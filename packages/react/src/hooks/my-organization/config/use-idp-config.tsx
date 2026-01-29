import { hasApiErrorBody, type IdpStrategy } from '@auth0/universal-components-core';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import type {
  IdpConfig,
  UseConfigIdpResult,
} from '../../../types/my-organization/config/config-idp-types';
import { useCoreClient } from '../../use-core-client';

export const idpConfigQueryKeys = {
  all: ['idp-config'] as const,
  config: () => [...idpConfigQueryKeys.all, 'config'] as const,
};

/**
 * Custom hook for managing IDP configuration data.
 * Uses TanStack Query for caching, loading states, and data synchronization.
 */
export function useIdpConfig(): UseConfigIdpResult {
  const { coreClient } = useCoreClient();
  const queryClient = useQueryClient();

  // ============================================
  // QUERY - Config data managed by TanStack Query
  // ============================================

  const idpConfigQuery = useQuery({
    queryKey: idpConfigQueryKeys.config(),
    queryFn: async () => {
      const result = (await coreClient!
        .getMyOrganizationApiClient()
        .organization.configuration.identityProviders.get()) as unknown as IdpConfig;
      return result;
    },
    enabled: !!coreClient,
    retry: (failureCount, error) => {
      // Don't retry on 404 errors (config not set)
      if (hasApiErrorBody(error) && error.body?.status === 404) {
        return false;
      }
      return failureCount < 3;
    },
    // Set default data to null on 404 errors
    throwOnError: (error) => {
      if (hasApiErrorBody(error) && error.body?.status === 404) {
        return false;
      }
      return true;
    },
  });

  const idpConfig = idpConfigQuery.data ?? null;

  // Validate the idpConfig
  const isIdpConfigValid = !!idpConfig?.strategies && Object.keys(idpConfig.strategies).length > 0;

  // ============================================
  // ACTIONS
  // ============================================

  const fetchIdpConfig = useCallback(async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: idpConfigQueryKeys.config() });
  }, [queryClient]);

  const isProvisioningEnabled = useCallback(
    (strategy: IdpStrategy | undefined): boolean => {
      if (!strategy || !idpConfig?.strategies?.[strategy]) {
        return false;
      }
      return idpConfig.strategies[strategy].enabled_features.includes('provisioning');
    },
    [idpConfig],
  );

  const isProvisioningMethodEnabled = useCallback(
    (strategy: IdpStrategy | undefined): boolean => {
      if (!strategy || !idpConfig?.strategies?.[strategy]) {
        return false;
      }
      return idpConfig.strategies[strategy].provisioning_methods.includes('scim');
    },
    [idpConfig],
  );

  // ============================================
  // RETURN
  // ============================================

  return {
    // Data from TanStack Query - single source of truth
    idpConfig,
    isIdpConfigValid,

    // Loading state - derived from TanStack Query
    isLoadingIdpConfig: idpConfigQuery.isLoading,

    // Actions
    fetchIdpConfig,
    isProvisioningEnabled,
    isProvisioningMethodEnabled,
  };
}
