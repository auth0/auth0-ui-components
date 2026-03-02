/**
 * SSO provider table data and actions hook.
 * @module use-sso-provider-table
 */

import {
  OrganizationDetailsMappers,
  SsoProviderMappers,
  MY_ORGANIZATION_SSO_PROVIDER_TABLE_SCOPES,
  type UpdateIdentityProviderRequestContent,
  type IdentityProvider,
  type OrganizationPrivate,
  BusinessError,
} from '@auth0/universal-components-core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

import { showToast } from '@/components/auth0/shared/toast';
import { useConfig } from '@/hooks/my-organization/use-config';
import { useIdpConfig } from '@/hooks/my-organization/use-idp-config';
import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useErrorHandler } from '@/hooks/shared/use-error-handler';
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
 * Hook for SSO provider table data, CRUD operations, and UI logic.
 * @param options - Hook options.
 * @param options.readOnly - Whether the table is in read-only mode.
 * @param options.createAction - Action config for create.
 * @param options.editAction - Action config for edit.
 * @param options.deleteAction - Delete action handler.
 * @param options.deleteFromOrganizationAction - Remove from org handler.
 * @param options.enableProviderAction - Enable/disable handler.
 * @param options.customMessages - Translation overrides.
 * @returns Provider data, mutations, UI state, and actions.
 */
export function useSsoProviderTable({
  readOnly = false,
  createAction,
  editAction,
  deleteAction,
  deleteFromOrganizationAction,
  enableProviderAction,
  customMessages = {},
}: UseSsoProviderTableOptions): UseSsoProviderTableReturn {
  const { t } = useTranslator('idp_management.notifications', customMessages);
  const { coreClient } = useCoreClient();
  const queryClient = useQueryClient();
  const handleError = useErrorHandler();
  const {
    isLoadingConfig,
    shouldAllowDeletion,
    isConfigValid,
    error: configError,
    retry: retryConfig,
  } = useConfig();
  const {
    isLoadingIdpConfig,
    isIdpConfigValid,
    error: idpConfigError,
    retry: retryIdpConfig,
  } = useIdpConfig();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedIdp, setSelectedIdp] = useState<IdentityProvider | null>(null);

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
    retry: false,
  });

  useEffect(() => {
    if (providersQuery.error) {
      handleError(providersQuery.error);
    }
  }, [providersQuery.error, handleError]);

  const enableProviderMutation = useMutation({
    mutationFn: async ({
      selectedIdp,
      enabled,
    }: {
      selectedIdp: IdentityProvider;
      enabled: boolean;
    }): Promise<IdentityProvider> => {
      if (enableProviderAction?.onBefore) {
        const shouldProceed = enableProviderAction.onBefore(selectedIdp);
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
        .withScopes(MY_ORGANIZATION_SSO_PROVIDER_TABLE_SCOPES)
        .organization.identityProviders.update(selectedIdp.id!, apiRequestData);

      return updatedProvider as IdentityProvider;
    },
    onSuccess: async (updatedProvider, { selectedIdp }) => {
      if (enableProviderAction?.onAfter) {
        await enableProviderAction.onAfter(selectedIdp);
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
    onError: (error) => handleError(error),
  });

  const deleteProviderMutation = useMutation({
    mutationFn: async (selectedIdp: IdentityProvider): Promise<void> => {
      await coreClient!
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_SSO_PROVIDER_TABLE_SCOPES)
        .organization.identityProviders.delete(selectedIdp.id!);
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
    onError: (error) => handleError(error),
  });

  const removeProviderMutation = useMutation({
    mutationFn: async (selectedIdp: IdentityProvider): Promise<void> => {
      await coreClient!
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_SSO_PROVIDER_TABLE_SCOPES)
        .organization.identityProviders.detach(selectedIdp.id!);
    },
    onSuccess: async (_, selectedIdp) => {
      if (deleteFromOrganizationAction?.onAfter) {
        await deleteFromOrganizationAction.onAfter(selectedIdp);
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
    onError: (error) => handleError(error),
  });

  const onEnableProvider = useCallback(
    async (selectedIdp: IdentityProvider, enabled: boolean): Promise<boolean> => {
      if (!selectedIdp || !selectedIdp.id) {
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
      if (!selectedIdp || !selectedIdp.id) {
        return;
      }

      deleteProviderMutation.mutate(selectedIdp);
    },
    [coreClient, deleteProviderMutation],
  );

  const onRemoveConfirm = useCallback(
    async (selectedIdp: IdentityProvider): Promise<void> => {
      if (!selectedIdp || !selectedIdp.id) {
        return;
      }

      removeProviderMutation.mutate(selectedIdp);
    },
    [coreClient, removeProviderMutation],
  );

  const fetchProviders = useCallback(async (): Promise<void> => {
    await queryClient.getQueryData(ssoProviderQueryKeys.list());
  }, [queryClient]);

  const getOrganizationName = useCallback(async (): Promise<string | undefined> => {
    try {
      const data = await queryClient.ensureQueryData({
        queryKey: ssoProviderQueryKeys.organization,
        queryFn: async () => {
          const response = await coreClient!
            .getMyOrganizationApiClient()
            .withScopes(MY_ORGANIZATION_SSO_PROVIDER_TABLE_SCOPES)
            .organizationDetails.get();
          return OrganizationDetailsMappers.fromAPI(response);
        },
      });
      return data.display_name;
    } catch (error) {
      handleError(error);
      return undefined;
    }
  }, [coreClient, queryClient, handleError]);

  const isViewLoading = providersQuery.isLoading || isLoadingConfig || isLoadingIdpConfig;

  const handleCreate = useCallback(() => {
    if (createAction?.onAfter) {
      createAction.onAfter();
    }
  }, [createAction]);

  const handleEdit = useCallback(
    (idp: IdentityProvider) => {
      if (editAction?.onAfter) {
        editAction.onAfter(idp);
      }
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
      if (readOnly || !onEnableProvider) return;
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

  const error =
    providersQuery.error ||
    configError ||
    idpConfigError ||
    enableProviderMutation.error ||
    deleteProviderMutation.error ||
    removeProviderMutation.error;

  const retry = async () => {
    if (configError) {
      await retryConfig();
      return;
    }
    if (idpConfigError) {
      await retryIdpConfig();
      return;
    }
    if (providersQuery.error) {
      await queryClient.invalidateQueries({ queryKey: ssoProviderQueryKeys.list() });
      return;
    }

    const mutations = [
      {
        error: enableProviderMutation.error,
        retry: () =>
          enableProviderMutation.variables &&
          enableProviderMutation.mutateAsync(enableProviderMutation.variables),
      },
      {
        error: deleteProviderMutation.error,
        retry: () =>
          deleteProviderMutation.variables &&
          deleteProviderMutation.mutateAsync(deleteProviderMutation.variables),
      },
      {
        error: removeProviderMutation.error,
        retry: () =>
          removeProviderMutation.variables &&
          removeProviderMutation.mutateAsync(removeProviderMutation.variables),
      },
    ];

    const failedMutation = mutations.find((m) => m.error);
    if (failedMutation) {
      await failedMutation.retry();
    }
  };

  return {
    providers: providersQuery.data ?? [],
    isLoading: providersQuery.isLoading,
    isViewLoading,
    isDeleting: deleteProviderMutation.isPending,
    isRemoving: removeProviderMutation.isPending,
    isUpdating: enableProviderMutation.isPending,
    isUpdatingId: enableProviderMutation.isPending
      ? (enableProviderMutation.variables?.selectedIdp?.id ?? null)
      : null,
    shouldAllowDeletion,
    shouldHideCreate,
    showDeleteModal,
    showRemoveModal,
    selectedIdp,
    error,
    retry,
    fetchProviders,
    getOrganizationName,
    onDeleteConfirm,
    onRemoveConfirm,
    onEnableProvider,
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
