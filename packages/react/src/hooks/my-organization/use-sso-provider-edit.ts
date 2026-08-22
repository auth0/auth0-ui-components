/**
 * SSO provider edit hook.
 * Single public hook that consumes the internal service hook.
 * @module use-sso-provider-edit
 */

import { getIdpManagementPermissions, type IdpId } from '@auth0/universal-components-core';
import { useCallback, useMemo } from 'react';

import { useConfig } from '@/hooks/my-organization/shared/services/use-config-service';
import { useIdpConfig } from '@/hooks/my-organization/shared/services/use-idp-config-service';
import { useSsoProviderEditService } from '@/hooks/my-organization/shared/services/use-sso-provider-edit-service';
import { usePermissions } from '@/hooks/shared/use-permissions';
import type {
  UseSsoProviderEditOptions,
  UseSsoProviderEditReturn,
} from '@/types/my-organization/idp-management/sso-provider/sso-provider-edit-types';

/**
 * Wraps a service mutation so it no-ops without the required permission.
 * @param allowed - Whether the caller holds the required permission.
 * @param mutate - The service mutation to guard.
 * @returns The guarded mutation.
 */
function useGuardedMutation<TArgs extends unknown[], TResult>(
  allowed: boolean,
  mutate: (...args: TArgs) => Promise<TResult>,
): (...args: TArgs) => Promise<TResult | undefined> {
  return useCallback(
    async (...args: TArgs) => (allowed ? mutate(...args) : undefined),
    [allowed, mutate],
  );
}

/**
 * Hook for editing SSO provider settings and provisioning.
 * Manages config state, UI logic, and delegates API operations
 * to the internal service hook.
 * @param idpId - Identity provider ID.
 * @param options - Hook options.
 * @returns Hook state and methods.
 */
export function useSsoProviderEdit(
  idpId: IdpId,
  {
    sso,
    provisioning,
    customMessages = {},
    skipProvisioningFetch = false,
    readOnly = false,
    enableProviderAction,
  }: Partial<UseSsoProviderEditOptions> = {},
): UseSsoProviderEditReturn {
  const { createPermissionResolver } = usePermissions();

  const permissions = useMemo(
    () => createPermissionResolver(getIdpManagementPermissions, { readOnly }),
    [createPermissionResolver, readOnly],
  );

  const service = useSsoProviderEditService(idpId, {
    sso,
    provisioning,
    customMessages,
    skipProvisioningFetch,
    enableProviderAction,
  });

  const { shouldAllowDeletion, isLoadingConfig } = useConfig();
  const { idpConfig, isLoadingIdpConfig, isProvisioningEnabled, isProvisioningMethodEnabled } =
    useIdpConfig();

  const showProvisioningTab =
    isProvisioningEnabled(service.provider?.strategy) &&
    isProvisioningMethodEnabled(service.provider?.strategy);

  const handleToggleProvider = useCallback(
    async (enabled: boolean) => {
      if (!permissions.canUpdateProvider || !service.provider?.strategy) return;
      await service.enableProvider(enabled);
    },
    [permissions, service.provider?.strategy, service.enableProvider],
  );

  const updateProvider = useGuardedMutation(permissions.canUpdateProvider, service.updateProvider);
  const syncSsoAttributes = useGuardedMutation(
    permissions.canUpdateProvider,
    service.syncSsoAttributes,
  );
  const onDeleteConfirm = useGuardedMutation(
    permissions.canDeleteProvider,
    service.onDeleteConfirm,
  );
  const onRemoveConfirm = useGuardedMutation(
    permissions.canDetachProvider,
    service.onRemoveConfirm,
  );
  const createProvisioning = useGuardedMutation(
    permissions.canCreateProvisioning,
    service.createProvisioning,
  );
  const deleteProvisioning = useGuardedMutation(
    permissions.canDeleteProvisioning,
    service.deleteProvisioning,
  );
  const syncProvisioningAttributes = useGuardedMutation(
    permissions.canUpdateProvisioning,
    service.syncProvisioningAttributes,
  );
  const createScimToken = useGuardedMutation(
    permissions.canCreateScimToken,
    service.createScimToken,
  );
  const deleteScimToken = useGuardedMutation(
    permissions.canDeleteScimToken,
    service.deleteScimToken,
  );

  return {
    ...service,
    updateProvider,
    syncSsoAttributes,
    onDeleteConfirm,
    onRemoveConfirm,
    createProvisioning,
    deleteProvisioning,
    syncProvisioningAttributes,
    createScimToken,
    deleteScimToken,
    permissions,
    shouldAllowDeletion,
    isLoadingConfig,
    idpConfig,
    isLoadingIdpConfig,
    showProvisioningTab,
    handleToggleProvider,
  };
}
