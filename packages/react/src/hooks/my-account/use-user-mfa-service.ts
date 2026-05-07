/**
 * MFA service hook with TanStack Query.
 * @module use-user-mfa-service
 * @internal
 */

import {
  MFAMappers,
  mfaQueryKeys,
  type Authenticator,
  type MFAType,
  type EnrollOptions,
  type ConfirmEnrollmentOptions,
} from '@auth0/universal-components-core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef } from 'react';

import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useErrorHandler } from '@/hooks/shared/use-error-handler';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { UseUserMFAServiceReturn, UserMFAMgmtProps } from '@/types/my-account/mfa/mfa-types';

/**
 * Internal service hook for MFA operations backed by TanStack Query.
 * Provides queries and mutations; use `useUserMFA` for the public API.
 * @param onlyActive - Whether to return only active factors.
 * @param customMessages - Optional custom i18n messages for MFA translations.
 * @returns MFA query and mutation handlers for factor listing and enrollment lifecycle operations.
 * @internal
 */
export function useUserMFAService(
  onlyActive: boolean,
  customMessages: UserMFAMgmtProps['customMessages'] = {},
): UseUserMFAServiceReturn {
  const { coreClient } = useCoreClient();
  const { t } = useTranslator('mfa', customMessages);
  const queryClient = useQueryClient();
  const handleError = useErrorHandler();
  const hasFiredFactorsError = useRef(false);

  const factorsQuery = useQuery<Record<MFAType, Authenticator[]>>({
    queryKey: mfaQueryKeys.factors(onlyActive),
    queryFn: async () => {
      const client = coreClient!.getMyAccountApiClient();
      const [availableFactors, enrolledFactors] = await Promise.all([
        client.factors.list(),
        client.authenticationMethods.list(),
      ]);
      return MFAMappers.fromAPI(availableFactors, enrolledFactors, onlyActive) as Record<
        MFAType,
        Authenticator[]
      >;
    },
    enabled: !!coreClient,
  });

  useEffect(() => {
    if (!factorsQuery.isError) {
      hasFiredFactorsError.current = false;
      return;
    }
    if (hasFiredFactorsError.current) return;
    hasFiredFactorsError.current = true;
    handleError(factorsQuery.error, { fallbackMessage: t('errors.factors_loading_error') });
  }, [factorsQuery.isError, factorsQuery.error, handleError, t]);

  const enrollMutation = useMutation({
    mutationFn: ({
      factorType,
      options = {},
    }: {
      factorType: MFAType;
      options?: EnrollOptions;
    }) => {
      const client = coreClient!.getMyAccountApiClient();
      const params = MFAMappers.buildEnrollParams(factorType, options);
      return client.authenticationMethods.create(params);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (authenticatorId: string) =>
      coreClient!.getMyAccountApiClient().authenticationMethods.delete(authenticatorId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: mfaQueryKeys.factors(onlyActive) });
    },
    onError: (error) => {
      handleError(error, { fallbackMessage: t('errors.delete_factor') });
    },
  });

  const confirmEnrollmentMutation = useMutation({
    mutationFn: ({
      factorType,
      authSession,
      authenticationMethodId,
      options,
    }: {
      factorType: MFAType;
      authSession: string;
      authenticationMethodId: string;
      options: ConfirmEnrollmentOptions;
    }) => {
      const client = coreClient!.getMyAccountApiClient();
      const params = MFAMappers.buildConfirmEnrollmentParams(factorType, authSession, options);
      return client.authenticationMethods.verify(authenticationMethodId, params);
    },
  });

  return {
    factorsQuery,
    enrollMutation,
    deleteMutation,
    confirmEnrollmentMutation,
  };
}
