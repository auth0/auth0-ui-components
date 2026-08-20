/**
 * Internal domain table service hook.
 * Handles data fetching and CRUD operations for domains.
 * @module use-domain-table-service
 * @internal
 */

import {
  type Domain,
  type IdpKnownResponse,
  type CreateOrganizationDomainRequestContent,
  type IdentityProviderAssociatedWithDomain,
  BusinessError,
  domainQueryKeys,
} from '@auth0/universal-components-core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useState } from 'react';

import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useTranslator } from '@/hooks/shared/use-translator';
import { MEMBER_ACCESS_LEVELS } from '@/lib/constants/common-constants';
import { isIdpKnownResponse } from '@/lib/utils/my-organization/idp-management/idp-management-utils';
import { getPreviousDataOption, isMutationLoading } from '@/lib/utils/tanstack-compat';
import type {
  UseDomainTableServiceOptions,
  UseDomainTableServiceReturn,
} from '@/types/my-organization/domain-management/domain-table-types';

const keepPreviousDataOption = getPreviousDataOption();

/**
 * Internal service hook for domain table data and CRUD operations.
 * @param props - Service options including actions and custom messages.
 * @param props.createAction - Create action callbacks.
 * @param props.deleteAction - Delete action callbacks.
 * @param props.verifyAction - Verify action callbacks.
 * @param props.associateToProviderAction - Associate to provider action callbacks.
 * @param props.deleteFromProviderAction - Delete from provider action callbacks.
 * @param props.customMessages - Custom translation messages.
 * @param props.paginationParams - Pagination parameters.
 * @returns Domain data, mutations, and actions.
 * @internal
 */
export function useDomainTableService({
  createAction,
  deleteAction,
  verifyAction,
  associateToProviderAction,
  deleteFromProviderAction,
  customMessages,
  paginationParams,
}: UseDomainTableServiceOptions): UseDomainTableServiceReturn {
  const { t } = useTranslator('domain_management.domain_table.notifications', customMessages);
  const { coreClient } = useCoreClient();
  const queryClient = useQueryClient();

  const [selectedDomainId, setSelectedDomainId] = useState<string | null>(null);
  const [selectedDomainName, setSelectedDomainName] = useState<string | null>(null);

  const fetchProvidersForDomain = async (domainName: string) => {
    const api = coreClient!.getMyOrganizationApiClient();

    const allProvidersResponse = await api.organization.identityProviders.list({
      member_access_level: [...MEMBER_ACCESS_LEVELS],
    });
    const allProviders = allProvidersResponse?.identity_providers ?? [];

    return allProviders.filter(isIdpKnownResponse).map(
      (provider): IdentityProviderAssociatedWithDomain => ({
        ...provider,
        is_associated: provider.domains?.includes(domainName) ?? false,
      }),
    );
  };

  const domainsQuery = useQuery({
    queryKey: domainQueryKeys.list({
      pageSize: paginationParams?.pageSize,
      fromToken: paginationParams?.fromToken,
    }),
    queryFn: async () => {
      const { response } = await coreClient!
        .getMyOrganizationApiClient()
        .organization.domains.list({
          take: paginationParams?.pageSize,
          from: paginationParams?.fromToken,
        });
      return {
        domains: response?.organization_domains ?? [],
        next: response?.next ?? null,
      };
    },
    enabled: !!coreClient,
    ...keepPreviousDataOption,
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
      queryClient.invalidateQueries({ queryKey: domainQueryKeys.lists() });
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
      queryClient.invalidateQueries({ queryKey: domainQueryKeys.lists() });
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
      queryClient.invalidateQueries({ queryKey: domainQueryKeys.lists() });
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

  const onCreateDomain = useCallback(
    (data: CreateOrganizationDomainRequestContent) => createDomainMutation.mutateAsync(data),
    [createDomainMutation],
  );

  const onVerifyDomain = useCallback(
    (domain: Domain) => verifyDomainMutation.mutateAsync(domain),
    [verifyDomainMutation],
  );

  const onDeleteDomain = useCallback(
    (domain: Domain) => deleteDomainMutation.mutateAsync(domain),
    [deleteDomainMutation],
  );

  const onAssociateToProvider = useCallback(
    (domain: Domain, provider: IdpKnownResponse) =>
      associateToProviderMutation.mutateAsync({ domain, provider }),
    [associateToProviderMutation],
  );

  const onDeleteFromProvider = useCallback(
    (domain: Domain, provider: IdpKnownResponse) =>
      deleteFromProviderMutation.mutateAsync({ domain, provider }),
    [deleteFromProviderMutation],
  );

  const fetchProviders = useCallback(
    async (domain: Domain) => {
      setSelectedDomainId(domain.id);
      setSelectedDomainName(domain.domain);
      await queryClient.ensureQueryData({
        queryKey: domainQueryKeys.providers(domain.id),
        queryFn: () => fetchProvidersForDomain(domain.domain),
      });
    },
    [queryClient, coreClient],
  );

  const fetchDomains = useCallback(async () => {
    await queryClient.getQueryData(domainQueryKeys.lists());
  }, [queryClient]);

  return {
    domains: domainsQuery.data?.domains ?? [],
    providers: providersQuery.data ?? [],
    nextToken: domainsQuery.data?.next ?? null,
    isFetching: domainsQuery.isLoading,
    isRefetchingDomains: domainsQuery.isFetching,
    isDomainsStale: domainsQuery.isStale,
    domainsUpdatedAt: domainsQuery.dataUpdatedAt,
    isCreating: isMutationLoading(createDomainMutation),
    isDeleting: isMutationLoading(deleteDomainMutation),
    isVerifying: isMutationLoading(verifyDomainMutation),
    isLoadingProviders: providersQuery.isLoading,

    refetchDomains: domainsQuery.refetch,
    fetchProviders,
    fetchDomains,
    onCreateDomain,
    onVerifyDomain,
    onDeleteDomain,
    onAssociateToProvider,
    onDeleteFromProvider,
  };
}
