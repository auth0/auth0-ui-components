import { type Domain, type IdentityProvider } from '@auth0/universal-components-core';
import { useCallback, useEffect, useState } from 'react';

import { showToast } from '@/components/auth0/shared/toast';
import type {
  UseDomainTableLogicOptions,
  UseDomainTableLogicResult,
} from '@/types/my-organization/domain-management/domain-table-types';

export function useDomainTableLogic({
  t,
  onCreateDomain,
  onVerifyDomain,
  onDeleteDomain,
  onAssociateToProvider,
  onDeleteFromProvider,
  fetchProviders,
  fetchDomains,
}: UseDomainTableLogicOptions): UseDomainTableLogicResult {
  const [error, setError] = useState<unknown>(null);
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
        setError(error);
      }
    },
    [onCreateDomain, t],
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
        setError(error);
      }
    },
    [onVerifyDomain, t],
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
        setError(error);
      }
    },
    [onDeleteDomain, t],
  );

  const handleToggleSwitch = useCallback(
    async (domain: Domain, provider: IdentityProvider, newCheckedValue: boolean) => {
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
          setError(error);
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
          setError(error);
        }
      }
    },
    [onAssociateToProvider, onDeleteFromProvider, t],
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
          setError(error);
        }
      }
    },
    [fetchProviders, t],
  );

  const handleVerifyClick = useCallback(
    async (domain: Domain) => {
      setSelectedDomain(domain);
      try {
        const isVerified = await onVerifyDomain(domain);
        if (isVerified) {
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
        setError(error);
      }
    },
    [onVerifyDomain, t],
  );

  const handleDeleteClick = useCallback((domain: Domain) => {
    setSelectedDomain(domain);
    setShowVerifyModal(false);
    setShowDeleteModal(true);
  }, []);

  // Initialization
  useEffect(() => {
    try {
      fetchDomains();
    } catch (error) {
      setError(error);
    }
  }, [fetchDomains]);

  return {
    // Error state
    error,

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
