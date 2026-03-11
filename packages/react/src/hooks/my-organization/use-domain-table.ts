/**
 * Domain table hook.
 * @module use-domain-table
 */

import {
  type Domain,
  type IdentityProvider,
  type CreateOrganizationDomainRequestContent,
  type IdentityProviderAssociatedWithDomain,
  BusinessError,
  MY_ORGANIZATION_DOMAIN_SCOPES,
} from '@auth0/universal-components-core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import { showToast } from '@/components/auth0/shared/toast';
import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useErrorHandler } from '@/hooks/shared/use-error-handler';
import { useTranslator } from '@/hooks/shared/use-translator';
import type {
  UseDomainTableOptions,
  UseDomainTableResult,
} from '@/types/my-organization/domain-management/domain-table-types';

const domainQueryKeys = {
  all: ['domains'] as const,
  list: () => [...domainQueryKeys.all, 'list'] as const,
  providers: (domainId: string) => [...domainQueryKeys.all, 'providers', domainId] as const,
};

/**
 * @param props - Hook options.
 * @returns Domain table state and handlers.
 */
export function useDomainTable({
  createAction,
  deleteAction,
  verifyAction,
  associateToProviderAction,
  deleteFromProviderAction,
  customMessages,
}: UseDomainTableOptions): UseDomainTableResult {
  const { t } = useTranslator('domain_management', customMessages);
  const { coreClient } = useCoreClient();
  const handleError = useErrorHandler();
  const queryClient = useQueryClient();

  const [selectedDomainId, setSelectedDomainId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showConfigureModal, setShowConfigureModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyError, setVerifyError] = useState<string | undefined>(undefined);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);

  const fetchProvidersForDomain = useCallback(
    async (domainId: string) => {
      const api = coreClient!
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_DOMAIN_SCOPES);

      const [allProvidersResponse, associatedProvidersResponse] = await Promise.all([
        api.organization.identityProviders.list(),
        api.organization.domains.identityProviders.get(domainId),
      ]);

      const allProviders = allProvidersResponse?.identity_providers ?? [];
      const associatedProviders = associatedProvidersResponse?.identity_providers ?? [];
      const associatedIds = new Set(associatedProviders.map((p) => p.id).filter(Boolean));

      return allProviders.map(
        (provider): IdentityProviderAssociatedWithDomain => ({
          ...provider,
          is_associated: provider.id ? associatedIds.has(provider.id) : false,
        }),
      );
    },
    [coreClient],
  );

  const domainsQuery = useQuery({
    queryKey: domainQueryKeys.list(),
    queryFn: async () => {
      const response = await coreClient!
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_DOMAIN_SCOPES)
        .organization.domains.list();
      return response?.organization_domains ?? [];
    },
    enabled: !!coreClient,
  });

  const providersQuery = useQuery({
    queryKey: domainQueryKeys.providers(selectedDomainId ?? ''),
    queryFn: () => fetchProvidersForDomain(selectedDomainId!),
    enabled: !!coreClient && !!selectedDomainId,
  });

  const createDomainMutation = useMutation({
    mutationFn: async (data: CreateOrganizationDomainRequestContent): Promise<Domain> => {
      if (createAction?.onBefore && !createAction.onBefore(data as Domain)) {
        throw new BusinessError({
          message: t('domain_table.notifications.domain_create.on_before'),
        });
      }
      return coreClient!
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_DOMAIN_SCOPES)
        .organization.domains.create(data);
    },
    onSuccess: (result) => {
      createAction?.onAfter?.(result);
      queryClient.invalidateQueries({ queryKey: domainQueryKeys.list() });
    },
  });

  const verifyDomainMutation = useMutation({
    mutationFn: async (domain: Domain): Promise<boolean> => {
      if (verifyAction?.onBefore && !verifyAction.onBefore(domain)) {
        throw new BusinessError({
          message: t('domain_table.notifications.domain_verify.on_before'),
        });
      }
      const response = await coreClient!
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_DOMAIN_SCOPES)
        .organization.domains.verify.create(domain.id);
      return response.status === 'verified';
    },
    onSuccess: (_, domain) => {
      verifyAction?.onAfter?.(domain);
      queryClient.invalidateQueries({ queryKey: domainQueryKeys.list() });
    },
  });

  const deleteDomainMutation = useMutation({
    mutationFn: async (domain: Domain): Promise<void> => {
      if (deleteAction?.onBefore && !deleteAction.onBefore(domain)) {
        throw new BusinessError({
          message: t('domain_table.notifications.domain_delete.on_before'),
        });
      }
      await coreClient!
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_DOMAIN_SCOPES)
        .organization.domains.delete(domain.id);
    },
    onSuccess: (_, domain) => {
      deleteAction?.onAfter?.(domain);
      queryClient.invalidateQueries({ queryKey: domainQueryKeys.list() });
      queryClient.removeQueries({ queryKey: domainQueryKeys.providers(domain.id) });
    },
  });

  const associateToProviderMutation = useMutation({
    mutationFn: async ({ domain, provider }: { domain: Domain; provider: IdentityProvider }) => {
      if (
        associateToProviderAction?.onBefore &&
        !associateToProviderAction.onBefore(domain, provider)
      ) {
        throw new BusinessError({
          message: t('domain_table.notifications.domain_associate_provider.on_before'),
        });
      }
      await coreClient!
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_DOMAIN_SCOPES)
        .organization.identityProviders.domains.create(provider.id!, { domain: domain.domain });
    },
    onSuccess: (_, { domain, provider }) => {
      associateToProviderAction?.onAfter?.(domain, provider);
      queryClient.invalidateQueries({ queryKey: domainQueryKeys.providers(domain.id) });
    },
  });

  const deleteFromProviderMutation = useMutation({
    mutationFn: async ({ domain, provider }: { domain: Domain; provider: IdentityProvider }) => {
      if (
        deleteFromProviderAction?.onBefore &&
        !deleteFromProviderAction.onBefore(domain, provider)
      ) {
        throw new BusinessError({
          message: t('domain_table.notifications.domain_delete_provider.on_before'),
        });
      }
      await coreClient!
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_DOMAIN_SCOPES)
        .organization.identityProviders.domains.delete(provider.id!, domain.domain);
    },
    onSuccess: (_, { domain, provider }) => {
      deleteFromProviderAction?.onAfter?.(domain, provider);
      queryClient.invalidateQueries({ queryKey: domainQueryKeys.providers(domain.id) });
    },
  });

  const handleCreate = useCallback(
    async (domainUrl: string) => {
      try {
        const newDomain = await createDomainMutation.mutateAsync({ domain: domainUrl });
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
    [createDomainMutation, t, handleError],
  );

  const handleVerify = useCallback(
    async (domain: Domain) => {
      try {
        const isVerified = await verifyDomainMutation.mutateAsync(domain);
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
    [verifyDomainMutation, t, handleError],
  );

  const handleDelete = useCallback(
    async (domain: Domain) => {
      try {
        await deleteDomainMutation.mutateAsync(domain);
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
    [deleteDomainMutation, t, handleError],
  );

  const handleToggleSwitch = useCallback(
    async (domain: Domain, provider: IdentityProvider, newCheckedValue: boolean) => {
      if (newCheckedValue) {
        try {
          await associateToProviderMutation.mutateAsync({ domain, provider });
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
          await deleteFromProviderMutation.mutateAsync({ domain, provider });
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
    [associateToProviderMutation, deleteFromProviderMutation, t, handleError],
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
          setSelectedDomainId(domain.id);
          await queryClient.ensureQueryData({
            queryKey: domainQueryKeys.providers(domain.id),
            queryFn: () => fetchProvidersForDomain(domain.id),
          });
          setShowConfigureModal(true);
        } catch (error) {
          handleError(error, {
            fallbackMessage: t('domain_table.notifications.fetch_providers_error'),
          });
        }
      }
    },
    [fetchProvidersForDomain, queryClient, t, handleError],
  );

  const handleVerifyClick = useCallback(
    async (domain: Domain) => {
      setSelectedDomain(domain);
      try {
        const isVerified = await verifyDomainMutation.mutateAsync(domain);
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
        handleError(error, {
          fallbackMessage: t('domain_table.notifications.domain_verify.error'),
        });
      }
    },
    [verifyDomainMutation, t, handleError],
  );

  const handleDeleteClick = useCallback((domain: Domain) => {
    setSelectedDomain(domain);
    setShowVerifyModal(false);
    setShowDeleteModal(true);
  }, []);

  return {
    domains: domainsQuery.data ?? [],
    providers: providersQuery.data ?? [],
    isFetching: domainsQuery.isLoading,
    isCreating: createDomainMutation.isPending,
    isDeleting: deleteDomainMutation.isPending,
    isVerifying: verifyDomainMutation.isPending,
    isLoadingProviders: providersQuery.isLoading,
    showCreateModal,
    showConfigureModal,
    showVerifyModal,
    showDeleteModal,
    verifyError,
    selectedDomain,
    setShowCreateModal,
    setShowConfigureModal,
    setShowVerifyModal,
    setShowDeleteModal,
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
