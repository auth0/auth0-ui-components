/**
 * Internal SSO domain tab service hook.
 * Handles data fetching and CRUD operations for SSO domains.
 * @module use-sso-domain-tab-service
 * @internal
 */

import {
  BusinessError,
  ssoDomainQueryKeys,
  type CreateOrganizationDomainRequestContent,
  type Domain,
  type IdpId,
} from '@auth0/universal-components-core';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { useEffect, useMemo } from 'react';

import { ssoProviderEditQueryKeys } from '@/hooks/my-organization/use-sso-provider-edit';
import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useErrorHandler } from '@/hooks/shared/use-error-handler';
import { useTranslator } from '@/hooks/shared/use-translator';
import { getPreviousDataOption } from '@/lib/utils/tanstack-compat';
import type {
  UseSsoDomainTabServiceOptions,
  UseSsoDomainTabServiceReturn,
} from '@/types/my-organization/idp-management/sso-domain/sso-domain-tab-types';

const keepPreviousDataOption = getPreviousDataOption();

/**
 * Internal service hook for SSO domain tab data and CRUD operations.
 * @param idpId - Identity provider ID.
 * @param options - Service options including actions and custom messages.
 * @returns Domain data, loading states, and mutation methods.
 * @internal
 */
export function useSsoDomainTabService(
  idpId: IdpId,
  {
    customMessages = {},
    domains,
    provider,
    pageSize,
    fromToken,
  }: Partial<UseSsoDomainTabServiceOptions> = {},
): UseSsoDomainTabServiceReturn {
  const { coreClient } = useCoreClient();
  const { t } = useTranslator('idp_management.notifications', customMessages);
  const handleError = useErrorHandler();
  const queryClient = useQueryClient();

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

  // Derive idpDomains from the provider's domains field
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
      queryClient.invalidateQueries({ queryKey: ssoProviderEditQueryKeys.detail(idpId) });
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
      queryClient.invalidateQueries({ queryKey: ssoProviderEditQueryKeys.detail(idpId) });
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
      queryClient.invalidateQueries({ queryKey: ssoProviderEditQueryKeys.detail(idpId) });
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
      queryClient.invalidateQueries({ queryKey: ssoProviderEditQueryKeys.detail(idpId) });
    },
  });

  return {
    domainsList,
    isLoading,
    isRefetchingDomains: domainsQuery.isFetching,
    isDomainsStale: domainsQuery.isStale,
    domainsUpdatedAt: domainsQuery.dataUpdatedAt,
    nextToken,
    refetchDomains: domainsQuery.refetch,
    idpDomains,
    isCreating: createDomainMutation.isPending,
    isVerifying: verifyDomainMutation.isPending,
    isDeleting: deleteDomainMutation.isPending,
    createDomain: createDomainMutation.mutateAsync,
    verifyDomain: verifyDomainMutation.mutateAsync,
    deleteDomain: deleteDomainMutation.mutateAsync,
    associateToProvider: associateToProviderMutation.mutateAsync,
    deleteFromProvider: deleteFromProviderMutation.mutateAsync,
  };
}
