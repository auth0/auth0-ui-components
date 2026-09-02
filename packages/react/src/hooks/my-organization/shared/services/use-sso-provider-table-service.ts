/**
 * Internal SSO provider table service hook.
 * Handles data fetching and CRUD operations for SSO providers.
 * @module use-sso-provider-table-service
 * @internal
 */

import {
  BusinessError,
  OrganizationDetailsMappers,
  SsoProviderMappers,
  ssoProviderQueryKeys,
  type UpdateIdentityProviderRequestContent,
  type ComponentAction,
  type IdpKnownResponse,
  type OrganizationPrivate,
} from '@auth0/universal-components-core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useTranslator } from '@/hooks/shared/use-translator';
import { isMutationLoading } from '@/lib/utils/tanstack-compat';
import type { UseSsoProviderTableServiceReturn } from '@/types/my-organization/idp-management/sso-provider/sso-provider-table-types';

export { ssoProviderQueryKeys };

/**
 * Internal service hook for SSO provider table data and CRUD operations.
 * @param deleteAction - Delete action handler.
 * @param removeFromOrganization - Remove from org handler.
 * @param enableAction - Enable/disable handler.
 * @param customMessages - Custom translation messages.
 * @returns Provider data, mutations, and actions.
 * @internal
 */
export function useSsoProviderTableService(
  deleteAction?: ComponentAction<IdpKnownResponse, void>,
  removeFromOrganization?: ComponentAction<IdpKnownResponse, void>,
  enableAction?: ComponentAction<IdpKnownResponse>,
  customMessages: Record<string, unknown> = {},
): UseSsoProviderTableServiceReturn {
  const { coreClient } = useCoreClient();
  const queryClient = useQueryClient();
  const { t } = useTranslator('idp_management.notifications', customMessages);

  const providersQuery = useQuery({
    queryKey: ssoProviderQueryKeys.list(),
    queryFn: async () => {
      const response = await coreClient!
        .getMyOrganizationApiClient()
        .organization.identityProviders.list();
      return (response?.identity_providers ?? []) as IdpKnownResponse[];
    },
    enabled: !!coreClient,
  });

  const organizationQuery = useQuery({
    queryKey: ssoProviderQueryKeys.organization(),
    queryFn: async () => {
      const response = await coreClient!.getMyOrganizationApiClient().organizationDetails.get();
      return OrganizationDetailsMappers.fromAPI(response);
    },
    enabled: !!coreClient,
  });

  const enableProviderMutation = useMutation({
    mutationFn: async ({
      selectedIdp,
      enabled,
    }: {
      selectedIdp: IdpKnownResponse;
      enabled: boolean;
    }): Promise<IdpKnownResponse> => {
      if (!selectedIdp?.id) {
        throw new Error('Invalid provider');
      }

      if (enableAction?.onBefore) {
        const shouldProceed = enableAction.onBefore(selectedIdp);
        if (!shouldProceed) {
          throw new BusinessError({ message: t('enable_on_before') });
        }
      }

      const apiRequestData: UpdateIdentityProviderRequestContent = SsoProviderMappers.updateToAPI({
        strategy: selectedIdp.strategy,
        is_enabled: enabled,
      });

      const updatedProvider = await coreClient!
        .getMyOrganizationApiClient()
        .organization.identityProviders.update(selectedIdp.id, apiRequestData);

      return updatedProvider as IdpKnownResponse;
    },
    onSuccess: async (updatedProvider, { selectedIdp }) => {
      if (enableAction?.onAfter) {
        await enableAction.onAfter(selectedIdp);
      }

      queryClient.setQueryData<IdpKnownResponse[]>(ssoProviderQueryKeys.list(), (old) => {
        if (!old) return old;
        return old.map((provider) =>
          provider.id === selectedIdp.id
            ? ({ ...provider, ...updatedProvider } as IdpKnownResponse)
            : provider,
        );
      });

      if (selectedIdp.id) {
        queryClient.setQueryData(
          ssoProviderQueryKeys.detail(selectedIdp.id),
          (old: IdpKnownResponse | undefined) => {
            if (!old) return old;
            return { ...old, ...updatedProvider };
          },
        );
      }
    },
  });

  const deleteProviderMutation = useMutation({
    mutationFn: async (selectedIdp: IdpKnownResponse): Promise<void> => {
      if (!selectedIdp?.id) {
        throw new Error('Invalid provider');
      }

      await coreClient!
        .getMyOrganizationApiClient()
        .organization.identityProviders.delete(selectedIdp.id);
    },
    onSuccess: async (_, selectedIdp) => {
      if (deleteAction?.onAfter) {
        await deleteAction.onAfter(selectedIdp);
      }

      queryClient.invalidateQueries({ queryKey: ssoProviderQueryKeys.list() });
    },
  });

  const removeProviderMutation = useMutation({
    mutationFn: async (selectedIdp: IdpKnownResponse): Promise<void> => {
      if (!selectedIdp?.id) {
        throw new Error('Invalid provider');
      }

      await coreClient!
        .getMyOrganizationApiClient()
        .organization.identityProviders.detach(selectedIdp.id);
    },
    onSuccess: async (_, selectedIdp) => {
      if (removeFromOrganization?.onAfter) {
        await removeFromOrganization.onAfter(selectedIdp);
      }

      queryClient.invalidateQueries({ queryKey: ssoProviderQueryKeys.list() });
    },
  });

  const onEnableProvider = useCallback(
    async (selectedIdp: IdpKnownResponse, enabled: boolean): Promise<void> => {
      if (!selectedIdp || !coreClient || !selectedIdp.id) {
        throw new Error('Invalid provider');
      }

      await enableProviderMutation.mutateAsync({ selectedIdp, enabled });
    },
    [coreClient, enableProviderMutation],
  );

  const onDeleteConfirm = useCallback(
    async (selectedIdp: IdpKnownResponse): Promise<void> => {
      if (!selectedIdp || !coreClient || !selectedIdp.id) {
        throw new Error('Invalid provider');
      }

      await deleteProviderMutation.mutateAsync(selectedIdp);
    },
    [coreClient, deleteProviderMutation],
  );

  const onRemoveConfirm = useCallback(
    async (selectedIdp: IdpKnownResponse): Promise<void> => {
      if (!selectedIdp || !coreClient || !selectedIdp.id) {
        throw new Error('Invalid provider');
      }

      await removeProviderMutation.mutateAsync(selectedIdp);
    },
    [coreClient, removeProviderMutation],
  );

  const fetchProviders = useCallback(async (): Promise<void> => {
    await queryClient.getQueryData(ssoProviderQueryKeys.list());
  }, [queryClient]);

  const fetchOrganizationDetails = useCallback(async (): Promise<OrganizationPrivate | null> => {
    if (!coreClient) {
      return null;
    }

    const data = await queryClient.ensureQueryData({
      queryKey: ssoProviderQueryKeys.organization(),
      queryFn: async () => {
        const response = await coreClient.getMyOrganizationApiClient().organizationDetails.get();
        return OrganizationDetailsMappers.fromAPI(response);
      },
    });
    return data;
  }, [coreClient, queryClient]);

  return {
    providers: providersQuery.data ?? [],
    organization: organizationQuery.data ?? null,
    isLoading: providersQuery.isLoading || organizationQuery.isLoading,
    isRefetchingProviders: providersQuery.isFetching,
    isProvidersStale: providersQuery.isStale,
    providersUpdatedAt: providersQuery.dataUpdatedAt,
    providersError: providersQuery.error,
    organizationError: organizationQuery.error,
    refetchProviders: providersQuery.refetch,
    isDeleting: isMutationLoading(deleteProviderMutation),
    isRemoving: isMutationLoading(removeProviderMutation),
    isUpdating: isMutationLoading(enableProviderMutation),
    isUpdatingId: isMutationLoading(enableProviderMutation)
      ? (enableProviderMutation.variables?.selectedIdp?.id ?? null)
      : null,

    fetchProviders,
    fetchOrganizationDetails,
    onDeleteConfirm,
    onRemoveConfirm,
    onEnableProvider,
  };
}
