/**
 * Domain table hook.
 * Single public hook combining data operations and UI logic.
 * @module use-domain-table
 */

import {
  getDomainManagementPermissions,
  type Domain,
  type IdpKnownResponse,
} from '@auth0/universal-components-core';
import { useCallback, useMemo, useState } from 'react';

import { showToast } from '@/components/auth0/shared/toast';
import { useConfig } from '@/hooks/my-organization/shared/services/use-config-service';
import { useDomainTableService } from '@/hooks/my-organization/shared/services/use-domain-table-service';
import { useIdpConfig } from '@/hooks/my-organization/shared/services/use-idp-config-service';
import { useCheckpointPagination } from '@/hooks/shared/use-checkpoint-pagination';
import { useErrorHandler } from '@/hooks/shared/use-error-handler';
import { usePermissions } from '@/hooks/shared/use-permissions';
import { useTranslator } from '@/hooks/shared/use-translator';
import { DEFAULT_PAGE_SIZE_OPTIONS } from '@/lib/constants/shared/constants';
import {
  getDomainVerificationMode,
  isDomainUsedForDiscovery,
} from '@/lib/utils/my-organization/domain-management/domain-management-utils';
import type {
  UseDomainTableOptions,
  UseDomainTableReturn,
} from '@/types/my-organization/domain-management/domain-table-types';

/**
 * Hook for domain table data, CRUD operations, and UI logic.
 * Consumes the internal service hook and manages modal/UI state.
 * @param options - Hook options including actions and custom messages.
 * @returns Combined data, loading states, UI state, and handlers.
 */
export function useDomainTable({
  readOnly = false,
  createAction,
  deleteAction,
  verifyAction,
  associateToProviderAction,
  deleteFromProviderAction,
  customMessages,
}: UseDomainTableOptions): UseDomainTableReturn {
  const { t } = useTranslator('domain_management', customMessages);
  const handleError = useErrorHandler();
  const { createPermissionResolver } = usePermissions();

  const permissions = useMemo(
    () => createPermissionResolver(getDomainManagementPermissions, { readOnly }),
    [createPermissionResolver, readOnly],
  );

  const { discoveryPolicy, showDiscovery, isDiscoveryReadOnly, discoveryDefaultValue } =
    useConfig();
  const { idpConfig } = useIdpConfig();
  const domainVerificationMode = getDomainVerificationMode(idpConfig);

  const {
    pageSize,
    currentPage,
    fromToken,
    hasPreviousPage,
    goToNextPage,
    goToPreviousPage,
    changePageSize,
  } = useCheckpointPagination({
    defaultPageSize: DEFAULT_PAGE_SIZE_OPTIONS[0],
  });

  const {
    domains,
    providers,
    nextToken,
    isFetching,
    isRefetchingDomains,
    isDomainsStale,
    domainsUpdatedAt,
    isCreating,
    isDeleting,
    isVerifying,
    isUpdatingDiscovery,
    isLoadingProviders,
    refetchDomains,
    fetchProviders,
    onCreateDomain,
    onVerifyDomain,
    onUpdateDomainDiscovery,
    onDeleteDomain,
    onAssociateToProvider,
    onDeleteFromProvider,
  } = useDomainTableService({
    createAction,
    deleteAction,
    verifyAction,
    associateToProviderAction,
    deleteFromProviderAction,
    customMessages,
    paginationParams: {
      pageSize,
      fromToken,
    },
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConfigureModal, setShowConfigureModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyError, setVerifyError] = useState<string | undefined>(undefined);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [showDiscoveryModal, setShowDiscoveryModal] = useState(false);
  const [configureAfterDiscoveryModal, setConfigureAfterDiscoveryModal] = useState(false);
  const [updatingDiscoveryId, setUpdatingDiscoveryId] = useState<string | null>(null);

  const canChangeDiscovery =
    showDiscovery && !isDiscoveryReadOnly && permissions.canUpdateDomainDiscovery;

  const handleCreate = useCallback(
    async (domainUrl: string, useForDiscovery?: boolean) => {
      if (!permissions.canCreateDomain) return;
      const shouldSendDiscovery = showDiscovery && useForDiscovery !== undefined;
      const discoveryPayload = shouldSendDiscovery
        ? { use_for_organization_discovery: useForDiscovery }
        : {};
      try {
        const newDomain = await onCreateDomain({ domain: domainUrl, ...discoveryPayload });
        showToast({
          type: 'success',
          message: t('domain_table.notifications.domain_create.success', {
            domainName: newDomain?.domain,
          }),
        });
        setSelectedDomain(newDomain);
        setShowCreateModal(false);
        setShowVerifyModal(true);
      } catch (error) {
        handleError(error, {
          fallbackMessage: t('domain_table.notifications.domain_create.error'),
        });
      }
    },
    [permissions, onCreateDomain, showDiscovery, t, handleError],
  );

  /** Toasts the verification and offers discovery if it's still off. Returns true if the modal opened. */
  const announceVerified = useCallback(
    (domain: Domain): boolean => {
      const isDiscoveryOn = showDiscovery && isDomainUsedForDiscovery(domain, discoveryPolicy);
      const toastValues = { domainName: domain.domain };
      const message = isDiscoveryOn
        ? t('domain_table.notifications.domain_verify.success_discovery_on', toastValues)
        : t('domain_table.notifications.domain_verify.success', toastValues);

      showToast({ type: 'success', message });

      const shouldOfferDiscovery = !isDiscoveryOn && canChangeDiscovery;
      if (shouldOfferDiscovery) {
        setSelectedDomain(domain);
        setShowDiscoveryModal(true);
      }
      return shouldOfferDiscovery;
    },
    [showDiscovery, discoveryPolicy, canChangeDiscovery, t],
  );

  const handleVerify = useCallback(
    async (domain: Domain) => {
      if (!permissions.canVerifyDomain) return;
      try {
        const isVerified = await onVerifyDomain(domain);
        if (isVerified) {
          setShowVerifyModal(false);
          announceVerified(domain);
        } else {
          setVerifyError(
            t('domain_verify.modal.errors.verification_failed', { domainName: domain.domain }),
          );
        }
      } catch (error) {
        handleError(error, {
          fallbackMessage: t('domain_table.notifications.domain_verify.error'),
        });
      }
    },
    [permissions, onVerifyDomain, announceVerified, t, handleError],
  );

  const handleDelete = useCallback(
    async (domain: Domain) => {
      if (!permissions.canDeleteDomain) return;
      try {
        await onDeleteDomain(domain);
        showToast({
          type: 'success',
          message: t('domain_table.notifications.domain_delete.success', {
            domainName: domain.domain,
          }),
        });
        setShowDeleteModal(false);
        setShowVerifyModal(false);
      } catch (error) {
        handleError(error, {
          fallbackMessage: t('domain_table.notifications.domain_delete.error'),
        });
      }
    },
    [permissions, onDeleteDomain, t, handleError],
  );

  const handleToggleSwitch = useCallback(
    async (domain: Domain, provider: IdpKnownResponse, newCheckedValue: boolean) => {
      if (
        newCheckedValue ? !permissions.canAssociateProvider : !permissions.canDissociateProvider
      ) {
        return;
      }

      if (newCheckedValue) {
        try {
          await onAssociateToProvider(domain, provider);
          showToast({
            type: 'success',
            message: t('domain_table.notifications.domain_associate_provider.success', {
              domain: domain.domain,
              idp: provider.name,
            }),
          });
        } catch (error) {
          handleError(error, {
            fallbackMessage: t('domain_table.notifications.domain_associate_provider.error'),
          });
        }
      } else {
        try {
          await onDeleteFromProvider(domain, provider);
          showToast({
            type: 'success',
            message: t('domain_table.notifications.domain_delete_provider.success', {
              domain: domain.domain,
              idp: provider.name,
            }),
          });
        } catch (error) {
          handleError(error, {
            fallbackMessage: t('domain_table.notifications.domain_delete_provider.error'),
          });
        }
      }
    },
    [permissions, onAssociateToProvider, onDeleteFromProvider, t, handleError],
  );

  const handleCloseVerifyModal = useCallback(() => {
    setShowVerifyModal(false);
    setVerifyError(undefined);
  }, []);

  const handleCreateClick = useCallback(() => {
    if (!permissions.canCreateDomain) return;
    setShowCreateModal(true);
  }, [permissions]);

  const handleConfigureClick = useCallback(
    async (domain: Domain) => {
      setSelectedDomain(domain);
      if (domain.status !== 'verified') {
        setShowVerifyModal(true);
      } else {
        try {
          await fetchProviders(domain);
          setShowConfigureModal(true);
        } catch (error) {
          handleError(error, {
            fallbackMessage: t('domain_table.notifications.fetch_providers_error'),
          });
        }
      }
    },
    [fetchProviders, t, handleError],
  );

  const handleVerifyClick = useCallback(
    async (domain: Domain) => {
      if (!permissions.canVerifyDomain) return;
      setSelectedDomain(domain);
      try {
        const isVerified = await onVerifyDomain(domain);
        if (isVerified) {
          if (announceVerified(domain)) {
            setConfigureAfterDiscoveryModal(true);
          } else {
            await fetchProviders(domain);
            setShowConfigureModal(true);
          }
        } else {
          showToast({
            type: 'error',
            message: t('domain_table.notifications.domain_verify.verification_failed', {
              domainName: domain.domain,
            }),
          });
        }
      } catch (error) {
        handleError(error, {
          fallbackMessage: t('domain_table.notifications.domain_verify.error'),
        });
      }
    },
    [permissions, onVerifyDomain, announceVerified, fetchProviders, t, handleError],
  );

  const handleToggleDiscovery = useCallback(
    async (domain: Domain, checked: boolean) => {
      const isVerified = domain.status === 'verified';
      const canToggle = canChangeDiscovery && isVerified;
      if (!canToggle) return;

      const successKey = checked ? 'success_on' : 'success_off';
      setUpdatingDiscoveryId(domain.id);
      try {
        await onUpdateDomainDiscovery(domain, checked);
        showToast({
          type: 'success',
          message: t(`domain_table.notifications.domain_discovery_update.${successKey}`, {
            domainName: domain.domain,
          }),
        });
      } catch (error) {
        handleError(error, {
          fallbackMessage: t('domain_table.notifications.domain_discovery_update.error'),
        });
      } finally {
        setUpdatingDiscoveryId(null);
      }
    },
    [canChangeDiscovery, onUpdateDomainDiscovery, t, handleError],
  );

  /** Resumes the configure step that a row-level verify put on hold. */
  const continueAfterDiscoveryModal = useCallback(
    async (domain: Domain) => {
      if (!configureAfterDiscoveryModal) return;
      setConfigureAfterDiscoveryModal(false);
      try {
        await fetchProviders(domain);
        setShowConfigureModal(true);
      } catch (error) {
        handleError(error, {
          fallbackMessage: t('domain_table.notifications.fetch_providers_error'),
        });
      }
    },
    [configureAfterDiscoveryModal, fetchProviders, t, handleError],
  );

  const handleCloseDiscoveryModal = useCallback(() => {
    setShowDiscoveryModal(false);
    if (selectedDomain) {
      void continueAfterDiscoveryModal(selectedDomain);
    }
  }, [selectedDomain, continueAfterDiscoveryModal]);

  const handleEnableDiscovery = useCallback(
    async (domain: Domain) => {
      if (!canChangeDiscovery) return;
      setUpdatingDiscoveryId(domain.id);
      try {
        await onUpdateDomainDiscovery(domain, true);
        showToast({
          type: 'success',
          message: t('domain_table.notifications.domain_discovery_update.success_on', {
            domainName: domain.domain,
          }),
        });
        setShowDiscoveryModal(false);
        await continueAfterDiscoveryModal(domain);
      } catch (error) {
        handleError(error, {
          fallbackMessage: t('domain_table.notifications.domain_discovery_update.error'),
        });
      } finally {
        setUpdatingDiscoveryId(null);
      }
    },
    [canChangeDiscovery, onUpdateDomainDiscovery, continueAfterDiscoveryModal, t, handleError],
  );

  const handleDeleteClick = useCallback(
    (domain: Domain) => {
      if (!permissions.canDeleteDomain) return;
      setSelectedDomain(domain);
      setShowVerifyModal(false);
      setShowDeleteModal(true);
    },
    [permissions],
  );

  const handleNextPage = useCallback(() => {
    if (nextToken) {
      goToNextPage(nextToken);
    }
  }, [nextToken, goToNextPage]);

  const handlePreviousPage = useCallback(() => {
    goToPreviousPage();
  }, [goToPreviousPage]);

  const handlePageSizeChange = useCallback(
    (newPageSize: number) => {
      changePageSize(newPageSize);
    },
    [changePageSize],
  );

  return {
    permissions,

    // Data
    domains,
    providers,

    // Loading states
    isFetching,
    isRefetchingDomains,
    isDomainsStale,
    domainsUpdatedAt,
    isCreating,
    isDeleting,
    isVerifying,
    isLoadingProviders,
    isUpdatingDiscovery,
    updatingDiscoveryId,
    // Pagination
    pagination: {
      pageSize,
      currentPage,
      hasNextPage: !!nextToken,
      hasPreviousPage,
    },

    // Domain verification
    domainVerificationMode,

    // Discovery policy
    discoveryPolicy,
    showDiscovery,
    isDiscoveryReadOnly,
    discoveryDefaultValue,

    // Modal state
    showCreateModal,
    showConfigureModal,
    showVerifyModal,
    showDeleteModal,
    showDiscoveryModal,
    verifyError,
    selectedDomain,

    // State setters
    setShowCreateModal,
    setShowConfigureModal,
    setShowVerifyModal,
    setShowDeleteModal,

    // Handlers
    refetchDomains,
    handleCreate,
    handleVerify,
    handleToggleDiscovery,
    handleEnableDiscovery,
    handleCloseDiscoveryModal,
    handleDelete,
    handleToggleSwitch,
    handleCloseVerifyModal,
    handleCreateClick,
    handleConfigureClick,
    handleVerifyClick,
    handleDeleteClick,
    handleNextPage,
    handlePreviousPage,
    handlePageSizeChange,
  };
}
