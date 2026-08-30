// Poll budget for Management-API reads that confirm a write propagated. Must stay above the worst
// case a single throttled read can take: mgmt() retries a 429 up to MAX_RATE_LIMIT_RETRIES times,
// each waiting up to MAX_RETRY_AFTER_MS. Below that boundary a poll gives up mid-backoff, which is
// the flaky-in-CI/solid-locally failure — locally 429s are rare, in CI they aren't. The client-side
// rate limiter in management-api.ts keeps requests under the ceiling so this stays comfortable.
export const POLL_TIMEOUT_MS = 20_000;

/**
 * Makes a read safe for `expect.poll`, which gives up the moment its callback throws instead of
 * polling again. Wrapping it means a blip keeps the poll going rather than failing the test.
 *
 * A read that fails on *every* attempt (bad token, 4xx, the endpoint never being hit) would
 * otherwise be indistinguishable from slow propagation: the poll just times out with no clue why.
 * So the last error is logged each attempt — the failing call surfaces in the test output instead
 * of being swallowed.
 *
 * @param read - The read to run on each attempt.
 * @param onError - Value to use when the read fails. Pick one that does not satisfy the assertion,
 *   so a read that keeps failing still times out instead of passing by accident.
 * @returns A callback safe to pass to `expect.poll`.
 */
export function pollRead<T>(read: () => Promise<T>, onError: T): () => Promise<T> {
  return () =>
    read().catch((error) => {
      console.warn(`pollRead: read failed, retrying — ${error}`);
      return onError;
    });
}
