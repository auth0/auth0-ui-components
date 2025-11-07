import type { IdpStrategy } from '@auth0/web-ui-components-core';
import { useCallback, useEffect, useState } from 'react';

import type { IdpConfig, UseConfigIdpResult } from '../../../types/my-org/config/config-idp-types';
import { useCoreClient } from '../../use-core-client';

export function useIdpConfig(): UseConfigIdpResult {
  const { coreClient } = useCoreClient();
  const [idpConfig, setIdpConfig] = useState<IdpConfig | null>(null);
  const [isLoadingIdpConfig, setIsLoadingIdpConfig] = useState(false);

  const fetchIdpConfig = useCallback(async (): Promise<void> => {
    if (!coreClient) {
      return;
    }
    setIsLoadingIdpConfig(true);

    try {
      const result = (await coreClient
        .getMyOrgApiClient()
        .organization.configuration.identityProviders.get()) as IdpConfig; // TODO: Remove cast when SDK is updated

      setIdpConfig(result);
    } finally {
      setIsLoadingIdpConfig(false);
    }
  }, [coreClient]);

  const isProvisioningEnabled = useCallback(
    (strategy: IdpStrategy | undefined): boolean => {
      if (!strategy || !idpConfig?.strategies?.[strategy]) {
        return false;
      }
      return idpConfig.strategies[strategy].enabled_features.includes('provisioning');
    },
    [idpConfig],
  );

  const isProvisioningMethodEnabled = useCallback(
    (strategy: IdpStrategy | undefined): boolean => {
      if (!strategy || !idpConfig?.strategies?.[strategy]) {
        return false;
      }
      return idpConfig.strategies[strategy].provisioning_methods.includes('scim');
    },
    [idpConfig],
  );

  // Fetch config on mount
  useEffect(() => {
    fetchIdpConfig();
  }, [fetchIdpConfig]);

  return {
    idpConfig,
    isLoadingIdpConfig,
    fetchIdpConfig,
    isProvisioningEnabled,
    isProvisioningMethodEnabled,
  };
}
