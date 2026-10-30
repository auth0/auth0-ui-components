/**
 * Serial queue for requests that may refresh the session's tokens.
 * @module token-queue
 * @internal
 */

/** How long a running task may hold the queue before the next one is released. */
export const TOKEN_QUEUE_HOLD_MS = 10_000;

/**
 * Queue that runs one task at a time.
 * @internal
 */
export interface TokenQueue {
  run: <T>(task: () => Promise<T>) => Promise<T>;
}

/**
 * Creates a queue that runs one task at a time, in the order they were added.
 * A task that fails does not block the next one. A task that never settles releases the queue
 * after `holdMs`, so one stuck request (for example a step-up prompt) cannot block the page.
 * @param holdMs - Longest a running task holds the queue
 * @returns A queue
 * @internal
 */
export function createTokenQueue(holdMs: number = TOKEN_QUEUE_HOLD_MS): TokenQueue {
  let tail: Promise<void> = Promise.resolve();

  return {
    run: async (task) => {
      const previous = tail;
      let release: () => void = () => undefined;
      tail = new Promise<void>((resolve) => {
        release = resolve;
      });

      await previous;
      const timer = setTimeout(release, holdMs);
      try {
        return await task();
      } finally {
        clearTimeout(timer);
        release();
      }
    },
  };
}

/** Queue shared by every fetcher on the page, so requests for different APIs take turns. */
export const tokenQueue = createTokenQueue();

/**
 * Resolves when the promise settles or after the given time, whichever comes first.
 * @param promise - Promise to wait for
 * @param timeoutMs - Longest time to wait
 * @returns Promise that never rejects
 * @internal
 */
export function waitFor(promise: Promise<unknown>, timeoutMs: number): Promise<void> {
  return new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, timeoutMs);
    const done = () => {
      clearTimeout(timer);
      resolve();
    };
    promise.then(done, done);
  });
}
