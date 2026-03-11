/**
 * SSO provisioning hook.
 * @module use-sso-provisioning
 */

import {
  type IdentityProvider,
  type IdpId,
  type GetIdPProvisioningConfigResponseContent,
  getStatusCode,
  MY_ORGANIZATION_SSO_PROVIDER_EDIT_SCOPES,
} from '@auth0/universal-components-core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef } from 'react';

import { showToast } from '@/components/auth0/shared/toast';
import { useScimTokens } from '@/hooks/my-organization/use-scim-tokens';
import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useTranslator } from '@/hooks/shared/use-translator';
import {
  ACTION_CANCELLED_ERROR,
  isActionCancelledError,
} from '@/lib/utils/my-organization/idp-management/actions';
import { ssoProviderEditQueryKeys } from '@/lib/utils/my-organization/idp-management/sso-provider-edit-query-keys';
import type { SsoProvisioningTabEditProps } from '@/types/my-organization/idp-management/sso-provisioning/sso-provisioning-tab-types';

export interface UseSsoProvisioningOptions {
  provider: IdentityProvider | null;
  createAction?: SsoProvisioningTabEditProps['createAction'];
  deleteAction?: SsoProvisioningTabEditProps['deleteAction'];
  createScimTokenAction?: SsoProvisioningTabEditProps['createScimTokenAction'];
  deleteScimTokenAction?: SsoProvisioningTabEditProps['deleteScimTokenAction'];
  customMessages?: Record<string, unknown>;
}

export interface UseSsoProvisioningReturn {
  provisioningConfig: GetIdPProvisioningConfigResponseContent | null;
  isProvisioningUpdating: boolean;
  isProvisioningDeleting: boolean;
  isProvisioningLoading: boolean;
  isProvisioningAttributesSyncing: boolean;
  hasProvisioningAttributeSyncWarning: boolean;
  isScimTokensLoading: boolean;
  isScimTokenCreating: boolean;
  isScimTokenDeleting: boolean;
  fetchProvisioning: () => Promise<GetIdPProvisioningConfigResponseContent | null>;
  createProvisioning: () => Promise<void>;
  deleteProvisioning: () => Promise<void>;
  syncProvisioningAttributes: () => Promise<void>;
  listScimTokens: ReturnType<typeof useScimTokens>['listScimTokens'];
  createScimToken: ReturnType<typeof useScimTokens>['createScimToken'];
  deleteScimToken: ReturnType<typeof useScimTokens>['deleteScimToken'];
}

/**
 * Hook for SSO provisioning operations (provisioning config + SCIM tokens).
 * @param idpId - Identity provider ID.
 * @param options - Hook options.
 * @returns Provisioning state and actions.
 * @internal
 */
export function useSsoProvisioning(
  idpId: IdpId,
  {
    provider,
    createAction,
    deleteAction,
    createScimTokenAction,
    deleteScimTokenAction,
    customMessages = {},
  }: UseSsoProvisioningOptions,
): UseSsoProvisioningReturn {
  const { coreClient } = useCoreClient();
  const { t } = useTranslator('idp_management.notifications', customMessages);
  const queryClient = useQueryClient();
  const hasShownProvisioningError = useRef(false);

  const scimTokens = useScimTokens(idpId, {
    provider,
    createScimTokenAction,
    deleteScimTokenAction,
    customMessages,
  });

  /**
   * Provisioning config query - fetches provisioning configuration.
   * Returns null if provisioning is not configured (404).
   */
  const provisioningQuery = useQuery({
    queryKey: ssoProviderEditQueryKeys.provisioning(idpId),
    queryFn: async (): Promise<GetIdPProvisioningConfigResponseContent | null> => {
      try {
        const result = await coreClient!
          .getMyOrganizationApiClient()
          .withScopes(MY_ORGANIZATION_SSO_PROVIDER_EDIT_SCOPES)
          .organization.identityProviders.provisioning.get(idpId);
        return result;
      } catch (error) {
        const status = getStatusCode(error);
        if (status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!coreClient && !!idpId,
  });

  useEffect(() => {
    if (provisioningQuery.isError && !hasShownProvisioningError.current) {
      showToast({ type: 'error', message: t('general_error') });
      hasShownProvisioningError.current = true;
    }
    if (!provisioningQuery.isError) {
      hasShownProvisioningError.current = false;
    }
  }, [provisioningQuery.isError, t]);

  const createProvisioningMutation = useMutation({
    mutationFn: async (): Promise<GetIdPProvisioningConfigResponseContent> => {
      if (!provider) {
        throw new Error('Provider not loaded');
      }

      if (createAction?.onBefore) {
        const canProceed = createAction.onBefore(provider);
        if (!canProceed) {
          throw new Error(ACTION_CANCELLED_ERROR);
        }
      }

      const result = await coreClient!
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_SSO_PROVIDER_EDIT_SCOPES)
        .organization.identityProviders.provisioning.create(idpId);

      return result;
    },
    onSuccess: async (result) => {
      showToast({
        type: 'success',
        message: t('update_success', { providerName: provider?.display_name }),
      });

      await queryClient.invalidateQueries({
        queryKey: ssoProviderEditQueryKeys.detail(idpId),
      });
      queryClient.setQueryData(ssoProviderEditQueryKeys.provisioning(idpId), result);

      if (createAction?.onAfter && provider) {
        await createAction.onAfter(provider, result);
      }
    },
    onError: (error) => {
      if (isActionCancelledError(error)) return;
      showToast({ type: 'error', message: t('general_error') });
    },
  });

  const deleteProvisioningMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      if (!provider) {
        throw new Error('Provider not loaded');
      }

      if (deleteAction?.onBefore) {
        const canProceed = deleteAction.onBefore(provider);
        if (!canProceed) {
          throw new Error(ACTION_CANCELLED_ERROR);
        }
      }

      await coreClient!
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_SSO_PROVIDER_EDIT_SCOPES)
        .organization.identityProviders.provisioning.delete(idpId);
    },
    onSuccess: async () => {
      showToast({
        type: 'success',
        message: t('update_success', { providerName: provider?.display_name }),
      });

      queryClient.setQueryData(ssoProviderEditQueryKeys.provisioning(idpId), null);
      await queryClient.invalidateQueries({
        queryKey: ssoProviderEditQueryKeys.detail(idpId),
      });

      if (deleteAction?.onAfter && provider) {
        await deleteAction.onAfter(provider);
      }
    },
    onError: (error) => {
      if (isActionCancelledError(error)) return;
      showToast({ type: 'error', message: t('general_error') });
    },
  });

  const syncProvisioningAttributesMutation = useMutation({
    mutationFn: async () => {
      await coreClient!
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_SSO_PROVIDER_EDIT_SCOPES)
        .organization.identityProviders.provisioning.updateAttributes(idpId, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ssoProviderEditQueryKeys.provisioning(idpId),
      });
      showToast({ type: 'success', message: t('provisioning_attributes_sync_success') });
    },
    onError: () => {
      showToast({ type: 'error', message: t('general_error') });
    },
  });

  const fetchProvisioning =
    useCallback(async (): Promise<GetIdPProvisioningConfigResponseContent | null> => {
      if (!coreClient || !idpId) {
        return null;
      }

      try {
        const data = await queryClient.fetchQuery({
          queryKey: ssoProviderEditQueryKeys.provisioning(idpId),
          queryFn: async () => {
            try {
              const result = await coreClient
                .getMyOrganizationApiClient()
                .withScopes(MY_ORGANIZATION_SSO_PROVIDER_EDIT_SCOPES)
                .organization.identityProviders.provisioning.get(idpId);
              return result;
            } catch (error) {
              const status = getStatusCode(error);
              if (status === 404) {
                return null;
              }
              throw error;
            }
          },
        });
        return data;
      } catch (error) {
        const status = getStatusCode(error);
        if (status !== 404) {
          showToast({ type: 'error', message: t('general_error') });
        }
        return null;
      }
    }, [coreClient, idpId, queryClient, t]);

  const createProvisioning = useCallback(async (): Promise<void> => {
    if (!coreClient || !idpId || !provider) return;
    try {
      await createProvisioningMutation.mutateAsync();
    } catch (error) {
      if (!isActionCancelledError(error)) throw error;
    }
  }, [coreClient, createProvisioningMutation, idpId, provider]);

  const deleteProvisioning = useCallback(async (): Promise<void> => {
    if (!coreClient || !idpId || !provider) return;
    try {
      await deleteProvisioningMutation.mutateAsync();
    } catch (error) {
      if (!isActionCancelledError(error)) throw error;
    }
  }, [coreClient, deleteProvisioningMutation, idpId, provider]);

  const syncProvisioningAttributes = useCallback(async (): Promise<void> => {
    if (!coreClient || !idpId) return;
    await syncProvisioningAttributesMutation.mutateAsync();
  }, [coreClient, idpId, syncProvisioningAttributesMutation]);

  const hasProvisioningAttributeSyncWarning = useMemo(() => {
    const attributes = provisioningQuery.data?.attributes ?? [];
    return attributes.some((attr) => attr.is_extra || attr.is_missing);
  }, [provisioningQuery.data]);

  return {
    provisioningConfig: provisioningQuery.data ?? null,
    isProvisioningUpdating: createProvisioningMutation.isPending,
    isProvisioningDeleting: deleteProvisioningMutation.isPending,
    isProvisioningLoading: provisioningQuery.isLoading || provisioningQuery.isFetching,
    isProvisioningAttributesSyncing: syncProvisioningAttributesMutation.isPending,
    hasProvisioningAttributeSyncWarning,
    fetchProvisioning,
    createProvisioning,
    deleteProvisioning,
    syncProvisioningAttributes,
    ...scimTokens,
  };
}
