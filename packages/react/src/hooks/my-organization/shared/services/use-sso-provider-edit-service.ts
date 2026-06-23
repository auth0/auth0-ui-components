/**
 * Internal SSO provider edit service hook.
 * Handles data fetching, mutations, and cache management for SSO provider editing.
 * @module use-sso-provider-edit-service
 * @internal
 */

import {
  OrganizationDetailsFactory,
  OrganizationDetailsMappers,
  SsoProviderMappers,
  ssoProviderQueryKeys,
  type IdpKnownResponse,
  type IdpId,
  type OrganizationPrivate,
  type UpdateIdentityProviderRequestContent,
  type CreateIdpProvisioningScimTokenRequestContent,
  type GetIdPProvisioningConfigResponseContent,
  getStatusCode,
} from '@auth0/universal-components-core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { showToast } from '@/components/auth0/shared/toast';
import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useErrorHandler } from '@/hooks/shared/use-error-handler';
import { useQueryErrorToast } from '@/hooks/shared/use-query-error-toast';
import { useTranslator } from '@/hooks/shared/use-translator';
import type {
  UseSsoProviderEditOptions,
  UseSsoProviderEditServiceReturn,
} from '@/types/my-organization/idp-management/sso-provider/sso-provider-edit-types';

const ACTION_CANCELLED_ERROR = 'ACTION_CANCELLED';

const isActionCancelledError = (error: unknown): boolean => {
  return error instanceof Error && error.message === ACTION_CANCELLED_ERROR;
};

/**
 * Internal service hook for SSO provider edit API operations.
 * @param idpId - Identity provider ID.
 * @param options - Hook options.
 * @returns Service state and methods.
 * @internal
 */
export function useSsoProviderEditService(
  idpId: IdpId,
  { sso, provisioning, customMessages = {} }: Partial<UseSsoProviderEditOptions> = {},
): UseSsoProviderEditServiceReturn {
  const { coreClient } = useCoreClient();
  const { t } = useTranslator('idp_management.notifications', customMessages);
  const queryClient = useQueryClient();
  const handleError = useErrorHandler();

  /**
   * Provider query - fetches the identity provider details.
   * TanStack Query handles caching, loading states, and refetching.
   */
  const providerQuery = useQuery({
    queryKey: ssoProviderQueryKeys.detail(idpId),
    queryFn: async (): Promise<IdpKnownResponse> => {
      const response = await coreClient!
        .getMyOrganizationApiClient()
        .organization.identityProviders.get(idpId);
      return response;
    },
    enabled: !!coreClient && !!idpId,
  });

  /**
   * Organization query - fetches organization details.
   * Shared across the application, so it uses a common query key.
   */
  const organizationQuery = useQuery({
    queryKey: ssoProviderQueryKeys.organization(),
    queryFn: async (): Promise<OrganizationPrivate> => {
      const response = await coreClient!.getMyOrganizationApiClient().organizationDetails.get();
      return OrganizationDetailsMappers.fromAPI(response);
    },
    enabled: !!coreClient,
    initialData: OrganizationDetailsFactory.create(),
  });

  /**
   * Provisioning config query - fetches provisioning configuration.
   * Returns null if provisioning is not configured (404).
   */
  const provisioningQuery = useQuery({
    queryKey: ssoProviderQueryKeys.provisioning(idpId),
    queryFn: async (): Promise<GetIdPProvisioningConfigResponseContent | null> => {
      try {
        const result = await coreClient!
          .getMyOrganizationApiClient()
          .organization.identityProviders.provisioning.get(idpId);
        return result;
      } catch (error) {
        const status = getStatusCode(error);
        if (status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!coreClient && !!idpId,
  });

  useQueryErrorToast(providerQuery, t('general_error'));
  useQueryErrorToast(organizationQuery, t('general_error'));
  useQueryErrorToast(provisioningQuery, t('general_error'));

  /**
   * Update provider mutation - updates SSO provider configuration.
   */
  const updateProviderMutation = useMutation({
    mutationFn: async (data: UpdateIdentityProviderRequestContent): Promise<IdpKnownResponse> => {
      const provider = providerQuery.data;
      if (!provider) {
        throw new Error('Provider not loaded');
      }

      if (sso?.updateAction?.onBefore) {
        const canProceed = sso.updateAction.onBefore(provider);
        if (!canProceed) {
          throw new Error(ACTION_CANCELLED_ERROR);
        }
      }

      const apiRequestData: UpdateIdentityProviderRequestContent = SsoProviderMappers.updateToAPI({
        strategy: provider.strategy,
        ...data,
      });

      const result = await coreClient!
        .getMyOrganizationApiClient()
        .organization.identityProviders.update(idpId, apiRequestData);

      return result;
    },
    onSuccess: async (result, _variables) => {
      const provider = providerQuery.data;

      showToast({
        type: 'success',
        message: t('update_success', { providerName: provider?.display_name }),
      });
      await queryClient.invalidateQueries({
        queryKey: ssoProviderQueryKeys.list(),
      });
      queryClient.setQueryData(ssoProviderQueryKeys.detail(idpId), result);

      if (sso?.updateAction?.onAfter && provider) {
        await sso.updateAction.onAfter(provider, result);
      }
    },
    onError: (error) => {
      if (isActionCancelledError(error)) {
        return;
      }
      handleError(error, { fallbackMessage: t('general_error') });
    },
  });

  /**
   * Create provisioning mutation - enables provisioning for the provider.
   */
  const createProvisioningMutation = useMutation({
    mutationFn: async (): Promise<GetIdPProvisioningConfigResponseContent> => {
      const provider = providerQuery.data;
      if (!provider) {
        throw new Error('Provider not loaded');
      }

      if (provisioning?.createAction?.onBefore) {
        const canProceed = provisioning.createAction.onBefore(provider);
        if (!canProceed) {
          throw new Error(ACTION_CANCELLED_ERROR);
        }
      }

      const result = await coreClient!
        .getMyOrganizationApiClient()
        .organization.identityProviders.provisioning.create(idpId);

      return result;
    },
    onSuccess: async (result) => {
      const provider = providerQuery.data;

      showToast({
        type: 'success',
        message: t('update_success', { providerName: provider?.display_name }),
      });
      await queryClient.invalidateQueries({
        queryKey: ssoProviderQueryKeys.detail(idpId),
      });
      queryClient.setQueryData(ssoProviderQueryKeys.provisioning(idpId), result);

      if (provisioning?.createAction?.onAfter && provider) {
        await provisioning.createAction.onAfter(provider, result);
      }
    },
    onError: (error) => {
      if (isActionCancelledError(error)) {
        return;
      }
      handleError(error, { fallbackMessage: t('general_error') });
    },
  });

  /**
   * Delete provisioning mutation - disables provisioning for the provider.
   */
  const deleteProvisioningMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      const provider = providerQuery.data;
      if (!provider) {
        throw new Error('Provider not loaded');
      }

      if (provisioning?.deleteAction?.onBefore) {
        const canProceed = provisioning.deleteAction.onBefore(provider);
        if (!canProceed) {
          throw new Error(ACTION_CANCELLED_ERROR);
        }
      }

      await coreClient!
        .getMyOrganizationApiClient()
        .organization.identityProviders.provisioning.delete(idpId);
    },
    onSuccess: async () => {
      const provider = providerQuery.data;

      showToast({
        type: 'success',
        message: t('update_success', { providerName: provider?.display_name }),
      });
      queryClient.setQueryData(ssoProviderQueryKeys.provisioning(idpId), null);
      await queryClient.invalidateQueries({
        queryKey: ssoProviderQueryKeys.detail(idpId),
      });

      if (provisioning?.deleteAction?.onAfter && provider) {
        await provisioning.deleteAction.onAfter(provider);
      }
    },
    onError: (error) => {
      if (isActionCancelledError(error)) {
        return;
      }
      handleError(error, { fallbackMessage: t('general_error') });
    },
  });

  /**
   * Create SCIM token mutation - generates a new SCIM token for provisioning.
   */
  const createScimTokenMutation = useMutation({
    mutationFn: async (data: CreateIdpProvisioningScimTokenRequestContent) => {
      const provider = providerQuery.data;
      if (!provider) {
        throw new Error('Provider not loaded');
      }

      if (provisioning?.createScimTokenAction?.onBefore) {
        const canProceed = provisioning.createScimTokenAction.onBefore(provider);
        if (!canProceed) {
          throw new Error(ACTION_CANCELLED_ERROR);
        }
      }

      const result = await coreClient!
        .getMyOrganizationApiClient()
        .organization.identityProviders.provisioning.scimTokens.create(idpId, data);

      return result;
    },
    onSuccess: async (result) => {
      const provider = providerQuery.data;

      showToast({
        type: 'success',
        message: t('scim_token_create_success'),
      });
      await queryClient.invalidateQueries({
        queryKey: ssoProviderQueryKeys.scimTokens(idpId),
      });

      if (provisioning?.createScimTokenAction?.onAfter && provider) {
        await provisioning.createScimTokenAction.onAfter(provider, result);
      }
    },
    onError: (error) => {
      if (isActionCancelledError(error)) {
        return;
      }
      handleError(error, { fallbackMessage: t('general_error') });
    },
  });

  /**
   * Delete SCIM token mutation - removes a SCIM token.
   */
  const deleteScimTokenMutation = useMutation({
    mutationFn: async (idpScimTokenId: string): Promise<void> => {
      const provider = providerQuery.data;
      if (!provider) {
        throw new Error('Provider not loaded');
      }

      if (provisioning?.deleteScimTokenAction?.onBefore) {
        const canProceed = provisioning.deleteScimTokenAction.onBefore(provider);
        if (!canProceed) {
          throw new Error(ACTION_CANCELLED_ERROR);
        }
      }

      await coreClient!
        .getMyOrganizationApiClient()
        .organization.identityProviders.provisioning.scimTokens.delete(idpId, idpScimTokenId);
    },
    onSuccess: async () => {
      const provider = providerQuery.data;

      showToast({
        type: 'success',
        message: t('scim_token_delete_success'),
      });
      await queryClient.invalidateQueries({
        queryKey: ssoProviderQueryKeys.scimTokens(idpId),
      });

      if (provisioning?.deleteScimTokenAction?.onAfter && provider) {
        await provisioning.deleteScimTokenAction.onAfter(provider);
      }
    },
    onError: (error) => {
      if (isActionCancelledError(error)) {
        return;
      }
      handleError(error, { fallbackMessage: t('general_error') });
    },
  });

  /**
   * Delete provider mutation - completely deletes the provider.
   */
  const deleteProviderMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      const provider = providerQuery.data;
      if (!provider?.id) {
        throw new Error('Provider not loaded or missing ID');
      }

      await coreClient!
        .getMyOrganizationApiClient()
        .organization.identityProviders.delete(provider.id);
    },
    onSuccess: async () => {
      const provider = providerQuery.data;

      showToast({
        type: 'success',
        message: t('delete_success', { providerName: provider?.display_name }),
      });
      queryClient.removeQueries({
        queryKey: ssoProviderQueryKeys.detail(idpId),
      });
      queryClient.removeQueries({
        queryKey: ssoProviderQueryKeys.provisioning(idpId),
      });
      queryClient.removeQueries({
        queryKey: ssoProviderQueryKeys.scimTokens(idpId),
      });
      await queryClient.invalidateQueries({
        queryKey: ssoProviderQueryKeys.all,
      });

      if (sso?.deleteAction?.onAfter && provider) {
        await sso.deleteAction.onAfter(provider);
      }
    },
    onError: (error) => {
      handleError(error, { fallbackMessage: t('general_error') });
    },
  });

  /**
   * Detach provider mutation - removes provider from organization but doesn't delete it.
   */
  const detachProviderMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      const provider = providerQuery.data;
      if (!provider?.id) {
        throw new Error('Provider not loaded or missing ID');
      }

      if (sso?.deleteFromOrganizationAction?.onBefore) {
        const canProceed = sso.deleteFromOrganizationAction.onBefore(provider);
        if (!canProceed) {
          throw new Error(ACTION_CANCELLED_ERROR);
        }
      }
      await queryClient.ensureQueryData({
        queryKey: ssoProviderQueryKeys.organization(),
      });

      await coreClient!
        .getMyOrganizationApiClient()
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
      queryClient.removeQueries({
        queryKey: ssoProviderQueryKeys.detail(idpId),
      });
      await queryClient.invalidateQueries({ queryKey: ssoProviderQueryKeys.list() });

      if (sso?.deleteFromOrganizationAction?.onAfter && provider) {
        await sso.deleteFromOrganizationAction.onAfter(provider);
      }
    },
    onError: (error) => {
      if (isActionCancelledError(error)) {
        return;
      }
      handleError(error, { fallbackMessage: t('general_error') });
    },
  });

  const fetchProvider = useCallback(async (): Promise<IdpKnownResponse | null> => {
    if (!coreClient || !idpId) {
      return null;
    }

    try {
      const data = await queryClient.ensureQueryData({
        queryKey: ssoProviderQueryKeys.detail(idpId),
        queryFn: async () => {
          const response = await coreClient
            .getMyOrganizationApiClient()
            .organization.identityProviders.get(idpId);
          return response;
        },
      });
      return data;
    } catch (error) {
      handleError(error, { fallbackMessage: t('general_error') });
      return null;
    }
  }, [coreClient, idpId, queryClient, t, handleError]);

  const fetchOrganizationDetails = useCallback(async (): Promise<void> => {
    if (!coreClient) {
      return;
    }

    await queryClient.getQueryData(ssoProviderQueryKeys.organization());
  }, [coreClient, queryClient]);

  const fetchProvisioning =
    useCallback(async (): Promise<GetIdPProvisioningConfigResponseContent | null> => {
      if (!coreClient || !idpId) {
        return null;
      }

      try {
        const data = await queryClient.fetchQuery({
          queryKey: ssoProviderQueryKeys.provisioning(idpId),
          queryFn: async () => {
            try {
              const result = await coreClient
                .getMyOrganizationApiClient()
                .organization.identityProviders.provisioning.get(idpId);
              return result;
            } catch (error) {
              const status = getStatusCode(error);
              if (status === 404) {
                return null;
              }
              throw error;
            }
          },
        });
        return data;
      } catch (error) {
        const status = getStatusCode(error);
        if (status !== 404) {
          handleError(error, { fallbackMessage: t('general_error') });
        }
        return null;
      }
    }, [coreClient, idpId, queryClient, t, handleError]);

  const updateProvider = useCallback(
    async (data: UpdateIdentityProviderRequestContent): Promise<void> => {
      const provider = providerQuery.data;
      if (!coreClient || !idpId || !provider) {
        return;
      }

      try {
        await updateProviderMutation.mutateAsync(data);
      } catch (error) {
        if (!isActionCancelledError(error)) {
          throw error;
        }
      }
    },
    [coreClient, idpId, providerQuery.data, updateProviderMutation],
  );

  const createProvisioning = useCallback(async (): Promise<void> => {
    const provider = providerQuery.data;
    if (!coreClient || !idpId || !provider) {
      return;
    }

    try {
      await createProvisioningMutation.mutateAsync();
    } catch (error) {
      if (!isActionCancelledError(error)) {
        throw error;
      }
    }
  }, [coreClient, createProvisioningMutation, idpId, providerQuery.data]);

  const deleteProvisioning = useCallback(async (): Promise<void> => {
    const provider = providerQuery.data;
    if (!coreClient || !idpId || !provider) {
      return;
    }

    try {
      await deleteProvisioningMutation.mutateAsync();
    } catch (error) {
      if (!isActionCancelledError(error)) {
        throw error;
      }
    }
  }, [coreClient, deleteProvisioningMutation, idpId, providerQuery.data]);

  /**
   * SCIM tokens query - fetches SCIM tokens for provisioning on demand.
   * Uses enabled:false with manual refetch since tokens contain sensitive data
   * and should only be fetched when explicitly requested.
   */
  const scimTokensQuery = useQuery({
    queryKey: ssoProviderQueryKeys.scimTokens(idpId),
    queryFn: async () => {
      const result = await coreClient!
        .getMyOrganizationApiClient()
        .organization.identityProviders.provisioning.scimTokens.list(idpId);
      return result;
    },
    enabled: false,
    gcTime: 0,
  });

  const listScimTokens = useCallback(async () => {
    if (!coreClient || !idpId) {
      return null;
    }

    const { data, error } = await scimTokensQuery.refetch();

    if (error) {
      handleError(error, { fallbackMessage: t('general_error') });
      return null;
    }

    return data ?? null;
  }, [coreClient, idpId, scimTokensQuery, handleError, t]);

  const createScimToken = useCallback(
    async (data: CreateIdpProvisioningScimTokenRequestContent) => {
      const provider = providerQuery.data;
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
    [coreClient, createScimTokenMutation, idpId, providerQuery.data],
  );

  const deleteScimToken = useCallback(
    async (idpScimTokenId: string): Promise<void> => {
      const provider = providerQuery.data;
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
    [coreClient, deleteScimTokenMutation, idpId, providerQuery.data],
  );

  const syncSsoAttributesMutation = useMutation({
    mutationFn: async () => {
      await coreClient!
        .getMyOrganizationApiClient()
        .organization.identityProviders.updateAttributes(idpId, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ssoProviderQueryKeys.detail(idpId),
      });
      showToast({
        type: 'success',
        message: t('sso_attributes_sync_success'),
      });
    },
    onError: (error) => {
      handleError(error, { fallbackMessage: t('general_error') });
    },
  });

  const syncSsoAttributes = useCallback(async (): Promise<void> => {
    if (!coreClient || !idpId) {
      return;
    }

    await syncSsoAttributesMutation.mutateAsync();
  }, [coreClient, idpId, syncSsoAttributesMutation]);

  const syncProvisioningAttributesMutation = useMutation({
    mutationFn: async () => {
      await coreClient!
        .getMyOrganizationApiClient()
        .organization.identityProviders.provisioning.updateAttributes(idpId, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ssoProviderQueryKeys.provisioning(idpId),
      });
      showToast({
        type: 'success',
        message: t('provisioning_attributes_sync_success'),
      });
    },
    onError: (error) => {
      handleError(error, { fallbackMessage: t('general_error') });
    },
  });

  const syncProvisioningAttributes = useCallback(async (): Promise<void> => {
    if (!coreClient || !idpId) {
      return;
    }

    await syncProvisioningAttributesMutation.mutateAsync();
  }, [coreClient, idpId, syncProvisioningAttributesMutation]);

  const onDeleteConfirm = useCallback(async (): Promise<void> => {
    const provider = providerQuery.data;
    if (!coreClient || !provider?.id) {
      return;
    }

    try {
      await deleteProviderMutation.mutateAsync();
    } catch (error) {
      if (!isActionCancelledError(error)) {
        throw error;
      }
    }
  }, [coreClient, deleteProviderMutation, providerQuery.data]);

  const onRemoveConfirm = useCallback(async (): Promise<void> => {
    const provider = providerQuery.data;
    if (!coreClient || !provider?.id) {
      return;
    }

    try {
      await detachProviderMutation.mutateAsync();
    } catch (error) {
      if (!isActionCancelledError(error)) {
        throw error;
      }
    }
  }, [coreClient, detachProviderMutation, providerQuery.data]);

  const hasSsoAttributeSyncWarning = useMemo(() => {
    const provider = providerQuery.data;
    const attributes = provider && 'attributes' in provider ? (provider.attributes ?? []) : [];
    return attributes.some((attr) => attr.is_extra || attr.is_missing);
  }, [providerQuery.data]);

  const hasProvisioningAttributeSyncWarning = useMemo(() => {
    const provisioningConfig = provisioningQuery.data;
    const attributes = provisioningConfig?.attributes ?? [];
    return attributes.some((attr) => attr.is_extra || attr.is_missing);
  }, [provisioningQuery.data]);

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
    isScimTokensLoading: scimTokensQuery.isFetching,
    isScimTokenCreating: createScimTokenMutation.isPending,
    isScimTokenDeleting: deleteScimTokenMutation.isPending,
    isSsoAttributesSyncing: syncSsoAttributesMutation.isPending,
    isProvisioningAttributesSyncing: syncProvisioningAttributesMutation.isPending,
    hasSsoAttributeSyncWarning,
    hasProvisioningAttributeSyncWarning,
    fetchProvider,
    fetchOrganizationDetails,
    fetchProvisioning,
    updateProvider,
    createProvisioning,
    deleteProvisioning,
    listScimTokens,
    createScimToken,
    deleteScimToken,
    syncSsoAttributes,
    syncProvisioningAttributes,
    onDeleteConfirm,
    onRemoveConfirm,
  };
}
