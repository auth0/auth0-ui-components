import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { test as base, type Browser, type BrowserContext } from '@playwright/test';

import { reactSpaNpmApp } from '../apps/react-spa-npm.app';

/**
 * Refresh tokens rotate on every MRRT exchange — server-side, even if the browser never reads
 * the response — so a `storageState` snapshot taken mid-exchange holds a token the in-flight
 * exchange burns moments later, and the next test dies on "Unknown or invalid refresh token."
 * Hence: snapshot only once token traffic is quiet, persist after anything that could rotate,
 * and make the validity probe force a real exchange so a dead session self-heals into a login.
 */

const dirname = path.dirname(fileURLToPath(import.meta.url));
const authDir = path.resolve(dirname, '../.auth');
const appOrigin = new URL(reactSpaNpmApp.baseURL).origin;

// Part of the state filename, so changing tenant/org/client env invalidates cached sessions
// instead of silently reusing one minted against a different config.
const configFingerprint = crypto
  .createHash('sha1')
  .update(JSON.stringify(reactSpaNpmApp.webServer.env))
  .digest('hex')
  .slice(0, 8);

const TOKEN_ENDPOINT_PATH = '/oauth/token';
const MY_ORG_API_PATH = '/my-org/';
const MY_ACCOUNT_API_PATH = '/me/';

/**
 * Live scoreboard of /oauth/token activity, updated in real-time by trackTokenTraffic() listeners.
 * - inFlight: counts how many token exchanges are currently running (sent but not yet responded).
 * - lastActivityAt: timestamp of the last request/response — used to detect the 250ms quiet window before saving session.
 * - failures: collects error messages from any failed token exchanges — surfaced as test annotations so you know why a test failed.
 */
interface TokenTraffic {
  inFlight: number;
  lastActivityAt: number;
  // `status body` for every non-2xx token response — a dead refresh token lands here.
  failures: string[];
}

function isTokenRequest(url: string): boolean {
  return url.includes(TOKEN_ENDPOINT_PATH);
}

function isApiRequest(url: string): boolean {
  return url.includes(MY_ORG_API_PATH) || url.includes(MY_ACCOUNT_API_PATH);
}

/**
 * Attaches network listeners to the browser context and returns a live TokenTraffic scoreboard.
 * Counts /oauth/token requests in-flight, timestamps every activity, and collects any failures.
 * Must be attached before navigation — the first token exchange fires on page load and would be missed otherwise.
 */
function trackTokenTraffic(context: BrowserContext): TokenTraffic {
  const traffic: TokenTraffic = { inFlight: 0, lastActivityAt: Date.now(), failures: [] };

  context.on('request', (request) => {
    if (!isTokenRequest(request.url())) return;
    traffic.inFlight += 1;
    traffic.lastActivityAt = Date.now();
  });

  const settle = (url: string) => {
    if (!isTokenRequest(url)) return;
    traffic.inFlight = Math.max(0, traffic.inFlight - 1);
    traffic.lastActivityAt = Date.now();
  };
  context.on('requestfinished', (request) => settle(request.url()));
  context.on('requestfailed', (request) => settle(request.url()));

  context.on('response', (response) => {
    if (!isTokenRequest(response.url()) || response.ok()) return;
    void response
      .text()
      .catch(() => '')
      .then((body) => {
        traffic.failures.push(`${response.status()} ${body}`.slice(0, 300));
      });
  });

  return traffic;
}

/**
 * Collects non-2xx My Org / My Account API responses, annotated onto the test. Without it a failure
 * only says a row never appeared, and the API side of the story is nowhere in the report.
 *
 * @param context - Context to observe. Attach before navigation, or the mount reads are missed.
 * @returns A live array of `method status path`, appended to as responses arrive.
 */
function trackApiFailures(context: BrowserContext): string[] {
  const failures: string[] = [];

  context.on('response', (response) => {
    const url = response.url();
    if (!isApiRequest(url) || response.ok()) return;
    failures.push(`${response.request().method()} ${response.status()} ${new URL(url).pathname}`);
  });

  return failures;
}

const RATE_LIMIT_RETRIES = 3;
// Auth0's Retry-After can be tens of seconds, which is longer than any test waits. Cap it so a rate
// limit costs us one extra retry instead of a test failure that looks like a broken feature.
const MAX_RETRY_AFTER_MS = 2_000;
// Seen in CI: a route.fetch() that never settled, so the component stayed loading until the test
// died. Both bounds stay under the 20s assertion timeout so a bad handler can't masquerade as one.
const FETCH_TIMEOUT_MS = 4_000;
const HANDLER_BUDGET_MS = 10_000;

function retryDelayMs(response: { headers(): Record<string, string> }, attempt: number): number {
  const retryAfterSeconds = Number(response.headers()['retry-after']);
  const wait =
    Number.isFinite(retryAfterSeconds) && retryAfterSeconds > 0
      ? retryAfterSeconds * 1000
      : 2 ** attempt * 400;
  return Math.min(wait, MAX_RETRY_AFTER_MS);
}

/**
 * The My Org API allows only 2 concurrent requests, but one page mount fires 5 reads — so 429s
 * are routine in tests. This intercepts My Org/Account API reads, retries on 429 with capped
 * backoff, and hands the final response back to the browser transparently.
 *
 * Only GETs are retried. Writes go straight back to the browser — replaying a signed write isn't
 * safe to guess at, and the app retries its own properly.
 *
 * Every step is bounded, and on any failure the request goes back to the browser. An unbounded
 * handler is invisible: it stalls the component with no error, and the test then fails 20s later
 * blaming the feature.
 */
async function installRateLimitRetry(context: BrowserContext): Promise<void> {
  await context.route(
    (url) => isApiRequest(url.href),
    async (route, request) => {
      if (request.method() !== 'GET') {
        await route.continue().catch(() => undefined);
        return;
      }

      const deadline = Date.now() + HANDLER_BUDGET_MS;

      try {
        let lastResponse = await route.fetch({ timeout: FETCH_TIMEOUT_MS });

        for (let attempt = 0; lastResponse.status() === 429 && attempt < RATE_LIMIT_RETRIES; ) {
          const delay = retryDelayMs(lastResponse, attempt);
          if (Date.now() + delay >= deadline) break;
          await sleep(delay);
          attempt += 1;

          const retried = await route.fetch({ timeout: FETCH_TIMEOUT_MS });
          if (retried.status() === 401 || retried.status() === 403) break;
          lastResponse = retried;
        }

        await route.fulfill({ response: lastResponse });
      } catch {
        // Timed-out fetch, route orphaned by the page aborting its own request, or the test ending
        // mid-retry. continue() so the request still gets made; abort() only if even that fails.
        await route.continue().catch(() => route.abort().catch(() => undefined));
      }
    },
  );
}

// How long token traffic must be silent before we consider it safe to save the session.
// 250ms is enough to avoid saving mid-exchange; a straggler that rotates once more is covered by the
// rotation leeway set in scripts/setup-org.ts.
const QUIET_WINDOW_MS = 250;
// Maximum time to wait for traffic to go quiet. If exceeded, we save anyway — a possibly-stale
// token is better than no session at all.
const QUIET_TIMEOUT_MS = 15_000;
// Much shorter because once the pages are parked, waiting can only detect a straggler, never fix one:
// the SDK stores a rotated token in the handler of the fetch it started, and that handler died with the page.
const POST_PARKING_QUIET_TIMEOUT_MS = 2_000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Polls the traffic scoreboard every 100ms until both conditions are true for 250ms:
 * - inFlight is zero (no exchanges running)
 * - no activity for at least QUIET_WINDOW_MS
 * Both conditions are needed because the SDK chains exchanges one after another — inFlight
 * briefly hits zero between two exchanges, so silence duration is what confirms it's truly done.
 * Returns true if settled in time, false if the timeout was reached.
 *
 * On timeout it logs both counters, since they mean opposite things: a long idle time means a request
 * was torn down without ever reporting back and the snapshot is fine, while fresh activity means the
 * SDK is still chaining exchanges and the snapshot really can be a generation behind.
 *
 * @param traffic - Live scoreboard from trackTokenTraffic().
 * @param timeoutMs - How long to wait before giving up.
 */
async function waitForTokenTrafficToSettle(
  traffic: TokenTraffic,
  timeoutMs = QUIET_TIMEOUT_MS,
): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  for (;;) {
    const idleMs = Date.now() - traffic.lastActivityAt;
    if (traffic.inFlight === 0 && idleMs >= QUIET_WINDOW_MS) return true;

    if (Date.now() >= deadline) {
      console.warn(
        `[auth.fixture] token traffic unsettled after ${timeoutMs}ms ` +
          `(inFlight=${traffic.inFlight}, idle=${idleMs}ms)`,
      );
      return false;
    }
    await sleep(100);
  }
}

/**
 * Saves the browser session (cookies + localStorage) to disk after all token exchanges settle.
 * Two-step process: first waits for quiet while the app is still open (so the SDK can store the
 * rotated token), then parks all pages to about:blank (so nothing new fires), then waits again
 * briefly before writing. Returns true if both waits succeeded, false if traffic never settled — in
 * which case the file is still written since a possibly-stale token beats no session at all.
 */
async function persistSession(
  context: BrowserContext,
  traffic: TokenTraffic,
  stateFile: string,
): Promise<boolean> {
  const quietBeforeParking = await waitForTokenTrafficToSettle(traffic);

  await Promise.all(context.pages().map((page) => page.goto('about:blank').catch(() => undefined)));
  // Deliberately short-circuiting: once the first wait has failed the snapshot is suspect whatever
  // the second says, so waiting again only burns another timeout to reach the same conclusion.
  const quiet =
    quietBeforeParking &&
    (await waitForTokenTrafficToSettle(traffic, POST_PARKING_QUIET_TIMEOUT_MS));

  await context.storageState({ path: stateFile });

  if (!quiet) {
    console.warn(
      `[auth.fixture] token traffic never went quiet; ` +
        `${path.basename(stateFile)} may hold a rotated-away refresh token`,
    );
  }
  return quiet;
}

/**
 * Runs once at the start of a full test suite run, only when a .auth session file already exists
 * on disk (e.g. tests run manually without setup-org.ts, which normally deletes .auth first).
 * Makes a real My Org API call to confirm the session is alive — file existing is not enough,
 * the refresh token inside could be dead. Persists the rotated token back on success.
 */
async function probeSession(browser: Browser, stateFile: string): Promise<boolean> {
  const context = await browser.newContext({ storageState: stateFile });
  const traffic = trackTokenTraffic(context);

  try {
    const page = await context.newPage();
    const apiSucceeded = page
      .waitForResponse((response) => response.url().includes(MY_ORG_API_PATH) && response.ok(), {
        timeout: 20_000,
      })
      .then(() => true)
      .catch(() => false);

    await page.goto(reactSpaNpmApp.routes.organizationManagement, { timeout: 20_000 });

    if (!(await apiSucceeded)) return false;

    await persistSession(context, traffic, stateFile);
    return true;
  } catch {
    // App unreachable, state file corrupt, or navigation timed out — treat as invalid.
    return false;
  } finally {
    await context.close();
  }
}

async function loginAndPersist(browser: Browser, stateFile: string): Promise<void> {
  const email = process.env.FT_TEST_USER_EMAIL;
  const password = process.env.FT_TEST_USER_PASSWORD;
  if (!email || !password) {
    throw new Error(
      'FT_TEST_USER_EMAIL / FT_TEST_USER_PASSWORD are not set — see functional-tests/.env',
    );
  }

  const context = await browser.newContext();
  const traffic = trackTokenTraffic(context);

  try {
    const page = await context.newPage();
    await page.goto(reactSpaNpmApp.baseURL);
    await page.getByRole('button', { name: /sign in/i }).click();

    await page.getByLabel(/email/i).fill(email);
    await page.getByRole('button', { name: 'Continue', exact: true }).click();

    await page.getByRole('textbox', { name: /password/i }).fill(password);
    await page.getByRole('button', { name: 'Continue', exact: true }).click();

    await page.waitForURL((url) => url.origin === appOrigin, { timeout: 30_000 });
    await page.waitForLoadState('networkidle');

    await persistSession(context, traffic, stateFile);
  } finally {
    await context.close();
  }
}

interface WorkerFixtures {
  workerStorageState: string;
}

interface TestFixtures {
  persistSession: boolean;
  sessionPersistence: void;
}

/**
 * Custom fixtures wired into every spec via `export { test }`:
 *
 * workerStorageState (worker-scoped) — runs once before all tests. Reuses the saved session file
 *   if still alive (probeSession), otherwise does a fresh login. Each worker gets its own file.
 *
 * storageState — overrides Playwright's built-in to load the worker's session file into every
 *   test's browser context automatically.
 *
 * persistSession (option, default true) — set false via test.use({ persistSession: false }) for
 *   tests that run logged-out, so their empty session doesn't overwrite the real session file.
 *
 * sessionPersistence (auto) — wraps every test. Before: starts token and API failure tracking and
 *   installs rate limit retry. After: removes the retry handler, attaches any token and API failure
 *   messages to the test report, and saves the latest refresh token back to the session file.
 *   If saving fails (traffic never settled), annotates this test — because a torn file fails
 *   the NEXT test, not the current one.
 */
export const test = base.extend<TestFixtures, WorkerFixtures>({
  persistSession: [true, { option: true }],

  // eslint-disable-next-line react-hooks/rules-of-hooks
  storageState: ({ workerStorageState }, use) => use(workerStorageState),

  sessionPersistence: [
    async ({ context, persistSession: shouldPersist, workerStorageState }, use, testInfo) => {
      const traffic = trackTokenTraffic(context);
      const apiFailures = trackApiFailures(context);
      await installRateLimitRetry(context);

      await use();

      await context.unrouteAll({ behavior: 'ignoreErrors' }).catch(() => undefined);

      if (traffic.failures.length > 0) {
        testInfo.annotations.push({
          type: 'token-endpoint-failures',
          description: traffic.failures.join(' | '),
        });
      }

      if (apiFailures.length > 0) {
        testInfo.annotations.push({
          type: 'api-failures',
          description: apiFailures.join(' | '),
        });
      }

      if (shouldPersist && !(await persistSession(context, traffic, workerStorageState))) {
        testInfo.annotations.push({
          type: 'token-traffic-never-settled',
          description: `snapshot written to ${path.basename(workerStorageState)} may be torn`,
        });
      }
    },
    { auto: true },
  ],

  workerStorageState: [
    async ({ browser }, use, workerInfo) => {
      fs.mkdirSync(authDir, { recursive: true });
      const stateFile = path.resolve(
        authDir,
        `${workerInfo.parallelIndex}-${configFingerprint}.json`,
      );

      if (fs.existsSync(stateFile)) {
        if (await probeSession(browser, stateFile)) {
          await use(stateFile);
          return;
        }
        fs.rmSync(stateFile, { force: true });
      }

      await loginAndPersist(browser, stateFile);
      await use(stateFile);
    },
    { scope: 'worker' },
  ],
});

export { expect } from '@playwright/test';
