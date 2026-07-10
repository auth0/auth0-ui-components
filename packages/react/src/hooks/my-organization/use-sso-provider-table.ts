/**
 * SSO provider table hook.
 * Single public hook combining data operations and UI logic.
 * @module use-sso-provider-table
 */

import type { IdpKnownResponse } from '@auth0/universal-components-core';
import { ssoProviderQueryKeys } from '@auth0/universal-components-core';
import { useCallback, useEffect, useRef, useState } from 'react';

import { showToast } from '@/components/auth0/shared/toast';
import { useSsoProviderTableService } from '@/hooks/my-organization/shared/services/use-sso-provider-table-service';
import { useConfig } from '@/hooks/my-organization/use-config';
import { useIdpConfig } from '@/hooks/my-organization/use-idp-config';
import { useErrorHandler } from '@/hooks/shared/use-error-handler';
import { useTranslator } from '@/hooks/shared/use-translator';
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
  const { t } = useTranslator(
    'idp_management.notifications',
    customMessages as Record<string, unknown>,
  );
  const handleError = useErrorHandler();

  const {
    providers,
    organization,
    isLoading,
    isRefetchingProviders,
    isProvidersStale,
    providersUpdatedAt,
    providersError,
    organizationError,
    isDeleting,
    isRemoving,
    isUpdating,
    isUpdatingId,
    refetchProviders,
    fetchProviders,
    fetchOrganizationDetails,
    onDeleteConfirm,
    onRemoveConfirm,
    onEnableProvider,
  } = useSsoProviderTableService(
    deleteAction,
    deleteFromOrganizationAction,
    enableProviderAction,
    customMessages as Record<string, unknown>,
  );

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedIdp, setSelectedIdp] = useState<IdpKnownResponse | null>(null);
  const hasShownProvidersError = useRef(false);
  const hasShownOrganizationError = useRef(false);

  const { isLoadingConfig, shouldAllowDeletion, isConfigValid } = useConfig();
  const { isLoadingIdpConfig, isIdpConfigValid } = useIdpConfig();
  const shouldHideCreate = !isConfigValid || !isIdpConfigValid;
  const isViewLoading = isLoading || isLoadingConfig || isLoadingIdpConfig;

  useEffect(() => {
    if (providersError && !hasShownProvidersError.current) {
      handleError(providersError, { fallbackMessage: t('general_error') });
      hasShownProvidersError.current = true;
    }

    if (!providersError) {
      hasShownProvidersError.current = false;
    }
  }, [providersError, t, handleError]);

  useEffect(() => {
    if (organizationError && !hasShownOrganizationError.current) {
      handleError(organizationError, { fallbackMessage: t('general_error') });
      hasShownOrganizationError.current = true;
    }

    if (!organizationError) {
      hasShownOrganizationError.current = false;
    }
  }, [organizationError, t, handleError]);

  const handleCreate = useCallback(() => {
    if (createAction?.onAfter) {
      createAction.onAfter();
    }
  }, [createAction]);

  const handleEdit = useCallback(
    (idp: IdpKnownResponse) => {
      if (editAction?.onAfter) {
        editAction.onAfter(idp);
      }
    },
    [editAction],
  );

  const handleDelete = useCallback(
    (idp: IdpKnownResponse) => {
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
    (idp: IdpKnownResponse) => {
      setSelectedIdp(idp);

      if (deleteFromOrganizationAction?.onBefore) {
        const shouldProceed = deleteFromOrganizationAction.onBefore(idp);
        if (!shouldProceed) return;
      }

      setShowRemoveModal(true);
    },
    [deleteFromOrganizationAction],
  );

  const handleFetchOrganizationDetails = useCallback(async () => {
    try {
      return await fetchOrganizationDetails();
    } catch (error) {
      handleError(error, { fallbackMessage: t('general_error') });
      return null;
    }
  }, [fetchOrganizationDetails, handleError, t]);

  const handleToggleEnabled = useCallback(
    async (idp: IdpKnownResponse, enabled: boolean) => {
      if (readOnly || !onEnableProvider) return;
      try {
        await onEnableProvider(idp, enabled);
        showToast({
          type: 'success',
          message: t('update_success', { providerName: idp.display_name }),
        });
      } catch (error) {
        handleError(error, { fallbackMessage: t('general_error') });
      }
    },
    [readOnly, onEnableProvider, t, handleError],
  );

  const handleDeleteConfirm = useCallback(
    async (provider: IdpKnownResponse) => {
      try {
        await onDeleteConfirm(provider);
        showToast({
          type: 'success',
          message: t('delete_success', { providerName: provider.display_name }),
        });
        setShowDeleteModal(false);
        setSelectedIdp(null);
      } catch (error) {
        handleError(error, { fallbackMessage: t('general_error') });
      }
    },
    [onDeleteConfirm, t, handleError],
  );

  const handleRemoveConfirm = useCallback(
    async (provider: IdpKnownResponse) => {
      try {
        await onRemoveConfirm(provider);
        showToast({
          type: 'success',
          message: t('remove_success', {
            providerName: provider.display_name,
            organizationName: organization?.display_name,
          }),
        });
        setShowRemoveModal(false);
        setSelectedIdp(null);
      } catch (error) {
        handleError(error, { fallbackMessage: t('general_error') });
      }
    },
    [onRemoveConfirm, organization?.display_name, t, handleError],
  );

  return {
    providers,
    organization,

    isLoading,
    isViewLoading,
    isRefetchingProviders,
    isProvidersStale,
    providersUpdatedAt,
    isDeleting,
    isRemoving,
    isUpdating,
    isUpdatingId,

    shouldAllowDeletion,
    shouldHideCreate,

    showDeleteModal,
    showRemoveModal,
    selectedIdp,

    refetchProviders,
    fetchProviders,
    fetchOrganizationDetails: handleFetchOrganizationDetails,

    handleCreate,
    handleEdit,
    handleDelete,
    handleDeleteFromOrganization,
    handleToggleEnabled,
    handleDeleteConfirm,
    handleRemoveConfirm,

    setShowDeleteModal,
    setShowRemoveModal,
    setSelectedIdp,
  };
}
