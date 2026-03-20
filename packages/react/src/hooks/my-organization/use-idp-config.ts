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
 * Mapping from IdpStrategy values to the SDK's strategy config keys.
 * The SDK uses 'googleapps' (no hyphen) while IdpStrategy uses 'google-apps'.
 */
const STRATEGY_TO_CONFIG_KEY: Record<IdpStrategy, keyof NonNullable<IdpConfig['strategies']>> = {
  adfs: 'adfs',
  'google-apps': 'googleapps',
  oidc: 'oidc',
  okta: 'okta',
  pingfederate: 'pingfederate',
  samlp: 'samlp',
  waad: 'waad',
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
    const key = STRATEGY_TO_CONFIG_KEY[strategy];
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
