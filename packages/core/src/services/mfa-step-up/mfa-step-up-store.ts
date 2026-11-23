import { createMfaStepUpError, type MfaStepUpError } from './mfa-step-up-errors';

/** The open step-up. The dialog completes or cancels it. */
export interface MfaStepUpRequest {
  error: unknown;
  complete(): void;
  cancel(failure?: MfaStepUpError): void;
}

export interface MfaStepUpStore {
  /** Resolves once the user passed MFA. A request made while one is open joins it. */
  request(error: unknown): Promise<void>;
  getSnapshot(): MfaStepUpRequest | undefined;
  subscribe(listener: () => void): () => void;
}

/**
 * @returns A store with nothing open.
 */
export function createMfaStepUpStore(): MfaStepUpStore {
  let open: { request: MfaStepUpRequest; done: Promise<void> } | undefined;
  const listeners = new Set<() => void>();

  const setOpen = (next: typeof open) => {
    open = next;
    listeners.forEach((listener) => listener());
  };

  const openStepUp = (error: unknown) => {
    let resolve!: () => void;
    let reject!: (reason: unknown) => void;
    const done = new Promise<void>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    const settle = (act: () => void) => {
      if (open?.request !== request) return;
      setOpen(undefined);
      act();
    };
    const request: MfaStepUpRequest = {
      error,
      complete: () => settle(resolve),
      cancel: (failure) =>
        settle(() => reject(failure ?? createMfaStepUpError('cancelled', { cause: error }))),
    };
    setOpen({ request, done });
    return done;
  };

  return {
    request: (error) => (open ? open.done : openStepUp(error)),
    getSnapshot: () => open?.request,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}

export const mfaStepUpStore = createMfaStepUpStore();
