/**
 * Generic polling hook built on TanStack Query.
 * Uses only options shared by TanStack Query v4 and v5 (numeric `refetchInterval`,
 * `retry`, `removeQueries`), so it works with either peer version.
 * @module use-poll-until
 * @internal
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

import type { UsePollUntilOptions, UsePollUntilReturn } from '@/types/poll-types';

const DEFAULT_INTERVAL_MS = 5_000;
const DEFAULT_MAX_ATTEMPTS = 120;
const DEFAULT_MAX_DURATION_MS = 600_000;

interface PollState {
  /** The poll this state belongs to; state from a previous poll is ignored. */
  owner: string;
  attempts: number;
  timedOut: boolean;
  stopped: boolean;
  settled: boolean;
}

const initialPollState = (owner: string): PollState => ({
  owner,
  attempts: 0,
  timedOut: false,
  stopped: false,
  settled: false,
});

/**
 * Polls `queryFn` until `isDone` returns true, a fatal error occurs, a cap is
 * reached, or `stop` is called. Non-fatal errors keep polling, so a transient
 * failure (for example a token refresh) is not treated as a terminal result.
 * @param options - {@link UsePollUntilOptions}
 * @returns Latest data and error, attempt count, polling and timeout flags, and `stop`.
 * @internal
 */
export function usePollUntil<TData>({
  queryKey,
  queryFn,
  isDone,
  isFatalError,
  intervalMs = DEFAULT_INTERVAL_MS,
  maxAttempts = DEFAULT_MAX_ATTEMPTS,
  maxDurationMs = DEFAULT_MAX_DURATION_MS,
  enabled = true,
}: UsePollUntilOptions<TData>): UsePollUntilReturn<TData> {
  const queryClient = useQueryClient();
  const keyHash = JSON.stringify(queryKey);
  const owner = `${keyHash}:${enabled}`;
  const queryKeyRef = useRef(queryKey);
  queryKeyRef.current = queryKey;

  const [storedState, setStoredState] = useState<PollState>(() => initialPollState(owner));
  const state = storedState.owner === owner ? storedState : initialPollState(owner);

  const update = useCallback(
    (patch: Partial<Omit<PollState, 'owner'>>) =>
      setStoredState((previous) => ({
        ...(previous.owner === owner ? previous : initialPollState(owner)),
        ...patch,
      })),
    [owner],
  );

  const isActive = enabled && !state.stopped && !state.timedOut && !state.settled;

  const query = useQuery({
    queryKey,
    queryFn: () => {
      setStoredState((previous) => {
        const current = previous.owner === owner ? previous : initialPollState(owner);
        return { ...current, attempts: current.attempts + 1 };
      });
      return queryFn();
    },
    enabled: isActive,
    retry: false,
    refetchOnWindowFocus: false,
    refetchInterval: isActive ? intervalMs : false,
    refetchIntervalInBackground: true,
  });

  const done = query.data !== undefined && isDone(query.data);
  const fatal = query.error != null && (isFatalError?.(query.error) ?? false);

  useEffect(() => {
    if (done || fatal) update({ settled: true });
  }, [done, fatal, update]);

  useEffect(() => {
    if (isActive && !done && !fatal && !query.isFetching && state.attempts >= maxAttempts) {
      update({ timedOut: true });
    }
  }, [isActive, done, fatal, query.isFetching, state.attempts, maxAttempts, update]);

  useEffect(() => {
    if (!isActive) return undefined;
    const timer = setTimeout(() => update({ timedOut: true }), maxDurationMs);
    return () => clearTimeout(timer);
  }, [isActive, maxDurationMs, update]);

  // Polled results are not cached across mounts or keys.
  useEffect(() => {
    const key = queryKeyRef.current;
    return () => {
      queryClient.removeQueries({ queryKey: key, exact: true });
    };
  }, [queryClient, keyHash]);

  const stop = useCallback(() => update({ stopped: true }), [update]);

  return {
    data: query.data,
    error: query.error,
    attempts: state.attempts,
    isPolling: isActive && !done && !fatal,
    timedOut: state.timedOut,
    stop,
  };
}
