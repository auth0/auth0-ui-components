/**
 * Internal SSO provider test service hook.
 * Handles starting an identity provider test and polling its result.
 * @module use-sso-provider-test-service
 * @internal
 */

import {
  getStatusCode,
  ssoProviderQueryKeys,
  type CreateIdpTestResponseContent,
  type GetIdpTestResponseContent,
  type IdpId,
  type IdpTestId,
} from '@auth0/universal-components-core';
import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';

import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useErrorHandler } from '@/hooks/shared/use-error-handler';
import { usePollUntil } from '@/hooks/shared/use-poll-until';
import { useTranslator } from '@/hooks/shared/use-translator';
import { isMutationLoading } from '@/lib/utils/tanstack-compat';
import type {
  UseSsoProviderTestServiceOptions,
  UseSsoProviderTestServiceReturn,
} from '@/types/my-organization/idp-management/sso-provider/sso-provider-test-types';

/** Poll errors that end the test: missing scope, or a test that expired or never existed. */
const FATAL_POLL_STATUSES = new Set([403, 404]);

/**
 * Starts identity provider tests and polls the current one.
 * @param idpId - Identity provider being tested.
 * @param testId - Test to poll, or `null` when no test is running.
 * @param options - {@link UseSsoProviderTestServiceOptions}
 * @returns `startTest`, its loading flag, and the poll for the current test.
 * @internal
 */
export function useSsoProviderTestService(
  idpId: IdpId,
  testId: IdpTestId | null,
  { customMessages = {} }: UseSsoProviderTestServiceOptions = {},
): UseSsoProviderTestServiceReturn {
  const { coreClient } = useCoreClient();
  const { t } = useTranslator('idp_management.notifications', customMessages);
  const handleError = useErrorHandler();

  const startTestMutation = useMutation({
    // The API rejects any body field, so the request body must stay empty.
    mutationFn: async (): Promise<CreateIdpTestResponseContent> =>
      coreClient!
        .getMyOrganizationApiClient()
        .organization.identityProviders.tests.create(idpId, {}),
    onError: (error) => {
      handleError(error, { fallbackMessage: t('test_provider_start_error') });
    },
  });

  const { mutateAsync } = startTestMutation;

  const startTest = useCallback(async (): Promise<CreateIdpTestResponseContent | null> => {
    if (!coreClient || !idpId) return null;
    try {
      return await mutateAsync();
    } catch {
      return null;
    }
  }, [coreClient, idpId, mutateAsync]);

  const poll = usePollUntil<GetIdpTestResponseContent>({
    queryKey: ssoProviderQueryKeys.test(idpId, testId ?? ''),
    queryFn: () =>
      coreClient!
        .getMyOrganizationApiClient()
        .organization.identityProviders.tests.get(idpId, testId!),
    isDone: (data) => data.status !== 'in_progress',
    isFatalError: (error) => FATAL_POLL_STATUSES.has(getStatusCode(error) ?? 0),
    enabled: !!coreClient && !!idpId && !!testId,
  });

  return {
    startTest,
    isStarting: isMutationLoading(startTestMutation),
    poll,
  };
}
