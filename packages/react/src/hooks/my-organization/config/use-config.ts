import {
  AVAILABLE_STRATEGY_LIST,
  hasApiErrorBody,
  type IdpStrategy,
} from '@auth0/universal-components-core';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import type { UseConfigResult } from '../../../types/my-organization/config/config-types';
import { useCoreClient } from '../../use-core-client';

const configQueryKeys = {
  all: ['config'] as const,
  details: () => [...configQueryKeys.all, 'details'] as const,
};

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
    fetchConfig: () => queryClient.invalidateQueries({ queryKey: configQueryKeys.details() }),
    filteredStrategies,
    shouldAllowDeletion,
    isConfigValid,
  };
}
