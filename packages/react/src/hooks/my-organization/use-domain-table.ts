/**
 * Domain table data and mutations hook.
 * @module use-domain-table
 */

import {
  type Domain,
  type IdpKnownResponse,
  type CreateOrganizationDomainRequestContent,
  type IdentityProviderAssociatedWithDomain,
  BusinessError,
} from '@auth0/universal-components-core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { useCoreClient } from '@/hooks/shared/use-core-client';
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
 * Hook for domain table data fetching and CRUD operations.
 * @param props - Component props.
 * @param props.createAction - Configuration for the create action
 * @param props.deleteAction - Configuration for the delete action
 * @param props.verifyAction - Configuration for the verify action
 * @param props.associateToProviderAction - Configuration for associating to a provider
 * @param props.deleteFromProviderAction - Configuration for deleting from a provider
 * @param props.customMessages - Custom translation messages to override defaults
 * @returns Hook state and methods
 */
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
  const [selectedDomainName, setSelectedDomainName] = useState<string | null>(null);

  const fetchProvidersForDomain = async (domainName: string) => {
    const api = coreClient!.getMyOrganizationApiClient();

    const allProvidersResponse = await api.organization.identityProviders.list();
    const allProviders = allProvidersResponse?.identity_providers ?? [];

    return allProviders.map(
      (provider): IdentityProviderAssociatedWithDomain => ({
        ...provider,
        is_associated: provider.domains?.includes(domainName) ?? false,
      }),
    );
  };

  const domainsQuery = useQuery({
    queryKey: domainQueryKeys.list(),
    queryFn: async () => {
      const { response } = await coreClient!
        .getMyOrganizationApiClient()
        .organization.domains.list();
      return response?.organization_domains ?? [];
    },
    enabled: !!coreClient,
  });

  const providersQuery = useQuery({
    queryKey: domainQueryKeys.providers(selectedDomainId ?? ''),
    queryFn: () => fetchProvidersForDomain(selectedDomainName!),
    enabled: !!coreClient && !!selectedDomainId && !!selectedDomainName,
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
    mutationFn: async ({ domain, provider }: { domain: Domain; provider: IdpKnownResponse }) => {
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
    mutationFn: async ({ domain, provider }: { domain: Domain; provider: IdpKnownResponse }) => {
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
    isCreating: createDomainMutation.isPending ?? (createDomainMutation as any).isLoading,
    isDeleting: deleteDomainMutation.isPending ?? (deleteDomainMutation as any).isLoading,
    isVerifying: verifyDomainMutation.isPending ?? (verifyDomainMutation as any).isLoading,
    isLoadingProviders: providersQuery.isLoading,
    fetchProviders: async (domain: Domain) => {
      setSelectedDomainId(domain.id);
      setSelectedDomainName(domain.domain);
      await queryClient.ensureQueryData({
        queryKey: domainQueryKeys.providers(domain.id),
        queryFn: () => fetchProvidersForDomain(domain.domain),
      });
    },
    fetchDomains: async () => {
      await queryClient.getQueryData(domainQueryKeys.list());
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
