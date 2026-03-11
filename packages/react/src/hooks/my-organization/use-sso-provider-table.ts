/**
 * SSO provider table hook.
 * @module use-sso-provider-table
 */

import {
  OrganizationDetailsMappers,
  SsoProviderMappers,
  type UpdateIdentityProviderRequestContent,
  type IdentityProvider,
  type OrganizationPrivate,
  BusinessError,
  MY_ORGANIZATION_SSO_PROVIDER_TABLE_SCOPES,
} from '@auth0/universal-components-core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useRef, useState } from 'react';

import { showToast } from '@/components/auth0/shared/toast';
import { useConfig } from '@/hooks/my-organization/use-config';
import { useIdpConfig } from '@/hooks/my-organization/use-idp-config';
import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useTranslator } from '@/hooks/shared/use-translator';
import type {
  UseSsoProviderTableOptions,
  UseSsoProviderTableReturn,
} from '@/types/my-organization/idp-management/sso-provider/sso-provider-table-types';

export const ssoProviderQueryKeys = {
  all: ['sso-providers'] as const,
  list: () => [...ssoProviderQueryKeys.all, 'list'] as const,
  organization: ['organization', 'details'] as const,
};

/**
 * Hook for SSO provider table data, CRUD operations, and UI state.
 * @param options - Hook options.
 * @returns Provider data, mutations, UI state, and handlers.
 */
export function useSsoProviderTable({
  createAction,
  editAction,
  deleteAction,
  deleteFromOrganizationAction,
  enableProviderAction,
  readOnly = false,
  customMessages = {},
}: UseSsoProviderTableOptions = {}): UseSsoProviderTableReturn {
  const { t } = useTranslator('idp_management.notifications', customMessages);
  const { coreClient } = useCoreClient();
  const queryClient = useQueryClient();
  const hasShownProvidersError = useRef(false);
  const hasShownOrganizationError = useRef(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedIdp, setSelectedIdp] = useState<IdentityProvider | null>(null);

  const { isLoadingConfig, shouldAllowDeletion, isConfigValid } = useConfig();
  const { isLoadingIdpConfig, isIdpConfigValid } = useIdpConfig();
  const shouldHideCreate = !isConfigValid || !isIdpConfigValid;

  const providersQuery = useQuery({
    queryKey: ssoProviderQueryKeys.list(),
    queryFn: async () => {
      const response = await coreClient!
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_SSO_PROVIDER_TABLE_SCOPES)
        .organization.identityProviders.list();
      return (response?.identity_providers ?? []) as IdentityProvider[];
    },
    enabled: !!coreClient,
  });

  const organizationQuery = useQuery({
    queryKey: ssoProviderQueryKeys.organization,
    queryFn: async () => {
      const response = await coreClient!
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_SSO_PROVIDER_TABLE_SCOPES)
        .organizationDetails.get();
      return OrganizationDetailsMappers.fromAPI(response);
    },
    enabled: !!coreClient,
  });

  useEffect(() => {
    if (providersQuery.isError && !hasShownProvidersError.current) {
      showToast({ type: 'error', message: t('general_error') });
      hasShownProvidersError.current = true;
    }
    if (!providersQuery.isError) {
      hasShownProvidersError.current = false;
    }
  }, [providersQuery.isError, t]);

  useEffect(() => {
    if (organizationQuery.isError && !hasShownOrganizationError.current) {
      showToast({ type: 'error', message: t('general_error') });
      hasShownOrganizationError.current = true;
    }
    if (!organizationQuery.isError) {
      hasShownOrganizationError.current = false;
    }
  }, [organizationQuery.isError, t]);

  const isLoading = providersQuery.isLoading || organizationQuery.isLoading;
  const isViewLoading = isLoading || isLoadingConfig || isLoadingIdpConfig;

  const enableProviderMutation = useMutation({
    mutationFn: async ({
      selectedIdp: idp,
      enabled,
    }: {
      selectedIdp: IdentityProvider;
      enabled: boolean;
    }): Promise<IdentityProvider> => {
      if (!idp?.id) {
        throw new Error('Invalid provider');
      }

      if (enableProviderAction?.onBefore) {
        const shouldProceed = enableProviderAction.onBefore(idp);
        if (!shouldProceed) {
          throw new BusinessError({ message: t('general_error') });
        }
      }

      const apiRequestData: UpdateIdentityProviderRequestContent = SsoProviderMappers.updateToAPI({
        strategy: idp.strategy,
        is_enabled: enabled,
      });

      const updatedProvider = await coreClient!
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_SSO_PROVIDER_TABLE_SCOPES)
        .organization.identityProviders.update(idp.id, apiRequestData);

      return updatedProvider as IdentityProvider;
    },
    onSuccess: async (updatedProvider, { selectedIdp: idp }) => {
      if (enableProviderAction?.onAfter) {
        await enableProviderAction.onAfter(idp);
      }

      showToast({
        type: 'success',
        message: t('update_success', { providerName: idp.display_name }),
      });

      queryClient.setQueryData<IdentityProvider[]>(ssoProviderQueryKeys.list(), (old) => {
        if (!old) return old;
        return old.map((provider) =>
          provider.id === idp.id ? { ...provider, ...updatedProvider } : provider,
        );
      });
    },
    onError: () => {
      showToast({ type: 'error', message: t('general_error') });
    },
  });

  const deleteProviderMutation = useMutation({
    mutationFn: async (idp: IdentityProvider): Promise<void> => {
      if (!idp?.id) {
        throw new Error('Invalid provider');
      }

      await coreClient!
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_SSO_PROVIDER_TABLE_SCOPES)
        .organization.identityProviders.delete(idp.id);
    },
    onSuccess: async (_, idp) => {
      if (deleteAction?.onAfter) {
        await deleteAction.onAfter(idp);
      }

      showToast({
        type: 'success',
        message: t('delete_success', { providerName: idp.display_name }),
      });

      queryClient.invalidateQueries({ queryKey: ssoProviderQueryKeys.list() });
    },
    onError: () => {
      showToast({ type: 'error', message: t('general_error') });
    },
  });

  const removeProviderMutation = useMutation({
    mutationFn: async (idp: IdentityProvider): Promise<void> => {
      if (!idp?.id) {
        throw new Error('Invalid provider');
      }

      await coreClient!
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_SSO_PROVIDER_TABLE_SCOPES)
        .organization.identityProviders.detach(idp.id);
    },
    onSuccess: async (_, idp) => {
      if (deleteFromOrganizationAction?.onAfter) {
        await deleteFromOrganizationAction.onAfter(idp);
      }

      const organizationData = queryClient.getQueryData<OrganizationPrivate>(
        ssoProviderQueryKeys.organization,
      );

      showToast({
        type: 'success',
        message: t('remove_success', {
          providerName: idp.display_name,
          organizationName: organizationData?.display_name,
        }),
      });

      queryClient.invalidateQueries({ queryKey: ssoProviderQueryKeys.list() });
    },
    onError: () => {
      showToast({ type: 'error', message: t('general_error') });
    },
  });

  const onEnableProvider = useCallback(
    async (idp: IdentityProvider, enabled: boolean): Promise<boolean> => {
      if (!idp || !coreClient || !idp.id) return false;
      try {
        await enableProviderMutation.mutateAsync({ selectedIdp: idp, enabled });
        return true;
      } catch {
        return false;
      }
    },
    [coreClient, enableProviderMutation],
  );

  const onDeleteConfirm = useCallback(
    async (idp: IdentityProvider): Promise<void> => {
      if (!idp || !coreClient || !idp.id) return;
      deleteProviderMutation.mutate(idp);
    },
    [coreClient, deleteProviderMutation],
  );

  const onRemoveConfirm = useCallback(
    async (idp: IdentityProvider): Promise<void> => {
      if (!idp || !coreClient || !idp.id) return;
      removeProviderMutation.mutate(idp);
    },
    [coreClient, removeProviderMutation],
  );

  const fetchProviders = useCallback(async (): Promise<void> => {
    await queryClient.getQueryData(ssoProviderQueryKeys.list());
  }, [queryClient]);

  const fetchOrganizationDetails = useCallback(async (): Promise<OrganizationPrivate | null> => {
    if (!coreClient) return null;
    try {
      const data = await queryClient.ensureQueryData({
        queryKey: ssoProviderQueryKeys.organization,
        queryFn: async () => {
          const response = await coreClient
            .getMyOrganizationApiClient()
            .withScopes(MY_ORGANIZATION_SSO_PROVIDER_TABLE_SCOPES)
            .organizationDetails.get();
          return OrganizationDetailsMappers.fromAPI(response);
        },
      });
      return data;
    } catch {
      showToast({ type: 'error', message: t('general_error') });
      return null;
    }
  }, [coreClient, queryClient, t]);

  const handleCreate = useCallback(() => {
    createAction?.onAfter?.();
  }, [createAction]);

  const handleEdit = useCallback(
    (idp: IdentityProvider) => {
      editAction?.onAfter?.(idp);
    },
    [editAction],
  );

  const handleDelete = useCallback(
    (idp: IdentityProvider) => {
      setSelectedIdp(idp);
      if (deleteAction?.onBefore) {
        const shouldProceed = deleteAction.onBefore(idp);
        if (!shouldProceed) return;
      }
      setShowDeleteModal(true);
    },
    [deleteAction],
  );

  const handleDeleteFromOrganization = useCallback(
    (idp: IdentityProvider) => {
      setSelectedIdp(idp);
      if (deleteFromOrganizationAction?.onBefore) {
        const shouldProceed = deleteFromOrganizationAction.onBefore(idp);
        if (!shouldProceed) return;
      }
      setShowRemoveModal(true);
    },
    [deleteFromOrganizationAction],
  );

  const handleToggleEnabled = useCallback(
    async (idp: IdentityProvider, enabled: boolean) => {
      if (readOnly) return;
      await onEnableProvider(idp, enabled);
    },
    [readOnly, onEnableProvider],
  );

  const handleDeleteConfirm = useCallback(
    async (provider: IdentityProvider) => {
      await onDeleteConfirm(provider);
      setShowDeleteModal(false);
      setSelectedIdp(null);
    },
    [onDeleteConfirm],
  );

  const handleRemoveConfirm = useCallback(
    async (provider: IdentityProvider) => {
      await onRemoveConfirm(provider);
      setShowRemoveModal(false);
      setSelectedIdp(null);
    },
    [onRemoveConfirm],
  );

  return {
    providers: providersQuery.data ?? [],
    organization: organizationQuery.data ?? null,
    isLoading,
    isDeleting: deleteProviderMutation.isPending,
    isRemoving: removeProviderMutation.isPending,
    isUpdating: enableProviderMutation.isPending,
    isUpdatingId: enableProviderMutation.isPending
      ? (enableProviderMutation.variables?.selectedIdp?.id ?? null)
      : null,
    isViewLoading,
    shouldAllowDeletion,
    shouldHideCreate,
    showDeleteModal,
    showRemoveModal,
    selectedIdp,
    fetchProviders,
    fetchOrganizationDetails,
    setShowDeleteModal,
    setShowRemoveModal,
    setSelectedIdp,
    handleCreate,
    handleEdit,
    handleDelete,
    handleDeleteFromOrganization,
    handleToggleEnabled,
    handleDeleteConfirm,
    handleRemoveConfirm,
  };
}
