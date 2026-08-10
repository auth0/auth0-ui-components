/**
 * SSO provider edit hook.
 * Single public hook that consumes the internal service hook.
 * @module use-sso-provider-edit
 */

import type { IdpId } from '@auth0/universal-components-core';
import { useCallback } from 'react';

import { useConfig } from '@/hooks/my-organization/shared/services/use-config-service';
import { useIdpConfig } from '@/hooks/my-organization/shared/services/use-idp-config-service';
import { useSsoProviderEditService } from '@/hooks/my-organization/shared/services/use-sso-provider-edit-service';
import type {
  UseSsoProviderEditOptions,
  UseSsoProviderEditReturn,
} from '@/types/my-organization/idp-management/sso-provider/sso-provider-edit-types';

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
  }: Partial<UseSsoProviderEditOptions> = {},
): UseSsoProviderEditReturn {
  const service = useSsoProviderEditService(idpId, {
    sso,
    provisioning,
    customMessages,
    skipProvisioningFetch,
  });

  const { shouldAllowDeletion, isLoadingConfig, showThirdPartyAccess } = useConfig();
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

  const handleToggleProvider = useCallback(
    async (enabled: boolean) => {
      if (!service.provider?.strategy) return;
      await service.updateProvider({
        strategy: service.provider.strategy,
        is_enabled: enabled,
      });
    },
    [service.provider?.strategy, service.updateProvider],
  );

  return {
    ...service,
    shouldAllowDeletion,
    isLoadingConfig,
    idpConfig,
    isLoadingIdpConfig,
    showProvisioningTab,
    handleToggleProvider,
    showThirdPartyAccess,
    showCrossAppAccess: showCrossAppAccess(service.provider?.strategy),
    isCrossAppAccessReadOnly: isCrossAppAccessReadOnly(service.provider?.strategy),
  };
}
