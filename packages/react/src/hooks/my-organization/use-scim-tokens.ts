/**
 * SCIM token management hook.
 * @module use-scim-tokens
 */

import {
  MY_ORGANIZATION_SSO_PROVIDER_EDIT_SCOPES,
  type IdentityProvider,
  type IdpId,
  type CreateIdpProvisioningScimTokenRequestContent,
  type CreateIdpProvisioningScimTokenResponseContent,
  type ListIdpProvisioningScimTokensResponseContent,
} from '@auth0/universal-components-core';
import { useMutation } from '@tanstack/react-query';
import { useCallback } from 'react';

import { showToast } from '@/components/auth0/shared/toast';
import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useErrorHandler } from '@/hooks/shared/use-error-handler';
import { useTranslator } from '@/hooks/shared/use-translator';
import {
  ACTION_CANCELLED_ERROR,
  isActionCancelledError,
} from '@/lib/utils/my-organization/action-cancelled';
import type { SsoProvisioningTabEditProps } from '@/types/my-organization/idp-management/sso-provisioning/sso-provisioning-tab-types';

export interface UseScimTokensOptions {
  provisioning?: SsoProvisioningTabEditProps;
  customMessages?: Record<string, unknown>;
}

export interface UseScimTokensReturn {
  listScimTokens: () => Promise<ListIdpProvisioningScimTokensResponseContent | null>;
  createScimToken: (
    data: CreateIdpProvisioningScimTokenRequestContent,
  ) => Promise<CreateIdpProvisioningScimTokenResponseContent>;
  deleteScimToken: (idpScimTokenId: string) => Promise<void>;
  isScimTokensLoading: boolean;
  isScimTokenCreating: boolean;
  isScimTokenDeleting: boolean;
  scimTokensError: unknown;
}

/**
 * Hook for managing SCIM tokens for an identity provider.
 * @param idpId - Identity provider ID.
 * @param provider - The current identity provider (may be null while loading).
 * @param options - Hook options.
 * @returns SCIM token operations and loading states.
 */
export function useScimTokens(
  idpId: IdpId,
  provider: IdentityProvider | null,
  { provisioning, customMessages = {} }: UseScimTokensOptions = {},
): UseScimTokensReturn {
  const { coreClient } = useCoreClient();
  const { t } = useTranslator('idp_management.notifications', customMessages);
  const handleError = useErrorHandler();

  const listScimTokensMutation = useMutation({
    mutationFn: async () => {
      if (!coreClient || !idpId) return null;

      const result = await coreClient
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_SSO_PROVIDER_EDIT_SCOPES)
        .organization.identityProviders.provisioning.scimTokens.list(idpId);
      return result;
    },
    onError: (error) => handleError(error),
  });

  const createScimTokenMutation = useMutation({
    mutationFn: async (data: CreateIdpProvisioningScimTokenRequestContent) => {
      if (!provider) throw new Error('Provider not loaded');

      if (
        provisioning?.createScimTokenAction?.onBefore &&
        !provisioning.createScimTokenAction.onBefore(provider)
      ) {
        throw new Error(ACTION_CANCELLED_ERROR);
      }

      const result = await coreClient!
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_SSO_PROVIDER_EDIT_SCOPES)
        .organization.identityProviders.provisioning.scimTokens.create(idpId, data);

      return result;
    },
    onSuccess: async (result) => {
      showToast({ type: 'success', message: t('scim_token_create_success') });
      if (provisioning?.createScimTokenAction?.onAfter && provider) {
        await provisioning.createScimTokenAction.onAfter(provider, result);
      }
    },
    onError: (error) => {
      if (!isActionCancelledError(error)) handleError(error);
    },
  });

  const deleteScimTokenMutation = useMutation({
    mutationFn: async (idpScimTokenId: string): Promise<void> => {
      if (!provider) throw new Error('Provider not loaded');

      if (
        provisioning?.deleteScimTokenAction?.onBefore &&
        !provisioning.deleteScimTokenAction.onBefore(provider)
      ) {
        throw new Error(ACTION_CANCELLED_ERROR);
      }

      await coreClient!
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_SSO_PROVIDER_EDIT_SCOPES)
        .organization.identityProviders.provisioning.scimTokens.delete(idpId, idpScimTokenId);
    },
    onSuccess: async () => {
      showToast({ type: 'success', message: t('scim_token_delete_success') });
      if (provisioning?.deleteScimTokenAction?.onAfter && provider) {
        await provisioning.deleteScimTokenAction.onAfter(provider);
      }
    },
    onError: (error) => {
      if (!isActionCancelledError(error)) handleError(error);
    },
  });

  const listScimTokens = useCallback(async () => {
    return await listScimTokensMutation.mutateAsync();
  }, [listScimTokensMutation]);

  const createScimToken = useCallback(
    async (data: CreateIdpProvisioningScimTokenRequestContent) => {
      return await createScimTokenMutation.mutateAsync(data);
    },
    [createScimTokenMutation],
  );

  const deleteScimToken = useCallback(
    async (idpScimTokenId: string) => {
      if (!coreClient || !provider) return;
      try {
        await deleteScimTokenMutation.mutateAsync(idpScimTokenId);
      } catch (error) {
        if (!isActionCancelledError(error)) throw error;
      }
    },
    [coreClient, deleteScimTokenMutation, provider],
  );

  return {
    listScimTokens,
    createScimToken,
    deleteScimToken,
    isScimTokensLoading: listScimTokensMutation.isPending,
    isScimTokenCreating: createScimTokenMutation.isPending,
    isScimTokenDeleting: deleteScimTokenMutation.isPending,
    scimTokensError:
      listScimTokensMutation.error ||
      createScimTokenMutation.error ||
      deleteScimTokenMutation.error,
  };
}
