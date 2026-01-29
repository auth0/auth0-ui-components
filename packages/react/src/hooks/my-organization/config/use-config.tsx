import {
  AVAILABLE_STRATEGY_LIST,
  hasApiErrorBody,
  type GetConfigurationResponseContent,
  type IdpStrategy,
} from '@auth0/universal-components-core';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import type { UseConfigResult } from '../../../types/my-organization/config/config-types';
import { useCoreClient } from '../../use-core-client';

const CACHE_CONFIG = {
  CONFIG_STALE_TIME: 5 * 60 * 1000,
  CONFIG_GC_TIME: 10 * 60 * 1000,
} as const;

export const configQueryKeys = {
  all: ['config'] as const,
  details: () => [...configQueryKeys.all, 'details'] as const,
};

export function useConfig(): UseConfigResult {
  const { coreClient } = useCoreClient();
  const queryClient = useQueryClient();

  // ============================================
  // QUERY - Config data managed by TanStack Query
  // ============================================

  const configQuery = useQuery({
    queryKey: configQueryKeys.details(),
    queryFn: async () => {
      const result: GetConfigurationResponseContent = await coreClient!
        .getMyOrganizationApiClient()
        .organization.configuration.get();
      return result;
    },
    staleTime: CACHE_CONFIG.CONFIG_STALE_TIME,
    gcTime: CACHE_CONFIG.CONFIG_GC_TIME,
    enabled: !!coreClient,
    retry: (failureCount, error) => {
      // Don't retry on 404 errors (config not set)
      if (hasApiErrorBody(error) && error.body?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
  });

  const config = configQuery.data ?? null;

  // ============================================
  // COMPUTED VALUES - Derived from query data
  // ============================================

  const isConfigValid = useMemo((): boolean => {
    // If query errored with 404, config is not valid
    if (configQuery.isError && !configQuery.data) {
      return false;
    }

    // Validate the config has allowed strategies
    const hasAllowedStrategies = config?.allowed_strategies && config.allowed_strategies.length > 0;
    return !!hasAllowedStrategies;
  }, [config, configQuery.isError, configQuery.data]);

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

  // ============================================
  // ACTIONS - Cache management
  // ============================================

  const fetchConfig = useCallback(async (): Promise<void> => {
    const existingData = queryClient.getQueryData(configQueryKeys.details());
    const queryState = queryClient.getQueryState(configQueryKeys.details());

    // Only refetch if data is stale or doesn't exist
    if (existingData && queryState && !queryState.isInvalidated) {
      const dataAge = Date.now() - (queryState.dataUpdatedAt || 0);
      if (dataAge < CACHE_CONFIG.CONFIG_STALE_TIME) {
        return;
      }
    }

    await queryClient.invalidateQueries({ queryKey: configQueryKeys.details() });
  }, [queryClient]);

  return {
    config,
    isLoadingConfig: configQuery.isLoading,
    fetchConfig,
    filteredStrategies,
    shouldAllowDeletion,
    isConfigValid,
  };
}
