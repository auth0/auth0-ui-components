/**
 * Internal SSO domain tab service hook.
 * Handles data fetching and CRUD operations for SSO domains.
 * @module use-sso-domain-tab-service
 * @internal
 */

import {
  BusinessError,
  domainQueryKeys,
  ssoDomainQueryKeys,
  ssoProviderQueryKeys,
  type CreateOrganizationDomainRequestContent,
  type Domain,
  type IdpId,
} from '@auth0/universal-components-core';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useMemo } from 'react';

import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useQueryErrorToast } from '@/hooks/shared/use-query-error-toast';
import { useTranslator } from '@/hooks/shared/use-translator';
import { getPreviousDataOption } from '@/lib/utils/tanstack-compat';
import type {
  UseSsoDomainTabServiceOptions,
  UseSsoDomainTabServiceReturn,
} from '@/types/my-organization/idp-management/sso-domain/sso-domain-tab-types';

const keepPreviousDataOption = getPreviousDataOption();

const DOMAIN_PAGE_SIZE = 100;
const MAX_DOMAIN_PAGES = 5;

/**
 * Internal service hook for SSO domain tab data and CRUD operations.
 * @param idpId - Identity provider ID.
 * @param options - Service options including actions and custom messages.
 * @returns Domain data, loading states, and mutation methods.
 * @internal
 */
export function useSsoDomainTabService(
  idpId: IdpId,
  { customMessages = {}, domains, provider }: Partial<UseSsoDomainTabServiceOptions> = {},
): UseSsoDomainTabServiceReturn {
  const { coreClient } = useCoreClient();
  const { t } = useTranslator('idp_management.notifications', customMessages);
  const queryClient = useQueryClient();

  const domainsListKey = ssoDomainQueryKeys.list(idpId);

  const domainsQuery = useQuery({
    queryKey: domainsListKey,
    queryFn: async () => {
      const organizationDomains: Domain[] = [];
      let from: string | undefined;
      for (let page = 0; page < MAX_DOMAIN_PAGES; page += 1) {
        const { response } = await coreClient!
          .getMyOrganizationApiClient()
          .organization.domains.list({ take: DOMAIN_PAGE_SIZE, from });
        organizationDomains.push(...(response?.organization_domains ?? []));
        from = response?.next ?? undefined;
        if (!from) break;
      }
      return { domains: organizationDomains, next: null };
    },
    enabled: !!coreClient && !!idpId,
    ...keepPreviousDataOption,
  });

  const organizationDomains = useMemo(
    () => domainsQuery.data?.domains ?? [],
    [domainsQuery.data?.domains],
  );

  useQueryErrorToast(domainsQuery, t('general_error'));

  const domainsList = useMemo(() => {
    const providerDomainNames = provider?.domains ?? [];
    return organizationDomains.filter(
      (domain) => domain.status === 'verified' && providerDomainNames.includes(domain.domain),
    );
  }, [provider?.domains, organizationDomains]);

  const availableDomains = useMemo(() => {
    const providerDomainNames = provider?.domains ?? [];
    return organizationDomains.filter(
      (domain) =>
        domain.status === 'verified' &&
        domain.identity_provider_association === 'unassociated' &&
        !providerDomainNames.includes(domain.domain),
    );
  }, [provider?.domains, organizationDomains]);

  const idpDomains = useMemo(() => domainsList.map((domain) => domain.id), [domainsList]);

  const createDomainMutation = useMutation({
    mutationFn: async (data: CreateOrganizationDomainRequestContent) => {
      if (!coreClient) {
        throw new BusinessError({ message: t('general_error') });
      }

      if (domains?.createAction?.onBefore) {
        const canProceed = domains.createAction.onBefore(data);
        if (!canProceed) {
          throw new BusinessError({ message: t('domain_create.on_before') });
        }
      }

      const result: Domain = await coreClient
        .getMyOrganizationApiClient()
        .organization.domains.create(data);

      await domains?.createAction?.onAfter?.(result);

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ssoDomainQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ssoProviderQueryKeys.detail(idpId) });
    },
  });

  const verifyDomainMutation = useMutation({
    mutationFn: async (domain: Domain) => {
      if (!coreClient) {
        return { updatedDomain: domain, isVerified: false };
      }

      if (domains?.verifyAction?.onBefore) {
        const canProceed = domains.verifyAction.onBefore(domain);
        if (!canProceed) {
          throw new BusinessError({ message: t('domain_verify.on_before') });
        }
      }

      const updatedDomain = await coreClient
        .getMyOrganizationApiClient()
        .organization.domains.verify.create(domain.id);

      if (domains?.verifyAction?.onAfter) {
        await domains.verifyAction.onAfter(updatedDomain);
      }

      return { updatedDomain, isVerified: updatedDomain.status === 'verified' };
    },
    onSuccess: ({ updatedDomain, isVerified }, domain) => {
      if (isVerified) {
        queryClient.setQueryData<{ domains: Domain[]; next: string | null }>(
          domainsListKey,
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

  const invalidateAssignments = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ssoProviderQueryKeys.detail(idpId) }),
      queryClient.invalidateQueries({ queryKey: ssoDomainQueryKeys.lists() }),
      queryClient.invalidateQueries({ queryKey: domainQueryKeys.all }),
    ]);

  const associateToProviderMutation = useMutation({
    mutationFn: async (domain: Domain) => {
      if (!coreClient) {
        return domain;
      }

      if (domains?.associateToProviderAction?.onBefore) {
        const canProceed = domains.associateToProviderAction.onBefore(domain, provider);
        if (!canProceed) {
          throw new BusinessError({ message: t('domain_associate_provider.on_before') });
        }
      }

      await coreClient
        .getMyOrganizationApiClient()
        .organization.identityProviders.domains.create(idpId, {
          domain: domain.domain,
        });

      if (domains?.associateToProviderAction?.onAfter) {
        await domains.associateToProviderAction.onAfter(domain, provider);
      }

      return domain;
    },
    onSuccess: () => invalidateAssignments(),
  });

  const deleteFromProviderMutation = useMutation({
    mutationFn: async (domain: Domain) => {
      if (!coreClient || !provider?.id) {
        return domain;
      }

      if (domains?.deleteFromProviderAction?.onBefore) {
        const canProceed = domains.deleteFromProviderAction.onBefore(domain, provider);
        if (!canProceed) {
          throw new BusinessError({ message: t('domain_delete_provider.on_before') });
        }
      }

      await coreClient
        .getMyOrganizationApiClient()
        .organization.identityProviders.domains.delete(provider.id, domain.domain);

      if (domains?.deleteFromProviderAction?.onAfter) {
        await domains.deleteFromProviderAction.onAfter(domain);
      }

      return domain;
    },
    onSuccess: () => invalidateAssignments(),
  });

  return {
    domainsList,
    availableDomains,
    isLoading: domainsQuery.isLoading,
    isRefetchingDomains: domainsQuery.isFetching,
    isDomainsStale: domainsQuery.isStale,
    domainsUpdatedAt: domainsQuery.dataUpdatedAt,
    nextToken: null,
    refetchDomains: domainsQuery.refetch,
    idpDomains,
    isCreating: createDomainMutation.isPending,
    isVerifying: verifyDomainMutation.isPending,
    isDeleting: deleteDomainMutation.isPending,
    isAssociating: associateToProviderMutation.isPending,
    createDomain: createDomainMutation.mutateAsync,
    verifyDomain: verifyDomainMutation.mutateAsync,
    deleteDomain: deleteDomainMutation.mutateAsync,
    associateToProvider: associateToProviderMutation.mutateAsync,
    deleteFromProvider: deleteFromProviderMutation.mutateAsync,
  };
}
