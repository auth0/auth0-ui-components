/**
 * Internal Google Workspace directory provisioning service hook.
 * Handles data fetching, mutations, and cache management for Google Workspace provisioning.
 * @module use-google-workspace-provisioning-service
 * @internal
 */

import {
  getStatusCode,
  ssoProviderQueryKeys,
  type DirectoryProvisioningConfig,
  type IdpId,
} from '@auth0/universal-components-core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useQueryErrorToast } from '@/hooks/shared/use-query-error-toast';
import { useTranslator } from '@/hooks/shared/use-translator';
import { isMutationLoading } from '@/lib/utils/tanstack-compat';
import type {
  UseGoogleWorkspaceProvisioningServiceOptions,
  UseGoogleWorkspaceProvisioningServiceReturn,
} from '@/types/my-organization/idp-management/sso-provisioning/google-workspace-provisioning-types';

/**
 * Internal service hook for Google Workspace directory provisioning API operations.
 *
 * @param idpId - Identity provider ID.
 * @param options - Hook options.
 * @param options.customMessages - Custom notification messages for query error toasts.
 * @returns Service state and methods.
 * @internal
 */
export function useGoogleWorkspaceProvisioningService(
  idpId: IdpId,
  { customMessages = {} }: UseGoogleWorkspaceProvisioningServiceOptions = {},
): UseGoogleWorkspaceProvisioningServiceReturn {
  const { coreClient } = useCoreClient();
  const { t } = useTranslator('idp_management.notifications', customMessages);
  const queryClient = useQueryClient();

  const getDirectoryProvisioningClient = useCallback(
    () =>
      coreClient!.getMyOrganizationApiClient().organization.identityProviders.directoryProvisioning,
    [coreClient],
  );

  /**
   * Directory provisioning config query.
   * Returns null if directory provisioning is not configured (404).
   */
  const configQueryFn = useCallback(async (): Promise<DirectoryProvisioningConfig | null> => {
    try {
      return await getDirectoryProvisioningClient().get(idpId);
    } catch (error) {
      if (getStatusCode(error) === 404) {
        return null;
      }
      throw error;
    }
  }, [getDirectoryProvisioningClient, idpId]);

  const configQuery = useQuery({
    queryKey: ssoProviderQueryKeys.directoryProvisioning(idpId),
    queryFn: configQueryFn,
    enabled: !!coreClient && !!idpId,
  });

  useQueryErrorToast(configQuery, t('general_error'));

  /**
   * Start consent mutation - starts the Google consent flow and returns the ticket URL.
   */
  const startConsentMutation = useMutation({
    mutationFn: async (): Promise<string> => {
      const result = await getDirectoryProvisioningClient().create(idpId, {});
      return result.provisioning_ticket_url;
    },
  });

  /**
   * Delete mutation - removes the directory provisioning configuration.
   */
  const deleteMutation = useMutation({
    mutationFn: async (): Promise<void> => {
      await getDirectoryProvisioningClient().delete(idpId);
    },
    onSuccess: () => {
      queryClient.setQueryData(ssoProviderQueryKeys.directoryProvisioning(idpId), null);
    },
  });

  /**
   * Update mutation - turns automatic synchronization on or off.
   */
  const updateMutation = useMutation({
    mutationFn: async (synchronizeAutomatically: boolean): Promise<DirectoryProvisioningConfig> =>
      getDirectoryProvisioningClient().update(idpId, {
        synchronize_automatically: synchronizeAutomatically,
      }),
    onSuccess: (result) => {
      queryClient.setQueryData(ssoProviderQueryKeys.directoryProvisioning(idpId), result);
    },
  });

  const verifyConsent = useCallback<UseGoogleWorkspaceProvisioningServiceReturn['verifyConsent']>(
    async (signal) => {
      const result = await getDirectoryProvisioningClient().verify(
        idpId,
        {},
        { abortSignal: signal },
      );
      return { status: result.status };
    },
    [getDirectoryProvisioningClient, idpId],
  );

  const refetchConfig = useCallback(
    async (): Promise<DirectoryProvisioningConfig | null> =>
      queryClient.fetchQuery({
        queryKey: ssoProviderQueryKeys.directoryProvisioning(idpId),
        queryFn: configQueryFn,
        staleTime: 0,
      }),
    [queryClient, idpId, configQueryFn],
  );

  return {
    config: configQuery.data ?? null,
    isConfigLoading: configQuery.isLoading && configQuery.fetchStatus !== 'idle',
    isStartingConsent: isMutationLoading(startConsentMutation),
    isUpdating: isMutationLoading(updateMutation),
    isDeleting: isMutationLoading(deleteMutation),
    startConsent: startConsentMutation.mutateAsync,
    verifyConsent,
    refetchConfig,
    setAutoSync: updateMutation.mutateAsync,
    deleteConfig: deleteMutation.mutateAsync,
  };
}
