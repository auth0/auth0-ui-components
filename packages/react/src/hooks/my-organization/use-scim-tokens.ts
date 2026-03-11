/**
 * SCIM tokens hook.
 * @module use-scim-tokens
 */

import {
  type IdentityProvider,
  type IdpId,
  type CreateIdpProvisioningScimTokenRequestContent,
  type CreateIdpProvisioningScimTokenResponseContent,
  type ListIdpProvisioningScimTokensResponseContent,
  MY_ORGANIZATION_SSO_PROVIDER_EDIT_SCOPES,
} from '@auth0/universal-components-core';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { showToast } from '@/components/auth0/shared/toast';
import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useTranslator } from '@/hooks/shared/use-translator';
import {
  ACTION_CANCELLED_ERROR,
  isActionCancelledError,
} from '@/lib/utils/my-organization/idp-management/actions';
import { ssoProviderEditQueryKeys } from '@/lib/utils/my-organization/idp-management/sso-provider-edit-query-keys';
import type { SsoProvisioningTabEditProps } from '@/types/my-organization/idp-management/sso-provisioning/sso-provisioning-tab-types';

export interface UseScimTokensOptions {
  provider: IdentityProvider | null;
  createScimTokenAction?: SsoProvisioningTabEditProps['createScimTokenAction'];
  deleteScimTokenAction?: SsoProvisioningTabEditProps['deleteScimTokenAction'];
  customMessages?: Record<string, unknown>;
}

export interface UseScimTokensReturn {
  isScimTokensLoading: boolean;
  isScimTokenCreating: boolean;
  isScimTokenDeleting: boolean;
  listScimTokens: () => Promise<ListIdpProvisioningScimTokensResponseContent | null>;
  createScimToken: (
    data: CreateIdpProvisioningScimTokenRequestContent,
  ) => Promise<CreateIdpProvisioningScimTokenResponseContent | undefined>;
  deleteScimToken: (idpScimTokenId: string) => Promise<void>;
}

/**
 * Hook for SCIM token operations.
 * @param idpId - Identity provider ID.
 * @param options - Hook options.
 * @returns SCIM token loading states and actions.
 * @internal
 */
export function useScimTokens(
  idpId: IdpId,
  {
    provider,
    createScimTokenAction,
    deleteScimTokenAction,
    customMessages = {},
  }: UseScimTokensOptions,
): UseScimTokensReturn {
  const { coreClient } = useCoreClient();
  const { t } = useTranslator('idp_management.notifications', customMessages);
  const queryClient = useQueryClient();

  /**
   * List SCIM tokens mutation - fetches SCIM tokens for provisioning.
   * Uses imperative fetching rather than a query because tokens are fetched
   * on-demand and include sensitive data that shouldn't be automatically cached.
   */
  const listScimTokensMutation = useMutation({
    mutationFn: async () => {
      if (!coreClient || !idpId) {
        return null;
      }

      const result = await coreClient
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_SSO_PROVIDER_EDIT_SCOPES)
        .organization.identityProviders.provisioning.scimTokens.list(idpId);
      return result;
    },
    onError: () => {
      showToast({ type: 'error', message: t('general_error') });
    },
  });

  const listScimTokens = useCallback(async () => {
    try {
      return await listScimTokensMutation.mutateAsync();
    } catch {
      return null;
    }
  }, [listScimTokensMutation]);

  const createScimTokenMutation = useMutation({
    mutationFn: async (data: CreateIdpProvisioningScimTokenRequestContent) => {
      if (!provider) {
        throw new Error('Provider not loaded');
      }

      if (createScimTokenAction?.onBefore) {
        const canProceed = createScimTokenAction.onBefore(provider);
        if (!canProceed) {
          throw new Error(ACTION_CANCELLED_ERROR);
        }
      }

      const result = await coreClient!
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_SSO_PROVIDER_EDIT_SCOPES)
        .organization.identityProviders.provisioning.scimTokens.create(idpId, data);

      return result;
    },
    onSuccess: async (result) => {
      showToast({ type: 'success', message: t('scim_token_create_success') });

      await queryClient.invalidateQueries({
        queryKey: ssoProviderEditQueryKeys.scimTokens(idpId),
      });

      if (createScimTokenAction?.onAfter && provider) {
        await createScimTokenAction.onAfter(provider, result);
      }
    },
    onError: (error) => {
      if (isActionCancelledError(error)) return;
      showToast({ type: 'error', message: t('general_error') });
    },
  });

  const createScimToken = useCallback(
    async (data: CreateIdpProvisioningScimTokenRequestContent) => {
      if (!coreClient || !idpId || !provider) {
        return undefined;
      }

      try {
        return await createScimTokenMutation.mutateAsync(data);
      } catch (error) {
        if (!isActionCancelledError(error)) {
          throw error;
        }
        return undefined;
      }
    },
    [coreClient, createScimTokenMutation, idpId, provider],
  );

  const deleteScimTokenMutation = useMutation({
    mutationFn: async (idpScimTokenId: string): Promise<void> => {
      if (!provider) {
        throw new Error('Provider not loaded');
      }

      if (deleteScimTokenAction?.onBefore) {
        const canProceed = deleteScimTokenAction.onBefore(provider);
        if (!canProceed) {
          throw new Error(ACTION_CANCELLED_ERROR);
        }
      }

      await coreClient!
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_SSO_PROVIDER_EDIT_SCOPES)
        .organization.identityProviders.provisioning.scimTokens.delete(idpId, idpScimTokenId);
    },
    onSuccess: async () => {
      showToast({ type: 'success', message: t('scim_token_delete_sucess') });

      await queryClient.invalidateQueries({
        queryKey: ssoProviderEditQueryKeys.scimTokens(idpId),
      });

      if (deleteScimTokenAction?.onAfter && provider) {
        await deleteScimTokenAction.onAfter(provider);
      }
    },
    onError: (error) => {
      if (isActionCancelledError(error)) return;
      showToast({ type: 'error', message: t('general_error') });
    },
  });

  const deleteScimToken = useCallback(
    async (idpScimTokenId: string): Promise<void> => {
      if (!coreClient || !idpId || !provider) {
        return;
      }

      try {
        await deleteScimTokenMutation.mutateAsync(idpScimTokenId);
      } catch (error) {
        if (!isActionCancelledError(error)) {
          throw error;
        }
      }
    },
    [coreClient, deleteScimTokenMutation, idpId, provider],
  );

  return {
    isScimTokensLoading: listScimTokensMutation.isPending,
    isScimTokenCreating: createScimTokenMutation.isPending,
    isScimTokenDeleting: deleteScimTokenMutation.isPending,
    listScimTokens,
    createScimToken,
    deleteScimToken,
  };
}
