/**
 * Polling hook types.
 * @module poll-types
 * @internal
 */

/** Options for {@link usePollUntil}. */
export interface UsePollUntilOptions<TData> {
  queryKey: readonly unknown[];
  queryFn: () => Promise<TData>;
  isDone: (data: TData) => boolean;
  isFatalError?: (error: unknown) => boolean;
  intervalMs?: number;
  maxAttempts?: number;
  maxDurationMs?: number;
  enabled?: boolean;
}

/** Return value of {@link usePollUntil}. */
export interface UsePollUntilReturn<TData> {
  data: TData | undefined;
  error: unknown;
  attempts: number;
  isPolling: boolean;
  timedOut: boolean;
  stop: () => void;
}
