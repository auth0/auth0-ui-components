import { createMfaStepUpError, type MfaStepUpError } from '../mfa-step-up-api-error';
import type { MfaRequiredError } from '../mfa-step-up-api-types';

import { createSubscribers } from './mfa-step-up-subscribers';

export interface MfaStepUpRequest {
  error: MfaRequiredError;
  complete(): void;
  cancel(failure?: MfaStepUpError): void;
}

/**
 * @returns A promise together with the functions that settle it.
 */
function createDeferred() {
  let resolve!: () => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<void>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

/**
 * @returns A store with nothing open.
 */
export function createMfaStepUpStore() {
  let open: { request: MfaStepUpRequest; done: Promise<void> } | undefined;
  const subscribers = createSubscribers();

  const close = () => {
    open = undefined;
    subscribers.notify();
  };

  const openStepUp = (error: MfaRequiredError) => {
    const { promise: done, resolve, reject } = createDeferred();
    const settle = (act: () => void) => {
      if (open?.request !== request) return;
      act();
      close();
    };
    const request: MfaStepUpRequest = {
      error,
      complete: () => settle(resolve),
      cancel: (failure) =>
        settle(() => reject(failure ?? createMfaStepUpError('cancelled', { cause: error }))),
    };
    open = { request, done };
    subscribers.notify();
    return done;
  };

  return {
    /**
     * @param error - The `mfa_required` error that needs a step-up. Ignored when one is already open.
     * @returns Resolves once the user passed MFA. A request made while one is open joins it.
     */
    request: (error: MfaRequiredError): Promise<void> => {
      if (open) return open.done;
      if (subscribers.isEmpty()) {
        return Promise.reject(createMfaStepUpError('unavailable', { cause: error }));
      }
      return openStepUp(error);
    },
    getSnapshot: () => open?.request,
    subscribe: subscribers.subscribe,
  };
}

export const mfaStepUpStore = createMfaStepUpStore();
