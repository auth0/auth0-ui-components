import {
  type Domain,
  type IdentityProvider,
  type CreateOrganizationDomainRequestContent,
  type IdentityProviderAssociatedWithDomain,
  MY_ORGANIZATION_DOMAIN_SCOPES,
} from '@auth0/universal-components-core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { showToast } from '@/components/auth0/shared/toast';
import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useErrorHandler } from '@/hooks/shared/use-error-handler';
import { useTranslator } from '@/hooks/shared/use-translator';
import type {
  UseDomainTableOptions,
  UseDomainTableResult,
} from '@/types/my-organization/domain-management/domain-table-types';

type ModalType = 'create' | 'configure' | 'verify' | 'delete';

const ACTION_CANCELLED_ERROR = 'ACTION_CANCELLED';

const isActionCancelledError = (error: unknown): boolean => {
  return error instanceof Error && error.message === ACTION_CANCELLED_ERROR;
};

const domainQueryKeys = {
  all: ['domains'] as const,
  list: () => [...domainQueryKeys.all, 'list'] as const,
  providers: (domainId: string) => [...domainQueryKeys.all, 'providers', domainId] as const,
};

const mapProviders = (
  all: IdentityProvider[],
  associatedIds: Set<string>,
): IdentityProviderAssociatedWithDomain[] =>
  all.map((provider) => ({
    ...provider,
    is_associated: provider.id ? associatedIds.has(provider.id) : false,
  }));

/**
 * Hook for managing organization domain verification and provider associations.
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
  const queryClient = useQueryClient();
  const handleError = useErrorHandler();

  const [activeModal, setActiveModal] = useState<ModalType | null>(null);
  const [selectedDomainId, setSelectedDomainId] = useState<string | null>(null);
  const [verifyError, setVerifyError] = useState<string | undefined>(undefined);

  const notifySuccess = (key: string, params?: Record<string, unknown>) => {
    showToast({
      type: 'success',
      message: t(`domain_table.notifications.${key}.success`, params),
    });
  };

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
    retry: false,
  });

  useEffect(() => {
    if (domainsQuery.error) {
      handleError(domainsQuery.error);
    }
  }, [domainsQuery.error, handleError]);

  const selectedDomain = useMemo(
    () => domainsQuery.data?.find((d) => d.id === selectedDomainId) ?? null,
    [domainsQuery.data, selectedDomainId],
  );

  const providersQuery = useQuery({
    queryKey: domainQueryKeys.providers(selectedDomainId ?? ''),
    queryFn: async () => {
      const api = coreClient!
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_DOMAIN_SCOPES);
      const [allRes, assocRes] = await Promise.all([
        api.organization.identityProviders.list(),
        api.organization.domains.identityProviders.get(selectedDomainId!),
      ]);
      const associatedIds = new Set(
        (assocRes?.identity_providers ?? []).map((p) => p.id).filter((id): id is string => !!id),
      );
      return mapProviders(allRes?.identity_providers ?? [], associatedIds);
    },
    enabled: !!coreClient && !!selectedDomainId && activeModal === 'configure',
    retry: false,
  });

  useEffect(() => {
    if (providersQuery.error) {
      handleError(providersQuery.error);
    }
  }, [providersQuery.error, handleError]);

  const createDomainMutation = useMutation({
    mutationFn: async (data: CreateOrganizationDomainRequestContent) => {
      if (createAction?.onBefore && !createAction.onBefore(data as Domain)) {
        throw new Error(ACTION_CANCELLED_ERROR);
      }
      return coreClient!
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_DOMAIN_SCOPES)
        .organization.domains.create(data);
    },
    onSuccess: (newDomain) => {
      createAction?.onAfter?.(newDomain);
      queryClient.invalidateQueries({ queryKey: domainQueryKeys.list() });
      notifySuccess('domain_create', { domainName: newDomain?.domain });
      setSelectedDomainId(newDomain.id);
      setActiveModal('verify');
    },
    onError: (error) => {
      if (!isActionCancelledError(error)) handleError(error);
    },
  });

  const verifyDomainMutation = useMutation({
    mutationFn: async (domain: Domain) => {
      if (verifyAction?.onBefore && !verifyAction.onBefore(domain)) {
        throw new Error(ACTION_CANCELLED_ERROR);
      }
      const res = await coreClient!
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_DOMAIN_SCOPES)
        .organization.domains.verify.create(domain.id);
      return res.status === 'verified';
    },
    onSuccess: (isVerified, domain) => {
      if (isVerified) {
        verifyAction?.onAfter?.(domain);
        queryClient.invalidateQueries({ queryKey: domainQueryKeys.list() });
      }
    },
    onError: (error) => {
      if (!isActionCancelledError(error)) handleError(error);
    },
  });

  const deleteDomainMutation = useMutation({
    mutationFn: async (domain: Domain) => {
      if (deleteAction?.onBefore && !deleteAction.onBefore(domain)) {
        throw new Error(ACTION_CANCELLED_ERROR);
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
      notifySuccess('domain_delete', { domainName: domain.domain });
      setActiveModal(null);
      setSelectedDomainId(null);
    },
    onError: (error) => {
      if (!isActionCancelledError(error)) handleError(error);
    },
  });

  const associateToProviderMutation = useMutation({
    mutationFn: async ({ domain, provider }: { domain: Domain; provider: IdentityProvider }) => {
      if (
        associateToProviderAction?.onBefore &&
        !associateToProviderAction.onBefore(domain, provider)
      ) {
        throw new Error(t('domain_table.notifications.domain_associate_provider.on_before'));
      }
      await coreClient!
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_DOMAIN_SCOPES)
        .organization.identityProviders.domains.create(provider.id!, { domain: domain.domain });
    },
    onSuccess: (_, { domain, provider }) => {
      associateToProviderAction?.onAfter?.(domain, provider);
      queryClient.invalidateQueries({ queryKey: domainQueryKeys.providers(domain.id) });
      notifySuccess('domain_associate_provider', { domain: domain.domain, idp: provider.name });
    },
    onError: (error) => handleError(error),
  });

  const deleteFromProviderMutation = useMutation({
    mutationFn: async ({ domain, provider }: { domain: Domain; provider: IdentityProvider }) => {
      if (
        deleteFromProviderAction?.onBefore &&
        !deleteFromProviderAction.onBefore(domain, provider)
      ) {
        throw new Error(t('domain_table.notifications.domain_delete_provider.on_before'));
      }
      await coreClient!
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_DOMAIN_SCOPES)
        .organization.identityProviders.domains.delete(provider.id!, domain.domain);
    },
    onSuccess: (_, { domain, provider }) => {
      deleteFromProviderAction?.onAfter?.(domain, provider);
      queryClient.invalidateQueries({ queryKey: domainQueryKeys.providers(domain.id) });
      notifySuccess('domain_delete_provider', { domain: domain.domain, idp: provider.name });
    },
    onError: (error) => handleError(error),
  });

  const verifyAndTransition = useCallback(
    async (domain: Domain, nextModal: ModalType | null) => {
      const isVerified = await verifyDomainMutation.mutateAsync(domain);
      if (isVerified) {
        setActiveModal(nextModal);
        notifySuccess('domain_verify', { domainName: domain.domain });
      } else {
        setVerifyError(
          t('domain_verify.modal.errors.verification_failed', { domainName: domain.domain }),
        );
      }
    },
    [verifyDomainMutation, t],
  );

  const handleCreate = useCallback(
    async (domainUrl: string) => {
      await createDomainMutation.mutateAsync({ domain: domainUrl });
    },
    [createDomainMutation],
  );

  const handleVerify = useCallback(
    async (domain: Domain) => verifyAndTransition(domain, null),
    [verifyAndTransition],
  );

  const handleDelete = useCallback(
    async (domain: Domain) => {
      await deleteDomainMutation.mutateAsync(domain);
    },
    [deleteDomainMutation],
  );

  const handleToggleSwitch = useCallback(
    async (domain: Domain, provider: IdentityProvider, checked: boolean) => {
      const mutation = checked ? associateToProviderMutation : deleteFromProviderMutation;
      await mutation.mutateAsync({ domain, provider });
    },
    [associateToProviderMutation, deleteFromProviderMutation],
  );

  const closeModal = useCallback(() => {
    setActiveModal(null);
    setVerifyError(undefined);
  }, []);

  const handleCreateClick = useCallback(() => setActiveModal('create'), []);

  const handleConfigureClick = useCallback((domain: Domain) => {
    setSelectedDomainId(domain.id);
    setActiveModal(domain.status === 'verified' ? 'configure' : 'verify');
  }, []);

  const handleVerifyClick = useCallback(
    async (domain: Domain) => {
      setSelectedDomainId(domain.id);
      try {
        await verifyAndTransition(domain, 'configure');
      } catch (error) {
        // Error handled by mutation's onError callback
      }
    },
    [verifyAndTransition],
  );

  const handleDeleteClick = useCallback((domain: Domain) => {
    setSelectedDomainId(domain.id);
    setActiveModal('delete');
  }, []);

  const error =
    domainsQuery.error ||
    providersQuery.error ||
    createDomainMutation.error ||
    verifyDomainMutation.error ||
    deleteDomainMutation.error ||
    associateToProviderMutation.error ||
    deleteFromProviderMutation.error;

  const retry = async () => {
    if (domainsQuery.error) {
      await queryClient.invalidateQueries({ queryKey: domainQueryKeys.list() });
      return;
    }

    if (providersQuery.error) {
      await queryClient.invalidateQueries({
        queryKey: domainQueryKeys.providers(selectedDomainId ?? ''),
      });
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
    domains: domainsQuery.data ?? [],
    providers: providersQuery.data ?? [],
    error,
    retry,
    isFetching: domainsQuery.isLoading,
    isCreating: createDomainMutation.isPending,
    isDeleting: deleteDomainMutation.isPending,
    isVerifying: verifyDomainMutation.isPending,
    isLoadingProviders: providersQuery.isFetching,
    showCreateModal: activeModal === 'create',
    showConfigureModal: activeModal === 'configure',
    showVerifyModal: activeModal === 'verify',
    showDeleteModal: activeModal === 'delete',
    verifyError,
    selectedDomain,
    closeModal,
    handleCreate,
    handleVerify,
    handleDelete,
    handleToggleSwitch,
    handleCreateClick,
    handleConfigureClick,
    handleVerifyClick,
    handleDeleteClick,
  };
}
