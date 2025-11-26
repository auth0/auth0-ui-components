import {
  OrgDetailsMappers,
  SsoProviderMappers,
  type UpdateIdentityProviderRequestContent,
  type ComponentAction,
  type IdentityProvider,
  type OrganizationPrivate,
} from '@auth0/web-ui-components-core';
import { useCallback, useState, useEffect } from 'react';

import { showToast } from '../../../components/ui/toast';
import type { UseSsoProviderTableReturn } from '../../../types/my-org/idp-management/sso-provider/sso-provider-table-types';
import { useCoreClient } from '../../use-core-client';
import { useErrorHandler } from '../../use-error-handler';
import { useTranslator } from '../../use-translator';

/**
 * Custom hook for managing SSO provider table data and actions.
 */
export function useSsoProviderTable(
  deleteAction?: ComponentAction<IdentityProvider, void>,
  removeFromOrg?: ComponentAction<IdentityProvider, void>,
  enableAction?: ComponentAction<IdentityProvider>,
  customMessages = {},
): UseSsoProviderTableReturn {
  const { t } = useTranslator('idp_management.notifications', customMessages);
  const { coreClient } = useCoreClient();
  const { handleError } = useErrorHandler();

  const [providers, setProviders] = useState<IdentityProvider[]>([]);
  const [organization, setOrganization] = useState<OrganizationPrivate | null>(null);
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isUpdatingId, setIsUpdatingId] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const isLoading = !coreClient || isDataLoading;

  const fetchOrganizationDetails = useCallback(async (): Promise<OrganizationPrivate | null> => {
    if (!coreClient) {
      return null;
    }

    try {
      const response = await coreClient.getMyOrgApiClient().organizationDetails.get();
      const orgData = OrgDetailsMappers.fromAPI(response);

      setOrganization(orgData);
      return orgData;
    } catch (error) {
      handleError(error, { fallbackMessage: t('general_error') });
      return null;
    }
  }, [coreClient, t]);

  const fetchProviders = useCallback(async (): Promise<void> => {
    if (!coreClient) {
      return;
    }

    try {
      setIsDataLoading(true);

      const response = await coreClient.getMyOrgApiClient().organization.identityProviders.list();

      const providers = response?.identity_providers ?? [];
      setProviders(providers as IdentityProvider[]);
    } catch (error) {
      handleError(error, { fallbackMessage: t('general_error') });
    } finally {
      setIsDataLoading(false);
    }
  }, [coreClient, t]);

  const onEnableProvider = useCallback(
    async (selectedIdp: IdentityProvider, enabled: boolean): Promise<boolean> => {
      if (!selectedIdp || !coreClient || !selectedIdp.id) {
        return false;
      }

      try {
        setIsUpdating(true);
        setIsUpdatingId(selectedIdp.id);

        if (enableAction?.onBefore) {
          const shouldProceed = enableAction.onBefore(selectedIdp);
          if (!shouldProceed) {
            return false;
          }
        }

        const apiRequestData: UpdateIdentityProviderRequestContent = SsoProviderMappers.updateToAPI(
          {
            strategy: selectedIdp.strategy,
            is_enabled: enabled,
          },
        );
        const updatedProvider = await coreClient
          .getMyOrgApiClient()
          .organization.identityProviders.update(selectedIdp.id, apiRequestData);

        if (enableAction?.onAfter) {
          await enableAction.onAfter(selectedIdp);
        }

        showToast({
          type: 'success',
          message: t('update_success', { providerName: selectedIdp.display_name }),
        });

        setProviders((prevProviders) =>
          prevProviders.map((provider) =>
            provider.id === selectedIdp.id ? { ...provider, ...updatedProvider } : provider,
          ),
        );

        return true;
      } catch (error) {
        handleError(error, { fallbackMessage: t('general_error') });
        return false;
      } finally {
        setIsUpdating(false);
        setIsUpdatingId(null);
      }
    },
    [enableAction, t, coreClient],
  );

  const onDeleteConfirm = useCallback(
    async (selectedIdp: IdentityProvider) => {
      if (!selectedIdp || !coreClient || !selectedIdp.id) {
        return;
      }

      try {
        setIsDeleting(true);

        await coreClient.getMyOrgApiClient().organization.identityProviders.delete(selectedIdp.id);

        if (deleteAction?.onAfter) {
          await deleteAction.onAfter(selectedIdp);
        }

        showToast({
          type: 'success',
          message: t('delete_success', { providerName: selectedIdp.display_name }),
        });

        await fetchProviders();
      } catch (error) {
        handleError(error, { fallbackMessage: t('general_error') });
      } finally {
        setIsDeleting(false);
      }
    },
    [deleteAction, fetchProviders, t, coreClient],
  );

  const onRemoveConfirm = useCallback(
    async (selectedIdp: IdentityProvider) => {
      if (!selectedIdp || !coreClient || !selectedIdp.id) {
        return;
      }

      try {
        setIsRemoving(true);

        const orgData = await fetchOrganizationDetails();

        await coreClient.getMyOrgApiClient().organization.identityProviders.detach(selectedIdp.id);

        if (removeFromOrg?.onAfter) {
          await removeFromOrg.onAfter(selectedIdp);
        }

        showToast({
          type: 'success',
          message: t('remove_success', {
            providerName: selectedIdp.display_name,
            organizationName: orgData?.display_name,
          }),
        });

        await fetchProviders();
      } catch (error) {
        handleError(error, { fallbackMessage: t('general_error') });
      } finally {
        setIsRemoving(false);
      }
    },
    [removeFromOrg, fetchProviders, fetchOrganizationDetails, t, coreClient],
  );

  useEffect(() => {
    setIsDataLoading(true);
    Promise.allSettled([fetchProviders(), fetchOrganizationDetails()]).finally(() => {
      setIsDataLoading(false);
    });
  }, []);

  return {
    providers,
    organization,
    isLoading,
    isDeleting,
    isRemoving,
    isUpdating,
    isUpdatingId,
    fetchProviders,
    fetchOrganizationDetails,
    onDeleteConfirm,
    onRemoveConfirm,
    onEnableProvider,
  };
}
