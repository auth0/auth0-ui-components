/**
 * Domain table hook.
 * Single public hook combining data operations and UI logic.
 * @module use-domain-table
 */

import { type Domain, type IdpKnownResponse } from '@auth0/universal-components-core';
import { useCallback, useEffect, useState } from 'react';

import { showToast } from '@/components/auth0/shared/toast';
import { useDomainTableService } from '@/hooks/my-organization/shared/services/use-domain-table-service';
import { useErrorHandler } from '@/hooks/shared/use-error-handler';
import { useTranslator } from '@/hooks/shared/use-translator';
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
  createAction,
  deleteAction,
  verifyAction,
  associateToProviderAction,
  deleteFromProviderAction,
  customMessages,
}: UseDomainTableOptions): UseDomainTableReturn {
  const { t } = useTranslator('domain_management', customMessages);
  const handleError = useErrorHandler();

  const {
    domains,
    providers,
    isFetching,
    isCreating,
    isDeleting,
    isVerifying,
    isLoadingProviders,
    fetchProviders,
    fetchDomains,
    onCreateDomain,
    onVerifyDomain,
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
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConfigureModal, setShowConfigureModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyError, setVerifyError] = useState<string | undefined>(undefined);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);

  const handleCreate = useCallback(
    async (domainUrl: string) => {
      try {
        const newDomain = await onCreateDomain({ domain: domainUrl });
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
    [onCreateDomain, t, handleError],
  );

  const handleVerify = useCallback(
    async (domain: Domain) => {
      try {
        const isVerified = await onVerifyDomain(domain);
        if (isVerified) {
          setShowVerifyModal(false);
          showToast({
            type: 'success',
            message: t('domain_table.notifications.domain_verify.success', {
              domainName: domain.domain,
            }),
          });
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
    [onVerifyDomain, t, handleError],
  );

  const handleDelete = useCallback(
    async (domain: Domain) => {
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
    [onDeleteDomain, t, handleError],
  );

  const handleToggleSwitch = useCallback(
    async (domain: Domain, provider: IdpKnownResponse, newCheckedValue: boolean) => {
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
    [onAssociateToProvider, onDeleteFromProvider, t, handleError],
  );

  const handleCloseVerifyModal = useCallback(() => {
    setShowVerifyModal(false);
    setVerifyError(undefined);
  }, []);

  const handleCreateClick = useCallback(() => {
    setShowCreateModal(true);
  }, []);

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
      setSelectedDomain(domain);
      try {
        const isVerified = await onVerifyDomain(domain);
        if (isVerified) {
          await fetchProviders(domain);
          setShowConfigureModal(true);
          showToast({
            type: 'success',
            message: t('domain_table.notifications.domain_verify.success', {
              domainName: domain.domain,
            }),
          });
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
    [onVerifyDomain, fetchProviders, t, handleError],
  );

  const handleDeleteClick = useCallback((domain: Domain) => {
    setSelectedDomain(domain);
    setShowVerifyModal(false);
    setShowDeleteModal(true);
  }, []);

  useEffect(() => {
    try {
      fetchDomains();
    } catch (error) {
      handleError(error, {
        fallbackMessage: t('domain_table.notifications.fetch_domains_error'),
      });
    }
  }, []);

  return {
    // Data
    domains,
    providers,

    // Loading states
    isFetching,
    isCreating,
    isDeleting,
    isVerifying,
    isLoadingProviders,

    // Modal state
    showCreateModal,
    showConfigureModal,
    showVerifyModal,
    showDeleteModal,
    verifyError,
    selectedDomain,

    // State setters
    setShowCreateModal,
    setShowConfigureModal,
    setShowVerifyModal,
    setShowDeleteModal,

    // Handlers
    handleCreate,
    handleVerify,
    handleDelete,
    handleToggleSwitch,
    handleCloseVerifyModal,
    handleCreateClick,
    handleConfigureClick,
    handleVerifyClick,
    handleDeleteClick,
  };
}
