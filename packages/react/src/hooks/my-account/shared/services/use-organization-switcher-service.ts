/**
 * Internal organization switcher service hook.
 * Loads the first page of the user's organizations (My Account API).
 * @module use-organization-switcher-service
 * @internal
 */

import { userOrganizationQueryKeys, type UserOrganization } from '@auth0/universal-components-core';
import { useQuery } from '@tanstack/react-query';

import { useCoreClient } from '@/hooks/shared/use-core-client';
import type {
  UseOrganizationSwitcherServiceOptions,
  UseOrganizationSwitcherServiceResult,
} from '@/types/my-account/organization-management/organization-switcher-types';

const NO_ORGANIZATIONS: UserOrganization[] = [];

/**
 * Internal service hook for the organization list.
 * It uses the same query key and data shape as the first page of the organization table, so both
 * share one request.
 * @param options - Service hook options.
 * @param options.pageSize - Number of organizations to load.
 * @returns Loaded organizations and query state.
 * @internal
 */
export function useOrganizationSwitcherService({
  pageSize,
}: UseOrganizationSwitcherServiceOptions): UseOrganizationSwitcherServiceResult {
  const { coreClient } = useCoreClient();

  const organizationsQuery = useQuery({
    queryKey: userOrganizationQueryKeys.list({ pageSize }),
    queryFn: async () => {
      const { response } = await coreClient!
        .getMyAccountApiClient()
        .organizations.list({ take: pageSize });
      return {
        organizations: response?.organizations ?? [],
        next: response?.next ?? null,
      };
    },
    enabled: !!coreClient,
  });

  return {
    organizations: organizationsQuery.data?.organizations ?? NO_ORGANIZATIONS,
    isLoading: organizationsQuery.isLoading,
    isError: organizationsQuery.isError,
    // Retrying after a failed first load puts the query back into its loading state.
    isRetrying: organizationsQuery.isLoading && organizationsQuery.errorUpdateCount > 0,
    refetch: () => {
      void organizationsQuery.refetch();
    },
  };
}
