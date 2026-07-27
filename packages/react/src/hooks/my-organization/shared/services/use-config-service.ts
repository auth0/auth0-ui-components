/**
 * Organization configuration hook.
 * @module use-config-service
 */

import {
  AVAILABLE_STRATEGY_LIST,
  configQueryKeys,
  hasApiErrorBody,
  type IdpStrategy,
} from '@auth0/universal-components-core';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useCoreClient } from '@/hooks/shared/use-core-client';
import type { UseConfigResult } from '@/types/my-organization/config/config-types';

/**
 * Hook for fetching organization configuration.
 * @returns Config data and allowed strategies.
 */
export function useConfig(): UseConfigResult {
  const { coreClient } = useCoreClient();
  const queryClient = useQueryClient();

  const configQuery = useQuery({
    queryKey: configQueryKeys.details(),
    queryFn: () => coreClient!.getMyOrganizationApiClient().organization.configuration.get(),
    enabled: !!coreClient,
    retry: (failureCount, error) => {
      if (hasApiErrorBody(error) && error.body?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
  });

  const config = configQuery.data;
  const allowedStrategies = config?.allowed_strategies;

  const filteredStrategies: IdpStrategy[] = allowedStrategies
    ? AVAILABLE_STRATEGY_LIST.filter((s) => allowedStrategies.includes(s))
    : AVAILABLE_STRATEGY_LIST;

  const shouldAllowDeletion =
    config?.connection_deletion_behavior === 'allow' ||
    config?.connection_deletion_behavior === 'allow_if_empty';

  const isConfigValid = !!allowedStrategies?.length;

  return {
    config: config ?? null,
    isLoadingConfig: configQuery.isLoading,
    fetchConfig: async () => await queryClient.getQueryData(configQueryKeys.details()),
    filteredStrategies,
    shouldAllowDeletion,
    isConfigValid,
  };
}
