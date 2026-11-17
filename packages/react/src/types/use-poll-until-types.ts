/**
 * Poll-until hook types.
 * @module use-poll-until-types
 */

export interface PollIntervalContext<T> {
  elapsedMs: number;
  attempts: number;
  lastResult?: T;
}

export interface UsePollUntilOptions<T> {
  request: (signal: AbortSignal) => Promise<T>;
  isDone: (result: T) => boolean;
  getInterval: (context: PollIntervalContext<T>) => number | false;
  onDone: (result: T) => void;
  onError?: (error: unknown) => void;
  onExhausted?: () => void;
  immediate?: boolean;
  pollOnFocus?: boolean;
  focusThrottleMs?: number;
}

export interface UsePollUntilReturn {
  start: () => void;
  stop: () => void;
  isPolling: boolean;
}

export interface PollSession {
  startedAt: number;
  attempts: number;
  lastRequestAt: number;
  timer?: ReturnType<typeof setTimeout>;
  controller?: AbortController;
  inFlight: boolean;
}
