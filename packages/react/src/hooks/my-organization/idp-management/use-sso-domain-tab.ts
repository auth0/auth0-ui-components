import type { CreateOrganizationDomainRequestContent } from '@auth0/universal-components-core';
import { BusinessError, type Domain, type IdpId } from '@auth0/universal-components-core';
import { useQuery, useQueryClient, useMutation, useQueries } from '@tanstack/react-query';
import { useCallback, useState, useMemo, useEffect } from 'react';

import { showToast } from '../../../components/ui/toast';
import { useErrorHandler } from '../../../hooks/use-error-handler';
import type {
  UseSsoDomainTabOptions,
  UseSsoDomainTabReturn,
} from '../../../types/my-organization/idp-management/sso-domain/sso-domain-tab-types';
import { useCoreClient } from '../../use-core-client';
import { useTranslator } from '../../use-translator';

const domainQueryKeys = {
  all: ['sso-domains'] as const,
  lists: () => [...domainQueryKeys.all, 'list'] as const,
  list: (idpId: IdpId) => [...domainQueryKeys.lists(), idpId] as const,
  idpAssociations: () => [...domainQueryKeys.all, 'idp-associations'] as const,
  idpAssociation: (domainId: string, idpId: IdpId) =>
    [...domainQueryKeys.idpAssociations(), domainId, idpId] as const,
};

export function useSsoDomainTab(
  idpId: IdpId,
  { customMessages = {}, domains, provider }: Partial<UseSsoDomainTabOptions> = {},
): UseSsoDomainTabReturn {
  const { coreClient } = useCoreClient();
  const { t } = useTranslator('idp_management.notifications', customMessages);
  const { handleError } = useErrorHandler();
  const queryClient = useQueryClient();

  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [verifyError, setVerifyError] = useState<string | undefined>(undefined);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);

  // Fetch domains list using TanStack Query
  const domainsQuery = useQuery({
    queryKey: domainQueryKeys.list(idpId),
    queryFn: async () => {
      const response = await coreClient!.getMyOrganizationApiClient().organization.domains.list();
      return response.organization_domains;
    },
    enabled: !!coreClient && !!idpId,
  });

  const domainsList = domainsQuery.data ?? [];
  const isLoading = domainsQuery.isLoading;

  // Handle errors from domains query
  useEffect(() => {
    if (domainsQuery.error) {
      handleError(domainsQuery.error, {
        fallbackMessage: t('general_error'),
      });
    }
  }, [domainsQuery.error, handleError, t]);

  // Fetch IDP associations for each domain using useQueries
  const idpAssociationQueries = useQueries({
    queries: domainsList.map((domain) => ({
      queryKey: domainQueryKeys.idpAssociation(domain.id, idpId),
      queryFn: async () => {
        const response = await coreClient!
          .getMyOrganizationApiClient()
          .organization.domains.identityProviders.get(domain.id);

        const isIdpEnabled = response.identity_providers?.some((idp) => idp.id === idpId);
        return { domainId: domain.id, isEnabled: isIdpEnabled ?? false };
      },
      enabled: !!coreClient && !!idpId,
      staleTime: 5 * 60 * 1000, // 5 minutes
    })),
  });

  // Derive idpDomains from query results
  const idpDomains = useMemo(
    () =>
      idpAssociationQueries
        .filter((query) => query.data?.isEnabled)
        .map((query) => query.data!.domainId),
    [idpAssociationQueries],
  );

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
    onSuccess: (newDomain) => {
      queryClient.invalidateQueries({ queryKey: domainQueryKeys.list(idpId) });
      // Also invalidate the IDP association for the new domain
      queryClient.invalidateQueries({
        queryKey: domainQueryKeys.idpAssociation(newDomain.id, idpId),
      });
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
        queryClient.setQueryData<Domain[]>(domainQueryKeys.list(idpId), (oldDomains) => {
          if (!oldDomains) return oldDomains;
          return oldDomains.map((d) => (d.id === domain.id ? { ...d, ...updatedDomain } : d));
        });
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
    onSuccess: (domain) => {
      queryClient.invalidateQueries({ queryKey: domainQueryKeys.list(idpId) });
      // Also invalidate the IDP association for the deleted domain
      queryClient.invalidateQueries({
        queryKey: domainQueryKeys.idpAssociation(domain.id, idpId),
      });
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
    onSuccess: (domain) => {
      // Invalidate the IDP association query for this domain
      queryClient.invalidateQueries({
        queryKey: domainQueryKeys.idpAssociation(domain.id, idpId),
      });
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
    onSuccess: (domain) => {
      // Invalidate the IDP association query for this domain
      queryClient.invalidateQueries({
        queryKey: domainQueryKeys.idpAssociation(domain.id, idpId),
      });
    },
  });

  // ===== Handlers =====

  const handleCreate = useCallback(
    async (domainUrl: string) => {
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

  const handleDeleteClick = useCallback((domain: Domain) => {
    setSelectedDomain(domain);
    setShowVerifyModal(false);
    setShowDeleteModal(true);
  }, []);

  const handleDelete = useCallback(
    async (domain: Domain) => {
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
    [handleError, deleteDomainMutation, t],
  );

  const handleVerifyActionColumn = useCallback(
    async (domain: Domain) => {
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

  return {
    isLoading,
    domainsList,
    isCreating: createDomainMutation.isPending,
    selectedDomain,
    showVerifyModal,
    showDeleteModal,
    isVerifying: verifyDomainMutation.isPending,
    verifyError,
    isDeleting: deleteDomainMutation.isPending,
    showCreateModal,
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
  };
}
