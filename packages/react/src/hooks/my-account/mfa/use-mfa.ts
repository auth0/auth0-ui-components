import type {
  MFAType,
  EnrollOptions,
  ConfirmEnrollmentOptions,
} from '@auth0/universal-components-core';
import { MFAMappers } from '@auth0/universal-components-core';
import { useCallback } from 'react';

import type { UseMFAResult } from '../../../types/my-account/mfa/mfa-types';
import { useCoreClient } from '../../use-core-client';

export function useMFA(): UseMFAResult {
  const { coreClient } = useCoreClient();

  if (!coreClient) {
    throw new Error(
      'useMFA must be used within Auth0ComponentProvider with initialized CoreClient',
    );
  }

  const fetchFactors = useCallback(
    async (onlyActive = false) => {
      const client = coreClient.getMyAccountApiClient();
      const [availableFactorsResponse, enrolledFactorsResponse] = await Promise.all([
        client.factors.list(),
        client.authenticationMethods.list(),
      ]);
      return MFAMappers.fromAPI(availableFactorsResponse, enrolledFactorsResponse, onlyActive);
    },
    [coreClient],
  );

  const enrollMfa = useCallback(
    (factorName: MFAType, options: EnrollOptions = {}) => {
      const client = coreClient.getMyAccountApiClient();
      const params = MFAMappers.buildEnrollParams(factorName, options);
      return client.authenticationMethods.create(params);
    },
    [coreClient],
  );

  const deleteMfa = useCallback(
    (authenticatorId: string) =>
      coreClient.getMyAccountApiClient().authenticationMethods.delete(authenticatorId),
    [coreClient],
  );

  const confirmEnrollment = useCallback(
    (
      factorType: MFAType,
      authSession: string,
      authenticationMethodId: string,
      options: ConfirmEnrollmentOptions,
    ) => {
      const client = coreClient.getMyAccountApiClient();
      const params = MFAMappers.buildConfirmEnrollmentParams(factorType, authSession, options);
      return client.authenticationMethods.verify(authenticationMethodId, params);
    },
    [coreClient],
  );

  return {
    fetchFactors,
    enrollMfa,
    deleteMfa,
    confirmEnrollment,
  };
}
