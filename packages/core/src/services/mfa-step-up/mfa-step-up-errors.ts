/**
 * Errors a caller of an MFA step-up can receive.
 * @module mfa-step-up-errors
 */
import { isNetworkError } from '../../api/error-utils';

export type MfaStepUpErrorCode =
  | 'cancelled'
  | 'token_expired'
  | 'token_invalid'
  | 'rate_limited'
  | 'no_authenticators'
  | 'unavailable'
  | 'unexpected';

const STEP_UP_ERROR_NAME = 'MfaStepUpError';

/** Any failure of an MFA step-up. `code` says which. */
export type MfaStepUpError = Error & { code: MfaStepUpErrorCode };

/**
 * @param code - Which failure it is.
 * @param options - A message (the code, by default), and what caused the failure.
 * @returns The failure, as an `Error` that carries its `code`.
 */
export const createMfaStepUpError = (
  code: MfaStepUpErrorCode,
  { message = code, cause }: { message?: string; cause?: unknown } = {},
): MfaStepUpError =>
  Object.assign(new Error(message, { cause }), { code, name: STEP_UP_ERROR_NAME });

/**
 * @param err - Anything that was thrown or rejected.
 * @returns Whether it is a failure of an MFA step-up, made by `createMfaStepUpError`, or an error
 * that was caused by one. The SDK clients wrap what their fetcher throws.
 */
export const isMfaStepUpError = (err: unknown): boolean =>
  err instanceof Error && (err.name === STEP_UP_ERROR_NAME || isMfaStepUpError(err.cause));

interface RawApiError {
  status?: number;
  error?: string;
  error_description?: string;
  data?: { error?: string; error_description?: string };
}

/**
 * @param err - What a request threw.
 * @returns The OAuth `error` code in it, from the error itself or its `data`.
 */
export function getApiErrorCode(err: unknown): string | undefined {
  const { error, data } = (err ?? {}) as RawApiError;
  return error ?? data?.error;
}

/**
 * Tells whether a request failed because the service could not be reached or failed itself, so
 * trying again later may work and the user did nothing wrong. A proxy whose own call to Auth0
 * failed answers `unknown_error` with "fetch failed".
 *
 * @param err - What a request threw.
 * @returns Whether the failure is on the service's side.
 */
export function isUnavailableError(err: unknown): boolean {
  const { status, error_description, data } = (err ?? {}) as RawApiError;
  const description = error_description ?? data?.error_description ?? '';
  return (
    isNetworkError(err) ||
    (status !== undefined && status >= 500) ||
    getApiErrorCode(err) === 'unknown_error' ||
    /fetch failed/i.test(description)
  );
}

export type MfaFatalErrorCode = 'rate_limited' | 'token_expired' | 'token_invalid';

/**
 * Tells whether what an MFA request threw is a failure the flow cannot continue from. A wrong code
 * is not one: the user stays on the screen and tries again.
 *
 * @param err - What a request threw.
 * @returns Which failure it is, or `undefined` when the user can try again.
 */
export function getFatalErrorCode(err: unknown): MfaFatalErrorCode | undefined {
  const { status, error_description, data } = (err ?? {}) as RawApiError;
  const code = getApiErrorCode(err);
  const description = error_description ?? data?.error_description ?? '';

  if (status === 429) return 'rate_limited';
  if (
    code === 'expired_token' ||
    code === 'mfa_token_expired' ||
    code === 'mfa_context_not_found'
  ) {
    return 'token_expired';
  }
  if (code === 'invalid_token' || code === 'mfa_token_invalid') return 'token_invalid';
  // `invalid_grant` is also what a wrong code returns, so only a complaint about the token counts.
  if (code === 'invalid_grant' && /mfa_token/i.test(description)) {
    return /expired/i.test(description) ? 'token_expired' : 'token_invalid';
  }
  return undefined;
}
