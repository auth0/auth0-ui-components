import type { CreateOrganizationDomainRequestContent } from '@auth0/web-ui-components-core';
import { BusinessError, type Domain, type IdpId } from '@auth0/web-ui-components-core';
import { useCallback, useState, useEffect } from 'react';

import { showToast } from '../../../components/ui/toast';
import { useErrorHandler } from '../../../hooks/use-error-handler';
import type {
  UseSsoDomainTabOptions,
  UseSsoDomainTabReturn,
} from '../../../types/my-org/idp-management/sso-domain/sso-domain-tab-types';
import { useCoreClient } from '../../use-core-client';
import { useTranslator } from '../../use-translator';

export function useSsoDomainTab(
  idpId: IdpId,
  { customMessages = {}, domains, provider }: Partial<UseSsoDomainTabOptions> = {},
): UseSsoDomainTabReturn {
  const { coreClient } = useCoreClient();
  const { t } = useTranslator('idp_management.notifications', customMessages);
  const { handleError } = useErrorHandler();

  const [isLoading, setIsLoading] = useState(false);
  const [domainsList, setDomainsList] = useState<Domain[]>([]);
  const [idpDomains, setIdpDomains] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyError, setVerifyError] = useState<string | undefined>(undefined);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchProviderfromDomain = useCallback(
    async (domainId: string): Promise<string | undefined> => {
      if (!coreClient) {
        return;
      }

      const response = await coreClient
        .getMyOrgApiClient()
        .organization.domains.identityProviders.get(domainId);

      const isIdpEnabled = response.identity_providers?.some((idp) => idp.id === idpId);

      if (isIdpEnabled) {
        setIdpDomains([...idpDomains, domainId]);
      }
    },
    [coreClient],
  );

  const getAllProviderDomains = useCallback(
    async (fetchedDomains: Domain[]) => {
      try {
        setIsLoading(true);

        fetchedDomains.map(async (domain) => await fetchProviderfromDomain(domain.id));
      } catch (error) {
        handleError(error, {
          fallbackMessage: t('general_error'),
        });
      } finally {
        setIsLoading(false);
      }
    },
    [domainsList],
  );

  const listDomains = useCallback(async (): Promise<void> => {
    if (!coreClient) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await coreClient.getMyOrgApiClient().organization.domains.list();

      setDomainsList(response.organization_domains);

      await getAllProviderDomains(response.organization_domains);
    } catch (error) {
      handleError(error, {
        fallbackMessage: t('general_error'),
      });
    } finally {
      setIsLoading(false);
    }
  }, [coreClient, t]);

  const onCreateDomain = useCallback(
    async (data: CreateOrganizationDomainRequestContent): Promise<Domain | null> => {
      if (domains?.createAction?.onBefore) {
        const canProceed = domains.createAction.onBefore(data as Domain); // TODO: Check use different types to onBefore and onAfter
        if (!canProceed) {
          setIsCreating(false);
          throw new BusinessError({ message: t('domain_create.on_before') });
        }
      }

      const result: Domain = await coreClient!
        .getMyOrgApiClient()
        .organization.domains.create(data);

      domains?.createAction?.onAfter?.(result);

      await listDomains();

      return result;
    },
    [coreClient, domains, t],
  );

  const onVerifyDomain = useCallback(
    async (selectedDomain: Domain): Promise<boolean> => {
      if (domains?.verifyAction?.onBefore) {
        const canProceed = domains.verifyAction.onBefore(selectedDomain);
        if (!canProceed) {
          setIsVerifying(false);
          throw new BusinessError({ message: t('domain_verify.on_before') });
        }
      }

      const response = await coreClient!
        .getMyOrgApiClient()
        .organization.domains.verify.create(selectedDomain.id);

      if (domains?.verifyAction?.onAfter) {
        await domains.verifyAction.onAfter(selectedDomain);
      }

      setIsVerifying(false);

      return response.status === 'verified';
    },
    [domains, t, coreClient],
  );

  const onDeleteDomain = useCallback(
    async (selectedDomain: Domain) => {
      if (!coreClient) {
        return;
      }

      if (domains?.deleteAction?.onBefore) {
        const canProceed = domains.deleteAction.onBefore(selectedDomain);
        if (!canProceed) {
          setIsDeleting(false);
          throw new BusinessError({ message: t('domain_delete.on_before') });
        }
      }

      await coreClient.getMyOrgApiClient().organization.domains.delete(selectedDomain.id);

      if (domains?.deleteAction?.onAfter) {
        await domains.deleteAction.onAfter(selectedDomain);
      }

      await listDomains();
    },
    [domains, listDomains, t, coreClient],
  );

  const onAssociateToProvider = useCallback(
    async (domain: Domain) => {
      if (domains?.associateToProviderAction?.onBefore) {
        const canProceed = domains.associateToProviderAction.onBefore(domain, provider);
        if (!canProceed) {
          throw new BusinessError({ message: t('domain_associate_provider.on_before') });
        }
      }

      await coreClient!.getMyOrgApiClient().organization.identityProviders.domains.create(idpId, {
        domain: domain.domain,
      });

      if (domains?.associateToProviderAction?.onAfter) {
        await domains.associateToProviderAction.onAfter(domain, provider);
      }
    },
    [domains, provider, t, coreClient],
  );

  const onDeleteFromProvider = useCallback(
    async (selectedDomain: Domain) => {
      if (!provider) {
        return;
      }

      if (domains?.deleteFromProviderAction?.onBefore) {
        const canProceed = domains.deleteFromProviderAction.onBefore(selectedDomain, provider);
        if (!canProceed) {
          throw new BusinessError({ message: t('domain_delete_provider.on_before') });
        }
      }

      await coreClient!
        .getMyOrgApiClient()
        .organization.identityProviders.domains.delete(provider.id!, selectedDomain.domain);

      if (domains?.deleteFromProviderAction?.onAfter) {
        await domains.deleteFromProviderAction.onAfter(selectedDomain);
      }

      await getAllProviderDomains(domainsList);
    },
    [domains, t, coreClient, domainsList],
  );

  // ===== Handlers =====

  const handleCreate = useCallback(
    async (domainUrl: string) => {
      setIsCreating(true);

      try {
        const newDomain = await onCreateDomain({ domain: domainUrl });

        showToast({
          type: 'success',
          message: t('domain_create.success', {
            domainName: newDomain?.domain,
          }),
        });

        setSelectedDomain(newDomain);
        setShowCreateModal(false);
        setShowVerifyModal(true);
      } catch (error) {
        handleError(error, {
          fallbackMessage: t('domain_create.error'),
        });
      } finally {
        setIsCreating(false);
      }
    },
    [onCreateDomain, t],
  );

  const handleCloseVerifyModal = useCallback(() => {
    setShowVerifyModal(false);
    setVerifyError(undefined);
  }, []);

  const handleVerify = useCallback(
    async (domain: Domain) => {
      setIsVerifying(true);

      try {
        const isVerified = await onVerifyDomain(domain);
        if (isVerified) {
          setShowVerifyModal(false);

          showToast({
            type: 'success',
            message: t('domain_verify.success', {
              domainName: domain.domain,
            }),
          });

          await onAssociateToProvider(domain);
        } else {
          setVerifyError(t('domain_verify.verification_failed', { domainName: domain.domain }));
        }
      } catch (error) {
        handleError(error, {
          fallbackMessage: t('domain_verify.verification_failed'),
        });
      } finally {
        setIsVerifying(false);
      }
    },
    [onVerifyDomain, t],
  );

  const handleDeleteClick = useCallback((domain: Domain) => {
    setSelectedDomain(domain);
    setShowVerifyModal(false);
    setShowDeleteModal(true);
  }, []);

  const handleDelete = useCallback(
    async (domain: Domain) => {
      setIsDeleting(true);

      try {
        await onDeleteDomain(domain);

        showToast({
          type: 'success',
          message: t('domain_delete.success', {
            domainName: domain.domain,
          }),
        });

        setShowDeleteModal(false);
        setShowVerifyModal(false);
      } catch (error) {
        handleError(error, {
          fallbackMessage: t('domain_delete.error'),
        });
      } finally {
        setIsDeleting(false);
      }
    },
    [onDeleteDomain, t],
  );

  const handleVerifyActionColumn = useCallback(
    async (domain: Domain) => {
      setIsUpdating(true);

      try {
        const isVerified = await onVerifyDomain(domain);
        if (isVerified) {
          showToast({
            type: 'success',
            message: t('domain_verify.success', {
              domainName: domain.domain,
            }),
          });

          await onAssociateToProvider(domain);
        } else {
          showToast({
            type: 'error',
            message: t('domain_verify.verification_failed', {
              domainName: domain.domain,
            }),
          });
        }
      } catch (error) {
        handleError(error, {
          fallbackMessage: t('domain_verify.verification_failed', { domainName: domain.domain }),
        });
      } finally {
        setIsUpdating(false);
      }
    },
    [onVerifyDomain, t],
  );

  const handleToggleSwitch = useCallback(
    async (domain: Domain, newCheckedValue: boolean) => {
      setIsUpdating(true);

      if (newCheckedValue) {
        try {
          await onAssociateToProvider(domain);

          showToast({
            type: 'success',
            message: t('domain_associate_provider.success', {
              domain: domain.domain,
              idp: provider?.name,
            }),
          });
        } catch (error) {
          handleError(error, {
            fallbackMessage: t('general_error'),
          });
        } finally {
          setIsUpdating(false);
        }
      } else {
        try {
          await onDeleteFromProvider(domain);

          showToast({
            type: 'success',
            message: t('domain_delete_provider.success', {
              domain: domain.domain,
              idp: provider?.name,
            }),
          });
        } catch (error) {
          handleError(error, {
            fallbackMessage: t('general_error'),
          });
        } finally {
          setIsUpdating(false);
        }
      }
    },
    [onAssociateToProvider, t, provider],
  );

  useEffect(() => {
    if (!coreClient || !idpId) return;

    setIsLoading(true);
    Promise.allSettled([listDomains()]).finally(() => {
      setIsLoading(false);
    });
  }, [coreClient, idpId]);

  return {
    isLoading,
    domainsList,
    isCreating,
    selectedDomain,
    showVerifyModal,
    showDeleteModal,
    isVerifying,
    verifyError,
    isDeleting,
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
    handleToggleSwitch,
  };
}
