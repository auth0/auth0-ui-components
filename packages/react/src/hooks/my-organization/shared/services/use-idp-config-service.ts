/**
 * Identity provider configuration hook.
 * @module use-idp-config-service
 */

import {
  hasApiErrorBody,
  idpConfigQueryKeys,
  type GetIdpConfigurationResponseContent,
  type IdentityProvidersConfigStrategyBase,
  type IdpStrategy,
  type CrossAppAccessResourceAppConfig,
  type StrategyWithCrossAppAccess,
} from '@auth0/universal-components-core';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useCoreClient } from '@/hooks/shared/use-core-client';
import type { UseConfigIdpResult } from '@/types/my-organization/config/config-idp-types';

/**
 * Mapping from IdpStrategy values to the SDK's strategy config keys.
 */
const STRATEGY_TO_CONFIG_KEY: Record<
  IdpStrategy,
  keyof NonNullable<GetIdpConfigurationResponseContent['strategies']>
> = {
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

  const getStrategyFor = (
    strategy: IdpStrategy | undefined,
  ): IdentityProvidersConfigStrategyBase | undefined => {
    if (!strategy || !strategies) return undefined;
    const key = STRATEGY_TO_CONFIG_KEY[strategy];
    return strategies[key];
  };

  const isProvisioningEnabled = (strategy: IdpStrategy | undefined): boolean =>
    getStrategyFor(strategy)?.enabled_features.includes('provisioning') ?? false;

  const isProvisioningMethodEnabled = (strategy: IdpStrategy | undefined): boolean =>
    getStrategyFor(strategy)?.provisioning_methods.includes('scim') ?? false;

  const getCrossAppAccessConfig = (
    strategy: IdpStrategy | undefined,
  ): CrossAppAccessResourceAppConfig | undefined => {
    const strategyConfig = getStrategyFor(strategy) as StrategyWithCrossAppAccess | undefined;
    return strategyConfig?.cross_app_access_resource_app;
  };

  const showCrossAppAccess = (strategy: IdpStrategy | undefined): boolean => {
    const config = getCrossAppAccessConfig(strategy);
    return config !== undefined;
  };

  const isCrossAppAccessReadOnly = (strategy: IdpStrategy | undefined): boolean => {
    const config = getCrossAppAccessConfig(strategy);
    if (!config) return true;
    return (config.status.allowed_values?.length ?? 0) <= 1;
  };

  const getCrossAppAccessDefaultValue = (
    strategy: IdpStrategy | undefined,
  ): 'enabled' | 'disabled' | undefined => {
    const config = getCrossAppAccessConfig(strategy);
    if (!config) return undefined;
    const isReadOnly = (config.status.allowed_values?.length ?? 0) <= 1;
    return isReadOnly ? config.status.allowed_values?.[0] : config.status.default_value;
  };

  return {
    idpConfig,
    isIdpConfigValid: !!strategies && Object.keys(strategies).length > 0,
    isLoadingIdpConfig: idpConfigQuery.isLoading,
    fetchIdpConfig: async () => await queryClient.getQueryData(idpConfigQueryKeys.config()),
    isProvisioningEnabled,
    isProvisioningMethodEnabled,
    showCrossAppAccess,
    isCrossAppAccessReadOnly,
    getCrossAppAccessDefaultValue,
  };
}
