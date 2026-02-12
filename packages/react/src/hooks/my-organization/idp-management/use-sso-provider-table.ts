import {
  OrganizationDetailsMappers,
  SsoProviderMappers,
  type UpdateIdentityProviderRequestContent,
  type ComponentAction,
  type IdentityProvider,
  type OrganizationPrivate,
  BusinessError,
} from '@auth0/universal-components-core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';

import { showToast } from '../../../components/ui/toast';
import type { UseSsoProviderTableReturn } from '../../../types/my-organization/idp-management/sso-provider/sso-provider-table-types';
import { useCoreClient } from '../../use-core-client';
import { useTranslator } from '../../use-translator';

export const ssoProviderQueryKeys = {
  all: ['sso-providers'] as const,
  list: () => [...ssoProviderQueryKeys.all, 'list'] as const,
  organization: ['organization', 'details'] as const,
};

/**
 * Custom hook for managing SSO provider table data and actions.
 * Uses TanStack Query for caching, loading states, and data synchronization.
 */
export function useSsoProviderTable(
  deleteAction?: ComponentAction<IdentityProvider, void>,
  removeFromOrg?: ComponentAction<IdentityProvider, void>,
  enableAction?: ComponentAction<IdentityProvider>,
  customMessages = {},
): UseSsoProviderTableReturn {
  const { t } = useTranslator('idp_management.notifications', customMessages);
  const { coreClient } = useCoreClient();
  const queryClient = useQueryClient();
  const hasShownProvidersError = useRef(false);
  const hasShownOrganizationError = useRef(false);

  // ============================================
  // QUERIES - All data managed by TanStack Query
  // ============================================

  const providersQuery = useQuery({
    queryKey: ssoProviderQueryKeys.list(),
    queryFn: async () => {
      const response = await coreClient!
        .getMyOrganizationApiClient()
        .organization.identityProviders.list();
      return (response?.identity_providers ?? []) as IdentityProvider[];
    },
    enabled: !!coreClient,
  });

  const organizationQuery = useQuery({
    queryKey: ssoProviderQueryKeys.organization,
    queryFn: async () => {
      const response = await coreClient!.getMyOrganizationApiClient().organizationDetails.get();
      return OrganizationDetailsMappers.fromAPI(response);
    },
    enabled: !!coreClient,
  });

  useEffect(() => {
    if (providersQuery.isError && !hasShownProvidersError.current) {
      showToast({
        type: 'error',
        message: t('general_error'),
      });
      hasShownProvidersError.current = true;
    }

    if (!providersQuery.isError) {
      hasShownProvidersError.current = false;
    }
  }, [providersQuery.isError, t]);

  useEffect(() => {
    if (organizationQuery.isError && !hasShownOrganizationError.current) {
      showToast({
        type: 'error',
        message: t('general_error'),
      });
      hasShownOrganizationError.current = true;
    }

    if (!organizationQuery.isError) {
      hasShownOrganizationError.current = false;
    }
  }, [organizationQuery.isError, t]);

  // ============================================
  // MUTATIONS
  // ============================================

  const enableProviderMutation = useMutation({
    mutationFn: async ({
      selectedIdp,
      enabled,
    }: {
      selectedIdp: IdentityProvider;
      enabled: boolean;
    }): Promise<IdentityProvider> => {
      if (!selectedIdp?.id) {
        throw new Error('Invalid provider');
      }

      if (enableAction?.onBefore) {
        const shouldProceed = enableAction.onBefore(selectedIdp);
        if (!shouldProceed) {
          throw new BusinessError({ message: t('general_error') });
        }
      }

      const apiRequestData: UpdateIdentityProviderRequestContent = SsoProviderMappers.updateToAPI({
        strategy: selectedIdp.strategy,
        is_enabled: enabled,
      });

      const updatedProvider = await coreClient!
        .getMyOrganizationApiClient()
        .organization.identityProviders.update(selectedIdp.id, apiRequestData);

      return updatedProvider as IdentityProvider;
    },
    onSuccess: async (updatedProvider, { selectedIdp }) => {
      if (enableAction?.onAfter) {
        await enableAction.onAfter(selectedIdp);
      }

      showToast({
        type: 'success',
        message: t('update_success', { providerName: selectedIdp.display_name }),
      });

      // Update the cache optimistically
      queryClient.setQueryData<IdentityProvider[]>(ssoProviderQueryKeys.list(), (old) => {
        if (!old) return old;
        return old.map((provider) =>
          provider.id === selectedIdp.id ? { ...provider, ...updatedProvider } : provider,
        );
      });
    },
    onError: () => {
      showToast({
        type: 'error',
        message: t('general_error'),
      });
    },
  });

  const deleteProviderMutation = useMutation({
    mutationFn: async (selectedIdp: IdentityProvider): Promise<void> => {
      if (!selectedIdp?.id) {
        throw new Error('Invalid provider');
      }

      await coreClient!
        .getMyOrganizationApiClient()
        .organization.identityProviders.delete(selectedIdp.id);
    },
    onSuccess: async (_, selectedIdp) => {
      if (deleteAction?.onAfter) {
        await deleteAction.onAfter(selectedIdp);
      }

      showToast({
        type: 'success',
        message: t('delete_success', { providerName: selectedIdp.display_name }),
      });

      queryClient.invalidateQueries({ queryKey: ssoProviderQueryKeys.list() });
    },
    onError: () => {
      showToast({
        type: 'error',
        message: t('general_error'),
      });
    },
  });

  const removeProviderMutation = useMutation({
    mutationFn: async (selectedIdp: IdentityProvider): Promise<void> => {
      if (!selectedIdp?.id) {
        throw new Error('Invalid provider');
      }

      await coreClient!
        .getMyOrganizationApiClient()
        .organization.identityProviders.detach(selectedIdp.id);
    },
    onSuccess: async (_, selectedIdp) => {
      if (removeFromOrg?.onAfter) {
        await removeFromOrg.onAfter(selectedIdp);
      }

      const organizationData = queryClient.getQueryData<OrganizationPrivate>(
        ssoProviderQueryKeys.organization,
      );

      showToast({
        type: 'success',
        message: t('remove_success', {
          providerName: selectedIdp.display_name,
          organizationName: organizationData?.display_name,
        }),
      });

      queryClient.invalidateQueries({ queryKey: ssoProviderQueryKeys.list() });
    },
    onError: () => {
      showToast({
        type: 'error',
        message: t('general_error'),
      });
    },
  });

  // ============================================
  // ACTIONS - Wrappers around mutations
  // ============================================

  const onEnableProvider = useCallback(
    async (selectedIdp: IdentityProvider, enabled: boolean): Promise<boolean> => {
      if (!selectedIdp || !coreClient || !selectedIdp.id) {
        return false;
      }

      try {
        await enableProviderMutation.mutateAsync({ selectedIdp, enabled });
        return true;
      } catch {
        return false;
      }
    },
    [coreClient, enableProviderMutation],
  );

  const onDeleteConfirm = useCallback(
    async (selectedIdp: IdentityProvider): Promise<void> => {
      if (!selectedIdp || !coreClient || !selectedIdp.id) {
        return;
      }

      try {
        await deleteProviderMutation.mutateAsync(selectedIdp);
      } catch {
        // Errors are handled by mutation onError
      }
    },
    [coreClient, deleteProviderMutation],
  );

  const onRemoveConfirm = useCallback(
    async (selectedIdp: IdentityProvider): Promise<void> => {
      if (!selectedIdp || !coreClient || !selectedIdp.id) {
        return;
      }

      try {
        await removeProviderMutation.mutateAsync(selectedIdp);
      } catch {
        // Errors are handled by mutation onError
      }
    },
    [coreClient, removeProviderMutation],
  );

  const fetchProviders = useCallback(async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: ssoProviderQueryKeys.list() });
  }, [queryClient]);

  const fetchOrganizationDetails = useCallback(async (): Promise<OrganizationPrivate | null> => {
    if (!coreClient) {
      return null;
    }

    try {
      const data = await queryClient.ensureQueryData({
        queryKey: ssoProviderQueryKeys.organization,
        queryFn: async () => {
          const response = await coreClient.getMyOrganizationApiClient().organizationDetails.get();
          return OrganizationDetailsMappers.fromAPI(response);
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
  }, [coreClient, queryClient, t]);

  // ============================================
  // RETURN
  // ============================================

  return {
    // Data from TanStack Query - single source of truth
    providers: providersQuery.data ?? [],
    organization: organizationQuery.data ?? null,

    // Loading states - all derived from TanStack Query
    isLoading: providersQuery.isLoading || organizationQuery.isLoading,
    isDeleting: deleteProviderMutation.isPending,
    isRemoving: removeProviderMutation.isPending,
    isUpdating: enableProviderMutation.isPending,
    isUpdatingId: enableProviderMutation.isPending
      ? (enableProviderMutation.variables?.selectedIdp?.id ?? null)
      : null,

    // Actions
    fetchProviders,
    fetchOrganizationDetails,
    onDeleteConfirm,
    onRemoveConfirm,
    onEnableProvider,
  };
}
