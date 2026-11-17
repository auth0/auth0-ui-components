/**
 * SSO domain tab data and actions hook.
 * Single public hook that consumes the internal service hook.
 * @module use-sso-domain-tab
 */

import {
  DEFAULT_DOMAIN_VERIFICATION_MODE,
  getIdpManagementPermissions,
  type Domain,
  type IdpId,
} from '@auth0/universal-components-core';
import { useCallback, useState, useMemo, useRef } from 'react';

import { showToast } from '@/components/auth0/shared/toast';
import { useSsoDomainTabService } from '@/hooks/my-organization/shared/services/use-sso-domain-tab-service';
import { useErrorHandler } from '@/hooks/shared/use-error-handler';
import { usePermissions } from '@/hooks/shared/use-permissions';
import { useTranslator } from '@/hooks/shared/use-translator';
import {
  isDomainAssociationUnavailable,
  isLastRequiredDomainLocked,
} from '@/lib/utils/my-organization/domain-management/domain-management-utils';
import { getProviderAccess } from '@/lib/utils/my-organization/idp-management/idp-management-utils';
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
 * @param options.domainVerificationMode - How the provider uses verified domains; assigning is skipped in `none` mode, without the associate permission, or when the access level is below full.
 * @returns Hook state and methods
 */
export function useSsoDomainTab(
  idpId: IdpId,
  {
    customMessages = {},
    domains,
    provider,
    readOnly = false,
    domainVerificationMode = DEFAULT_DOMAIN_VERIFICATION_MODE,
  }: Partial<UseSsoDomainTabOptions> = {},
): UseSsoDomainTabReturn {
  const { t } = useTranslator('idp_management.notifications', customMessages);
  const handleError = useErrorHandler();
  const { createPermissionResolver } = usePermissions();

  const permissions = useMemo(
    () => createPermissionResolver(getIdpManagementPermissions, { readOnly }),
    [createPermissionResolver, readOnly],
  );

  const {
    domainsList,
    availableDomains,
    isLoading,
    isRefetchingDomains,
    isDomainsStale,
    domainsUpdatedAt,
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
  });

  const canManageProviderDomains = getProviderAccess(provider).canManageDomains;
  const isAssociationUnavailable = isDomainAssociationUnavailable(domainVerificationMode);
  const canAssociate = permissions.canAssociateDomain && canManageProviderDomains;
  const canAssociateAfterVerify = canAssociate && !isAssociationUnavailable;
  const canAssociateAfterVerifyRef = useRef(canAssociateAfterVerify);
  canAssociateAfterVerifyRef.current = canAssociateAfterVerify;
  const isLastDomainLocked = isLastRequiredDomainLocked(domainVerificationMode, {
    is_enabled: provider?.is_enabled,
    domains: domainsList.map(({ domain }) => domain),
  });

  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [verifyError, setVerifyError] = useState<string | undefined>(undefined);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);

  const handleCreate = useCallback(
    async (domainUrl: string) => {
      if (!permissions.canCreateDomain) return;
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
      if (!permissions.canVerifyDomain) return;
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

          if (canAssociateAfterVerifyRef.current) await associateToProvider(domain);
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

  const handleDeleteClick = useCallback(
    (domain: Domain) => {
      if (!permissions.canDeleteDomain) return;
      setSelectedDomain(domain);
      setShowVerifyModal(false);
      setShowDeleteModal(true);
    },
    [permissions],
  );

  const handleDelete = useCallback(
    async (domain: Domain) => {
      if (!permissions.canDeleteDomain) return;
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
    [permissions, handleError, deleteDomain, t],
  );

  const handleVerifyActionColumn = useCallback(
    async (domain: Domain) => {
      if (!permissions.canVerifyDomain) return;
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

          if (canAssociateAfterVerifyRef.current) await associateToProvider(domain);
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
      const hasPermission = newCheckedValue ? canAssociate : permissions.canDissociateDomain;
      if (!hasPermission || !canManageProviderDomains) return;
      if (newCheckedValue && isAssociationUnavailable) return;
      if (!newCheckedValue && isLastDomainLocked) return;
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
    [
      associateToProvider,
      t,
      provider,
      handleError,
      deleteFromProvider,
      permissions,
      canAssociate,
      canManageProviderDomains,
      isAssociationUnavailable,
      isLastDomainLocked,
    ],
  );

  const handleAssign = useCallback(
    async (domainsToAssign: Domain[]) => {
      if (!canAssociate || isAssociationUnavailable || domainsToAssign.length === 0) return false;
      setIsAssigning(true);

      const assigned: Domain[] = [];
      const failed: { domain: Domain; error: unknown }[] = [];
      for (const domain of domainsToAssign) {
        try {
          await associateToProvider(domain);
          assigned.push(domain);
        } catch (error) {
          failed.push({ domain, error });
        }
      }

      if (assigned.length > 0) {
        showToast({
          type: 'success',
          message: t('domain_assign.success', {
            domains: assigned.map(({ domain }) => domain).join(', '),
            idp: provider?.name,
          }),
        });
      }
      if (failed.length > 0) {
        handleError(failed[0]!.error, {
          messagePrefix: t('domain_assign.error', {
            domains: failed.map(({ domain }) => domain.domain).join(', '),
            idp: provider?.name,
          }),
        });
      }

      setIsAssigning(false);
      return failed.length === 0;
    },
    [canAssociate, isAssociationUnavailable, associateToProvider, handleError, t, provider],
  );

  const handleRemove = useCallback(
    (domain: Domain) => handleToggleSwitch(domain, false),
    [handleToggleSwitch],
  );

  const noop = useCallback(() => {}, []);

  return {
    availableDomains,
    showAssignModal,
    setShowAssignModal,
    isAssigning,
    handleAssign,
    handleRemove,
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
      pageSize: domainsList.length,
      currentPage: 1,
      hasNextPage: false,
      hasPreviousPage: false,
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
    handleNextPage: noop,
    handlePreviousPage: noop,
    handlePageSizeChange: noop,
  };
}
