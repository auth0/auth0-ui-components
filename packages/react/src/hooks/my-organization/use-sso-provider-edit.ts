import {
  OrganizationDetailsFactory,
  OrganizationDetailsMappers,
  SsoProviderMappers,
  MY_ORGANIZATION_SSO_PROVIDER_EDIT_SCOPES,
  type IdentityProvider,
  type IdpId,
  type OrganizationPrivate,
  type UpdateIdentityProviderRequestContent,
  type CreateIdpProvisioningScimTokenRequestContent,
  type GetIdPProvisioningConfigResponseContent,
  getStatusCode,
} from '@auth0/universal-components-core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo } from 'react';

import { showToast } from '@/components/auth0/shared/toast';
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
 * Hook for editing SSO identity provider configuration and provisioning.
 */
export function useSsoProviderEdit(
  idpId: IdpId,
  { sso, provisioning, customMessages = {} }: Partial<UseSsoProviderEditOptions> = {},
): UseSsoProviderEditReturn {
  const { coreClient } = useCoreClient();
  const { t } = useTranslator('idp_management.notifications', customMessages);
  const queryClient = useQueryClient();
  const handleError = useErrorHandler();

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

  const provisioningQuery = useQuery({
    queryKey: ssoProviderEditQueryKeys.provisioning(idpId),
    queryFn: async (): Promise<GetIdPProvisioningConfigResponseContent | null> => {
      try {
        const result = await coreClient!
          .getMyOrganizationApiClient()
          .withScopes(MY_ORGANIZATION_SSO_PROVIDER_EDIT_SCOPES)
          .organization.identityProviders.provisioning.get(idpId);
        return result;
      } catch (error) {
        if (getStatusCode(error) === 404) return null;
        throw error;
      }
    },
    enabled: !!coreClient && !!idpId,
  });

  useEffect(() => {
    if (providerQuery.error) handleError(providerQuery.error);
  }, [providerQuery.error, handleError]);

  useEffect(() => {
    if (organizationQuery.error) handleError(organizationQuery.error);
  }, [organizationQuery.error, handleError]);

  useEffect(() => {
    if (provisioningQuery.error) handleError(provisioningQuery.error);
  }, [provisioningQuery.error, handleError]);

  const updateProviderMutation = useMutation({
    mutationFn: async (data: UpdateIdentityProviderRequestContent): Promise<IdentityProvider> => {
      const provider = providerQuery.data;
      if (!provider) throw new Error('Provider not loaded');

      if (sso?.updateAction?.onBefore && !sso.updateAction.onBefore(provider)) {
        throw new Error(ACTION_CANCELLED_ERROR);
      }

      const apiRequestData = SsoProviderMappers.updateToAPI({
        strategy: provider.strategy,
        ...data,
      });

      const result = await coreClient!
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_SSO_PROVIDER_EDIT_SCOPES)
        .organization.identityProviders.update(idpId, apiRequestData);

      return result;
    },
    onSuccess: async (result) => {
      const provider = providerQuery.data;
      showToast({
        type: 'success',
        message: t('update_success', { providerName: provider?.display_name }),
      });
      queryClient.setQueryData(ssoProviderEditQueryKeys.detail(idpId), result);
      if (sso?.updateAction?.onAfter && provider) {
        await sso.updateAction.onAfter(provider, result);
      }
    },
    onError: (error) => {
      if (!isActionCancelledError(error)) handleError(error);
    },
  });

  const deleteProviderMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      const provider = providerQuery.data;
      if (!provider?.id) throw new Error('Provider not loaded or missing ID');

      await coreClient!
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_SSO_PROVIDER_EDIT_SCOPES)
        .organization.identityProviders.delete(provider.id);
    },
    onSuccess: async () => {
      const provider = providerQuery.data;
      showToast({
        type: 'success',
        message: t('delete_success', { providerName: provider?.display_name }),
      });
      queryClient.removeQueries({ queryKey: ssoProviderEditQueryKeys.detail(idpId) });
      queryClient.removeQueries({ queryKey: ssoProviderEditQueryKeys.provisioning(idpId) });
      if (sso?.deleteAction?.onAfter && provider) {
        await sso.deleteAction.onAfter(provider);
      }
    },
    onError: (error) => handleError(error),
  });

  const detachProviderMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      const provider = providerQuery.data;
      if (!provider?.id) throw new Error('Provider not loaded or missing ID');

      if (
        sso?.deleteFromOrganizationAction?.onBefore &&
        !sso.deleteFromOrganizationAction.onBefore(provider)
      ) {
        throw new Error(ACTION_CANCELLED_ERROR);
      }

      await coreClient!
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_SSO_PROVIDER_EDIT_SCOPES)
        .organization.identityProviders.detach(provider.id);
    },
    onSuccess: async () => {
      const provider = providerQuery.data;
      const organization = organizationQuery.data;
      showToast({
        type: 'success',
        message: t('remove_success', {
          providerName: provider?.display_name,
          organizationName: organization?.display_name,
        }),
      });
      queryClient.removeQueries({ queryKey: ssoProviderEditQueryKeys.detail(idpId) });
      if (sso?.deleteFromOrganizationAction?.onAfter && provider) {
        await sso.deleteFromOrganizationAction.onAfter(provider);
      }
    },
    onError: (error) => {
      if (!isActionCancelledError(error)) handleError(error);
    },
  });

  const createProvisioningMutation = useMutation({
    mutationFn: async (): Promise<GetIdPProvisioningConfigResponseContent> => {
      const provider = providerQuery.data;
      if (!provider) throw new Error('Provider not loaded');

      if (provisioning?.createAction?.onBefore && !provisioning.createAction.onBefore(provider)) {
        throw new Error(ACTION_CANCELLED_ERROR);
      }

      const result = await coreClient!
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_SSO_PROVIDER_EDIT_SCOPES)
        .organization.identityProviders.provisioning.create(idpId);

      return result;
    },
    onSuccess: async (result) => {
      const provider = providerQuery.data;
      showToast({
        type: 'success',
        message: t('update_success', { providerName: provider?.display_name }),
      });
      await queryClient.invalidateQueries({ queryKey: ssoProviderEditQueryKeys.detail(idpId) });
      queryClient.setQueryData(ssoProviderEditQueryKeys.provisioning(idpId), result);
      if (provisioning?.createAction?.onAfter && provider) {
        await provisioning.createAction.onAfter(provider, result);
      }
    },
    onError: (error) => {
      if (!isActionCancelledError(error)) handleError(error);
    },
  });

  const deleteProvisioningMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      const provider = providerQuery.data;
      if (!provider) throw new Error('Provider not loaded');

      if (provisioning?.deleteAction?.onBefore && !provisioning.deleteAction.onBefore(provider)) {
        throw new Error(ACTION_CANCELLED_ERROR);
      }

      await coreClient!
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_SSO_PROVIDER_EDIT_SCOPES)
        .organization.identityProviders.provisioning.delete(idpId);
    },
    onSuccess: async () => {
      const provider = providerQuery.data;
      showToast({
        type: 'success',
        message: t('update_success', { providerName: provider?.display_name }),
      });
      queryClient.setQueryData(ssoProviderEditQueryKeys.provisioning(idpId), null);
      await queryClient.invalidateQueries({ queryKey: ssoProviderEditQueryKeys.detail(idpId) });
      if (provisioning?.deleteAction?.onAfter && provider) {
        await provisioning.deleteAction.onAfter(provider);
      }
    },
    onError: (error) => {
      if (!isActionCancelledError(error)) handleError(error);
    },
  });

  const createScimTokenMutation = useMutation({
    mutationFn: async (data: CreateIdpProvisioningScimTokenRequestContent) => {
      const provider = providerQuery.data;
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
      const provider = providerQuery.data;
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
      const provider = providerQuery.data;
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
      const provider = providerQuery.data;
      showToast({ type: 'success', message: t('scim_token_delete_sucess') });
      if (provisioning?.deleteScimTokenAction?.onAfter && provider) {
        await provisioning.deleteScimTokenAction.onAfter(provider);
      }
    },
    onError: (error) => {
      if (!isActionCancelledError(error)) handleError(error);
    },
  });

  /**
   * List SCIM tokens mutation - fetches SCIM tokens for provisioning.
   * Note: This uses imperative fetching rather than a query because tokens
   * are typically fetched on-demand and the response includes sensitive data
   * that shouldn't be automatically cached.
   */
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

  const syncProvisioningAttributesMutation = useMutation({
    mutationFn: async () => {
      await coreClient!
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_SSO_PROVIDER_EDIT_SCOPES)
        .organization.identityProviders.provisioning.updateAttributes(idpId, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ssoProviderEditQueryKeys.provisioning(idpId) });
      showToast({ type: 'success', message: t('provisioning_attributes_sync_success') });
    },
    onError: (error) => handleError(error),
  });

  const updateProvider = useCallback(
    async (data: UpdateIdentityProviderRequestContent) => {
      if (!coreClient || !providerQuery.data) return;
      try {
        await updateProviderMutation.mutateAsync(data);
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

  const createProvisioning = useCallback(async () => {
    if (!coreClient || !providerQuery.data) return;
    try {
      await createProvisioningMutation.mutateAsync();
    } catch (error) {
      if (!isActionCancelledError(error)) throw error;
    }
  }, [coreClient, createProvisioningMutation, providerQuery.data]);

  const deleteProvisioning = useCallback(async () => {
    if (!coreClient || !providerQuery.data) return;
    try {
      await deleteProvisioningMutation.mutateAsync();
    } catch (error) {
      if (!isActionCancelledError(error)) throw error;
    }
  }, [coreClient, deleteProvisioningMutation, providerQuery.data]);

  const createScimToken = useCallback(
    async (data: CreateIdpProvisioningScimTokenRequestContent) => {
      if (!coreClient || !providerQuery.data) return undefined;
      try {
        return await createScimTokenMutation.mutateAsync(data);
      } catch (error) {
        if (!isActionCancelledError(error)) throw error;
        return undefined;
      }
    },
    [coreClient, createScimTokenMutation, providerQuery.data],
  );

  const deleteScimToken = useCallback(
    async (idpScimTokenId: string) => {
      if (!coreClient || !providerQuery.data) return;
      try {
        await deleteScimTokenMutation.mutateAsync(idpScimTokenId);
      } catch (error) {
        if (!isActionCancelledError(error)) throw error;
      }
    },
    [coreClient, deleteScimTokenMutation, providerQuery.data],
  );

  const listScimTokens = useCallback(async () => {
    try {
      return await listScimTokensMutation.mutateAsync();
    } catch (error) {
      return null;
    }
  }, [listScimTokensMutation]);

  const syncSsoAttributes = useCallback(async () => {
    if (!coreClient) return;
    await syncSsoAttributesMutation.mutateAsync();
  }, [coreClient, syncSsoAttributesMutation]);

  const syncProvisioningAttributes = useCallback(async () => {
    if (!coreClient) return;
    await syncProvisioningAttributesMutation.mutateAsync();
  }, [coreClient, syncProvisioningAttributesMutation]);

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

  const fetchProvisioning = useCallback(async () => {
    try {
      const result = await queryClient.fetchQuery({
        queryKey: ssoProviderEditQueryKeys.provisioning(idpId),
        queryFn: async (): Promise<GetIdPProvisioningConfigResponseContent | null> => {
          try {
            const response = await coreClient!
              .getMyOrganizationApiClient()
              .withScopes(MY_ORGANIZATION_SSO_PROVIDER_EDIT_SCOPES)
              .organization.identityProviders.provisioning.get(idpId);
            return response;
          } catch (error) {
            if (getStatusCode(error) === 404) return null;
            throw error;
          }
        },
      });
      return result;
    } catch (error) {
      return null;
    }
  }, [queryClient, idpId, coreClient]);

  const hasSsoAttributeSyncWarning = useMemo(() => {
    const provider = providerQuery.data;
    const attributes = provider && 'attributes' in provider ? (provider.attributes ?? []) : [];
    return attributes.some((attr) => attr.is_extra || attr.is_missing);
  }, [providerQuery.data]);

  const hasProvisioningAttributeSyncWarning = useMemo(() => {
    const attributes = provisioningQuery.data?.attributes ?? [];
    return attributes.some((attr) => attr.is_extra || attr.is_missing);
  }, [provisioningQuery.data]);

  const error =
    providerQuery.error ||
    organizationQuery.error ||
    provisioningQuery.error ||
    updateProviderMutation.error ||
    deleteProviderMutation.error ||
    detachProviderMutation.error ||
    createProvisioningMutation.error ||
    deleteProvisioningMutation.error ||
    createScimTokenMutation.error ||
    deleteScimTokenMutation.error ||
    syncSsoAttributesMutation.error ||
    syncProvisioningAttributesMutation.error;

  const retry = async () => {
    const queries = [
      { error: providerQuery.error, key: ssoProviderEditQueryKeys.detail(idpId) },
      { error: organizationQuery.error, key: ssoProviderEditQueryKeys.organization() },
      { error: provisioningQuery.error, key: ssoProviderEditQueryKeys.provisioning(idpId) },
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
        error: createProvisioningMutation.error,
        retry: () => createProvisioningMutation.mutateAsync(),
      },
      {
        error: deleteProvisioningMutation.error,
        retry: () => deleteProvisioningMutation.mutateAsync(),
      },
      {
        error: createScimTokenMutation.error,
        retry: () =>
          createScimTokenMutation.variables &&
          createScimTokenMutation.mutateAsync(createScimTokenMutation.variables),
      },
      {
        error: deleteScimTokenMutation.error,
        retry: () =>
          deleteScimTokenMutation.variables &&
          deleteScimTokenMutation.mutateAsync(deleteScimTokenMutation.variables),
      },
      {
        error: syncSsoAttributesMutation.error,
        retry: () => syncSsoAttributesMutation.mutateAsync(),
      },
      {
        error: syncProvisioningAttributesMutation.error,
        retry: () => syncProvisioningAttributesMutation.mutateAsync(),
      },
    ];

    const failedMutation = mutations.find((m) => m.error);
    if (failedMutation) {
      await failedMutation.retry();
    }
  };

  return {
    provider: providerQuery.data ?? null,
    organization: organizationQuery.data ?? OrganizationDetailsFactory.create(),
    provisioningConfig: provisioningQuery.data ?? null,
    isLoading: providerQuery.isLoading || organizationQuery.isLoading,
    isUpdating: updateProviderMutation.isPending,
    isDeleting: deleteProviderMutation.isPending,
    isRemoving: detachProviderMutation.isPending,
    isProvisioningUpdating: createProvisioningMutation.isPending,
    isProvisioningDeleting: deleteProvisioningMutation.isPending,
    isProvisioningLoading: provisioningQuery.isLoading || provisioningQuery.isFetching,
    isScimTokensLoading: listScimTokensMutation.isPending,
    isScimTokenCreating: createScimTokenMutation.isPending,
    isScimTokenDeleting: deleteScimTokenMutation.isPending,
    isSsoAttributesSyncing: syncSsoAttributesMutation.isPending,
    isProvisioningAttributesSyncing: syncProvisioningAttributesMutation.isPending,
    hasSsoAttributeSyncWarning,
    hasProvisioningAttributeSyncWarning,
    error,
    retry,
    fetchProvider,
    fetchProvisioning,
    updateProvider,
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
