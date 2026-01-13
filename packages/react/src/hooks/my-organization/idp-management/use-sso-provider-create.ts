import {
  hasApiErrorBody,
  SsoProviderMappers,
  type CreateIdentityProviderRequestContent,
  type CreateIdentityProviderRequestContentPrivate,
  type IdentityProvider,
} from '@auth0/universal-components-core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { showToast } from '../../../components/ui/toast';
import { useCoreClient } from '../../../hooks/use-core-client';
import { useTranslator } from '../../../hooks/use-translator';
import type { UseSsoProviderCreateOptions } from '../../../types/my-organization/idp-management/sso-provider/sso-provider-create-types';

import { ssoProviderQueryKeys } from './use-sso-provider-table';

export interface UseSsoProviderCreateReturn {
  createProvider: (data: CreateIdentityProviderRequestContentPrivate) => Promise<void>;
  isCreating: boolean;
}

/**
 * Custom hook for creating SSO providers.
 * Uses TanStack Query for mutation management and cache invalidation.
 */
export function useSsoProviderCreate({
  createAction,
  customMessages = {},
}: UseSsoProviderCreateOptions = {}): UseSsoProviderCreateReturn {
  const { coreClient } = useCoreClient();
  const { t } = useTranslator('idp_management.create_sso_provider', customMessages);
  const queryClient = useQueryClient();

  // ============================================
  // MUTATION
  // ============================================

  const createProviderMutation = useMutation({
    mutationFn: async (
      data: CreateIdentityProviderRequestContentPrivate,
    ): Promise<IdentityProvider> => {
      if (!coreClient) {
        throw new Error('Core client not available');
      }

      if (createAction?.onBefore) {
        const canProceed = createAction.onBefore(data);
        if (!canProceed) {
          throw new Error('Creation cancelled by onBefore hook');
        }
      }

      const { strategy, name, display_name, ...configOptions } = data;

      const formData = {
        strategy,
        name,
        display_name,
        options: configOptions,
      };

      const apiRequestData: CreateIdentityProviderRequestContent =
        SsoProviderMappers.createToAPI(formData);

      const result: IdentityProvider = await coreClient
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
      } else {
        showToast({
          type: 'error',
          message: t('notifications.general_error'),
        });
      }
    },
  });

  // ============================================
  // ACTION - Wrapper around mutation
  // ============================================

  const createProvider = useCallback(
    async (data: CreateIdentityProviderRequestContentPrivate): Promise<void> => {
      await createProviderMutation.mutateAsync(data);
    },
    [createProviderMutation],
  );

  return {
    createProvider,
    isCreating: createProviderMutation.isPending,
  };
}
