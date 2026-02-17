import {
  hasApiErrorBody,
  SsoProviderMappers,
  type CreateIdentityProviderRequestContent,
  type CreateIdentityProviderRequestContentPrivate,
  type IdentityProvider,
} from '@auth0/universal-components-core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { showToast } from '@/components/auth0/shared/toast';
import { ssoProviderQueryKeys } from '@/hooks/my-organization/use-sso-provider-table';
import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useErrorHandler } from '@/hooks/shared/use-error-handler';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { UseSsoProviderCreateOptions } from '@/types/my-organization/idp-management/sso-provider/sso-provider-create-types';

/** Extracts domain from "discovery failure: <domain>" error detail */
function extractDomainFromDiscoveryError(detail?: string): string | null {
  if (!detail) return null;
  const match = detail.match(/discovery failure:\s*(.+)/i);
  return match?.[1]?.trim() ?? null;
}

export interface UseSsoProviderCreateReturn {
  createProvider: (data: CreateIdentityProviderRequestContentPrivate) => Promise<void>;
  isCreating: boolean;
  error: unknown;
  retry: () => Promise<void>;
}

/**
 * Creates SSO providers with automatic error handling and cache management.
 */
export function useSsoProviderCreate({
  createAction,
  customMessages = {},
}: UseSsoProviderCreateOptions = {}): UseSsoProviderCreateReturn {
  const { coreClient } = useCoreClient();
  const { t } = useTranslator('idp_management.create_sso_provider', customMessages);
  const queryClient = useQueryClient();
  const handleError = useErrorHandler();

  const createProviderMutation = useMutation({
    mutationFn: async (
      data: CreateIdentityProviderRequestContentPrivate,
    ): Promise<IdentityProvider> => {
      const { strategy, name, display_name, ...configOptions } = data;

      const formData = {
        strategy,
        name,
        display_name,
        options: configOptions,
      };

      const apiRequestData: CreateIdentityProviderRequestContent =
        SsoProviderMappers.createToAPI(formData);

      const result: IdentityProvider = await coreClient!
        .getMyOrganizationApiClient()
        .organization.identityProviders.create(apiRequestData);

      return result;
    },
    onSuccess: (result, data) => {
      showToast({
        type: 'success',
        message: t('notifications.provider_create_success', { providerName: result.name }),
      });

      createAction?.onAfter?.(data, result);

      // Invalidate the providers list to refetch with the new provider
      queryClient.invalidateQueries({ queryKey: ssoProviderQueryKeys.list() });
    },
    onError: (error, data) => {
      // Handle specific business errors with custom messages
      if (
        hasApiErrorBody(error) &&
        error.body?.status === 409 &&
        error.body?.type === 'https://auth0.com/api-errors#A0E-409-0001'
      ) {
        showToast({
          type: 'error',
          message: t('notifications.provider_create_duplicated_provider_error', {
            providerName: data.name,
          }),
        });
        return;
      }

      // Handle discovery failure error for domain
      if (hasApiErrorBody(error)) {
        const domainFromError = extractDomainFromDiscoveryError(error.body?.detail);
        if (domainFromError) {
          showToast({
            type: 'error',
            message: t('notifications.provider_create_discovery_failure', {
              domain: domainFromError,
            }),
          });
          return;
        }
      }
      handleError(error);
    },
  });

  const createProvider = useCallback(
    async (data: CreateIdentityProviderRequestContentPrivate): Promise<void> => {
      if (!coreClient) {
        showToast({
          type: 'error',
          message: t('notifications.general_error'),
        });
        return;
      }

      if (createAction?.onBefore) {
        const canProceed = createAction.onBefore(data);
        if (!canProceed) {
          return;
        }
      }

      await createProviderMutation.mutateAsync(data);
    },
    [coreClient, t, createAction, createProviderMutation],
  );

  const retry = useCallback(async () => {
    if (createProviderMutation.variables) {
      await createProviderMutation.mutateAsync(createProviderMutation.variables);
    } else {
      createProviderMutation.reset();
    }
  }, [createProviderMutation]);

  return {
    createProvider,
    isCreating: createProviderMutation.isPending,
    error: createProviderMutation.error,
    retry,
  };
}
