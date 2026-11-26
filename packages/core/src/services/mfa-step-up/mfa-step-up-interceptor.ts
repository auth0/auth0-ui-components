import { mfaStepUpStore } from './flow/mfa-step-up-store';
import { isMfaStepUpError } from './mfa-step-up-api-error';
import type { MfaRequiredError } from './mfa-step-up-api-types';
import { isMfaRequiredError, normalizeMfaRequiredError } from './mfa-step-up-api-utils';

/**
 * Runs `call`. If it fails with `mfa_required`, prompts the user to pass MFA and runs `call`
 * again.
 *
 * Concurrent calls that hit `mfa_required` share the same open dialog instead of opening
 * multiple prompts.
 *
 * @param call - Async function to run. It runs again after MFA, so it must be safe to repeat.
 * @returns What `call` returns.
 * @throws {MfaStepUpError} With a `code` (such as `'cancelled'`, `'token_expired'`, or
 *   `'unavailable'`) if the user cancels or MFA cannot be completed.
 * @throws Re-throws any other error from `call`.
 */
export async function withMfaStepUp<T>(call: () => Promise<T>): Promise<T> {
  try {
    return await throwIfMfaRequired(await call());
  } catch (error) {
    if (isMfaStepUpError(error) || !isMfaRequiredError(error)) throw error;
    await mfaStepUpStore.request(normalizeMfaRequiredError(error));
    return withMfaStepUp(call);
  }
}

/**
 * `fetch` does not throw on a 403, so a 403 whose body is `mfa_required` is thrown here.
 *
 * @param result - What a call returned. Only a `fetch` response is inspected.
 * @returns The same result.
 * @throws {Error & MfaRequiredError} When `result` is a 403 response whose body is `mfa_required`.
 */
async function throwIfMfaRequired<T>(result: T): Promise<T> {
  const response: unknown = result;
  const isReadable = response instanceof Response && !response.bodyUsed && !response.body?.locked;
  if (isReadable && response.status === 403) {
    const body = await response
      .clone()
      .json()
      .catch(() => undefined);
    if (isMfaRequiredError(body)) {
      const error: Error & MfaRequiredError = Object.assign(new Error('mfa_required'), body);
      throw error;
    }
  }
  return result;
}
