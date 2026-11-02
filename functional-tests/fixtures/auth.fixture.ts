import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { test as base, type Browser } from '@playwright/test';

import { reactSpaNpmApp } from '../apps/react-spa-npm.app';

/**
 * Refresh tokens rotate on every exchange, so a `storageState` snapshot can capture a token that a
 * still-in-flight exchange burns moments later. We don't fight that timing: setup-org.ts sets a
 * generous rotation leeway, so a just-burned token stays valid long enough for the next sequential
 * test (workers: 1) to use it and heal the session forward.
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

async function loginAndPersist(browser: Browser, stateFile: string): Promise<void> {
  const email = process.env.FT_TEST_USER_EMAIL;
  const password = process.env.FT_TEST_USER_PASSWORD;
  if (!email || !password) {
    throw new Error(
      'FT_TEST_USER_EMAIL / FT_TEST_USER_PASSWORD are not set — see functional-tests/.env',
    );
  }

  const context = await browser.newContext();
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

    await context.storageState({ path: stateFile });
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
 * persistSession (option, default true) — set false via test.use({ persistSession: false }) so a
 *   logged-out test's empty session doesn't overwrite the worker's real session file.
 * sessionPersistence (auto) — writes the possibly-rotated session back after each test so the next
 *   sequential test isn't stale.
 */
export const test = base.extend<TestFixtures, WorkerFixtures>({
  persistSession: [true, { option: true }],

  // eslint-disable-next-line react-hooks/rules-of-hooks
  storageState: ({ workerStorageState }, use) => use(workerStorageState),

  sessionPersistence: [
    async ({ context, persistSession: shouldPersist, workerStorageState }, use) => {
      await use();
      if (shouldPersist) {
        await context.storageState({ path: workerStorageState });
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

      if (!fs.existsSync(stateFile)) {
        await loginAndPersist(browser, stateFile);
      }
      await use(stateFile);
    },
    { scope: 'worker' },
  ],
});

export { expect } from '@playwright/test';
