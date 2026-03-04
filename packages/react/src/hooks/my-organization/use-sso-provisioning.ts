/**
 * SSO provisioning hook.
 * @module use-sso-provisioning
 */

import {
  MY_ORGANIZATION_SSO_PROVIDER_EDIT_SCOPES,
  type IdentityProvider,
  type IdpId,
  type GetIdPProvisioningConfigResponseContent,
  getStatusCode,
} from '@auth0/universal-components-core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo } from 'react';

import { showToast } from '@/components/auth0/shared/toast';
import { ssoProviderEditQueryKeys } from '@/hooks/my-organization/use-sso-provider-edit';
import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useErrorHandler } from '@/hooks/shared/use-error-handler';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { SsoProvisioningTabEditProps } from '@/types/my-organization/idp-management/sso-provisioning/sso-provisioning-tab-types';

const ACTION_CANCELLED_ERROR = 'ACTION_CANCELLED';

const isActionCancelledError = (error: unknown): boolean => {
  return error instanceof Error && error.message === ACTION_CANCELLED_ERROR;
};

export interface UseSsoProvisioningOptions {
  provisioning?: SsoProvisioningTabEditProps;
  customMessages?: Record<string, unknown>;
}

/** Return type of the useSsoProvisioning hook. */
export interface UseSsoProvisioningReturn {
  provisioningConfig: GetIdPProvisioningConfigResponseContent | null;
  isProvisioningLoading: boolean;
  isProvisioningUpdating: boolean;
  isProvisioningDeleting: boolean;
  isProvisioningAttributesSyncing: boolean;
  hasProvisioningAttributeSyncWarning: boolean;
  provisioningError: unknown;
  fetchProvisioning: () => Promise<GetIdPProvisioningConfigResponseContent | null>;
  createProvisioning: () => Promise<void>;
  deleteProvisioning: () => Promise<void>;
  syncProvisioningAttributes: () => Promise<void>;
}

/**
 * Hook for managing SSO provisioning configuration for an identity provider.
 * @param idpId - Identity provider ID.
 * @param provider - The current identity provider (may be null while loading).
 * @param options - Hook options.
 * @returns Provisioning operations, config state, and loading states.
 */
export function useSsoProvisioning(
  idpId: IdpId,
  provider: IdentityProvider | null,
  { provisioning, customMessages = {} }: UseSsoProvisioningOptions = {},
): UseSsoProvisioningReturn {
  const { coreClient } = useCoreClient();
  const { t } = useTranslator('idp_management.notifications', customMessages);
  const queryClient = useQueryClient();
  const handleError = useErrorHandler();

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
        if (getStatusCode(error) === 404) return null;
        throw error;
      }
    },
    enabled: !!coreClient && !!idpId,
  });

  useEffect(() => {
    if (provisioningQuery.error) handleError(provisioningQuery.error);
  }, [provisioningQuery.error, handleError]);

  const createProvisioningMutation = useMutation({
    mutationFn: async (): Promise<GetIdPProvisioningConfigResponseContent> => {
      if (!provider) throw new Error('Provider not loaded');

      if (provisioning?.createAction?.onBefore && !provisioning.createAction.onBefore(provider)) {
        throw new Error(ACTION_CANCELLED_ERROR);
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
      await queryClient.invalidateQueries({ queryKey: ssoProviderEditQueryKeys.detail(idpId) });
      queryClient.setQueryData(ssoProviderEditQueryKeys.provisioning(idpId), result);
      if (provisioning?.createAction?.onAfter && provider) {
        await provisioning.createAction.onAfter(provider, result);
      }
    },
    onError: (error) => {
      if (!isActionCancelledError(error)) handleError(error);
    },
  });

  const deleteProvisioningMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      if (!provider) throw new Error('Provider not loaded');

      if (provisioning?.deleteAction?.onBefore && !provisioning.deleteAction.onBefore(provider)) {
        throw new Error(ACTION_CANCELLED_ERROR);
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
      await queryClient.invalidateQueries({ queryKey: ssoProviderEditQueryKeys.detail(idpId) });
      if (provisioning?.deleteAction?.onAfter && provider) {
        await provisioning.deleteAction.onAfter(provider);
      }
    },
    onError: (error) => {
      if (!isActionCancelledError(error)) handleError(error);
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
      queryClient.invalidateQueries({ queryKey: ssoProviderEditQueryKeys.provisioning(idpId) });
      showToast({ type: 'success', message: t('provisioning_attributes_sync_success') });
    },
    onError: (error) => handleError(error),
  });

  const fetchProvisioning = useCallback(async () => {
    try {
      const result = await queryClient.fetchQuery({
        queryKey: ssoProviderEditQueryKeys.provisioning(idpId),
        queryFn: async (): Promise<GetIdPProvisioningConfigResponseContent | null> => {
          try {
            const response = await coreClient!
              .getMyOrganizationApiClient()
              .withScopes(MY_ORGANIZATION_SSO_PROVIDER_EDIT_SCOPES)
              .organization.identityProviders.provisioning.get(idpId);
            return response;
          } catch (error) {
            if (getStatusCode(error) === 404) return null;
            throw error;
          }
        },
      });
      return result;
    } catch {
      return null;
    }
  }, [queryClient, idpId, coreClient]);

  const createProvisioning = useCallback(async () => {
    if (!coreClient || !provider) return;
    try {
      await createProvisioningMutation.mutateAsync();
    } catch (error) {
      if (!isActionCancelledError(error)) throw error;
    }
  }, [coreClient, createProvisioningMutation, provider]);

  const deleteProvisioning = useCallback(async () => {
    if (!coreClient || !provider) return;
    try {
      await deleteProvisioningMutation.mutateAsync();
    } catch (error) {
      if (!isActionCancelledError(error)) throw error;
    }
  }, [coreClient, deleteProvisioningMutation, provider]);

  const syncProvisioningAttributes = useCallback(async () => {
    if (!coreClient) return;
    await syncProvisioningAttributesMutation.mutateAsync();
  }, [coreClient, syncProvisioningAttributesMutation]);

  const hasProvisioningAttributeSyncWarning = useMemo(() => {
    const attributes = provisioningQuery.data?.attributes ?? [];
    return attributes.some((attr) => attr.is_extra || attr.is_missing);
  }, [provisioningQuery.data]);

  return {
    provisioningConfig: provisioningQuery.data ?? null,
    isProvisioningLoading: provisioningQuery.isLoading || provisioningQuery.isFetching,
    isProvisioningUpdating: createProvisioningMutation.isPending,
    isProvisioningDeleting: deleteProvisioningMutation.isPending,
    isProvisioningAttributesSyncing: syncProvisioningAttributesMutation.isPending,
    hasProvisioningAttributeSyncWarning,
    provisioningError:
      provisioningQuery.error ||
      createProvisioningMutation.error ||
      deleteProvisioningMutation.error ||
      syncProvisioningAttributesMutation.error,
    fetchProvisioning,
    createProvisioning,
    deleteProvisioning,
    syncProvisioningAttributes,
  };
}
