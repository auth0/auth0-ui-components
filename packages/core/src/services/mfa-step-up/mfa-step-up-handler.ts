import { isMfaRequiredError, normalizeMfaRequiredError } from './mfa-step-up-api-utils';
import { mfaStepUpStore } from './mfa-step-up-store';

/**
 * Runs the call. When it fails because MFA is required, the user passes MFA and it runs again.
 *
 * @param call - Makes the request. It must be safe to repeat.
 * @returns What the last run of `call` returns.
 * @throws What `call` throws unless it is `mfa_required`, or the failure of the step-up.
 */
export async function handleMfaRequiredError<T>(call: () => Promise<T>): Promise<T> {
  try {
    return await call();
  } catch (error) {
    if (!isMfaRequiredError(error)) throw error;
    await mfaStepUpStore.request(normalizeMfaRequiredError(error));
    return handleMfaRequiredError(call);
  }
}
