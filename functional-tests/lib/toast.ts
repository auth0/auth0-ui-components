import type { Page } from '@playwright/test';

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
const SUCCESS = `${TOAST}[data-type="success"]`;
const ERROR = `${TOAST}[data-type="error"]`;

const DEFAULT_TIMEOUT_MS = 20_000;
const POLL_INTERVAL_MS = 100;

function normalize(text: string): string {
  return text.replace(/\s+/g, ' ').trim().toLowerCase();
}

function countContaining(texts: string[], message: string): number {
  const needle = normalize(message);
  return texts.filter((text) => normalize(text).includes(needle)).length;
}

// Errors on screen now that were not there before, counting duplicates separately.
function newErrors(baseline: string[], current: string[]): string[] {
  const remaining = [...baseline];
  return current.filter((text) => {
    const index = remaining.findIndex((seen) => normalize(seen) === normalize(text));
    if (index === -1) return true;
    remaining.splice(index, 1);
    return false;
  });
}

export interface ToastWatcher {
  expectSuccess(message: string, options?: { timeout?: number }): Promise<void>;
  expectError(message: string, options?: { timeout?: number }): Promise<void>;
}

export async function watchToasts(page: Page): Promise<ToastWatcher> {
  const baselineSuccess = await page.locator(SUCCESS).allInnerTexts();
  const baselineError = await page.locator(ERROR).allInnerTexts();

  const waitFor = async (
    selector: string,
    baseline: string[],
    message: string,
    failOnError: boolean,
    timeout: number,
  ): Promise<void> => {
    // One more than were already there, so an older toast with the same text cannot satisfy this.
    const target = countContaining(baseline, message) + 1;
    const deadline = Date.now() + timeout;

    for (;;) {
      const texts = await page.locator(selector).allInnerTexts();
      if (countContaining(texts, message) >= target) return;

      if (failOnError) {
        const errors = newErrors(baselineError, await page.locator(ERROR).allInnerTexts());
        if (errors.length > 0) {
          throw new Error(
            `Expected a success toast "${message}", but the app reported an error: ${errors.join(' | ')}`,
          );
        }
      }

      if (Date.now() >= deadline) {
        const onScreen = await page.locator(TOAST).allInnerTexts();
        throw new Error(
          `Timed out after ${timeout}ms waiting for a new toast containing "${message}". ` +
            (onScreen.length > 0
              ? `Toasts on screen: ${onScreen.join(' | ')}`
              : 'No toasts on screen.'),
        );
      }

      await page.waitForTimeout(POLL_INTERVAL_MS);
    }
  };

  return {
    expectSuccess: (message, options) =>
      waitFor(SUCCESS, baselineSuccess, message, true, options?.timeout ?? DEFAULT_TIMEOUT_MS),
    expectError: (message, options) =>
      waitFor(ERROR, baselineError, message, false, options?.timeout ?? DEFAULT_TIMEOUT_MS),
  };
}
