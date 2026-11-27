import {
  FACTOR_TYPE_ALIASES,
  FACTOR_TYPE_EMAIL,
  FACTOR_TYPE_SMS,
  FACTOR_TYPE_VOICE,
  MFA_REQUIRED_ERROR,
} from './mfa-step-up-api-constants';
import type { MfaRequiredError } from './mfa-step-up-api-types';

type MfaPayload = Partial<MfaRequiredError>;

const isMfaPayload = (value: unknown): value is MfaPayload =>
  typeof value === 'object' &&
  value !== null &&
  'error' in value &&
  value.error === MFA_REQUIRED_ERROR;

/**
 * Fetch-based SDKs put the response body in `body`, `cause` or `data`. Axios puts it in `response.data`.
 *
 * @param err - Whatever a request failed with.
 * @returns The error itself and every place its body may be.
 */
function getPayloads(err: unknown): MfaPayload[] {
  const { body, cause, data, response } = (err ?? {}) as {
    body?: MfaPayload;
    cause?: MfaPayload;
    data?: MfaPayload;
    response?: { data?: MfaPayload };
  };
  return [err as MfaPayload, body, cause, data, response?.data].filter(Boolean) as MfaPayload[];
}

/**
 * @param err - The error to check.
 * @returns Whether it is an Auth0 `mfa_required` error, wherever its body sits.
 */
export function isMfaRequiredError(err: unknown): err is MfaRequiredError {
  return getPayloads(err).some(isMfaPayload);
}

/**
 * @param err - The error to normalize.
 * @returns The error with `mfa_token` and `mfa_requirements` lifted to the top level.
 */
export function normalizeMfaRequiredError<T extends MfaRequiredError>(err: T): T {
  const payloads = getPayloads(err);
  return {
    ...err,
    mfa_token: payloads.find(({ mfa_token }) => mfa_token)?.mfa_token,
    mfa_requirements: payloads.find(({ mfa_requirements }) => mfa_requirements)?.mfa_requirements,
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
