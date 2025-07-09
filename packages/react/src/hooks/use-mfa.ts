import { useCallback } from 'react';
import { useCoreClient } from './use-core-client';
import type {
  MFAType,
  EnrollMfaResponse,
  EnhancedEnrollMfaResponse,
  Authenticator,
  EnrollOptions,
  ConfirmEnrollmentOptions,
  ResolveChallengeOptions,
  ResolveChallengeResponse,
} from '@auth0-web-ui-components/core';

export interface UseMfaResult {
  fetchFactors: (onlyActive?: boolean) => Promise<Authenticator[]>;
  enrollMfa: (factorName: MFAType, options?: EnrollOptions) => Promise<EnrollMfaResponse>;
  enrollMfaWithChallenge: (
    factorName: MFAType,
    options?: EnrollOptions,
  ) => Promise<EnhancedEnrollMfaResponse>;
  resolveChallenge: (options: ResolveChallengeOptions) => Promise<ResolveChallengeResponse>;
  deleteMfa: (authenticatorId: string) => Promise<void>;
  confirmEnrollment: (factorName: MFAType, options: ConfirmEnrollmentOptions) => Promise<unknown>;
}

/**
 * A custom React hook for managing all Multi-Factor Authentication (MFA) operations.
 * @returns {UseMfaResult} An object containing the functions to manage MFA factors.
 */
export function useMFA(): UseMfaResult {
  const { coreClient } = useCoreClient();

  if (!coreClient) {
    throw new Error(
      'CoreClient is not initialized. Make sure you are using useMFA within an Auth0ComponentProvider.',
    );
  }

  const fetchFactors = useCallback(
    (onlyActive = false) => coreClient.authentication.mfa.fetchFactors(onlyActive),
    [coreClient],
  );

  const enrollMfa = useCallback(
    (factorName: MFAType, options: EnrollOptions = {}) =>
      coreClient.authentication.mfa.enrollFactor(factorName, options),
    [coreClient],
  );

  const enrollMfaWithChallenge = useCallback(
    (factorName: MFAType, options: EnrollOptions = {}) =>
      (
        coreClient.authentication.mfa as typeof coreClient.authentication.mfa & {
          enrollFactorWithChallenge: (
            f: MFAType,
            o?: EnrollOptions,
          ) => Promise<EnhancedEnrollMfaResponse>;
        }
      ).enrollFactorWithChallenge(factorName, options),
    [coreClient],
  );

  const resolveChallenge = useCallback(
    (options: ResolveChallengeOptions) =>
      (
        coreClient.authentication.mfa as typeof coreClient.authentication.mfa & {
          resolveChallenge: (o: ResolveChallengeOptions) => Promise<ResolveChallengeResponse>;
        }
      ).resolveChallenge(options),
    [coreClient],
  );

  const deleteMfa = useCallback(
    (authenticatorId: string) => coreClient.authentication.mfa.deleteFactor(authenticatorId),
    [coreClient],
  );

  const confirmEnrollment = useCallback(
    (factorName: MFAType, options: ConfirmEnrollmentOptions) =>
      coreClient.authentication.mfa.confirmEnrollment(factorName, options),
    [coreClient],
  );

  return {
    fetchFactors,
    enrollMfa,
    enrollMfaWithChallenge,
    resolveChallenge,
    deleteMfa,
    confirmEnrollment,
  };
}
