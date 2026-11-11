/**
 * SSO provider edit hook.
 * Single public hook that consumes the internal service hook.
 * @module use-sso-provider-edit
 */

import {
  getIdpManagementPermissions,
  type IdpId,
  type UpdateIdentityProviderRequestContentPrivate,
} from '@auth0/universal-components-core';
import { useCallback, useMemo } from 'react';

import { useConfig } from '@/hooks/my-organization/shared/services/use-config-service';
import { useIdpConfig } from '@/hooks/my-organization/shared/services/use-idp-config-service';
import { useSsoProviderEditService } from '@/hooks/my-organization/shared/services/use-sso-provider-edit-service';
import { usePermissions } from '@/hooks/shared/use-permissions';
import {
  getDomainVerificationMode,
  isProviderEnableBlockedByDomains,
} from '@/lib/utils/my-organization/domain-management/domain-management-utils';
import {
  getProviderAccess,
  pickLimitedUpdateFields,
} from '@/lib/utils/my-organization/idp-management/idp-management-utils';
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

  const {
    shouldAllowDeletion,
    isLoadingConfig,
    showThirdPartyAccess,
    isThirdPartyAccessReadOnly,
    discoveryPolicy,
  } = useConfig();
  const {
    idpConfig,
    isLoadingIdpConfig,
    isProvisioningEnabled,
    isProvisioningMethodEnabled,
    showCrossAppAccess,
    isCrossAppAccessReadOnly,
  } = useIdpConfig();

  const showProvisioningTab =
    isProvisioningEnabled(service.provider?.strategy) &&
    isProvisioningMethodEnabled(service.provider?.strategy);

  const domainVerificationMode = getDomainVerificationMode(idpConfig);
  const isEnableBlockedByDomains = isProviderEnableBlockedByDomains(
    domainVerificationMode,
    service.provider,
  );

  const providerAccessLevel = service.provider?.access_level;
  const providerAccess = useMemo(
    () => getProviderAccess({ access_level: providerAccessLevel }),
    [providerAccessLevel],
  );

  const handleToggleProvider = useCallback(
    async (enabled: boolean) => {
      const canToggle = permissions.canUpdateProvider && providerAccess.canToggle;
      if (!canToggle || !service.provider?.strategy) return;

      const isBlockedFromEnabling = enabled && isEnableBlockedByDomains;
      if (isBlockedFromEnabling) return;

      await service.enableProvider(enabled);
    },
    [
      permissions,
      providerAccess,
      service.provider?.strategy,
      service.enableProvider,
      isEnableBlockedByDomains,
    ],
  );

  const updateWithinAccessLevel = useCallback(
    (data: UpdateIdentityProviderRequestContentPrivate) =>
      service.updateProvider(providerAccess.canEditDetails ? data : pickLimitedUpdateFields(data)),
    [providerAccess, service.updateProvider],
  );

  const updateProvider = useGuardedMutation(
    permissions.canUpdateProvider && providerAccess.canEditLoginSettings,
    updateWithinAccessLevel,
  );
  const syncSsoAttributes = useGuardedMutation(
    permissions.canUpdateProvider && providerAccess.canSyncAttributes,
    service.syncSsoAttributes,
  );
  const onDeleteConfirm = useGuardedMutation(
    permissions.canDeleteProvider && providerAccess.canDelete,
    service.onDeleteConfirm,
  );
  const onRemoveConfirm = useGuardedMutation(
    permissions.canDetachProvider && providerAccess.canDetach,
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
    showThirdPartyAccess,
    isThirdPartyAccessReadOnly,
    discoveryPolicy,
    domainVerificationMode,
    isEnableBlockedByDomains,
    providerAccess,
    showCrossAppAccess: showCrossAppAccess(service.provider?.strategy),
    isCrossAppAccessReadOnly: isCrossAppAccessReadOnly(service.provider?.strategy),
  };
}
