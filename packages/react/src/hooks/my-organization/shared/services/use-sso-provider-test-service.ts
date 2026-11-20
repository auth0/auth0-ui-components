/**
 * Internal SSO provider test service hook.
 * Handles starting an identity provider test and polling its result.
 * @module use-sso-provider-test-service
 * @internal
 */

import {
  getStatusCode,
  type CreateIdpTestResponseContent,
  type GetIdpTestResponseContent,
  type IdpId,
  type IdpTestId,
} from '@auth0/universal-components-core';
import { useMutation } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useErrorHandler } from '@/hooks/shared/use-error-handler';
import { usePollUntil } from '@/hooks/shared/use-poll-until';
import { useTranslator } from '@/hooks/shared/use-translator';
import {
  SSO_PROVIDER_TEST_FATAL_POLL_STATUSES,
  SSO_PROVIDER_TEST_MAX_POLL_ATTEMPTS,
  SSO_PROVIDER_TEST_MAX_POLL_DURATION_MS,
  SSO_PROVIDER_TEST_POLL_INTERVAL_MS,
} from '@/lib/constants/my-organization/idp-management/idp-management-constants';
import { isMutationLoading } from '@/lib/utils/tanstack-compat';
import type {
  SsoProviderTestPoll,
  UseSsoProviderTestServiceOptions,
  UseSsoProviderTestServiceReturn,
} from '@/types/my-organization/idp-management/sso-provider/sso-provider-test-types';

type PollOutcome = Pick<SsoProviderTestPoll, 'data' | 'error' | 'timedOut'> & {
  testId: IdpTestId | null;
};

const emptyOutcome = (testId: IdpTestId | null): PollOutcome => ({
  testId,
  data: undefined,
  error: null,
  timedOut: false,
});

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

  const [outcome, setOutcome] = useState<PollOutcome>(() => emptyOutcome(testId));
  const current = outcome.testId === testId ? outcome : emptyOutcome(testId);

  // Non-fatal errors (for example a token refresh) resolve to `null` so polling continues.
  const { start, stop, isPolling } = usePollUntil<GetIdpTestResponseContent | null>({
    request: async (signal) => {
      try {
        return await coreClient!
          .getMyOrganizationApiClient()
          .organization.identityProviders.tests.get(idpId, testId!, { abortSignal: signal });
      } catch (error) {
        if (SSO_PROVIDER_TEST_FATAL_POLL_STATUSES.has(getStatusCode(error) ?? 0)) throw error;
        return null;
      }
    },
    isDone: (data) => data !== null && data.status !== 'in_progress',
    getInterval: ({ elapsedMs, attempts }) =>
      attempts >= SSO_PROVIDER_TEST_MAX_POLL_ATTEMPTS ||
      elapsedMs >= SSO_PROVIDER_TEST_MAX_POLL_DURATION_MS
        ? false
        : SSO_PROVIDER_TEST_POLL_INTERVAL_MS,
    onDone: (data) => setOutcome({ ...emptyOutcome(testId), data: data ?? undefined }),
    onError: (error) => setOutcome({ ...emptyOutcome(testId), error }),
    onExhausted: () => setOutcome({ ...emptyOutcome(testId), timedOut: true }),
  });

  const canPoll = !!coreClient && !!idpId && !!testId;

  useEffect(() => {
    if (canPoll) start();
    else stop();
  }, [canPoll, testId, start, stop]);

  const poll: SsoProviderTestPoll = {
    data: current.data,
    error: current.error,
    isPolling,
    timedOut: current.timedOut,
    stop,
  };

  return {
    startTest,
    isStarting: isMutationLoading(startTestMutation),
    poll,
  };
}
