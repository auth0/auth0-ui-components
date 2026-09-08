/**
 * SSO domain tab data and actions hook.
 * Single public hook that consumes the internal service hook.
 * @module use-sso-domain-tab
 */

import type { Domain, IdpId } from '@auth0/universal-components-core';
import { useCallback, useState } from 'react';

import { showToast } from '@/components/auth0/shared/toast';
import { useSsoDomainTabService } from '@/hooks/my-organization/shared/services/use-sso-domain-tab-service';
import { useCheckpointPagination } from '@/hooks/shared/use-checkpoint-pagination';
import { useErrorHandler } from '@/hooks/shared/use-error-handler';
import { useTranslator } from '@/hooks/shared/use-translator';
import { DEFAULT_PAGE_SIZE_OPTIONS } from '@/lib/constants/shared/constants';
import type {
  UseSsoDomainTabOptions,
  UseSsoDomainTabReturn,
} from '@/types/my-organization/idp-management/sso-domain/sso-domain-tab-types';

/**
 * Hook for SSO domain tab domain operations and state.
 * @param idpId - Identity provider ID.
 * @param options - Hook options.
 * @param options.customMessages - Custom translation messages.
 * @param options.domains - Initial domains data.
 * @param options.provider - SSO provider data.
 * @returns Hook state and methods
 */
export function useSsoDomainTab(
  idpId: IdpId,
  { customMessages = {}, domains, provider }: Partial<UseSsoDomainTabOptions> = {},
): UseSsoDomainTabReturn {
  const { t } = useTranslator('idp_management.notifications', customMessages);
  const handleError = useErrorHandler();

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
    domainsList,
    isLoading,
    isRefetchingDomains,
    isDomainsStale,
    domainsUpdatedAt,
    nextToken,
    refetchDomains,
    idpDomains,
    isCreating,
    isVerifying,
    isDeleting,
    createDomain,
    verifyDomain,
    deleteDomain,
    associateToProvider,
    deleteFromProvider,
  } = useSsoDomainTabService(idpId, {
    customMessages,
    domains,
    provider,
    pageSize,
    fromToken,
  });

  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [verifyError, setVerifyError] = useState<string | undefined>(undefined);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);

  const handleCreate = useCallback(
    async (domainUrl: string) => {
      try {
        const newDomain = await createDomain({ domain: domainUrl });

        showToast({
          type: 'success',
          message: t('domain_create.success', {
            domainName: newDomain?.domain,
          }),
        });

        setSelectedDomain(newDomain);
        setShowCreateModal(false);
        setShowVerifyModal(true);
      } catch (error) {
        handleError(error, {
          fallbackMessage: t('domain_create.error'),
        });
      }
    },
    [handleError, createDomain, t],
  );

  const handleCloseVerifyModal = useCallback(() => {
    setShowVerifyModal(false);
    setVerifyError(undefined);
  }, []);

  const handleVerify = useCallback(
    async (domain: Domain) => {
      try {
        const { isVerified } = await verifyDomain(domain);
        if (isVerified) {
          setShowVerifyModal(false);

          showToast({
            type: 'success',
            message: t('domain_verify.success', {
              domainName: domain.domain,
            }),
          });

          await associateToProvider(domain);
        } else {
          setVerifyError(t('domain_verify.verification_failed', { domainName: domain.domain }));
        }
      } catch (error) {
        handleError(error, {
          fallbackMessage: t('domain_verify.verification_failed'),
        });
      }
    },
    [verifyDomain, t, handleError, associateToProvider],
  );

  const handleDeleteClick = useCallback((domain: Domain) => {
    setSelectedDomain(domain);
    setShowVerifyModal(false);
    setShowDeleteModal(true);
  }, []);

  const handleDelete = useCallback(
    async (domain: Domain) => {
      try {
        await deleteDomain(domain);

        showToast({
          type: 'success',
          message: t('domain_delete.success', {
            domainName: domain.domain,
          }),
        });

        setShowDeleteModal(false);
        setShowVerifyModal(false);
      } catch (error) {
        handleError(error, {
          fallbackMessage: t('domain_delete.error'),
        });
      }
    },
    [handleError, deleteDomain, t],
  );

  const handleVerifyActionColumn = useCallback(
    async (domain: Domain) => {
      setIsUpdating(true);
      setIsUpdatingId(domain.id);

      try {
        const { isVerified } = await verifyDomain(domain);
        if (isVerified) {
          showToast({
            type: 'success',
            message: t('domain_verify.success', {
              domainName: domain.domain,
            }),
          });

          await associateToProvider(domain);
        } else {
          showToast({
            type: 'error',
            message: t('domain_verify.verification_failed', {
              domainName: domain.domain,
            }),
          });
        }
      } catch (error) {
        handleError(error, {
          fallbackMessage: t('domain_verify.verification_failed', { domainName: domain.domain }),
        });
      } finally {
        setIsUpdating(false);
        setIsUpdatingId(null);
      }
    },
    [verifyDomain, t, handleError, associateToProvider],
  );

  const handleToggleSwitch = useCallback(
    async (domain: Domain, newCheckedValue: boolean) => {
      setIsUpdating(true);
      setIsUpdatingId(domain.id);

      if (newCheckedValue) {
        try {
          await associateToProvider(domain);

          showToast({
            type: 'success',
            message: t('domain_associate_provider.success', {
              domain: domain.domain,
              idp: provider?.name,
            }),
          });
        } catch (error) {
          handleError(error, {
            fallbackMessage: t('general_error'),
          });
        } finally {
          setIsUpdating(false);
          setIsUpdatingId(null);
        }
      } else {
        try {
          await deleteFromProvider(domain);

          showToast({
            type: 'success',
            message: t('domain_delete_provider.success', {
              domain: domain.domain,
              idp: provider?.name,
            }),
          });
        } catch (error) {
          handleError(error, {
            fallbackMessage: t('general_error'),
          });
        } finally {
          setIsUpdating(false);
          setIsUpdatingId(null);
        }
      }
    },
    [associateToProvider, t, provider, handleError, deleteFromProvider],
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
    isLoading,
    isRefetchingDomains,
    isDomainsStale,
    domainsUpdatedAt,
    domainsList,
    isCreating,
    selectedDomain,
    showVerifyModal,
    showDeleteModal,
    isVerifying,
    verifyError,
    isDeleting,
    showCreateModal,
    pagination: {
      pageSize,
      currentPage,
      hasNextPage: !!nextToken,
      hasPreviousPage,
    },
    refetchDomains,
    handleCreate,
    handleCloseVerifyModal,
    handleVerify,
    handleDeleteClick,
    handleDelete,
    setShowCreateModal,
    setShowDeleteModal,
    idpDomains,
    handleVerifyActionColumn,
    isUpdating,
    isUpdatingId,
    handleToggleSwitch,
    handleNextPage,
    handlePreviousPage,
    handlePageSizeChange,
  };
}
