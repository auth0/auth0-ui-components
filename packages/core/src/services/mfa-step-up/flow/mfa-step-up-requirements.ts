/**
 * Resolves which factors can be enrolled and which authenticators challenged.
 * @module mfa-step-up-requirements
 */
import {
  FACTOR_TYPE_EMAIL,
  FACTOR_TYPE_RECOVERY_CODE,
} from '../../my-account/user-mfa-management/user-mfa-management-constants';
import {
  FACTOR_TYPE_OTP,
  FACTOR_TYPE_PUSH,
  FACTOR_TYPE_SMS,
  FACTOR_TYPE_VOICE,
} from '../mfa-step-up-api-constants';
import type { MfaApiClient } from '../mfa-step-up-api-types';
import type {
  EnrollmentFactor,
  MfaAuthenticator,
  MfaRequiredError,
} from '../mfa-step-up-api-types';
import { normalizeFactorType } from '../mfa-step-up-api-utils';

import type { MfaOption } from './mfa-step-up-flow-types';

type RequirementsError = Pick<MfaRequiredError, 'mfa_token' | 'mfa_requirements'>;

// The factors the flow knows how to enroll. Others, like recovery codes or WebAuthn, are not offered.
const ENROLLABLE_FACTORS: readonly string[] = [
  FACTOR_TYPE_OTP,
  FACTOR_TYPE_PUSH,
  FACTOR_TYPE_SMS,
  FACTOR_TYPE_VOICE,
  FACTOR_TYPE_EMAIL,
];

// Authenticator app first, then SMS, voice, email and push. A recovery code is always last.
const FACTOR_ORDER: readonly string[] = [
  FACTOR_TYPE_OTP,
  FACTOR_TYPE_SMS,
  FACTOR_TYPE_VOICE,
  FACTOR_TYPE_EMAIL,
  FACTOR_TYPE_PUSH,
];

const getFactorRank = (factor: string) => {
  if (factor === FACTOR_TYPE_RECOVERY_CODE) return Number.MAX_SAFE_INTEGER;
  const rank = FACTOR_ORDER.indexOf(factor);
  return rank === -1 ? FACTOR_ORDER.length : rank;
};

/**
 * @param options - Options in the order the API gave them.
 * @returns The options in the order the user sees them. Equal factors keep the API's order.
 */
const sortByFactor = (options: MfaOption[]): MfaOption[] =>
  [...options].sort((a, b) => getFactorRank(a.factor) - getFactorRank(b.factor));

/**
 * Offers only factors the flow can enroll, and merges factors that normalize to the same type.
 *
 * @param factors - Raw factors from the API or from `mfa_requirements.enroll`.
 * @returns One enroll option per factor.
 */
function toEnrollOptions(factors: EnrollmentFactor[]): MfaOption[] {
  const options = factors
    .map((enrollmentFactor) => normalizeFactorType(enrollmentFactor.type))
    .filter((factor) => ENROLLABLE_FACTORS.includes(factor))
    .map((factor): MfaOption => ({ id: `enroll:${factor}`, kind: 'enroll', factor }));
  return sortByFactor([...new Map(options.map((option) => [option.id, option])).values()]);
}

/**
 * @param authenticator - An authenticator.
 * @returns The factor it represents.
 */
function getAuthenticatorFactor(authenticator: MfaAuthenticator): string {
  const { authenticatorType, type } = authenticator;
  if (authenticatorType === 'oob' && type) return normalizeFactorType(type);
  return authenticatorType === 'otp' ? FACTOR_TYPE_OTP : authenticatorType;
}

/**
 * @param authenticators - Authenticators from the API.
 * @returns One challenge option per active authenticator.
 */
function toChallengeOptions(authenticators: MfaAuthenticator[]): MfaOption[] {
  const options = authenticators
    .filter((authenticator) => authenticator.active)
    .map(
      (authenticator): MfaOption => ({
        id: `challenge:${authenticator.id}`,
        kind: 'challenge',
        factor: getAuthenticatorFactor(authenticator),
        authenticator: {
          id: authenticator.id,
          authenticatorType: authenticator.authenticatorType,
          type: authenticator.type,
          name: authenticator.name,
          createdAt: authenticator.createdAt,
          lastAuth: authenticator.lastAuth,
        },
      }),
    );
  return sortByFactor(options);
}

/**
 * SPA: enrollment factors, else active authenticators.
 *
 * @param apiClient - The MFA API client.
 * @param mfaToken - The `mfa_token` from the error.
 * @returns The options the user can pick from.
 */
async function resolveSpa(apiClient: MfaApiClient, mfaToken: string): Promise<MfaOption[]> {
  const enroll = toEnrollOptions((await apiClient.getEnrollmentFactors?.(mfaToken)) ?? []);
  return enroll.length ? enroll : toChallengeOptions(await apiClient.getAuthenticators(mfaToken));
}

/**
 * Proxy: active authenticators, else `mfa_requirements.enroll`.
 *
 * @param apiClient - The MFA API client.
 * @param error - The `mfa_required` error.
 * @returns The options the user can pick from.
 */
async function resolveProxy(
  apiClient: MfaApiClient,
  error: RequirementsError,
): Promise<MfaOption[]> {
  const challenge = toChallengeOptions(await apiClient.getAuthenticators(error.mfa_token));
  return challenge.length ? challenge : toEnrollOptions(error.mfa_requirements?.enroll ?? []);
}

/**
 * @param apiClient - The MFA API client.
 * @param error - The `mfa_required` error.
 * @param isProxyMode - Whether `apiClient` is the proxy client.
 * @returns The options the user can pick from.
 */
export function resolveMfaRequirements(
  apiClient: MfaApiClient,
  error: RequirementsError,
  isProxyMode: boolean,
): Promise<MfaOption[]> {
  return isProxyMode ? resolveProxy(apiClient, error) : resolveSpa(apiClient, error.mfa_token);
}
