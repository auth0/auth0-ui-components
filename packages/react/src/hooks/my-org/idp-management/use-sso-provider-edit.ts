import {
  OrgDetailsFactory,
  OrgDetailsMappers,
  SsoProviderMappers,
  type IdentityProvider,
  type IdpId,
  type OrganizationPrivate,
  type UpdateIdentityProviderRequestContent,
  type CreateIdpProvisioningScimTokenRequestContent,
  type GetIdPProvisioningConfigResponseContent,
  getStatusCode,
} from '@auth0/web-ui-components-core';
import { useCallback, useState, useEffect } from 'react';

import { showToast } from '../../../components/ui/toast';
import type {
  UseSsoProviderEditOptions,
  UseSsoProviderEditReturn,
} from '../../../types/my-org/idp-management/sso-provider/sso-provider-edit-types';
import { useCoreClient } from '../../use-core-client';
import { useErrorHandler } from '../../use-error-handler';
import { useTranslator } from '../../use-translator';

export function useSsoProviderEdit(
  idpId: IdpId,
  { sso, provisioning, customMessages = {} }: Partial<UseSsoProviderEditOptions> = {},
): UseSsoProviderEditReturn {
  const { coreClient } = useCoreClient();
  const { handleError } = useErrorHandler();
  const { t } = useTranslator('idp_management.notifications', customMessages);

  const [provider, setProvider] = useState<IdentityProvider | null>(null);
  const [organization, setOrganization] = useState<OrganizationPrivate>(OrgDetailsFactory.create());
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isProvisioningUpdating, setIsProvisioningUpdating] = useState(false);
  const [isProvisioningDeleting, setIsProvisioningDeleting] = useState(false);
  const [isScimTokensLoading, setIsScimTokensLoading] = useState(false);
  const [isScimTokenCreating, setIsScimTokenCreating] = useState(false);
  const [isScimTokenDeleting, setIsScimTokenDeleting] = useState(false);
  const [isProvisioningLoading, setIsProvisioningLoading] = useState(false);
  const [provisioningConfig, setProvisioningConfig] =
    useState<GetIdPProvisioningConfigResponseContent | null>(null);

  const fetchProvider = useCallback(async (): Promise<IdentityProvider | null> => {
    if (!coreClient || !idpId) {
      return null;
    }

    try {
      setIsLoading(true);
      const response = await coreClient
        .getMyOrgApiClient()
        .organization.identityProviders.get(idpId);

      setProvider(response);
      return response;
    } catch (error) {
      handleError(error, { fallbackMessage: t('general_error') });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [coreClient, idpId, t]);

  const fetchOrganizationDetails = useCallback(async (): Promise<void> => {
    if (!coreClient) {
      return;
    }

    try {
      setIsLoading(true);

      const response = await coreClient.getMyOrgApiClient().organizationDetails.get();
      const orgData = OrgDetailsMappers.fromAPI(response);

      setOrganization(orgData);
    } catch (error) {
      handleError(error, { fallbackMessage: t('general_error') });
    } finally {
      setIsLoading(false);
    }
  }, [coreClient, t]);

  const fetchProvisioning = useCallback(async () => {
    if (!coreClient || !idpId) {
      return null;
    }

    try {
      setIsProvisioningLoading(true);
      const result = await coreClient
        .getMyOrgApiClient()
        .organization.identityProviders.provisioning.get(idpId);

      setProvisioningConfig(result);
      return result;
    } catch (error) {
      const status = getStatusCode(error);
      if (status === 404) {
        setProvisioningConfig(null);
      } else {
        handleError(error, { fallbackMessage: t('general_error') });
      }
      return null;
    } finally {
      setIsProvisioningLoading(false);
    }
  }, [coreClient, idpId, t]);

  const updateProvider = useCallback(
    async (data: UpdateIdentityProviderRequestContent): Promise<void> => {
      if (!coreClient || !provider || !idpId) {
        return;
      }

      try {
        setIsUpdating(true);

        if (sso?.updateAction?.onBefore) {
          const canProceed = sso?.updateAction.onBefore(provider);
          if (!canProceed) {
            return;
          }
        }

        const apiRequestData: UpdateIdentityProviderRequestContent = SsoProviderMappers.updateToAPI(
          { strategy: provider.strategy, ...data },
        );
        const result = await coreClient
          .getMyOrgApiClient()
          .organization.identityProviders.update(idpId, apiRequestData);
        setProvider(result);

        showToast({
          type: 'success',
          message: t('update_success', { providerName: provider.display_name }),
        });

        if (sso?.updateAction?.onAfter) {
          await sso.updateAction.onAfter(provider, result);
        }
      } catch (error) {
        handleError(error, { fallbackMessage: t('general_error') });
      } finally {
        setIsUpdating(false);
      }
    },
    [coreClient, provider, idpId, sso, t],
  );

  const createProvisioning = useCallback(async (): Promise<void> => {
    if (!coreClient || !provider || !idpId) {
      return;
    }

    try {
      setIsProvisioningUpdating(true);

      if (provisioning?.createAction?.onBefore) {
        const canProceed = provisioning.createAction.onBefore(provider);
        if (!canProceed) {
          return;
        }
      }

      const result = await coreClient
        .getMyOrgApiClient()
        .organization.identityProviders.provisioning.create(idpId);

      const updatedProvider = await fetchProvider();
      if (updatedProvider) {
        setProvider(updatedProvider);
      }

      showToast({
        type: 'success',
        message: t('update_success', { providerName: provider.display_name }),
      });

      if (provisioning?.createAction?.onAfter) {
        await provisioning.createAction.onAfter(provider, result);
      }
    } catch (error) {
      handleError(error, { fallbackMessage: t('general_error') });
    } finally {
      setIsProvisioningUpdating(false);
    }
  }, [coreClient, provider, idpId, provisioning, t, fetchProvider]);

  const deleteProvisioning = useCallback(async (): Promise<void> => {
    if (!coreClient || !provider || !idpId) {
      return;
    }

    try {
      setIsProvisioningDeleting(true);

      if (provisioning?.deleteAction?.onBefore) {
        const canProceed = provisioning.deleteAction.onBefore(provider);
        if (!canProceed) {
          return;
        }
      }

      await coreClient
        .getMyOrgApiClient()
        .organization.identityProviders.provisioning.delete(idpId);

      setProvisioningConfig(null);

      const updatedProvider = await fetchProvider();
      if (updatedProvider) {
        setProvider(updatedProvider);
      }

      showToast({
        type: 'success',
        message: t('update_success', { providerName: provider.display_name }),
      });

      if (provisioning?.deleteAction?.onAfter) {
        await provisioning.deleteAction.onAfter(provider);
      }
    } catch (error) {
      handleError(error, { fallbackMessage: t('general_error') });
    } finally {
      setIsProvisioningDeleting(false);
    }
  }, [coreClient, provider, idpId, provisioning, t, fetchProvider]);

  const listScimTokens = useCallback(async () => {
    if (!coreClient || !idpId) {
      return null;
    }

    try {
      setIsScimTokensLoading(true);
      const result = await coreClient
        .getMyOrgApiClient()
        .organization.identityProviders.provisioning.scimTokens.list(idpId);
      return result;
    } catch (error) {
      handleError(error, { fallbackMessage: t('general_error') });
      return null;
    } finally {
      setIsScimTokensLoading(false);
    }
  }, [coreClient, idpId, t]);

  const createScimToken = useCallback(
    async (data: CreateIdpProvisioningScimTokenRequestContent) => {
      if (!coreClient || !idpId) {
        return;
      }

      try {
        setIsScimTokenCreating(true);

        if (provisioning?.createScimTokenAction?.onBefore) {
          const canProceed = provisioning.createScimTokenAction.onBefore(provider!);
          if (!canProceed) {
            return;
          }
        }

        const result = await coreClient
          .getMyOrgApiClient()
          .organization.identityProviders.provisioning.scimTokens.create(idpId, data);

        showToast({
          type: 'success',
          message: t('scim_token_create_success'),
        });

        if (provisioning?.createScimTokenAction?.onAfter) {
          await provisioning.createScimTokenAction.onAfter(provider!, result);
        }

        return result;
      } catch (error) {
        handleError(error, { fallbackMessage: t('general_error') });
      } finally {
        setIsScimTokenCreating(false);
      }
    },
    [coreClient, idpId, provider, provisioning, t],
  );

  const deleteScimToken = useCallback(
    async (idpScimTokenId: string): Promise<void> => {
      if (!coreClient || !idpId) {
        return;
      }

      try {
        setIsScimTokenDeleting(true);

        if (provisioning?.deleteScimTokenAction?.onBefore) {
          const canProceed = provisioning.deleteScimTokenAction.onBefore(provider!);
          if (!canProceed) {
            return;
          }
        }

        await coreClient
          .getMyOrgApiClient()
          .organization.identityProviders.provisioning.scimTokens.delete(idpId, idpScimTokenId);

        showToast({
          type: 'success',
          message: t('scim_token_delete_sucess'),
        });

        if (provisioning?.deleteScimTokenAction?.onAfter) {
          await provisioning.deleteScimTokenAction.onAfter(provider!);
        }
      } catch (error) {
        handleError(error, { fallbackMessage: t('general_error') });
      } finally {
        setIsScimTokenDeleting(false);
      }
    },
    [coreClient, idpId, provider, provisioning, t],
  );

  const onDeleteConfirm = useCallback(async (): Promise<void> => {
    if (!provider || !coreClient || !provider.id) {
      return;
    }

    try {
      setIsDeleting(true);

      await coreClient.getMyOrgApiClient().organization.identityProviders.delete(provider.id);

      showToast({
        type: 'success',
        message: t('delete_success', { providerName: provider.display_name }),
      });

      if (sso?.deleteAction?.onAfter) {
        await sso.deleteAction.onAfter(provider);
      }
    } catch (error) {
      handleError(error, { fallbackMessage: t('general_error') });
    } finally {
      setIsDeleting(false);
    }
  }, [sso, provider, t, coreClient]);

  const onRemoveConfirm = useCallback(async (): Promise<void> => {
    if (!provider || !coreClient || !provider.id) {
      return;
    }

    try {
      setIsRemoving(true);

      if (sso?.deleteFromOrgAction?.onBefore) {
        const canProceed = sso.deleteFromOrgAction.onBefore(provider);
        if (!canProceed) {
          return;
        }
      }

      await fetchOrganizationDetails();

      await coreClient.getMyOrgApiClient().organization.identityProviders.detach(provider.id);

      showToast({
        type: 'success',
        message: t('remove_success', {
          providerName: provider.display_name,
          organizationName: organization?.display_name,
        }),
      });
      if (sso?.deleteFromOrgAction?.onAfter) {
        await sso.deleteFromOrgAction.onAfter(provider);
      }
    } catch (error) {
      handleError(error, { fallbackMessage: t('general_error') });
    } finally {
      setIsRemoving(false);
    }
  }, [sso, provider, fetchOrganizationDetails, t, coreClient, organization]);

  useEffect(() => {
    if (!coreClient || !idpId) return;

    setIsLoading(true);
    Promise.allSettled([fetchProvider(), fetchOrganizationDetails()]).finally(() => {
      setIsLoading(false);
    });
  }, [coreClient, idpId]);

  return {
    provider,
    organization,
    provisioningConfig,
    isLoading,
    isUpdating,
    isDeleting,
    isRemoving,
    isProvisioningUpdating,
    isProvisioningDeleting,
    isProvisioningLoading,
    isScimTokensLoading,
    isScimTokenCreating,
    isScimTokenDeleting,
    fetchProvider,
    fetchOrganizationDetails,
    fetchProvisioning,
    updateProvider,
    createProvisioning,
    deleteProvisioning,
    listScimTokens,
    createScimToken,
    deleteScimToken,
    onDeleteConfirm,
    onRemoveConfirm,
  };
}
