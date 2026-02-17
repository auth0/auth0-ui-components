import type { CreateOrganizationDomainRequestContent } from '@auth0/universal-components-core';
import {
  type Domain,
  type IdpId,
  MY_ORGANIZATION_DOMAIN_SCOPES,
} from '@auth0/universal-components-core';
import { useQuery, useQueryClient, useMutation, useQueries } from '@tanstack/react-query';
import { useCallback, useState, useMemo, useEffect } from 'react';

import { showToast } from '@/components/auth0/shared/toast';
import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useErrorHandler } from '@/hooks/shared/use-error-handler';
import { useTranslator } from '@/hooks/shared/use-translator';
import type {
  UseSsoDomainTabOptions,
  UseSsoDomainTabReturn,
} from '@/types/my-organization/idp-management/sso-domain/sso-domain-tab-types';

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
  const queryClient = useQueryClient();
  const handleError = useErrorHandler();

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
      const response = await coreClient!
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_DOMAIN_SCOPES)
        .organization.domains.list();
      return response.organization_domains;
    },
    enabled: !!coreClient && !!idpId,
  });

  useEffect(() => {
    if (domainsQuery.error) {
      handleError(domainsQuery.error);
    }
  }, [domainsQuery.error, handleError]);

  const domainsList = domainsQuery.data ?? [];
  const isLoading = domainsQuery.isLoading;

  // Fetch IDP associations for each domain using useQueries
  const idpAssociationQueries = useQueries({
    queries: domainsList.map((domain) => ({
      queryKey: domainQueryKeys.idpAssociation(domain.id, idpId),
      queryFn: async () => {
        const response = await coreClient!
          .getMyOrganizationApiClient()
          .withScopes(MY_ORGANIZATION_DOMAIN_SCOPES)
          .organization.domains.identityProviders.get(domain.id);

        const isIdpEnabled = response.identity_providers?.some((idp) => idp.id === idpId);
        return { domainId: domain.id, isEnabled: isIdpEnabled ?? false };
      },
      enabled: !!coreClient && !!idpId,
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
          throw new Error(t('domain_create.on_before'));
        }
      }

      const result: Domain = await coreClient!
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_DOMAIN_SCOPES)
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
    onError: (error) => handleError(error),
  });

  const verifyDomainMutation = useMutation({
    mutationFn: async (domain: Domain) => {
      if (domains?.verifyAction?.onBefore) {
        const canProceed = domains.verifyAction.onBefore(domain);
        if (!canProceed) {
          throw new Error(t('domain_verify.on_before'));
        }
      }

      const updatedDomain = await coreClient!
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_DOMAIN_SCOPES)
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
    onError: (error) => handleError(error),
  });

  const deleteDomainMutation = useMutation({
    mutationFn: async (domain: Domain) => {
      if (!coreClient) {
        return domain;
      }

      if (domains?.deleteAction?.onBefore) {
        const canProceed = domains.deleteAction.onBefore(domain);
        if (!canProceed) {
          throw new Error(t('domain_delete.on_before'));
        }
      }

      await coreClient
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_DOMAIN_SCOPES)
        .organization.domains.delete(domain.id);

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
    onError: (error) => handleError(error),
  });

  const associateToProviderMutation = useMutation({
    mutationFn: async (domain: Domain) => {
      if (domains?.associateToProviderAction?.onBefore) {
        const canProceed = domains.associateToProviderAction.onBefore(domain, provider);
        if (!canProceed) {
          throw new Error(t('domain_associate_provider.on_before'));
        }
      }

      await coreClient!
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_DOMAIN_SCOPES)
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
    onError: (error) => handleError(error),
  });

  const deleteFromProviderMutation = useMutation({
    mutationFn: async (domain: Domain) => {
      if (!provider) {
        return domain;
      }

      if (domains?.deleteFromProviderAction?.onBefore) {
        const canProceed = domains.deleteFromProviderAction.onBefore(domain, provider);
        if (!canProceed) {
          throw new Error(t('domain_delete_provider.on_before'));
        }
      }

      await coreClient!
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_DOMAIN_SCOPES)
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
    onError: (error) => handleError(error),
  });

  // ===== Handlers =====

  const handleCreate = useCallback(
    async (domainUrl: string) => {
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
    },
    [createDomainMutation, t],
  );

  const handleCloseVerifyModal = useCallback(() => {
    setShowVerifyModal(false);
    setVerifyError(undefined);
  }, []);

  const handleVerify = useCallback(
    async (domain: Domain) => {
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
    },
    [verifyDomainMutation, t, associateToProviderMutation],
  );

  const handleDeleteClick = useCallback((domain: Domain) => {
    setSelectedDomain(domain);
    setShowVerifyModal(false);
    setShowDeleteModal(true);
  }, []);

  const handleDelete = useCallback(
    async (domain: Domain) => {
      await deleteDomainMutation.mutateAsync(domain);

      showToast({
        type: 'success',
        message: t('domain_delete.success', {
          domainName: domain.domain,
        }),
      });

      setShowDeleteModal(false);
      setShowVerifyModal(false);
    },
    [deleteDomainMutation, t],
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
      } finally {
        setIsUpdating(false);
        setIsUpdatingId(null);
      }
    },
    [verifyDomainMutation, t, associateToProviderMutation],
  );

  const handleToggleSwitch = useCallback(
    async (domain: Domain, newCheckedValue: boolean) => {
      setIsUpdating(true);
      setIsUpdatingId(domain.id);

      try {
        if (newCheckedValue) {
          await associateToProviderMutation.mutateAsync(domain);

          showToast({
            type: 'success',
            message: t('domain_associate_provider.success', {
              domain: domain.domain,
              idp: provider?.name,
            }),
          });
        } else {
          await deleteFromProviderMutation.mutateAsync(domain);

          showToast({
            type: 'success',
            message: t('domain_delete_provider.success', {
              domain: domain.domain,
              idp: provider?.name,
            }),
          });
        }
      } finally {
        setIsUpdating(false);
        setIsUpdatingId(null);
      }
    },
    [associateToProviderMutation, t, provider, deleteFromProviderMutation],
  );

  // Combine errors from all queries and mutations
  const error =
    domainsQuery.error ||
    createDomainMutation.error ||
    verifyDomainMutation.error ||
    deleteDomainMutation.error ||
    associateToProviderMutation.error ||
    deleteFromProviderMutation.error;

  // Retry function
  const retry = async () => {
    if (domainsQuery.error) {
      await queryClient.invalidateQueries({ queryKey: domainQueryKeys.list(idpId) });
      return;
    }

    const mutations = [
      {
        error: createDomainMutation.error,
        retry: () =>
          createDomainMutation.variables &&
          createDomainMutation.mutateAsync(createDomainMutation.variables),
      },
      {
        error: verifyDomainMutation.error,
        retry: () =>
          verifyDomainMutation.variables &&
          verifyDomainMutation.mutateAsync(verifyDomainMutation.variables),
      },
      {
        error: deleteDomainMutation.error,
        retry: () =>
          deleteDomainMutation.variables &&
          deleteDomainMutation.mutateAsync(deleteDomainMutation.variables),
      },
      {
        error: associateToProviderMutation.error,
        retry: () =>
          associateToProviderMutation.variables &&
          associateToProviderMutation.mutateAsync(associateToProviderMutation.variables),
      },
      {
        error: deleteFromProviderMutation.error,
        retry: () =>
          deleteFromProviderMutation.variables &&
          deleteFromProviderMutation.mutateAsync(deleteFromProviderMutation.variables),
      },
    ];

    const failedMutation = mutations.find((m) => m.error);
    if (failedMutation) {
      await failedMutation.retry();
    }
  };

  return {
    isLoading,
    error,
    retry,
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
