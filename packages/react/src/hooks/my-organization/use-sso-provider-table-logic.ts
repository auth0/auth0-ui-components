/**
 * SSO provider table logic hook.
 * @module use-sso-provider-table-logic
 * @internal
 */

import type { IdentityProvider } from '@auth0/universal-components-core';
import { useCallback, useState } from 'react';

import { useConfig } from '@/hooks/my-organization/use-config';
import { useIdpConfig } from '@/hooks/my-organization/use-idp-config';
import type {
  UseSsoProviderTableLogicOptions,
  UseSsoProviderTableLogicResult,
} from '@/types/my-organization/idp-management/sso-provider/sso-provider-table-types';

/**
 * Logic hook for SSO provider table UI.
 * @param params - Hook options
 * @param params.readOnly - Whether the table is in read-only mode
 * @param params.isLoading - Loading state from parent/data hook
 * @param params.createAction - Action config for create
 * @param params.editAction - Action config for edit
 * @param params.deleteAction - Action config for delete
 * @param params.deleteFromOrganizationAction - Action config for remove from org
 * @param params.onEnableProvider - Handler for enabling/disabling provider
 * @param params.onDeleteConfirm - Handler for confirming delete
 * @param params.onRemoveConfirm - Handler for confirming remove from org
 * @returns Hook state and methods
 * @internal
 */
export function useSsoProviderTableLogic({
  readOnly,
  isLoading,
  createAction,
  editAction,
  deleteAction,
  deleteFromOrganizationAction,
  onEnableProvider,
  onDeleteConfirm,
  onRemoveConfirm,
}: UseSsoProviderTableLogicOptions): UseSsoProviderTableLogicResult {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedIdp, setSelectedIdp] = useState<IdentityProvider | null>(null);
  const { isLoadingConfig, shouldAllowDeletion, isConfigValid } = useConfig();
  const { isLoadingIdpConfig, isIdpConfigValid } = useIdpConfig();
  const shouldHideCreate = !isConfigValid || !isIdpConfigValid;
  const isViewLoading = isLoading || isLoadingConfig || isLoadingIdpConfig;

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

  return {
    isViewLoading,
    shouldAllowDeletion,
    showDeleteModal,
    shouldHideCreate,
    showRemoveModal,
    selectedIdp,
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
