/**
 * Shared hook for polling a request until a condition is met.
 * @module use-poll-until
 */

import { useEffect, useRef, useState } from 'react';

import type {
  PollSession,
  UsePollUntilOptions,
  UsePollUntilReturn,
} from '@/types/use-poll-until-types';

const DEFAULT_FOCUS_THROTTLE_MS = 2_000;

/**
 * Creates the polling loop. Results of a stopped or restarted session are ignored and its
 * in-flight request is aborted.
 *
 * @param getOptions - Returns the latest options.
 * @param setIsPolling - Called when polling starts or stops.
 * @returns Controls for the polling loop.
 */
function createPoller<T>(
  getOptions: () => UsePollUntilOptions<T>,
  setIsPolling: (isPolling: boolean) => void,
) {
  let session: PollSession | null = null;

  const stop = () => {
    if (session) {
      clearTimeout(session.timer);
      session.controller?.abort();
    }
    session = null;
    setIsPolling(false);
  };

  const schedule = (current: PollSession, lastResult?: T) => {
    const { getInterval, onExhausted } = getOptions();
    const interval = getInterval({
      elapsedMs: Date.now() - current.startedAt,
      attempts: current.attempts,
      lastResult,
    });
    if (interval === false) {
      stop();
      onExhausted?.();
      return;
    }
    current.timer = setTimeout(() => void tick(current), interval);
  };

  const tick = async (current: PollSession) => {
    if (session !== current || current.inFlight) return;
    clearTimeout(current.timer);
    current.inFlight = true;
    current.attempts += 1;
    current.lastRequestAt = Date.now();
    current.controller = new AbortController();

    const { request, isDone, onDone, onError } = getOptions();
    let result: T;
    let done: boolean;
    try {
      result = await request(current.controller.signal);
      if (session !== current) return;
      done = isDone(result);
    } catch (error) {
      if (session !== current) return;
      stop();
      onError?.(error);
      return;
    }

    current.inFlight = false;
    if (done) {
      stop();
      onDone(result);
      return;
    }
    schedule(current, result);
  };

  const start = () => {
    stop();
    const current: PollSession = {
      startedAt: Date.now(),
      attempts: 0,
      lastRequestAt: 0,
      inFlight: false,
    };
    session = current;
    setIsPolling(true);
    if (getOptions().immediate ?? true) void tick(current);
    else schedule(current);
  };

  const pollOnFocus = () => {
    if (!session || session.inFlight) return;
    const { focusThrottleMs = DEFAULT_FOCUS_THROTTLE_MS } = getOptions();
    if (Date.now() - session.lastRequestAt < focusThrottleMs) return;
    void tick(session);
  };

  return { start, stop, pollOnFocus };
}

/**
 * Polls `request` until `isDone` returns `true`, waiting `getInterval` between requests. Stops on
 * error (calling `onError`), when `getInterval` returns `false` (calling `onExhausted`), on `stop()`,
 * and on unmount; the in-flight request's signal is aborted when it stops. By default the first
 * request is sent immediately, and the window regaining focus polls at most once per 2000 ms.
 *
 * @param options - Polling options.
 * @returns `start` and `stop` controls, and whether polling is in progress.
 */
export function usePollUntil<T>(options: UsePollUntilOptions<T>): UsePollUntilReturn {
  const { pollOnFocus = true } = options;
  const [isPolling, setIsPolling] = useState(false);
  const optionsRef = useRef(options);
  optionsRef.current = options;
  const [poller] = useState(() => createPoller(() => optionsRef.current, setIsPolling));

  useEffect(() => {
    if (!pollOnFocus || !isPolling) return;
    const onVisible = () => {
      if (document.visibilityState === 'visible') poller.pollOnFocus();
    };
    window.addEventListener('focus', onVisible);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('focus', onVisible);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [poller, pollOnFocus, isPolling]);

  useEffect(() => poller.stop, [poller]);

  return { start: poller.start, stop: poller.stop, isPolling };
}
