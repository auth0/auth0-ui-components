import type {
  MFAType,
  EnrollOptions,
  ConfirmEnrollmentOptions,
} from '@auth0-web-ui-components/core';
import { useCallback } from 'react';

import type { UseMFAResult } from '@/types';

import { useCoreClient } from '../../use-core-client';

/**
 * A custom React hook for managing all Multi-Factor Authentication (MFA) operations.
 * @returns {UseMfaResult} An object containing the functions to manage MFA factors.
 */
export function useMFA(): UseMFAResult {
  const { coreClient } = useCoreClient();

  if (!coreClient) {
    throw new Error(
      'useMFA must be used within Auth0ComponentProvider with initialized CoreClient',
    );
  }

  const fetchFactors = useCallback(
    (onlyActive = false) => coreClient.getAuthenticationApiService().mfa.fetchFactors(onlyActive),
    [coreClient],
  );

  const enrollMfa = useCallback(
    (factorName: MFAType, options: EnrollOptions = {}) =>
      coreClient.getAuthenticationApiService().mfa.enrollFactor(factorName, options),
    [coreClient],
  );

  const deleteMfa = useCallback(
    (authenticatorId: string) =>
      coreClient.getAuthenticationApiService().mfa.deleteFactor(authenticatorId),
    [coreClient],
  );

  const confirmEnrollment = useCallback(
    (factorName: MFAType, options: ConfirmEnrollmentOptions) =>
      coreClient.getAuthenticationApiService().mfa.confirmEnrollment(factorName, options),
    [coreClient],
  );

  return {
    fetchFactors,
    enrollMfa,
    deleteMfa,
    confirmEnrollment,
  };
}
