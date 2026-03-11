/**
 * SSO provider edit hook.
 * @module use-sso-provider-edit
 */

import {
  OrganizationDetailsFactory,
  OrganizationDetailsMappers,
  SsoProviderMappers,
  type IdentityProvider,
  type IdpId,
  type OrganizationPrivate,
  type UpdateIdentityProviderRequestContent,
  MY_ORGANIZATION_SSO_PROVIDER_EDIT_SCOPES,
} from '@auth0/universal-components-core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo } from 'react';

import { showToast } from '@/components/auth0/shared/toast';
import { useConfig } from '@/hooks/my-organization/use-config';
import { useIdpConfig } from '@/hooks/my-organization/use-idp-config';
import { useSsoProvisioning } from '@/hooks/my-organization/use-sso-provisioning';
import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useErrorHandler } from '@/hooks/shared/use-error-handler';
import { useTranslator } from '@/hooks/shared/use-translator';
import {
  ACTION_CANCELLED_ERROR,
  isActionCancelledError,
} from '@/lib/utils/my-organization/idp-management/actions';
import { ssoProviderEditQueryKeys } from '@/lib/utils/my-organization/idp-management/sso-provider-edit-query-keys';
import type {
  UseSsoProviderEditOptions,
  UseSsoProviderEditReturn,
} from '@/types/my-organization/idp-management/sso-provider/sso-provider-edit-types';

export { ssoProviderEditQueryKeys };

/**
 * Hook for editing SSO provider settings and provisioning.
 * @param idpId - Identity provider ID.
 * @param options - Hook options.
 * @param options.sso - SSO action callbacks.
 * @param options.provisioning - Provisioning action callbacks.
 * @param options.customMessages - Custom translation messages.
 * @returns Hook state and methods
 */
export function useSsoProviderEdit(
  idpId: IdpId,
  { sso, provisioning, customMessages = {} }: Partial<UseSsoProviderEditOptions> = {},
): UseSsoProviderEditReturn {
  const { coreClient } = useCoreClient();
  const { t } = useTranslator('idp_management.notifications', customMessages);
  const queryClient = useQueryClient();
  const { shouldAllowDeletion, isLoadingConfig } = useConfig();
  const { idpConfig, isLoadingIdpConfig, isProvisioningEnabled, isProvisioningMethodEnabled } =
    useIdpConfig();
  const handleError = useErrorHandler();

  /**
   * Provider query - fetches the identity provider details.
   */
  const providerQuery = useQuery({
    queryKey: ssoProviderEditQueryKeys.detail(idpId),
    queryFn: async (): Promise<IdentityProvider> => {
      const response = await coreClient!
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_SSO_PROVIDER_EDIT_SCOPES)
        .organization.identityProviders.get(idpId);
      return response;
    },
    enabled: !!coreClient && !!idpId,
  });

  /**
   * Organization query - fetches organization details.
   */
  const organizationQuery = useQuery({
    queryKey: ssoProviderEditQueryKeys.organization(),
    queryFn: async (): Promise<OrganizationPrivate> => {
      const response = await coreClient!
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_SSO_PROVIDER_EDIT_SCOPES)
        .organizationDetails.get();
      return OrganizationDetailsMappers.fromAPI(response);
    },
    enabled: !!coreClient,
    initialData: OrganizationDetailsFactory.create(),
  });

  useEffect(() => {
    if (providerQuery.error) {
      handleError(providerQuery.error);
    }
  }, [providerQuery.error, handleError]);

  useEffect(() => {
    if (organizationQuery.error) {
      handleError(organizationQuery.error);
    }
  }, [organizationQuery.error, handleError]);

  /**
   * Update provider mutation - updates SSO provider configuration.
   */
  const updateProviderMutation = useMutation({
    mutationFn: async (data: UpdateIdentityProviderRequestContent): Promise<IdentityProvider> => {
      const provider = providerQuery.data;
      if (!provider) {
        throw new Error('Provider not loaded');
      }

      if (sso?.updateAction?.onBefore) {
        const canProceed = sso.updateAction.onBefore(provider);
        if (!canProceed) {
          throw new Error(ACTION_CANCELLED_ERROR);
        }
      }

      const apiRequestData: UpdateIdentityProviderRequestContent = SsoProviderMappers.updateToAPI({
        strategy: provider.strategy,
        ...data,
      });

      const result = await coreClient!
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_SSO_PROVIDER_EDIT_SCOPES)
        .organization.identityProviders.update(idpId, apiRequestData);

      return result;
    },
    onSuccess: async (result) => {
      const provider = providerQuery.data;

      showToast({
        type: 'success',
        message: t('update_success', { providerName: provider?.display_name }),
      });

      queryClient.setQueryData(ssoProviderEditQueryKeys.detail(idpId), result);

      if (sso?.updateAction?.onAfter && provider) {
        await sso.updateAction.onAfter(provider, result);
      }
    },
    onError: (error) => {
      if (isActionCancelledError(error)) return;
      handleError(error);
    },
  });

  /**
   * Delete provider mutation - completely deletes the provider.
   */
  const deleteProviderMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      const provider = providerQuery.data;
      if (!provider?.id) {
        throw new Error('Provider not loaded or missing ID');
      }

      await coreClient!
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_SSO_PROVIDER_EDIT_SCOPES)
        .organization.identityProviders.delete(provider.id);
    },
    onSuccess: async () => {
      const provider = providerQuery.data;

      showToast({
        type: 'success',
        message: t('delete_success', { providerName: provider?.display_name }),
      });

      queryClient.removeQueries({ queryKey: ssoProviderEditQueryKeys.detail(idpId) });
      queryClient.removeQueries({ queryKey: ssoProviderEditQueryKeys.provisioning(idpId) });
      queryClient.removeQueries({ queryKey: ssoProviderEditQueryKeys.scimTokens(idpId) });

      if (sso?.deleteAction?.onAfter && provider) {
        await sso.deleteAction.onAfter(provider);
      }
    },
    onError: (error) => handleError(error),
  });

  /**
   * Detach provider mutation - removes provider from organization but doesn't delete it.
   */
  const detachProviderMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      const provider = providerQuery.data;
      if (!provider?.id) {
        throw new Error('Provider not loaded or missing ID');
      }

      if (sso?.deleteFromOrganizationAction?.onBefore) {
        const canProceed = sso.deleteFromOrganizationAction.onBefore(provider);
        if (!canProceed) {
          throw new Error(ACTION_CANCELLED_ERROR);
        }
      }

      await queryClient.ensureQueryData({ queryKey: ssoProviderEditQueryKeys.organization() });

      await coreClient!
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_SSO_PROVIDER_EDIT_SCOPES)
        .organization.identityProviders.detach(provider.id);
    },
    onSuccess: async () => {
      const provider = providerQuery.data;
      const organization = organizationQuery.data;

      showToast({
        type: 'success',
        message: t('remove_success', {
          providerName: provider?.display_name,
          organizationName: organization?.display_name,
        }),
      });

      queryClient.removeQueries({ queryKey: ssoProviderEditQueryKeys.detail(idpId) });

      if (sso?.deleteFromOrganizationAction?.onAfter && provider) {
        await sso.deleteFromOrganizationAction.onAfter(provider);
      }
    },
    onError: (error) => {
      if (isActionCancelledError(error)) return;
      handleError(error);
    },
  });

  const syncSsoAttributesMutation = useMutation({
    mutationFn: async () => {
      await coreClient!
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_SSO_PROVIDER_EDIT_SCOPES)
        .organization.identityProviders.updateAttributes(idpId, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ssoProviderEditQueryKeys.detail(idpId) });
      showToast({ type: 'success', message: t('sso_attributes_sync_success') });
    },
    onError: (error) => handleError(error),
  });

  const fetchProvider = useCallback(async (): Promise<IdentityProvider | null> => {
    if (!coreClient || !idpId) return null;

    try {
      const data = await queryClient.ensureQueryData({
        queryKey: ssoProviderEditQueryKeys.detail(idpId),
        queryFn: async () => {
          const response = await coreClient
            .getMyOrganizationApiClient()
            .withScopes(MY_ORGANIZATION_SSO_PROVIDER_EDIT_SCOPES)
            .organization.identityProviders.get(idpId);
          return response;
        },
      });
      return data;
    } catch (error) {
      handleError(error);
      return null;
    }
  }, [coreClient, idpId, queryClient, handleError]);

  const fetchOrganizationDetails = useCallback(async (): Promise<void> => {
    if (!coreClient) return;
    await queryClient.getQueryData(ssoProviderEditQueryKeys.organization());
  }, [coreClient, queryClient]);

  const updateProvider = useCallback(
    async (data: UpdateIdentityProviderRequestContent): Promise<void> => {
      const provider = providerQuery.data;
      if (!coreClient || !idpId || !provider) return;

      try {
        await updateProviderMutation.mutateAsync(data);
      } catch (error) {
        if (!isActionCancelledError(error)) throw error;
      }
    },
    [coreClient, idpId, providerQuery.data, updateProviderMutation],
  );

  const syncSsoAttributes = useCallback(async (): Promise<void> => {
    if (!coreClient || !idpId) return;
    await syncSsoAttributesMutation.mutateAsync();
  }, [coreClient, idpId, syncSsoAttributesMutation]);

  const onDeleteConfirm = useCallback(async (): Promise<void> => {
    const provider = providerQuery.data;
    if (!coreClient || !provider?.id) return;

    try {
      await deleteProviderMutation.mutateAsync();
    } catch (error) {
      if (!isActionCancelledError(error)) throw error;
    }
  }, [coreClient, deleteProviderMutation, providerQuery.data]);

  const onRemoveConfirm = useCallback(async (): Promise<void> => {
    const provider = providerQuery.data;
    if (!coreClient || !provider?.id) return;

    try {
      await detachProviderMutation.mutateAsync();
    } catch (error) {
      if (!isActionCancelledError(error)) throw error;
    }
  }, [coreClient, detachProviderMutation, providerQuery.data]);

  const hasSsoAttributeSyncWarning = useMemo(() => {
    const provider = providerQuery.data;
    const attributes = provider && 'attributes' in provider ? (provider.attributes ?? []) : [];
    return attributes.some((attr) => attr.is_extra || attr.is_missing);
  }, [providerQuery.data]);

  const showProvisioningTab =
    isProvisioningEnabled(providerQuery.data?.strategy) &&
    isProvisioningMethodEnabled(providerQuery.data?.strategy);

  const handleToggleProvider = useCallback(
    async (enabled: boolean): Promise<void> => {
      if (!providerQuery.data?.strategy) return;
      await updateProvider({ is_enabled: enabled });
    },
    [providerQuery.data?.strategy, updateProvider],
  );

  const ssoProvisioning = useSsoProvisioning(idpId, {
    provider: providerQuery.data ?? null,
    createAction: provisioning?.createAction,
    deleteAction: provisioning?.deleteAction,
    createScimTokenAction: provisioning?.createScimTokenAction,
    deleteScimTokenAction: provisioning?.deleteScimTokenAction,
    customMessages,
  });

  return {
    provider: providerQuery.data ?? null,
    organization: organizationQuery.data ?? OrganizationDetailsFactory.create(),
    isLoading: providerQuery.isLoading || organizationQuery.isLoading,
    isUpdating: updateProviderMutation.isPending,
    isDeleting: deleteProviderMutation.isPending,
    isRemoving: detachProviderMutation.isPending,
    isSsoAttributesSyncing: syncSsoAttributesMutation.isPending,
    hasSsoAttributeSyncWarning,
    shouldAllowDeletion,
    isLoadingConfig,
    idpConfig,
    isLoadingIdpConfig,
    showProvisioningTab,
    fetchProvider,
    fetchOrganizationDetails,
    updateProvider,
    syncSsoAttributes,
    onDeleteConfirm,
    onRemoveConfirm,
    handleToggleProvider,
    ...ssoProvisioning,
  };
}
