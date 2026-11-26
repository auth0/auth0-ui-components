/**
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
import type {
  EnrollmentFactor,
  MfaApiClient,
  MfaAuthenticator,
  MfaRequiredError,
  OobChannel,
} from '../mfa-step-up-api-types';
import { normalizeFactorType } from '../mfa-step-up-api-utils';

import type { MfaOption } from './mfa-step-up-flow-types';

type RequirementsError = Pick<MfaRequiredError, 'mfa_token' | 'mfa_requirements'>;

const ENROLLABLE_FACTORS: readonly string[] = [
  FACTOR_TYPE_OTP,
  FACTOR_TYPE_PUSH,
  FACTOR_TYPE_SMS,
  FACTOR_TYPE_VOICE,
  FACTOR_TYPE_EMAIL,
];

const CHALLENGEABLE_FACTORS: readonly string[] = [...ENROLLABLE_FACTORS, FACTOR_TYPE_RECOVERY_CODE];

/**
 * @param factors - Raw factors from the API or from `mfa_requirements.enroll`.
 * @returns One enroll option per factor.
 */
function toEnrollOptions(factors: EnrollmentFactor[]): MfaOption[] {
  const enrollable = new Set(
    factors
      .map(({ type }) => normalizeFactorType(type))
      .filter((factor) => ENROLLABLE_FACTORS.includes(factor)),
  );
  return [...enrollable].map(
    (factor): MfaOption => ({ id: `enroll:${factor}`, kind: 'enroll', factor }),
  );
}

const FACTOR_OF_OOB_CHANNEL: Record<OobChannel, string> = {
  sms: FACTOR_TYPE_SMS,
  voice: FACTOR_TYPE_VOICE,
  email: FACTOR_TYPE_EMAIL,
  auth0: FACTOR_TYPE_PUSH,
};

/**
 * @param authenticator - An authenticator.
 * @returns The factor it represents. An out-of-band authenticator is named by its `type`, or by
 * its channel when the API sends no `type`.
 */
function getAuthenticatorFactor(authenticator: MfaAuthenticator): string {
  const { authenticatorType, type, oobChannel } = authenticator;
  if (authenticatorType !== 'oob') return normalizeFactorType(authenticatorType);
  return normalizeFactorType(type ?? (oobChannel && FACTOR_OF_OOB_CHANNEL[oobChannel]) ?? 'oob');
}

/**
 * @param authenticators - Authenticators from the API.
 * @returns One challenge option per active authenticator the flow can challenge.
 */
function toChallengeOptions(authenticators: MfaAuthenticator[]): MfaOption[] {
  return authenticators
    .filter((authenticator) => authenticator.active)
    .filter((authenticator) =>
      CHALLENGEABLE_FACTORS.includes(getAuthenticatorFactor(authenticator)),
    )
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
