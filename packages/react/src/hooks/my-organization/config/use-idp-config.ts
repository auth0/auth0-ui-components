import { hasApiErrorBody, type IdpStrategy } from '@auth0/universal-components-core';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import type {
  IdpConfig,
  UseConfigIdpResult,
} from '../../../types/my-organization/config/config-idp-types';
import { useCoreClient } from '../../use-core-client';

const idpConfigQueryKeys = {
  all: ['idp-config'] as const,
  config: () => [...idpConfigQueryKeys.all, 'config'] as const,
};

export function useIdpConfig(): UseConfigIdpResult {
  const { coreClient } = useCoreClient();
  const queryClient = useQueryClient();

  const idpConfigQuery = useQuery({
    queryKey: idpConfigQueryKeys.config(),
    queryFn: async () => {
      try {
        return (await coreClient!
          .getMyOrganizationApiClient()
          .organization.configuration.identityProviders.get()) as unknown as IdpConfig;
      } catch (error) {
        if (hasApiErrorBody(error) && error.body?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!coreClient,
    retry: (failureCount) => failureCount < 3,
  });

  const idpConfig = idpConfigQuery.data ?? null;
  const strategies = idpConfig?.strategies;

  const isProvisioningEnabled = (strategy: IdpStrategy | undefined): boolean => {
    if (!strategy || !strategies?.[strategy]) return false;
    return strategies[strategy].enabled_features.includes('provisioning');
  };

  const isProvisioningMethodEnabled = (strategy: IdpStrategy | undefined): boolean => {
    if (!strategy || !strategies?.[strategy]) return false;
    return strategies[strategy].provisioning_methods.includes('scim');
  };

  return {
    idpConfig: idpConfig ?? null,
    isIdpConfigValid: !!strategies && Object.keys(strategies).length > 0,
    isLoadingIdpConfig: idpConfigQuery.isLoading,
    fetchIdpConfig: () => queryClient.invalidateQueries({ queryKey: idpConfigQueryKeys.config() }),
    isProvisioningEnabled,
    isProvisioningMethodEnabled,
  };
}
