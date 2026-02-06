import { hasApiErrorBody, type IdpStrategy } from '@auth0/universal-components-core';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useCoreClient } from '@/hooks/shared/use-core-client';
import type {
  IdpConfig,
  UseConfigIdpResult,
} from '@/types/my-organization/config/config-idp-types';

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
        const response = await coreClient!
          .getMyOrganizationApiClient()
          .organization.configuration.identityProviders.get();
        return response as unknown as IdpConfig;
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

  const isProvisioningEnabled = (strategy: IdpStrategy | undefined): boolean => {
    if (!strategy || !strategies?.[strategy]) return false;
    return strategies[strategy].enabled_features.includes('provisioning');
  };

  const isProvisioningMethodEnabled = (strategy: IdpStrategy | undefined): boolean => {
    if (!strategy || !strategies?.[strategy]) return false;
    return strategies[strategy].provisioning_methods.includes('scim');
  };

  return {
    idpConfig,
    isIdpConfigValid: !!strategies && Object.keys(strategies).length > 0,
    isLoadingIdpConfig: idpConfigQuery.isLoading,
    fetchIdpConfig: () => queryClient.invalidateQueries({ queryKey: idpConfigQueryKeys.config() }),
    isProvisioningEnabled,
    isProvisioningMethodEnabled,
  };
}
