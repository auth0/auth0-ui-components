import {
  AVAILABLE_STRATEGY_LIST,
  hasApiErrorBody,
  type GetConfigurationResponseContent,
  type IdpStrategy,
} from '@auth0/web-ui-components-core';
import { useCallback, useEffect, useMemo, useState } from 'react';

import type { UseConfigResult } from '../../../types/my-org/config/config-types';
import { useCoreClient } from '../../use-core-client';

export function useConfig(): UseConfigResult {
  const { coreClient } = useCoreClient();
  const [config, setConfig] = useState<GetConfigurationResponseContent | null>(null);
  const [isLoadingConfig, setIsLoadingConfig] = useState(false);
  const [isConfigValid, setIsConfigValid] = useState(true);

  const fetchConfig = useCallback(async (): Promise<void> => {
    if (!coreClient) {
      return;
    }
    setIsLoadingConfig(true);

    try {
      const result: GetConfigurationResponseContent = await coreClient
        .getMyOrgApiClient()
        .organization.configuration.get();
      setConfig(result);

      // Validate the config after fetching - test
      const hasAllowedStrategies =
        result.allowed_strategies && result.allowed_strategies.length > 0;
      setIsConfigValid(!!hasAllowedStrategies);
    } catch (error) {
      // If config is not set
      if (hasApiErrorBody(error) && error.body?.status === 404) {
        setConfig(null);
        setIsConfigValid(false);
      }
    } finally {
      setIsLoadingConfig(false);
    }
  }, [coreClient]);

  const filteredStrategies = useMemo((): IdpStrategy[] => {
    const allowedStrategies = config?.allowed_strategies;

    if (!allowedStrategies) {
      return AVAILABLE_STRATEGY_LIST;
    }

    return AVAILABLE_STRATEGY_LIST.filter((strategy) => allowedStrategies.includes(strategy));
  }, [config]);

  const shouldAllowDeletion = useMemo((): boolean => {
    return (
      config?.connection_deletion_behavior === 'allow' ||
      config?.connection_deletion_behavior === 'allow_if_empty'
    );
  }, [config]);

  // Fetch config on mount
  useEffect(() => {
    fetchConfig();
  }, []);

  return {
    config,
    isLoadingConfig,
    fetchConfig,
    filteredStrategies,
    shouldAllowDeletion,
    isConfigValid,
  };
}
