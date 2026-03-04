/**
 * SSO provider edit hook.
 * @module use-sso-provider-edit
 */

import {
  OrganizationDetailsFactory,
  OrganizationDetailsMappers,
  SsoProviderMappers,
  MY_ORGANIZATION_SSO_PROVIDER_EDIT_SCOPES,
  type IdentityProvider,
  type IdpId,
  type OrganizationPrivate,
  type UpdateIdentityProviderRequestContent,
  type UpdateIdentityProviderRequestContentPrivate,
} from '@auth0/universal-components-core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo } from 'react';

import { showToast } from '@/components/auth0/shared/toast';
import { useConfig } from '@/hooks/my-organization/use-config';
import { useIdpConfig } from '@/hooks/my-organization/use-idp-config';
import { useScimTokens } from '@/hooks/my-organization/use-scim-tokens';
import { useSsoProvisioning } from '@/hooks/my-organization/use-sso-provisioning';
import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useErrorHandler } from '@/hooks/shared/use-error-handler';
import { useTranslator } from '@/hooks/shared/use-translator';
import type {
  UseSsoProviderEditOptions,
  UseSsoProviderEditReturn,
} from '@/types/my-organization/idp-management/sso-provider/sso-provider-edit-types';

const ACTION_CANCELLED_ERROR = 'ACTION_CANCELLED';

const isActionCancelledError = (error: unknown): boolean => {
  return error instanceof Error && error.message === ACTION_CANCELLED_ERROR;
};

export const ssoProviderEditQueryKeys = {
  all: ['sso-providers'] as const,
  detail: (idpId: IdpId) => [...ssoProviderEditQueryKeys.all, 'detail', idpId] as const,
  organization: () => ['organization', 'details'] as const,
  provisioning: (idpId: IdpId) => [...ssoProviderEditQueryKeys.all, 'provisioning', idpId] as const,
  scimTokens: (idpId: IdpId) => [...ssoProviderEditQueryKeys.all, 'scim-tokens', idpId] as const,
};

/**
 * Hook for editing SSO provider settings and provisioning.
 * @param idpId - Identity provider ID.
 * @param options - Hook options.
 * @param options.sso - SSO action callbacks.
 * @param options.provisioning - Provisioning action callbacks.
 * @param options.customMessages - Custom translation messages.
 * @returns Hook state and methods
 */
export function useSsoProviderEdit(
  idpId: IdpId,
  { sso, provisioning, customMessages = {} }: Partial<UseSsoProviderEditOptions> = {},
): UseSsoProviderEditReturn {
  const { coreClient } = useCoreClient();
  const { t } = useTranslator('idp_management.notifications', customMessages);
  const queryClient = useQueryClient();
  const handleError = useErrorHandler();
  const {
    shouldAllowDeletion,
    isLoadingConfig,
    error: configError,
    retry: configRetry,
  } = useConfig();
  const {
    idpConfig,
    isLoadingIdpConfig,
    isProvisioningEnabled,
    isProvisioningMethodEnabled,
    error: idpConfigError,
    retry: idpConfigRetry,
  } = useIdpConfig();

  /**
   * Provider query - fetches the identity provider details.
   * TanStack Query handles caching, loading states, and refetching.
   */
  const providerQuery = useQuery({
    queryKey: ssoProviderEditQueryKeys.detail(idpId),
    queryFn: async (): Promise<IdentityProvider> => {
      const response = await coreClient!
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_SSO_PROVIDER_EDIT_SCOPES)
        .organization.identityProviders.get(idpId);
      return response;
    },
    enabled: !!coreClient && !!idpId,
  });

  const organizationQuery = useQuery({
    queryKey: ssoProviderEditQueryKeys.organization(),
    queryFn: async (): Promise<OrganizationPrivate> => {
      const response = await coreClient!
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_SSO_PROVIDER_EDIT_SCOPES)
        .organizationDetails.get();
      return OrganizationDetailsMappers.fromAPI(response);
    },
    enabled: !!coreClient,
    initialData: OrganizationDetailsFactory.create(),
  });

  useEffect(() => {
    if (providerQuery.error) handleError(providerQuery.error);
  }, [providerQuery.error, handleError]);

  useEffect(() => {
    if (organizationQuery.error) handleError(organizationQuery.error);
  }, [organizationQuery.error, handleError]);

  const provider = providerQuery.data ?? null;

  const {
    provisioningConfig,
    isProvisioningLoading,
    isProvisioningUpdating,
    isProvisioningDeleting,
    isProvisioningAttributesSyncing,
    hasProvisioningAttributeSyncWarning,
    provisioningError,
    fetchProvisioning,
    createProvisioning,
    deleteProvisioning,
    syncProvisioningAttributes,
  } = useSsoProvisioning(idpId, provider, { provisioning, customMessages });

  const {
    listScimTokens,
    createScimToken,
    deleteScimToken,
    isScimTokensLoading,
    isScimTokenCreating,
    isScimTokenDeleting,
    scimTokensError,
  } = useScimTokens(idpId, provider, { provisioning, customMessages });

  const updateProviderMutation = useMutation({
    mutationFn: async (data: UpdateIdentityProviderRequestContent): Promise<IdentityProvider> => {
      const currentProvider = providerQuery.data;
      if (!currentProvider) throw new Error('Provider not loaded');

      if (sso?.updateAction?.onBefore && !sso.updateAction.onBefore(currentProvider)) {
        throw new Error(ACTION_CANCELLED_ERROR);
      }

      const apiRequestData = SsoProviderMappers.updateToAPI({
        strategy: currentProvider.strategy,
        ...data,
      });

      const result = await coreClient!
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_SSO_PROVIDER_EDIT_SCOPES)
        .organization.identityProviders.update(idpId, apiRequestData);

      return result;
    },
    onSuccess: async (result) => {
      const currentProvider = providerQuery.data;
      showToast({
        type: 'success',
        message: t('update_success', { providerName: currentProvider?.display_name }),
      });
      queryClient.setQueryData(ssoProviderEditQueryKeys.detail(idpId), result);
      if (sso?.updateAction?.onAfter && currentProvider) {
        await sso.updateAction.onAfter(currentProvider, result);
      }
    },
    onError: (error) => {
      if (!isActionCancelledError(error)) handleError(error);
    },
  });

  const deleteProviderMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      const currentProvider = providerQuery.data;
      if (!currentProvider?.id) throw new Error('Provider not loaded or missing ID');

      await coreClient!
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_SSO_PROVIDER_EDIT_SCOPES)
        .organization.identityProviders.delete(currentProvider.id);
    },
    onSuccess: async () => {
      const currentProvider = providerQuery.data;
      showToast({
        type: 'success',
        message: t('delete_success', { providerName: currentProvider?.display_name }),
      });
      queryClient.removeQueries({ queryKey: ssoProviderEditQueryKeys.detail(idpId) });
      queryClient.removeQueries({ queryKey: ssoProviderEditQueryKeys.provisioning(idpId) });
      if (sso?.deleteAction?.onAfter && currentProvider) {
        await sso.deleteAction.onAfter(currentProvider);
      }
    },
    onError: (error) => handleError(error),
  });

  const detachProviderMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      const currentProvider = providerQuery.data;
      if (!currentProvider?.id) throw new Error('Provider not loaded or missing ID');

      if (
        sso?.deleteFromOrganizationAction?.onBefore &&
        !sso.deleteFromOrganizationAction.onBefore(currentProvider)
      ) {
        throw new Error(ACTION_CANCELLED_ERROR);
      }

      await coreClient!
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_SSO_PROVIDER_EDIT_SCOPES)
        .organization.identityProviders.detach(currentProvider.id);
    },
    onSuccess: async () => {
      const currentProvider = providerQuery.data;
      const organization = organizationQuery.data;
      showToast({
        type: 'success',
        message: t('remove_success', {
          providerName: currentProvider?.display_name,
          organizationName: organization?.display_name,
        }),
      });
      queryClient.removeQueries({ queryKey: ssoProviderEditQueryKeys.detail(idpId) });
      if (sso?.deleteFromOrganizationAction?.onAfter && currentProvider) {
        await sso.deleteFromOrganizationAction.onAfter(currentProvider);
      }
    },
    onError: (error) => {
      if (!isActionCancelledError(error)) handleError(error);
    },
  });

  const syncSsoAttributesMutation = useMutation({
    mutationFn: async () => {
      await coreClient!
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_SSO_PROVIDER_EDIT_SCOPES)
        .organization.identityProviders.updateAttributes(idpId, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ssoProviderEditQueryKeys.detail(idpId) });
      showToast({ type: 'success', message: t('sso_attributes_sync_success') });
    },
    onError: (error) => handleError(error),
  });

  const updateProvider = useCallback(
    async (data: UpdateIdentityProviderRequestContentPrivate) => {
      if (!coreClient || !providerQuery.data) return;
      try {
        await updateProviderMutation.mutateAsync(
          data as unknown as UpdateIdentityProviderRequestContent,
        );
      } catch (error) {
        if (!isActionCancelledError(error)) throw error;
      }
    },
    [coreClient, providerQuery.data, updateProviderMutation],
  );

  const onDeleteConfirm = useCallback(async () => {
    if (!coreClient || !providerQuery.data?.id) return;
    await deleteProviderMutation.mutateAsync();
  }, [coreClient, deleteProviderMutation, providerQuery.data?.id]);

  const onRemoveConfirm = useCallback(async () => {
    if (!coreClient || !providerQuery.data?.id) return;
    try {
      await detachProviderMutation.mutateAsync();
    } catch (error) {
      if (!isActionCancelledError(error)) throw error;
    }
  }, [coreClient, detachProviderMutation, providerQuery.data?.id]);

  const syncSsoAttributes = useCallback(async () => {
    if (!coreClient) return;
    await syncSsoAttributesMutation.mutateAsync();
  }, [coreClient, syncSsoAttributesMutation]);

  const fetchProvider = useCallback(async () => {
    const result = await queryClient.fetchQuery({
      queryKey: ssoProviderEditQueryKeys.detail(idpId),
      queryFn: async (): Promise<IdentityProvider> => {
        const response = await coreClient!
          .getMyOrganizationApiClient()
          .withScopes(MY_ORGANIZATION_SSO_PROVIDER_EDIT_SCOPES)
          .organization.identityProviders.get(idpId);
        return response;
      },
    });
    return result;
  }, [queryClient, idpId, coreClient]);

  const hasSsoAttributeSyncWarning = useMemo(() => {
    const currentProvider = providerQuery.data;
    const attributes =
      currentProvider && 'attributes' in currentProvider ? (currentProvider.attributes ?? []) : [];
    return attributes.some((attr) => attr.is_extra || attr.is_missing);
  }, [providerQuery.data]);

  const showProvisioningTab =
    isProvisioningEnabled(providerQuery.data?.strategy) &&
    isProvisioningMethodEnabled(providerQuery.data?.strategy);

  const handleToggleProvider = useCallback(
    async (enabled: boolean) => {
      if (!providerQuery.data?.strategy) return;
      await updateProvider({
        strategy: providerQuery.data.strategy,
        is_enabled: enabled,
      });
    },
    [providerQuery.data?.strategy, updateProvider],
  );

  const error =
    providerQuery.error ||
    organizationQuery.error ||
    configError ||
    idpConfigError ||
    provisioningError ||
    scimTokensError ||
    updateProviderMutation.error ||
    deleteProviderMutation.error ||
    detachProviderMutation.error ||
    syncSsoAttributesMutation.error;

  const retry = async () => {
    if (configError) {
      await configRetry();
      return;
    }
    if (idpConfigError) {
      await idpConfigRetry();
      return;
    }

    const queries = [
      { error: providerQuery.error, key: ssoProviderEditQueryKeys.detail(idpId) },
      { error: organizationQuery.error, key: ssoProviderEditQueryKeys.organization() },
      { error: provisioningError, key: ssoProviderEditQueryKeys.provisioning(idpId) },
    ];

    const failedQuery = queries.find((q) => q.error);
    if (failedQuery) {
      await queryClient.invalidateQueries({ queryKey: failedQuery.key });
      return;
    }

    const mutations = [
      {
        error: updateProviderMutation.error,
        retry: () =>
          updateProviderMutation.variables &&
          updateProviderMutation.mutateAsync(updateProviderMutation.variables),
      },
      {
        error: deleteProviderMutation.error,
        retry: () => deleteProviderMutation.mutateAsync(),
      },
      {
        error: detachProviderMutation.error,
        retry: () => detachProviderMutation.mutateAsync(),
      },
      {
        error: syncSsoAttributesMutation.error,
        retry: () => syncSsoAttributesMutation.mutateAsync(),
      },
    ];

    const failedMutation = mutations.find((m) => m.error);
    if (failedMutation) {
      await failedMutation.retry();
    }
  };

  return {
    provider,
    organization: organizationQuery.data ?? OrganizationDetailsFactory.create(),
    provisioningConfig,
    isLoading: providerQuery.isLoading || organizationQuery.isLoading,
    isUpdating: updateProviderMutation.isPending,
    isDeleting: deleteProviderMutation.isPending,
    isRemoving: detachProviderMutation.isPending,
    isProvisioningUpdating,
    isProvisioningDeleting,
    isProvisioningLoading,
    isScimTokensLoading,
    isScimTokenCreating,
    isScimTokenDeleting,
    isSsoAttributesSyncing: syncSsoAttributesMutation.isPending,
    isProvisioningAttributesSyncing,
    hasSsoAttributeSyncWarning,
    hasProvisioningAttributeSyncWarning,
    shouldAllowDeletion,
    isLoadingConfig,
    idpConfig,
    isLoadingIdpConfig,
    showProvisioningTab,
    error,
    retry,
    fetchProvider,
    fetchProvisioning,
    updateProvider,
    handleToggleProvider,
    onDeleteConfirm,
    onRemoveConfirm,
    createProvisioning,
    deleteProvisioning,
    listScimTokens,
    createScimToken,
    deleteScimToken,
    syncSsoAttributes,
    syncProvisioningAttributes,
  };
}
