import {
  type Domain,
  type IdentityProvider,
  type CreateOrganizationDomainRequestContent,
  type IdentityProviderAssociatedWithDomain,
  BusinessError,
} from '@auth0/universal-components-core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import type {
  UseDomainTableOptions,
  UseDomainTableResult,
} from '../../../types/my-organization/domain-management/domain-table-types';
import { useCoreClient } from '../../use-core-client';
import { useTranslator } from '../../use-translator';

const domainQueryKeys = {
  all: ['domains'] as const,
  list: () => [...domainQueryKeys.all, 'list'] as const,
  providers: (domainId: string) => [...domainQueryKeys.all, 'providers', domainId] as const,
};

export function useDomainTable({
  createAction,
  deleteAction,
  verifyAction,
  associateToProviderAction,
  deleteFromProviderAction,
  customMessages,
}: UseDomainTableOptions): UseDomainTableResult {
  const { t } = useTranslator('domain_management.domain_table.notifications', customMessages);
  const { coreClient } = useCoreClient();
  const queryClient = useQueryClient();

  const [selectedDomainId, setSelectedDomainId] = useState<string | null>(null);

  const fetchProvidersForDomain = async (domainId: string) => {
    const api = coreClient!.getMyOrganizationApiClient();

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
  };

  const domainsQuery = useQuery({
    queryKey: domainQueryKeys.list(),
    queryFn: async () => {
      const response = await coreClient!.getMyOrganizationApiClient().organization.domains.list();
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
        throw new BusinessError({ message: t('domain_create.on_before') });
      }
      return coreClient!.getMyOrganizationApiClient().organization.domains.create(data);
    },
    onSuccess: (result) => {
      createAction?.onAfter?.(result);
      queryClient.invalidateQueries({ queryKey: domainQueryKeys.list() });
    },
  });

  const verifyDomainMutation = useMutation({
    mutationFn: async (domain: Domain): Promise<boolean> => {
      if (verifyAction?.onBefore && !verifyAction.onBefore(domain)) {
        throw new BusinessError({ message: t('domain_verify.on_before') });
      }
      const response = await coreClient!
        .getMyOrganizationApiClient()
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
        throw new BusinessError({ message: t('domain_delete.on_before') });
      }
      await coreClient!.getMyOrganizationApiClient().organization.domains.delete(domain.id);
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
        throw new BusinessError({ message: t('domain_associate_provider.on_before') });
      }
      await coreClient!
        .getMyOrganizationApiClient()
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
        throw new BusinessError({ message: t('domain_delete_provider.on_before') });
      }
      await coreClient!
        .getMyOrganizationApiClient()
        .organization.identityProviders.domains.delete(provider.id!, domain.domain);
    },
    onSuccess: (_, { domain, provider }) => {
      deleteFromProviderAction?.onAfter?.(domain, provider);
      queryClient.invalidateQueries({ queryKey: domainQueryKeys.providers(domain.id) });
    },
  });

  return {
    domains: domainsQuery.data ?? [],
    providers: providersQuery.data ?? [],
    isFetching: domainsQuery.isLoading,
    isCreating: createDomainMutation.isPending,
    isDeleting: deleteDomainMutation.isPending,
    isVerifying: verifyDomainMutation.isPending,
    isLoadingProviders: providersQuery.isLoading,
    fetchProviders: async (domain: Domain) => {
      setSelectedDomainId(domain.id);
      await queryClient.ensureQueryData({
        queryKey: domainQueryKeys.providers(domain.id),
        queryFn: () => fetchProvidersForDomain(domain.id),
      });
    },
    fetchDomains: async () => {
      await queryClient.invalidateQueries({ queryKey: domainQueryKeys.list() });
    },
    onCreateDomain: (data) => createDomainMutation.mutateAsync(data),
    onVerifyDomain: (domain) => verifyDomainMutation.mutateAsync(domain),
    onDeleteDomain: (domain) => deleteDomainMutation.mutateAsync(domain),
    onAssociateToProvider: (domain, provider) =>
      associateToProviderMutation.mutateAsync({ domain, provider }),
    onDeleteFromProvider: (domain, provider) =>
      deleteFromProviderMutation.mutateAsync({ domain, provider }),
  };
}
