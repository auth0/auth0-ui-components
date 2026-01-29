import {
  type Domain,
  type IdentityProvider,
  type CreateOrganizationDomainRequestContent,
  type IdentityProviderAssociatedWithDomain,
  BusinessError,
} from '@auth0/universal-components-core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import type {
  UseDomainTableOptions,
  UseDomainTableResult,
} from '../../../types/my-organization/domain-management/domain-table-types';
import { useCoreClient } from '../../use-core-client';
import { useTranslator } from '../../use-translator';

export const domainQueryKeys = {
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

  // Track selected domain for providers query
  const [selectedDomainId, setSelectedDomainId] = useState<string | null>(null);

  // ============================================
  // QUERIES - All data managed by TanStack Query
  // ============================================

  const domainsQuery = useQuery({
    queryKey: domainQueryKeys.list(),
    queryFn: async () => {
      const response = await coreClient!.getMyOrganizationApiClient().organization.domains.list();
      return response?.organization_domains ?? [];
    },
    enabled: !!coreClient,
  });

  /**
   * Providers query - only runs when a domain is selected.
   * TanStack Query handles caching, loading states, and refetching.
   */
  const providersQuery = useQuery({
    queryKey: domainQueryKeys.providers(selectedDomainId!),
    queryFn: async () => {
      const responseAllProviders = await coreClient!
        .getMyOrganizationApiClient()
        .organization.identityProviders.list();
      const allProviders = responseAllProviders?.identity_providers ?? [];

      const responseAssociatedProviders = await coreClient!
        .getMyOrganizationApiClient()
        .organization.domains.identityProviders.get(selectedDomainId!);
      const associatedProviders = responseAssociatedProviders?.identity_providers ?? [];

      const providersWithAssociation: IdentityProviderAssociatedWithDomain[] = allProviders.map(
        (provider) => {
          const is_associated = associatedProviders.some(
            (assocProvider) => assocProvider.id === provider.id,
          );
          return { ...provider, is_associated };
        },
      );

      return providersWithAssociation;
    },
    enabled: !!coreClient && !!selectedDomainId, // Only fetch when domain is selected
  });

  /**
   * fetchProviders - Sets the selected domain ID to trigger the providers query.
   * TanStack Query handles the actual fetching and caching.
   */
  const fetchProviders = useCallback(
    async (domain: Domain): Promise<void> => {
      setSelectedDomainId(domain.id);
      // If data is already cached and fresh, this returns immediately
      // Otherwise, it will trigger a fetch via the providersQuery
      await queryClient.ensureQueryData({
        queryKey: domainQueryKeys.providers(domain.id),
        queryFn: async () => {
          const responseAllProviders = await coreClient!
            .getMyOrganizationApiClient()
            .organization.identityProviders.list();
          const allProviders = responseAllProviders?.identity_providers ?? [];

          const responseAssociatedProviders = await coreClient!
            .getMyOrganizationApiClient()
            .organization.domains.identityProviders.get(domain.id);
          const associatedProviders = responseAssociatedProviders?.identity_providers ?? [];

          const providersWithAssociation: IdentityProviderAssociatedWithDomain[] = allProviders.map(
            (provider) => {
              const is_associated = associatedProviders.some(
                (assocProvider) => assocProvider.id === provider.id,
              );
              return { ...provider, is_associated };
            },
          );

          return providersWithAssociation;
        },
      });
    },
    [coreClient, queryClient],
  );

  const createDomainMutation = useMutation({
    mutationFn: async (data: CreateOrganizationDomainRequestContent): Promise<Domain> => {
      if (createAction?.onBefore) {
        const canProceed = createAction.onBefore(data as Domain);
        if (!canProceed) {
          throw new BusinessError({ message: t('domain_create.on_before') });
        }
      }
      const result = await coreClient!
        .getMyOrganizationApiClient()
        .organization.domains.create(data);
      return result;
    },
    onSuccess: (result) => {
      createAction?.onAfter?.(result);
      queryClient.invalidateQueries({ queryKey: domainQueryKeys.list() });
    },
  });

  const verifyDomainMutation = useMutation({
    mutationFn: async (selectedDomain: Domain): Promise<boolean> => {
      if (verifyAction?.onBefore) {
        const canProceed = verifyAction.onBefore(selectedDomain);
        if (!canProceed) {
          throw new BusinessError({ message: t('domain_verify.on_before') });
        }
      }
      const response = await coreClient!
        .getMyOrganizationApiClient()
        .organization.domains.verify.create(selectedDomain.id);
      return response.status === 'verified';
    },
    onSuccess: async (_isVerified, selectedDomain) => {
      if (verifyAction?.onAfter) {
        await verifyAction.onAfter(selectedDomain);
      }
      queryClient.invalidateQueries({ queryKey: domainQueryKeys.list() });
    },
  });

  const deleteDomainMutation = useMutation({
    mutationFn: async (selectedDomain: Domain): Promise<void> => {
      if (deleteAction?.onBefore) {
        const canProceed = deleteAction.onBefore(selectedDomain);
        if (!canProceed) {
          throw new BusinessError({ message: t('domain_delete.on_before') });
        }
      }
      await coreClient!.getMyOrganizationApiClient().organization.domains.delete(selectedDomain.id);
    },
    onSuccess: async (_, selectedDomain) => {
      if (deleteAction?.onAfter) {
        await deleteAction.onAfter(selectedDomain);
      }
      queryClient.invalidateQueries({ queryKey: domainQueryKeys.list() });
      queryClient.removeQueries({ queryKey: domainQueryKeys.providers(selectedDomain.id) });
    },
  });

  const associateToProviderMutation = useMutation({
    mutationFn: async ({
      selectedDomain,
      provider,
    }: {
      selectedDomain: Domain;
      provider: IdentityProvider;
    }): Promise<void> => {
      if (associateToProviderAction?.onBefore) {
        const canProceed = associateToProviderAction.onBefore(selectedDomain, provider);
        if (!canProceed) {
          throw new BusinessError({ message: t('domain_associate_provider.on_before') });
        }
      }
      await coreClient!
        .getMyOrganizationApiClient()
        .organization.identityProviders.domains.create(provider.id!, {
          domain: selectedDomain.domain,
        });
    },
    onSuccess: async (_, { selectedDomain, provider }) => {
      if (associateToProviderAction?.onAfter) {
        await associateToProviderAction.onAfter(selectedDomain, provider);
      }
      queryClient.invalidateQueries({ queryKey: domainQueryKeys.providers(selectedDomain.id) });
    },
  });

  const deleteFromProviderMutation = useMutation({
    mutationFn: async ({
      selectedDomain,
      provider,
    }: {
      selectedDomain: Domain;
      provider: IdentityProvider;
    }): Promise<void> => {
      if (deleteFromProviderAction?.onBefore) {
        const canProceed = deleteFromProviderAction.onBefore(selectedDomain, provider);
        if (!canProceed) {
          throw new BusinessError({ message: t('domain_delete_provider.on_before') });
        }
      }
      await coreClient!
        .getMyOrganizationApiClient()
        .organization.identityProviders.domains.delete(provider.id!, selectedDomain.domain);
    },
    onSuccess: async (_, { selectedDomain, provider }) => {
      if (deleteFromProviderAction?.onAfter) {
        await deleteFromProviderAction.onAfter(selectedDomain, provider);
      }
      queryClient.invalidateQueries({ queryKey: domainQueryKeys.providers(selectedDomain.id) });
    },
  });

  const onCreateDomain = useCallback(
    async (data: CreateOrganizationDomainRequestContent): Promise<Domain | null> => {
      return await createDomainMutation.mutateAsync(data);
    },
    [createDomainMutation],
  );

  const onVerifyDomain = useCallback(
    async (selectedDomain: Domain): Promise<boolean> => {
      return await verifyDomainMutation.mutateAsync(selectedDomain);
    },
    [verifyDomainMutation],
  );

  const onDeleteDomain = useCallback(
    async (selectedDomain: Domain): Promise<void> => {
      await deleteDomainMutation.mutateAsync(selectedDomain);
    },
    [deleteDomainMutation],
  );

  const onAssociateToProvider = useCallback(
    async (selectedDomain: Domain, provider: IdentityProvider): Promise<void> => {
      await associateToProviderMutation.mutateAsync({ selectedDomain, provider });
    },
    [associateToProviderMutation],
  );

  const onDeleteFromProvider = useCallback(
    async (selectedDomain: Domain, provider: IdentityProvider): Promise<void> => {
      await deleteFromProviderMutation.mutateAsync({ selectedDomain, provider });
    },
    [deleteFromProviderMutation],
  );

  const fetchDomains = useCallback(async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: domainQueryKeys.list() });
  }, [queryClient]);

  return {
    // Data from TanStack Query - single source of truth
    domains: domainsQuery.data ?? [],
    providers: providersQuery.data ?? [],

    // Loading states - all derived from TanStack Query
    isFetching: domainsQuery.isFetching || domainsQuery.isLoading,
    isCreating: createDomainMutation.isPending,
    isDeleting: deleteDomainMutation.isPending,
    isVerifying: verifyDomainMutation.isPending,
    isLoadingProviders: providersQuery.isFetching || providersQuery.isLoading,

    // Actions
    fetchProviders,
    fetchDomains,
    onCreateDomain,
    onVerifyDomain,
    onDeleteDomain,
    onAssociateToProvider,
    onDeleteFromProvider,
  };
}
