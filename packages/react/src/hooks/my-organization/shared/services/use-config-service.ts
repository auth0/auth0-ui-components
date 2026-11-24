/**
 * Organization configuration hook.
 * @module use-config-service
 */

import {
  AVAILABLE_STRATEGY_LIST,
  configQueryKeys,
  type IdpStrategy,
} from '@auth0/universal-components-core';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useCoreClient } from '@/hooks/shared/use-core-client';
import { getDiscoveryState } from '@/lib/utils/my-organization/domain-management/domain-management-utils';
import { createRetryUnlessNotFound } from '@/lib/utils/shared/query-utils';
import type { UseConfigResult } from '@/types/my-organization/config/config-types';

/**
 * Hook for fetching organization configuration.
 * @param options - Hook options.
 * @param options.enabled - Whether to fetch the configuration. Defaults to `true`.
 * @returns Config data and allowed strategies.
 */
export function useConfig({ enabled = true }: { enabled?: boolean } = {}): UseConfigResult {
  const { coreClient } = useCoreClient();
  const queryClient = useQueryClient();

  const configQuery = useQuery({
    queryKey: configQueryKeys.details(),
    queryFn: () => coreClient!.getMyOrganizationApiClient().organization.configuration.get(),
    enabled: !!coreClient && enabled,
    retry: createRetryUnlessNotFound(queryClient),
  });

  const config = configQuery.data;
  const allowedStrategies = config?.allowed_strategies;

  const filteredStrategies: IdpStrategy[] = allowedStrategies
    ? AVAILABLE_STRATEGY_LIST.filter((s) => allowedStrategies.includes(s))
    : AVAILABLE_STRATEGY_LIST;

  const shouldAllowDeletion =
    config?.connection_deletion_behavior === 'allow' ||
    config?.connection_deletion_behavior === 'allow_if_empty';

  // The API treats an unset value as `allow_if_empty`.
  const organizationDeletionBehavior: UseConfigResult['organizationDeletionBehavior'] =
    config && (config.organization_deletion_behavior ?? 'allow_if_empty');

  // Unlike connections, an unavailable configuration doesn't block: the API still decides.
  const shouldAllowOrganizationDeletion =
    organizationDeletionBehavior === undefined ||
    organizationDeletionBehavior === 'allow' ||
    organizationDeletionBehavior === 'allow_if_empty';

  const isConfigValid = !!allowedStrategies?.length;

  const showThirdPartyAccess = config?.third_party_client_access !== undefined;
  const isThirdPartyAccessReadOnly =
    (config?.third_party_client_access?.allowed_values?.length ?? 0) <= 1;
  const thirdPartyAccessDefaultValue = isThirdPartyAccessReadOnly
    ? (config?.third_party_client_access?.allowed_values?.[0] ??
      config?.third_party_client_access?.default_value)
    : config?.third_party_client_access?.default_value;

  const discoveryPolicy = config?.use_for_organization_discovery ?? null;
  const {
    isAvailable: showDiscovery,
    isReadOnly: isDiscoveryReadOnly,
    defaultValue: discoveryDefaultValue,
  } = getDiscoveryState(discoveryPolicy);

  return {
    config: config ?? null,
    isLoadingConfig: configQuery.isLoading,
    fetchConfig: async () => await queryClient.getQueryData(configQueryKeys.details()),
    filteredStrategies,
    shouldAllowDeletion,
    organizationDeletionBehavior,
    shouldAllowOrganizationDeletion,
    isConfigValid,
    showThirdPartyAccess,
    isThirdPartyAccessReadOnly,
    thirdPartyAccessDefaultValue,
    discoveryPolicy,
    showDiscovery,
    isDiscoveryReadOnly,
    discoveryDefaultValue,
  };
}
