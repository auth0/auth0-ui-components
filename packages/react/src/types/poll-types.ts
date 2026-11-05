/**
 * Polling hook types.
 * @module poll-types
 */

/** Options for {@link usePollUntil}. */
export interface UsePollUntilOptions<TData> {
  /** TanStack Query key. A new key restarts polling. */
  queryKey: readonly unknown[];
  /** Fetches the polled resource once. */
  queryFn: () => Promise<TData>;
  /** Returns `true` when `data` is terminal and polling should stop. */
  isDone: (data: TData) => boolean;
  /** Returns `true` when `error` should stop polling. Other errors keep polling. */
  isFatalError?: (error: unknown) => boolean;
  /** Delay between fetches in ms. Default: 5000. */
  intervalMs?: number;
  /** Maximum number of fetches before timing out. Default: 120. */
  maxAttempts?: number;
  /** Maximum polling duration in ms before timing out. Default: 600000. */
  maxDurationMs?: number;
  /** Whether polling runs. Default: true. */
  enabled?: boolean;
}

/** Return value of {@link usePollUntil}. */
export interface UsePollUntilReturn<TData> {
  /** Latest fetched data. */
  data: TData | undefined;
  /** Latest fetch error, if any. */
  error: unknown;
  /** Number of fetches started. */
  attempts: number;
  /** Whether polling is still running. */
  isPolling: boolean;
  /** Whether polling stopped because a cap was reached. */
  timedOut: boolean;
  /** Stops polling. */
  stop: () => void;
}
