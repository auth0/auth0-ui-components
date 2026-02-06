import {
  OrganizationDetailsFactory,
  OrganizationDetailsMappers,
  SsoProviderMappers,
  type IdentityProvider,
  type IdpId,
  type OrganizationPrivate,
  type UpdateIdentityProviderRequestContent,
  type CreateIdpProvisioningScimTokenRequestContent,
  type GetIdPProvisioningConfigResponseContent,
  getStatusCode,
} from '@auth0/universal-components-core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';

import { showToast } from '../../../components/ui/toast';
import type {
  UseSsoProviderEditOptions,
  UseSsoProviderEditReturn,
} from '../../../types/my-organization/idp-management/sso-provider/sso-provider-edit-types';
import { useCoreClient } from '../../use-core-client';
import { useTranslator } from '../../use-translator';

const ACTION_CANCELLED_ERROR = 'ACTION_CANCELLED';

const isActionCancelledError = (error: unknown): boolean => {
  return error instanceof Error && error.message === ACTION_CANCELLED_ERROR;
};

const CACHE_CONFIG = {
  PROVIDER_STALE_TIME: 5 * 60 * 1000,
  PROVIDER_GC_TIME: 10 * 60 * 1000,
  ORGANIZATION_STALE_TIME: 10 * 60 * 1000,
  ORGANIZATION_GC_TIME: 15 * 60 * 1000,
  PROVISIONING_STALE_TIME: 2 * 60 * 1000,
  SCIM_TOKENS_STALE_TIME: 2 * 60 * 1000,
} as const;

export const ssoProviderEditQueryKeys = {
  all: ['sso-providers'] as const,
  detail: (idpId: IdpId) => [...ssoProviderEditQueryKeys.all, 'detail', idpId] as const,
  organization: () => ['organization', 'details'] as const,
  provisioning: (idpId: IdpId) => [...ssoProviderEditQueryKeys.all, 'provisioning', idpId] as const,
  scimTokens: (idpId: IdpId) => [...ssoProviderEditQueryKeys.all, 'scim-tokens', idpId] as const,
};

export function useSsoProviderEdit(
  idpId: IdpId,
  { sso, provisioning, customMessages = {} }: Partial<UseSsoProviderEditOptions> = {},
): UseSsoProviderEditReturn {
  const { coreClient } = useCoreClient();
  const { t } = useTranslator('idp_management.notifications', customMessages);
  const queryClient = useQueryClient();
  const hasShownProviderError = useRef(false);

  // ============================================
  // QUERIES - All data managed by TanStack Query
  // ============================================

  /**
   * Provider query - fetches the identity provider details.
   * TanStack Query handles caching, loading states, and refetching.
   */
  const providerQuery = useQuery({
    queryKey: ssoProviderEditQueryKeys.detail(idpId),
    queryFn: async (): Promise<IdentityProvider> => {
      const response = await coreClient!
        .getMyOrganizationApiClient()
        .organization.identityProviders.get(idpId);
      return response;
    },
    staleTime: CACHE_CONFIG.PROVIDER_STALE_TIME,
    gcTime: CACHE_CONFIG.PROVIDER_GC_TIME,
    enabled: !!coreClient && !!idpId,
  });

  /**
   * Organization query - fetches organization details.
   * Shared across the application, so it uses a common query key.
   */
  const organizationQuery = useQuery({
    queryKey: ssoProviderEditQueryKeys.organization(),
    queryFn: async (): Promise<OrganizationPrivate> => {
      const response = await coreClient!.getMyOrganizationApiClient().organizationDetails.get();
      return OrganizationDetailsMappers.fromAPI(response);
    },
    staleTime: CACHE_CONFIG.ORGANIZATION_STALE_TIME,
    gcTime: CACHE_CONFIG.ORGANIZATION_GC_TIME,
    enabled: !!coreClient,
    initialData: OrganizationDetailsFactory.create(),
  });

  /**
   * Provisioning config query - fetches provisioning configuration.
   * Returns null if provisioning is not configured (404).
   */
  const provisioningQuery = useQuery({
    queryKey: ssoProviderEditQueryKeys.provisioning(idpId),
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
    staleTime: CACHE_CONFIG.PROVISIONING_STALE_TIME,
    enabled: !!coreClient && !!idpId,
    retry: (failureCount, error) => {
      const status = getStatusCode(error);
      if (status === 404) return false;
      return failureCount < 3;
    },
  });

  useEffect(() => {
    if (providerQuery.isError && !hasShownProviderError.current) {
      showToast({
        type: 'error',
        message: t('general_error'),
      });
      hasShownProviderError.current = true;
    }

    if (!providerQuery.isError) {
      hasShownProviderError.current = false;
    }
  }, [providerQuery.isError, t]);

  // ============================================
  // MUTATIONS - All actions that modify data
  // ============================================

  /**
   * Update provider mutation - updates SSO provider configuration.
   */
  const updateProviderMutation = useMutation({
    mutationFn: async (data: UpdateIdentityProviderRequestContent): Promise<IdentityProvider> => {
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

      // Update cache with new data
      queryClient.setQueryData(ssoProviderEditQueryKeys.detail(idpId), result);

      if (sso?.updateAction?.onAfter && provider) {
        await sso.updateAction.onAfter(provider, result);
      }
    },
    onError: (error) => {
      if (isActionCancelledError(error)) {
        return;
      }
      showToast({
        type: 'error',
        message: t('general_error'),
      });
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

      // Invalidate queries to refetch fresh data
      await queryClient.invalidateQueries({
        queryKey: ssoProviderEditQueryKeys.detail(idpId),
      });
      queryClient.setQueryData(ssoProviderEditQueryKeys.provisioning(idpId), result);

      if (provisioning?.createAction?.onAfter && provider) {
        await provisioning.createAction.onAfter(provider, result);
      }
    },
    onError: (error) => {
      if (isActionCancelledError(error)) {
        return;
      }
      showToast({
        type: 'error',
        message: t('general_error'),
      });
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

      // Update cache to reflect deleted provisioning
      queryClient.setQueryData(ssoProviderEditQueryKeys.provisioning(idpId), null);
      await queryClient.invalidateQueries({
        queryKey: ssoProviderEditQueryKeys.detail(idpId),
      });

      if (provisioning?.deleteAction?.onAfter && provider) {
        await provisioning.deleteAction.onAfter(provider);
      }
    },
    onError: (error) => {
      if (isActionCancelledError(error)) {
        return;
      }
      showToast({
        type: 'error',
        message: t('general_error'),
      });
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

      // Invalidate SCIM tokens list to refetch
      await queryClient.invalidateQueries({
        queryKey: ssoProviderEditQueryKeys.scimTokens(idpId),
      });

      if (provisioning?.createScimTokenAction?.onAfter && provider) {
        await provisioning.createScimTokenAction.onAfter(provider, result);
      }
    },
    onError: (error) => {
      if (isActionCancelledError(error)) {
        return;
      }
      showToast({
        type: 'error',
        message: t('general_error'),
      });
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
        message: t('scim_token_delete_sucess'),
      });

      // Invalidate SCIM tokens list to refetch
      await queryClient.invalidateQueries({
        queryKey: ssoProviderEditQueryKeys.scimTokens(idpId),
      });

      if (provisioning?.deleteScimTokenAction?.onAfter && provider) {
        await provisioning.deleteScimTokenAction.onAfter(provider);
      }
    },
    onError: (error) => {
      if (isActionCancelledError(error)) {
        return;
      }
      showToast({
        type: 'error',
        message: t('general_error'),
      });
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

      // Remove all related queries from cache
      queryClient.removeQueries({
        queryKey: ssoProviderEditQueryKeys.detail(idpId),
      });
      queryClient.removeQueries({
        queryKey: ssoProviderEditQueryKeys.provisioning(idpId),
      });
      queryClient.removeQueries({
        queryKey: ssoProviderEditQueryKeys.scimTokens(idpId),
      });

      if (sso?.deleteAction?.onAfter && provider) {
        await sso.deleteAction.onAfter(provider);
      }
    },
    onError: () => {
      showToast({
        type: 'error',
        message: t('general_error'),
      });
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

      // Ensure organization data is fresh before detaching
      await queryClient.ensureQueryData({
        queryKey: ssoProviderEditQueryKeys.organization(),
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

      // Remove provider from cache
      queryClient.removeQueries({
        queryKey: ssoProviderEditQueryKeys.detail(idpId),
      });

      if (sso?.deleteFromOrganizationAction?.onAfter && provider) {
        await sso.deleteFromOrganizationAction.onAfter(provider);
      }
    },
    onError: (error) => {
      if (isActionCancelledError(error)) {
        return;
      }
      showToast({
        type: 'error',
        message: t('general_error'),
      });
    },
  });

  // ============================================
  // ACTION CALLBACKS - Wrapper functions for mutations
  // ============================================

  const fetchProvider = useCallback(async (): Promise<IdentityProvider | null> => {
    if (!coreClient || !idpId) {
      return null;
    }

    try {
      const data = await queryClient.ensureQueryData({
        queryKey: ssoProviderEditQueryKeys.detail(idpId),
        queryFn: async () => {
          const response = await coreClient
            .getMyOrganizationApiClient()
            .organization.identityProviders.get(idpId);
          return response;
        },
      });
      return data;
    } catch (error) {
      showToast({
        type: 'error',
        message: t('general_error'),
      });
      return null;
    }
  }, [coreClient, idpId, queryClient, t]);

  const fetchOrganizationDetails = useCallback(async (): Promise<void> => {
    if (!coreClient) {
      return;
    }

    try {
      await queryClient.invalidateQueries({
        queryKey: ssoProviderEditQueryKeys.organization(),
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? t('general_error', { message: error.message })
          : t('general_error');

      showToast({
        type: 'error',
        message: errorMessage,
      });
    }
  }, [coreClient, queryClient, t]);

  const fetchProvisioning =
    useCallback(async (): Promise<GetIdPProvisioningConfigResponseContent | null> => {
      if (!coreClient || !idpId) {
        return null;
      }

      try {
        const data = await queryClient.ensureQueryData({
          queryKey: ssoProviderEditQueryKeys.provisioning(idpId),
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
        showToast({
          type: 'error',
          message: t('general_error'),
        });
        return null;
      }
    }, [coreClient, idpId, queryClient, t]);

  const updateProvider = useCallback(
    async (data: UpdateIdentityProviderRequestContent): Promise<void> => {
      try {
        await updateProviderMutation.mutateAsync(data);
      } catch (error) {
        if (!isActionCancelledError(error)) {
          throw error;
        }
      }
    },
    [updateProviderMutation],
  );

  const createProvisioning = useCallback(async (): Promise<void> => {
    try {
      await createProvisioningMutation.mutateAsync();
    } catch (error) {
      if (!isActionCancelledError(error)) {
        throw error;
      }
    }
  }, [createProvisioningMutation]);

  const deleteProvisioning = useCallback(async (): Promise<void> => {
    try {
      await deleteProvisioningMutation.mutateAsync();
    } catch (error) {
      if (!isActionCancelledError(error)) {
        throw error;
      }
    }
  }, [deleteProvisioningMutation]);

  /**
   * List SCIM tokens mutation - fetches SCIM tokens for provisioning.
   * Note: This uses imperative fetching rather than a query because tokens
   * are typically fetched on-demand and the response includes sensitive data
   * that shouldn't be automatically cached.
   */
  const listScimTokensMutation = useMutation({
    mutationFn: async () => {
      if (!coreClient || !idpId) {
        return null;
      }

      const result = await coreClient
        .getMyOrganizationApiClient()
        .organization.identityProviders.provisioning.scimTokens.list(idpId);
      return result;
    },
    onError: () => {
      showToast({
        type: 'error',
        message: t('general_error'),
      });
    },
  });

  const listScimTokens = useCallback(async () => {
    return await listScimTokensMutation.mutateAsync();
  }, [listScimTokensMutation]);

  const createScimToken = useCallback(
    async (data: CreateIdpProvisioningScimTokenRequestContent) => {
      try {
        return await createScimTokenMutation.mutateAsync(data);
      } catch (error) {
        if (!isActionCancelledError(error)) {
          throw error;
        }
        return undefined;
      }
    },
    [createScimTokenMutation],
  );

  const deleteScimToken = useCallback(
    async (idpScimTokenId: string): Promise<void> => {
      try {
        await deleteScimTokenMutation.mutateAsync(idpScimTokenId);
      } catch (error) {
        if (!isActionCancelledError(error)) {
          throw error;
        }
      }
    },
    [deleteScimTokenMutation],
  );

  const syncSsoAttributes = useCallback(async (): Promise<void> => {
    if (!coreClient || !idpId) {
      return;
    }

    try {
      setIsSsoAttributesSyncing(true);

      await coreClient
        .getMyOrganizationApiClient()
        .organization.identityProviders.updateAttributes(idpId, {});

      await fetchProvider();

      showToast({
        type: 'success',
        message: t('sso_attributes_sync_success'),
      });
    } catch (error) {
      showToast({
        type: 'error',
        message: t('general_error'),
      });
      throw error;
    } finally {
      setIsSsoAttributesSyncing(false);
    }
  }, [coreClient, idpId, fetchProvider, t]);

  const syncProvisioningAttributes = useCallback(async (): Promise<void> => {
    if (!coreClient || !idpId) {
      return;
    }

    try {
      setIsProvisioningAttributesSyncing(true);

      await coreClient
        .getMyOrganizationApiClient()
        .organization.identityProviders.provisioning.updateAttributes(idpId, {});

      await fetchProvisioning();

      showToast({
        type: 'success',
        message: t('provisioning_attributes_sync_success'),
      });
    } catch (error) {
      showToast({
        type: 'error',
        message: t('general_error'),
      });
      throw error;
    } finally {
      setIsProvisioningAttributesSyncing(false);
    }
  }, [coreClient, idpId, fetchProvisioning, t]);

  const onDeleteConfirm = useCallback(async (): Promise<void> => {
    try {
      await deleteProviderMutation.mutateAsync();
    } catch (error) {
      if (!isActionCancelledError(error)) {
        throw error;
      }
    }
  }, [deleteProviderMutation]);

  const onRemoveConfirm = useCallback(async (): Promise<void> => {
    try {
      await detachProviderMutation.mutateAsync();
    } catch (error) {
      if (!isActionCancelledError(error)) {
        throw error;
      }
    }
  }, [detachProviderMutation]);

  const hasSsoAttributeSyncWarning = useMemo(() => {
    const attributes = provider && 'attributes' in provider ? (provider.attributes ?? []) : [];
    return attributes.some((attr) => attr.is_extra || attr.is_missing);
  }, [provider]);

  const hasProvisioningAttributeSyncWarning = useMemo(() => {
    const attributes = provisioningConfig?.attributes ?? [];
    return attributes.some((attr) => attr.is_extra || attr.is_missing);
  }, [provisioningConfig]);

  return {
    // Data from TanStack Query - single source of truth
    provider: providerQuery.data ?? null,
    organization: organizationQuery.data ?? OrganizationDetailsFactory.create(),
    provisioningConfig: provisioningQuery.data ?? null,

    // Loading states - all derived from TanStack Query
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

    // Actions
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
