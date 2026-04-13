import { FACTOR_TYPE_ALIASES, MFA_REQUIRED_ERROR } from './mfa-step-up-api-constants';
import type { MfaRequiredError } from './mfa-step-up-api-types';

/**
 * Validates if a data object matches the MFA requirement schema.
 * @param v - The value to check.
 * @returns True if the value matches the MFA payload shape.
 */
function isMfaPayload(v: unknown): v is MfaRequiredError {
  if (!v || typeof v !== 'object') return false;
  const p = v as Record<string, unknown>;
  return p.error === MFA_REQUIRED_ERROR;
}
/**
 * Type guard for Auth0 `mfa_required` errors.
 * @param err - The error to check.
 * @returns True if the error is an MFA required error.
 */
export function isMfaRequiredError(err: unknown): err is MfaRequiredError {
  const e = err && typeof err === 'object' ? (err as Record<string, unknown>) : null;
  return [e, e?.body, e?.cause].some(isMfaPayload);
}

/**
 * Flattens MFA metadata to the root of the error object.
 * @param err - The error to normalize.
 * @returns The error with MFA metadata lifted to the top level.
 */
export function normalizeMfaRequiredError<T extends MfaRequiredError>(err: T): T {
  const { body, cause } = err as unknown as {
    body?: Partial<MfaRequiredError>;
    cause?: Partial<MfaRequiredError>;
  };

  return {
    ...err,
    mfa_token: err.mfa_token ?? body?.mfa_token ?? cause?.mfa_token,
    mfa_requirements: err.mfa_requirements ?? body?.mfa_requirements ?? cause?.mfa_requirements,
  };
}

/**
 * @param type - Raw factor type from the API.
 * @returns Canonical factor type (`phone` → `sms`, `push-notification` → `push`, `totp` → `otp`).
 */
export function normalizeFactorType(type: string): string {
  return FACTOR_TYPE_ALIASES[type] ?? type;
}
