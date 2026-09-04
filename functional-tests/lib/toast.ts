import type { JSHandle, Page } from '@playwright/test';

/**
 * Waits for toasts an action just produced, ignoring any already on screen. Toasts last a few
 * seconds and repeat the same text, so matching on text alone can pass on an older one.
 *
 * Create the watcher right before the action, then assert:
 *
 *   const toasts = await watchToasts(page);
 *   await memberManagement.inviteSubmitButton.click();
 *   await toasts.expectSuccess(t('member_management.invitation.create.success', { email }));
 */

const TOAST = '[data-sonner-toast]';
const SUCCESS_ATTR = 'success';
const ERROR_ATTR = 'error';

const DEFAULT_TIMEOUT_MS = 30_000;
const POLL_INTERVAL_MS = 100;
const SNAPSHOT_LIMIT = 1_500;

// Shape stored in the in-page accumulator created by startAccumulator().
interface ToastRecord {
  type: string;
  text: string;
}

// Handle to the in-page JS object that accumulates every toast ever added to the DOM.
// Using a MutationObserver means toasts that appear and auto-dismiss before a poll tick
// are still captured — the primary cause of flaky toast assertions under CI load.
type AccumulatorHandle = JSHandle<{ records: ToastRecord[] }>;

async function startAccumulator(page: Page): Promise<AccumulatorHandle> {
  return page.evaluateHandle((selector) => {
    const state: { records: ToastRecord[] } = { records: [] };
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of Array.from(mutation.addedNodes)) {
          if (!(node instanceof Element)) continue;
          const toasts = node.matches(selector)
            ? [node]
            : Array.from(node.querySelectorAll(selector));
          for (const toast of toasts) {
            state.records.push({
              type: (toast as HTMLElement).dataset['type'] ?? '',
              text: (toast as HTMLElement).innerText ?? '',
            });
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    return state;
  }, TOAST);
}

async function drainAccumulator(handle: AccumulatorHandle): Promise<ToastRecord[]> {
  return handle.evaluate((state) => {
    const records = state.records.slice();
    state.records = [];
    return records;
  });
}

async function pageSnapshot(page: Page): Promise<string> {
  try {
    const snapshot = await page.locator('body').ariaSnapshot();
    return snapshot.length > SNAPSHOT_LIMIT ? `${snapshot.slice(0, SNAPSHOT_LIMIT)}\n…` : snapshot;
  } catch {
    return '<unavailable>';
  }
}

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim().toLowerCase();
}

function countContaining(texts: string[], message: string): number {
  const needle = normalize(message);
  return texts.filter((text) => normalize(text).includes(needle)).length;
}

export interface ToastWatcher {
  expectSuccess(message: string, options?: { timeout?: number }): Promise<void>;
  expectError(message: string, options?: { timeout?: number }): Promise<void>;
}

export async function watchToasts(page: Page): Promise<ToastWatcher> {
  // The observer only fires for nodes *added* after it attaches, so pre-existing toasts
  // are excluded by construction — no baseline snapshot needed.
  const accumulator = await startAccumulator(page);

  // Accumulated records seen so far in this watcher's lifetime, split by type.
  const seen: Record<string, string[]> = { [SUCCESS_ATTR]: [], [ERROR_ATTR]: [] };

  const flush = async () => {
    const fresh = await drainAccumulator(accumulator);
    for (const { type, text } of fresh) {
      if (!seen[type]) seen[type] = [];
      seen[type].push(text);
    }
  };

  const waitFor = async (
    type: string,
    message: string,
    failOnError: boolean,
    timeout: number,
  ): Promise<void> => {
    const deadline = Date.now() + timeout;

    for (;;) {
      await flush();

      if (countContaining(seen[type] ?? [], message) >= 1) return;

      if (failOnError) {
        const errorsSeen = seen[ERROR_ATTR] ?? [];
        if (errorsSeen.length > 0) {
          throw new Error(
            `Expected a success toast "${message}", but the app reported an error: ${errorsSeen.join(' | ')}`,
          );
        }
      }

      if (Date.now() >= deadline) {
        const onScreen = await page.locator(TOAST).allInnerTexts();
        const allSeen = Object.values(seen).flat();
        let toastContext: string;
        if (allSeen.length > 0) {
          toastContext = `Toasts captured since watcher started: ${allSeen.join(' | ')}`;
        } else if (onScreen.length > 0) {
          toastContext = `Toasts on screen: ${onScreen.join(' | ')}`;
        } else {
          toastContext = 'No toasts seen or on screen.';
        }
        throw new Error(
          `Timed out after ${timeout}ms waiting for a new toast containing "${message}". ` +
            toastContext +
            `\nPage at timeout:\n${await pageSnapshot(page)}`,
        );
      }

      await page.waitForTimeout(POLL_INTERVAL_MS);
    }
  };

  return {
    expectSuccess: (message, options) =>
      waitFor(SUCCESS_ATTR, message, true, options?.timeout ?? DEFAULT_TIMEOUT_MS),
    expectError: (message, options) =>
      waitFor(ERROR_ATTR, message, false, options?.timeout ?? DEFAULT_TIMEOUT_MS),
  };
}
