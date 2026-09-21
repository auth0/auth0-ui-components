/**
 * SSO domain tab data and actions hook.
 * @module use-sso-domain-tab
 */

import {
  type CreateOrganizationDomainRequestContent,
  BusinessError,
  getIdpManagementPermissions,
  ssoDomainQueryKeys,
  ssoProviderQueryKeys,
  type Domain,
  type IdpId,
} from '@auth0/universal-components-core';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useCallback, useState, useMemo, useEffect } from 'react';

import { showToast } from '@/components/auth0/shared/toast';
import { useCheckpointPagination } from '@/hooks/shared/use-checkpoint-pagination';
import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useErrorHandler } from '@/hooks/shared/use-error-handler';
import { usePermissions } from '@/hooks/shared/use-permissions';
import { useTranslator } from '@/hooks/shared/use-translator';
import { DEFAULT_PAGE_SIZE_OPTIONS } from '@/lib/constants/shared/constants';
import { getPreviousDataOption, isMutationLoading } from '@/lib/utils/tanstack-compat';
import type {
  UseSsoDomainTabOptions,
  UseSsoDomainTabReturn,
} from '@/types/my-organization/idp-management/sso-domain/sso-domain-tab-types';

const keepPreviousDataOption = getPreviousDataOption();

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
  {
    customMessages = {},
    domains,
    provider,
    readOnly = false,
  }: Partial<UseSsoDomainTabOptions> = {},
): UseSsoDomainTabReturn {
  const { coreClient } = useCoreClient();
  const { t } = useTranslator('idp_management.notifications', customMessages);
  const handleError = useErrorHandler();
  const queryClient = useQueryClient();
  const { createPermissionResolver } = usePermissions();

  const permissions = useMemo(
    () => createPermissionResolver(getIdpManagementPermissions, { readOnly }),
    [createPermissionResolver, readOnly],
  );

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

  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [verifyError, setVerifyError] = useState<string | undefined>(undefined);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);

  // Fetch domains list using TanStack Query
  const domainsQuery = useQuery({
    queryKey: ssoDomainQueryKeys.list(idpId, { pageSize, fromToken }),
    queryFn: async () => {
      const { response } = await coreClient!
        .getMyOrganizationApiClient()
        .organization.domains.list({
          take: pageSize,
          from: fromToken,
        });
      return {
        domains: response?.organization_domains ?? [],
        next: response?.next ?? null,
      };
    },
    enabled: !!coreClient && !!idpId,
    ...keepPreviousDataOption,
  });

  const domainsList = domainsQuery.data?.domains ?? [];
  const nextToken = domainsQuery.data?.next ?? null;
  const isLoading = domainsQuery.isLoading;

  // Handle errors from domains query
  useEffect(() => {
    if (domainsQuery.error) {
      handleError(domainsQuery.error, {
        fallbackMessage: t('general_error'),
      });
    }
  }, [domainsQuery.error, handleError, t]);

  // Derive idpDomains from the provider's domains field (provider is fetched by the parent hook)
  const idpDomains = useMemo(() => {
    const idpDomainNames = provider?.domains ?? [];
    return domainsList
      .filter((domain) => idpDomainNames.includes(domain.domain))
      .map((domain) => domain.id);
  }, [provider?.domains, domainsList]);

  // Mutations
  const createDomainMutation = useMutation({
    mutationFn: async (data: CreateOrganizationDomainRequestContent) => {
      if (domains?.createAction?.onBefore) {
        const canProceed = domains.createAction.onBefore(data as Domain);
        if (!canProceed) {
          throw new BusinessError({ message: t('domain_create.on_before') });
        }
      }

      const result: Domain = await coreClient!
        .getMyOrganizationApiClient()
        .organization.domains.create(data);

      domains?.createAction?.onAfter?.(result);

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ssoDomainQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ssoProviderQueryKeys.detail(idpId) });
    },
  });

  const verifyDomainMutation = useMutation({
    mutationFn: async (domain: Domain) => {
      if (domains?.verifyAction?.onBefore) {
        const canProceed = domains.verifyAction.onBefore(domain);
        if (!canProceed) {
          throw new BusinessError({ message: t('domain_verify.on_before') });
        }
      }

      const updatedDomain = await coreClient!
        .getMyOrganizationApiClient()
        .organization.domains.verify.create(domain.id);

      if (domains?.verifyAction?.onAfter) {
        await domains.verifyAction.onAfter(domain);
      }

      return { updatedDomain, isVerified: updatedDomain.status === 'verified' };
    },
    onSuccess: ({ updatedDomain, isVerified }, domain) => {
      if (isVerified) {
        queryClient.setQueryData<{ domains: Domain[]; next: string | null }>(
          ssoDomainQueryKeys.list(idpId, { pageSize, fromToken }),
          (oldData) => {
            if (!oldData) return oldData;
            return {
              ...oldData,
              domains: oldData.domains.map((d) =>
                d.id === domain.id ? { ...d, ...updatedDomain } : d,
              ),
            };
          },
        );
      }
    },
  });

  const deleteDomainMutation = useMutation({
    mutationFn: async (domain: Domain) => {
      if (!coreClient) {
        return domain;
      }

      if (domains?.deleteAction?.onBefore) {
        const canProceed = domains.deleteAction.onBefore(domain);
        if (!canProceed) {
          throw new BusinessError({ message: t('domain_delete.on_before') });
        }
      }

      await coreClient.getMyOrganizationApiClient().organization.domains.delete(domain.id);

      if (domains?.deleteAction?.onAfter) {
        await domains.deleteAction.onAfter(domain);
      }

      return domain;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ssoDomainQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ssoProviderQueryKeys.detail(idpId) });
    },
  });

  const associateToProviderMutation = useMutation({
    mutationFn: async (domain: Domain) => {
      if (domains?.associateToProviderAction?.onBefore) {
        const canProceed = domains.associateToProviderAction.onBefore(domain, provider);
        if (!canProceed) {
          throw new BusinessError({ message: t('domain_associate_provider.on_before') });
        }
      }

      await coreClient!
        .getMyOrganizationApiClient()
        .organization.identityProviders.domains.create(idpId, {
          domain: domain.domain,
        });

      if (domains?.associateToProviderAction?.onAfter) {
        await domains.associateToProviderAction.onAfter(domain, provider);
      }

      return domain;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ssoProviderQueryKeys.detail(idpId) });
    },
  });

  const deleteFromProviderMutation = useMutation({
    mutationFn: async (domain: Domain) => {
      if (!provider) {
        return domain;
      }

      if (domains?.deleteFromProviderAction?.onBefore) {
        const canProceed = domains.deleteFromProviderAction.onBefore(domain, provider);
        if (!canProceed) {
          throw new BusinessError({ message: t('domain_delete_provider.on_before') });
        }
      }

      await coreClient!
        .getMyOrganizationApiClient()
        .organization.identityProviders.domains.delete(provider.id!, domain.domain);

      if (domains?.deleteFromProviderAction?.onAfter) {
        await domains.deleteFromProviderAction.onAfter(domain);
      }

      return domain;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ssoProviderQueryKeys.detail(idpId) });
    },
  });

  const handleCreate = useCallback(
    async (domainUrl: string) => {
      if (!permissions.canCreateDomain) return;
      try {
        const newDomain = await createDomainMutation.mutateAsync({ domain: domainUrl });

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
    [handleError, createDomainMutation, t],
  );

  const handleCloseVerifyModal = useCallback(() => {
    setShowVerifyModal(false);
    setVerifyError(undefined);
  }, []);

  const handleVerify = useCallback(
    async (domain: Domain) => {
      if (!permissions.canVerifyDomain) return;
      try {
        const { isVerified } = await verifyDomainMutation.mutateAsync(domain);
        if (isVerified) {
          setShowVerifyModal(false);

          showToast({
            type: 'success',
            message: t('domain_verify.success', {
              domainName: domain.domain,
            }),
          });

          await associateToProviderMutation.mutateAsync(domain);
        } else {
          setVerifyError(t('domain_verify.verification_failed', { domainName: domain.domain }));
        }
      } catch (error) {
        handleError(error, {
          fallbackMessage: t('domain_verify.verification_failed'),
        });
      }
    },
    [verifyDomainMutation, t, handleError, associateToProviderMutation],
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
        await deleteDomainMutation.mutateAsync(domain);

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
    [permissions, handleError, deleteDomainMutation, t],
  );

  const handleVerifyActionColumn = useCallback(
    async (domain: Domain) => {
      if (!permissions.canVerifyDomain) return;
      setIsUpdating(true);
      setIsUpdatingId(domain.id);

      try {
        const { isVerified } = await verifyDomainMutation.mutateAsync(domain);
        if (isVerified) {
          showToast({
            type: 'success',
            message: t('domain_verify.success', {
              domainName: domain.domain,
            }),
          });

          await associateToProviderMutation.mutateAsync(domain);
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
    [verifyDomainMutation, t, handleError, associateToProviderMutation],
  );

  const handleToggleSwitch = useCallback(
    async (domain: Domain, newCheckedValue: boolean) => {
      if (newCheckedValue ? !permissions.canAssociateDomain : !permissions.canDissociateDomain) {
        return;
      }
      setIsUpdating(true);
      setIsUpdatingId(domain.id);

      if (newCheckedValue) {
        try {
          await associateToProviderMutation.mutateAsync(domain);

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
          await deleteFromProviderMutation.mutateAsync(domain);

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
    [associateToProviderMutation, t, provider, handleError, deleteFromProviderMutation],
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
    isRefetchingDomains: domainsQuery.isFetching,
    isDomainsStale: domainsQuery.isStale,
    domainsUpdatedAt: domainsQuery.dataUpdatedAt,
    domainsList,
    isCreating: isMutationLoading(createDomainMutation),
    selectedDomain,
    showVerifyModal,
    showDeleteModal,
    isVerifying: isMutationLoading(verifyDomainMutation),
    verifyError,
    isDeleting: isMutationLoading(deleteDomainMutation),
    showCreateModal,
    pagination: {
      pageSize,
      currentPage,
      hasNextPage: !!nextToken,
      hasPreviousPage,
    },
    refetchDomains: domainsQuery.refetch,
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
