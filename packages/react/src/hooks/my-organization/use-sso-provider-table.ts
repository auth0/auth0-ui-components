/**
 * SSO provider table hook.
 * Single public hook combining data operations and UI logic.
 * @module use-sso-provider-table
 */

import type { IdentityProvider } from '@auth0/universal-components-core';
import { useCallback, useState } from 'react';

import {
  useSsoProviderTableService,
  ssoProviderQueryKeys,
} from '@/hooks/my-organization/shared/services/use-sso-provider-table-service';
import { useConfig } from '@/hooks/my-organization/use-config';
import { useIdpConfig } from '@/hooks/my-organization/use-idp-config';
import type {
  UseSsoProviderTableOptions,
  UseSsoProviderTableReturn,
} from '@/types/my-organization/idp-management/sso-provider/sso-provider-table-types';

export { ssoProviderQueryKeys };

/**
 * Hook for SSO provider table data, CRUD operations, and UI logic.
 * Consumes the internal service hook and manages modal/UI state.
 * @param options - Hook options including actions, readOnly mode, and custom messages.
 * @returns Combined data, loading states, UI state, and handlers.
 */
export function useSsoProviderTable({
  readOnly = false,
  customMessages = {},
  createAction,
  editAction,
  deleteAction,
  deleteFromOrganizationAction,
  enableProviderAction,
}: UseSsoProviderTableOptions): UseSsoProviderTableReturn {
  // Internal service for data fetching and CRUD
  const service = useSsoProviderTableService(
    deleteAction,
    deleteFromOrganizationAction,
    enableProviderAction,
    customMessages,
  );

  // UI state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedIdp, setSelectedIdp] = useState<IdentityProvider | null>(null);

  // Config
  const { isLoadingConfig, shouldAllowDeletion, isConfigValid } = useConfig();
  const { isLoadingIdpConfig, isIdpConfigValid } = useIdpConfig();
  const shouldHideCreate = !isConfigValid || !isIdpConfigValid;
  const isViewLoading = service.isLoading || isLoadingConfig || isLoadingIdpConfig;

  // UI handlers
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
      if (readOnly || !service.onEnableProvider) return;
      await service.onEnableProvider(idp, enabled);
    },
    [readOnly, service.onEnableProvider],
  );

  const handleDeleteConfirm = useCallback(
    async (provider: IdentityProvider) => {
      await service.onDeleteConfirm(provider);
      setShowDeleteModal(false);
      setSelectedIdp(null);
    },
    [service.onDeleteConfirm],
  );

  const handleRemoveConfirm = useCallback(
    async (provider: IdentityProvider) => {
      await service.onRemoveConfirm(provider);
      setShowRemoveModal(false);
      setSelectedIdp(null);
    },
    [service.onRemoveConfirm],
  );

  return {
    // Data
    providers: service.providers,
    organization: service.organization,

    // Loading states
    isLoading: service.isLoading,
    isViewLoading,
    isDeleting: service.isDeleting,
    isRemoving: service.isRemoving,
    isUpdating: service.isUpdating,
    isUpdatingId: service.isUpdatingId,

    // Config
    shouldAllowDeletion,
    shouldHideCreate,

    // UI state
    showDeleteModal,
    showRemoveModal,
    selectedIdp,

    // Data actions
    fetchProviders: service.fetchProviders,
    fetchOrganizationDetails: service.fetchOrganizationDetails,

    // UI handlers
    handleCreate,
    handleEdit,
    handleDelete,
    handleDeleteFromOrganization,
    handleToggleEnabled,
    handleDeleteConfirm,
    handleRemoveConfirm,

    // UI state setters
    setShowDeleteModal,
    setShowRemoveModal,
    setSelectedIdp,
  };
}
