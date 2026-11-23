import { FACTOR_TYPE_EMAIL } from '../my-account/user-mfa-management/user-mfa-management-constants';

import {
  FACTOR_TYPE_ALIASES,
  FACTOR_TYPE_SMS,
  FACTOR_TYPE_VOICE,
  MFA_REQUIRED_ERROR,
} from './mfa-step-up-api-constants';
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
  return [e, e?.body, e?.cause, e?.data].some(isMfaPayload);
}

/**
 * Flattens MFA metadata to the root of the error object. It may be in `body`, `cause` or `data`.
 * @param err - The error to normalize.
 * @returns The error with MFA metadata lifted to the top level.
 */
export function normalizeMfaRequiredError<T extends MfaRequiredError>(err: T): T {
  const { body, cause, data } = err as unknown as {
    body?: Partial<MfaRequiredError>;
    cause?: Partial<MfaRequiredError>;
    data?: Partial<MfaRequiredError>;
  };

  return {
    ...err,
    mfa_token: err.mfa_token ?? body?.mfa_token ?? cause?.mfa_token ?? data?.mfa_token,
    mfa_requirements:
      err.mfa_requirements ??
      body?.mfa_requirements ??
      cause?.mfa_requirements ??
      data?.mfa_requirements,
  };
}

/**
 * @param err - Whatever a request failed with.
 * @returns The `mfa_token` when it is an `mfa_required` error that carries one.
 */
export function getMfaToken(err: unknown): string | undefined {
  return isMfaRequiredError(err) ? normalizeMfaRequiredError(err).mfa_token : undefined;
}

/**
 * @param type - Raw factor type from the API.
 * @returns Canonical factor type (`phone` → `sms`, `push-notification` → `push`, `totp` → `otp`).
 */
export function normalizeFactorType(type: string): string {
  return FACTOR_TYPE_ALIASES[type] ?? type;
}

const FACTORS_REQUIRING_CONTACT: readonly string[] = [
  FACTOR_TYPE_SMS,
  FACTOR_TYPE_VOICE,
  FACTOR_TYPE_EMAIL,
];

/**
 * @param factor - A canonical factor type.
 * @returns Whether the user must enter a phone number or an email before the factor can be enrolled.
 */
export function requiresContactInput(factor: string | undefined): boolean {
  return factor !== undefined && FACTORS_REQUIRING_CONTACT.includes(factor);
}
