import { FACTOR_TYPE_ALIASES, MFA_REQUIRED_ERROR } from './mfa-step-up-api-constants';
import type { MfaRequiredError } from './mfa-step-up-api-types';

/**
 * Type guard for Auth0 `mfa_required` errors (direct or nested under `body`).
 * @param error - The caught error value.
 * @returns Whether the error is an {@link MfaRequiredError}.
 */
export function isMfaRequiredError(error: unknown): error is MfaRequiredError {
  if (!error || typeof error !== 'object') return false;
  const isMfa = (obj: object) =>
    ('error' in obj && obj.error === MFA_REQUIRED_ERROR) ||
    ('code' in obj && obj.code === MFA_REQUIRED_ERROR);
  if (isMfa(error)) return true;
  const body = 'body' in error && typeof error.body === 'object' && error.body ? error.body : null;
  return !!body && isMfa(body);
}

/**
 * Flattens body-wrapped MFA errors to the standard {@link MfaRequiredError} shape.
 * @param error - The caught error value.
 * @returns A normalized {@link MfaRequiredError}.
 */
export function normalizeMfaRequiredError(error: MfaRequiredError): MfaRequiredError {
  const body =
    'body' in error
      ? (error as MfaRequiredError & { body?: Partial<MfaRequiredError> }).body
      : undefined;
  return {
    ...error,
    mfa_token: (error.mfa_token ?? body?.mfa_token) as string,
    mfa_requirements: error.mfa_requirements ?? body?.mfa_requirements,
  };
}

/**
 * @param type - Raw factor type from the API.
 * @returns Canonical factor type (`phone` → `sms`, `push-notification` → `push`, `totp` → `otp`).
 */
export function normalizeFactorType(type: string): string {
  return FACTOR_TYPE_ALIASES[type] ?? type;
}
