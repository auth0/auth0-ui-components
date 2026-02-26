/**
 * SSO provider edit logic hook.
 * @module use-sso-provider-edit-logic
 * @internal
 */

import { useCallback } from 'react';

import { useConfig } from '@/hooks/my-organization/use-config';
import { useIdpConfig } from '@/hooks/my-organization/use-idp-config';
import type {
  UseSsoProviderEditLogicResult,
  UseSsoProviderEditReturn,
} from '@/types/my-organization/idp-management/sso-provider/sso-provider-edit-types';

/**
 * Hook for SSO provider edit logic (e.g., handleToggleProvider).
 * @param ssoProviderEdit - SSO Provider Edit Prop
 * @internal
 * @returns Hook state and methods
 */
export function useSsoProviderEditLogic(
  ssoProviderEdit: UseSsoProviderEditReturn,
): UseSsoProviderEditLogicResult {
  const { shouldAllowDeletion, isLoadingConfig } = useConfig();
  const { idpConfig, isLoadingIdpConfig, isProvisioningEnabled, isProvisioningMethodEnabled } =
    useIdpConfig();

  const showProvisioningTab =
    isProvisioningEnabled(ssoProviderEdit.provider?.strategy) &&
    isProvisioningMethodEnabled(ssoProviderEdit.provider?.strategy);

  const handleToggleProvider = useCallback(
    async (enabled: boolean) => {
      if (!ssoProviderEdit.provider?.strategy) return;
      await ssoProviderEdit.updateProvider({
        strategy: ssoProviderEdit.provider.strategy,
        is_enabled: enabled,
      });
    },
    [ssoProviderEdit.provider?.strategy, ssoProviderEdit.updateProvider],
  );

  return {
    shouldAllowDeletion,
    isLoadingConfig,
    idpConfig,
    isLoadingIdpConfig,
    showProvisioningTab,
    handleToggleProvider,
  };
}
