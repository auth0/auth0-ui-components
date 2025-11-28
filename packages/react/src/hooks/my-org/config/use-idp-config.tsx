import { hasApiErrorBody, type IdpStrategy } from '@auth0/web-ui-components-core';
import { useCallback, useEffect, useState } from 'react';

import type { IdpConfig, UseConfigIdpResult } from '../../../types/my-org/config/config-idp-types';
import { useCoreClient } from '../../use-core-client';

export function useIdpConfig(): UseConfigIdpResult {
  const { coreClient } = useCoreClient();
  const [idpConfig, setIdpConfig] = useState<IdpConfig | null>(null);
  const [isLoadingIdpConfig, setIsLoadingIdpConfig] = useState(false);
  const [isIdpConfigValid, setIsIdpConfigValid] = useState(true);

  const fetchIdpConfig = useCallback(async (): Promise<void> => {
    if (!coreClient) {
      return;
    }
    setIsLoadingIdpConfig(true);

    try {
      const result = (await coreClient
        .getMyOrgApiClient()
        .organization.configuration.identityProviders.get()) as unknown as IdpConfig;

      setIdpConfig(result);

      // Validate the idpConfig after fetching
      const hasStrategies = result.strategies && Object.keys(result.strategies).length > 0;
      setIsIdpConfigValid(!!hasStrategies);
    } catch (error) {
      // If config is not set
      if (hasApiErrorBody(error) && error.body?.status === 404) {
        setIdpConfig(null);
        setIsIdpConfigValid(false);
      }
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
  }, []);

  return {
    idpConfig,
    isLoadingIdpConfig,
    fetchIdpConfig,
    isProvisioningEnabled,
    isProvisioningMethodEnabled,
    isIdpConfigValid,
  };
}
