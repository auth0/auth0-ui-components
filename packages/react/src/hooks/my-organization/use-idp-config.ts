/**
 * Identity provider configuration hook.
 * @module use-idp-config
 */

import {
  hasApiErrorBody,
  type GetIdpConfigurationResponseContent,
  type IdpConfigStrategyBase,
  type IdpStrategy,
} from '@auth0/universal-components-core';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useCoreClient } from '@/hooks/shared/use-core-client';
import type {
  IdpConfig,
  UseConfigIdpResult,
} from '@/types/my-organization/config/config-idp-types';

export const idpConfigQueryKeys = {
  all: ['idp-config'] as const,
  config: () => [...idpConfigQueryKeys.all, 'config'] as const,
};

/**
 * Maps an IdpStrategy value to the corresponding key in the SDK's strategy override object.
 * @param strategy - The identity provider strategy to map.
 * @returns The corresponding key in the SDK's IdentityProvidersConfigStrategyOverride.
 */
const strategyToConfigKey = (strategy: IdpStrategy): keyof NonNullable<IdpConfig['strategies']> => {
  if (strategy === 'google-apps') return 'googleapps';
  return strategy as keyof NonNullable<IdpConfig['strategies']>;
};

/**
 * Hook for fetching IDP configuration and provisioning settings.
 * @returns IDP config and provisioning utilities.
 */
export function useIdpConfig(): UseConfigIdpResult {
  const { coreClient } = useCoreClient();
  const queryClient = useQueryClient();

  const idpConfigQuery = useQuery<GetIdpConfigurationResponseContent | null>({
    queryKey: idpConfigQueryKeys.config(),
    queryFn: async () => {
      try {
        const response = await coreClient!
          .getMyOrganizationApiClient()
          .organization.configuration.identityProviders.get();
        return response;
      } catch (error) {
        if (hasApiErrorBody(error) && error.body?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!coreClient,
    retry: (failureCount, error) => {
      if (hasApiErrorBody(error) && error.body?.status === 404) return false;
      return failureCount < 3;
    },
  });

  const idpConfig = idpConfigQuery.data ?? null;
  const strategies = idpConfig?.strategies;

  const getStrategyFor = (strategy: IdpStrategy | undefined): IdpConfigStrategyBase | undefined => {
    if (!strategy || !strategies) return undefined;
    const key = strategyToConfigKey(strategy);
    return strategies[key];
  };

  const isProvisioningEnabled = (strategy: IdpStrategy | undefined): boolean =>
    getStrategyFor(strategy)?.enabled_features.includes('provisioning') ?? false;

  const isProvisioningMethodEnabled = (strategy: IdpStrategy | undefined): boolean =>
    getStrategyFor(strategy)?.provisioning_methods.includes('scim') ?? false;

  return {
    idpConfig,
    isIdpConfigValid: !!strategies && Object.keys(strategies).length > 0,
    isLoadingIdpConfig: idpConfigQuery.isLoading,
    fetchIdpConfig: async () => await queryClient.getQueryData(idpConfigQueryKeys.config()),
    isProvisioningEnabled,
    isProvisioningMethodEnabled,
  };
}
