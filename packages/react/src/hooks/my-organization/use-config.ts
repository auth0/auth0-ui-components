import {
  AVAILABLE_STRATEGY_LIST,
  hasApiErrorBody,
  MY_ORGANIZATION_SSO_PROVIDER_TABLE_SCOPES,
  type IdpStrategy,
} from '@auth0/universal-components-core';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useErrorHandler } from '@/hooks/shared/use-error-handler';
import type { UseConfigResult } from '@/types/my-organization/config/config-types';

const configQueryKeys = {
  all: ['config'] as const,
  details: () => [...configQueryKeys.all, 'details'] as const,
};

export function useConfig(): UseConfigResult {
  const { coreClient } = useCoreClient();
  const queryClient = useQueryClient();
  const handleError = useErrorHandler();

  const configQuery = useQuery({
    queryKey: configQueryKeys.details(),
    queryFn: () =>
      coreClient!
        .getMyOrganizationApiClient()
        .withScopes(MY_ORGANIZATION_SSO_PROVIDER_TABLE_SCOPES)
        .organization.configuration.get(),
    enabled: !!coreClient,
    retry: (failureCount, error) => {
      if (hasApiErrorBody(error) && error.body?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
  });

  useEffect(() => {
    if (configQuery.error) {
      handleError(configQuery.error);
    }
  }, [configQuery.error, handleError]);

  const config = configQuery.data;
  const allowedStrategies = config?.allowed_strategies;

  const filteredStrategies: IdpStrategy[] = allowedStrategies
    ? AVAILABLE_STRATEGY_LIST.filter((s) => allowedStrategies.includes(s))
    : AVAILABLE_STRATEGY_LIST;

  const shouldAllowDeletion =
    config?.connection_deletion_behavior === 'allow' ||
    config?.connection_deletion_behavior === 'allow_if_empty';

  const isConfigValid = !!allowedStrategies?.length;

  const retry = async () => {
    await queryClient.invalidateQueries({ queryKey: configQueryKeys.details() });
  };

  return {
    config: config ?? null,
    isLoadingConfig: configQuery.isLoading,
    fetchConfig: async () => await queryClient.getQueryData(configQueryKeys.details()),
    filteredStrategies,
    shouldAllowDeletion,
    isConfigValid,
    error: configQuery.error,
    retry,
  };
}
