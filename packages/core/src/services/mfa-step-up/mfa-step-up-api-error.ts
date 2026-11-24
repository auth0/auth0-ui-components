/**
 * @module mfa-step-up-api-error
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

const getApiErrorDescription = (err: unknown): string => {
  const { error_description, data } = (err ?? {}) as RawApiError;
  return error_description ?? data?.error_description ?? '';
};

/**
 * @param err - What a request threw.
 * @returns Whether the failure is on the service's side.
 */
export function isUnavailableError(err: unknown): boolean {
  const { status } = (err ?? {}) as RawApiError;
  return (
    isNetworkError(err) ||
    (status !== undefined && status >= 500) ||
    getApiErrorCode(err) === 'unknown_error' ||
    /fetch failed/i.test(getApiErrorDescription(err))
  );
}

type MfaFatalErrorCode = 'rate_limited' | 'token_expired' | 'token_invalid';

const TOKEN_EXPIRED_CODES = ['expired_token', 'mfa_token_expired', 'mfa_context_not_found'];
const TOKEN_INVALID_CODES = ['invalid_token', 'mfa_token_invalid'];

/**
 * @param err - What a request threw.
 * @returns Which failure it is, or `undefined` when the user can try again.
 */
export function getFatalErrorCode(err: unknown): MfaFatalErrorCode | undefined {
  const { status } = (err ?? {}) as RawApiError;
  const code = getApiErrorCode(err) ?? '';
  const description = getApiErrorDescription(err);

  if (status === 429) return 'rate_limited';
  if (TOKEN_EXPIRED_CODES.includes(code)) return 'token_expired';
  if (TOKEN_INVALID_CODES.includes(code)) return 'token_invalid';
  // A wrong code is also `invalid_grant`, so only a complaint about the token ends the flow.
  if (code === 'invalid_grant' && /mfa_token/i.test(description)) {
    return /expired/i.test(description) ? 'token_expired' : 'token_invalid';
  }
  return undefined;
}
