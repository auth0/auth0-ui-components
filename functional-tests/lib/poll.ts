/**
 * Makes a read safe for `expect.poll`, which gives up the moment its callback throws instead of
 * polling again. Wrapping it means a blip keeps the poll going rather than failing the test.
 *
 * @param read - The read to run on each attempt.
 * @param onError - Value to use when the read fails. Pick one that does not satisfy the assertion,
 *   so a read that keeps failing still times out instead of passing by accident.
 * @returns A callback safe to pass to `expect.poll`.
 */
export function pollRead<T>(read: () => Promise<T>, onError: T): () => Promise<T> {
  return () => read().catch(() => onError);
}
