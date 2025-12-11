import {
  type Domain,
  type IdentityProvider,
  type CreateOrganizationDomainRequestContent,
  type IdentityProviderAssociatedWithDomain,
  BusinessError,
} from '@auth0/universal-components-core';
import { useCallback, useState } from 'react';

import type {
  UseDomainTableOptions,
  UseDomainTableResult,
} from '../../../types/my-org/domain-management/domain-table-types';
import { useCoreClient } from '../../use-core-client';
import { useTranslator } from '../../use-translator';

/**
 * Custom hook for managing domain table data and actions.
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

  const [domains, setDomains] = useState<Domain[]>([]);
  const [providers, setProviders] = useState<IdentityProviderAssociatedWithDomain[]>([]);

  const [isCreating, setIsCreating] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [isLoadingProviders, setIsLoadingProviders] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const fetchProviders = useCallback(
    async (domain: Domain): Promise<void> => {
      try {
        setIsLoadingProviders(true);
        // Get all providers
        const responseAllProviders = await coreClient!
          .getMyOrgApiClient()
          .organization.identityProviders.list();
        const allProviders = responseAllProviders?.identity_providers ?? [];

        // Get associated providers
        const responseAssociatedProviders = await coreClient!
          .getMyOrgApiClient()
          .organization.domains.identityProviders.get(domain.id);
        const associatedProviders = responseAssociatedProviders?.identity_providers ?? [];

        // Match associated providers
        const providersWithAssociation: IdentityProviderAssociatedWithDomain[] = allProviders.map(
          (provider) => {
            const is_associated = associatedProviders.some(
              (assocProvider) => assocProvider.id === provider.id,
            );
            return {
              ...provider,
              is_associated,
            };
          },
        );

        setProviders(providersWithAssociation);
      } finally {
        setIsLoadingProviders(false);
      }
    },
    [coreClient, t],
  );

  const fetchDomains = useCallback(async (): Promise<void> => {
    try {
      setIsFetching(true);
      const response = await coreClient!.getMyOrgApiClient().organization.domains.list();
      const domains = response?.organization_domains ?? [];
      setDomains(domains);
    } finally {
      setIsFetching(false);
    }
  }, [coreClient, t]);

  const onCreateDomain = useCallback(
    async (data: CreateOrganizationDomainRequestContent): Promise<Domain | null> => {
      setIsCreating(true);

      if (createAction?.onBefore) {
        const canProceed = createAction.onBefore(data as Domain);
        if (!canProceed) {
          setIsCreating(false);
          throw new BusinessError({ message: t('domain_create.on_before') });
        }
      }

      try {
        const result: Domain = await coreClient!
          .getMyOrgApiClient()
          .organization.domains.create(data);

        createAction?.onAfter?.(result);
        await fetchDomains();
        return result;
      } finally {
        setIsCreating(false);
      }
    },
    [coreClient, createAction, t],
  );

  const onVerifyDomain = useCallback(
    async (selectedDomain: Domain): Promise<boolean> => {
      setIsVerifying(true);

      if (verifyAction?.onBefore) {
        const canProceed = verifyAction.onBefore(selectedDomain);
        if (!canProceed) {
          setIsVerifying(false);
          throw new BusinessError({ message: t('domain_verify.on_before') });
        }
      }

      try {
        const response = await coreClient!
          .getMyOrgApiClient()
          .organization.domains.verify.create(selectedDomain.id);

        if (verifyAction?.onAfter) {
          await verifyAction.onAfter(selectedDomain);
        }

        await fetchDomains();

        return response.status === 'verified';
      } finally {
        setIsVerifying(false);
      }
    },
    [verifyAction, t, coreClient, fetchDomains],
  );

  const onDeleteDomain = useCallback(
    async (selectedDomain: Domain) => {
      setIsDeleting(true);

      if (deleteAction?.onBefore) {
        const canProceed = deleteAction.onBefore(selectedDomain);
        if (!canProceed) {
          setIsDeleting(false);
          throw new BusinessError({ message: t('domain_delete.on_before') });
        }
      }

      try {
        await coreClient!.getMyOrgApiClient().organization.domains.delete(selectedDomain.id);

        if (deleteAction?.onAfter) {
          await deleteAction.onAfter(selectedDomain);
        }

        await fetchDomains();
      } finally {
        setIsDeleting(false);
      }
    },
    [deleteAction, fetchDomains, t, coreClient],
  );

  const onAssociateToProvider = useCallback(
    async (selectedDomain: Domain, provider: IdentityProvider) => {
      if (associateToProviderAction?.onBefore) {
        const canProceed = associateToProviderAction.onBefore(selectedDomain, provider);
        if (!canProceed) {
          throw new BusinessError({ message: t('domain_associate_provider.on_before') });
        }
      }

      await coreClient!
        .getMyOrgApiClient()
        .organization.identityProviders.domains.create(provider.id!, {
          domain: selectedDomain.domain,
        });

      if (associateToProviderAction?.onAfter) {
        await associateToProviderAction.onAfter(selectedDomain, provider);
      }

      await fetchProviders(selectedDomain);
    },
    [associateToProviderAction, t, coreClient, fetchProviders],
  );

  const onDeleteFromProvider = useCallback(
    async (selectedDomain: Domain, provider: IdentityProvider) => {
      if (deleteFromProviderAction?.onBefore) {
        const canProceed = deleteFromProviderAction.onBefore(selectedDomain, provider);
        if (!canProceed) {
          throw new BusinessError({ message: t('domain_delete_provider.on_before') });
        }
      }

      await coreClient!
        .getMyOrgApiClient()
        .organization.identityProviders.domains.delete(provider.id!, selectedDomain.domain);

      if (deleteFromProviderAction?.onAfter) {
        await deleteFromProviderAction.onAfter(selectedDomain, provider);
      }

      await fetchProviders(selectedDomain);
    },
    [deleteFromProviderAction, t, coreClient, fetchProviders],
  );

  return {
    domains,
    providers,
    isFetching,
    isCreating,
    isDeleting,
    isVerifying,
    isLoadingProviders,
    fetchProviders,
    fetchDomains,
    onCreateDomain,
    onVerifyDomain,
    onDeleteDomain,
    onAssociateToProvider,
    onDeleteFromProvider,
  };
}
