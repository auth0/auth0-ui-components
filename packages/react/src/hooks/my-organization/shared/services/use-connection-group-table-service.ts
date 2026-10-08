/**
 * Internal connection group table service hook.
 * Handles data fetching for connection groups.
 * @module use-connection-group-table-service
 * @internal
 */

import { useQuery } from '@tanstack/react-query';

import { useCoreClient } from '@/hooks/shared/use-core-client';
import type {
  ConnectionGroup,
  UseConnectionGroupTableServiceReturn,
} from '@/types/my-organization/connection-group/organization-connection-group-table-types';

/**
 * Query keys for connection group data.
 *
 * TODO(SDK): move to the core query-key factories alongside the other
 * `*QueryKeys` once the groups endpoints are part of the SDK.
 * @internal
 */
export const connectionGroupQueryKeys = {
  all: ['connection-groups'] as const,
  list: () => [...connectionGroupQueryKeys.all, 'list'] as const,
};

/**
 * Internal service hook for connection group table data.
 *
 * The `@auth0/myorganization-js` client does not yet expose a `groups`
 * namespace, so the list query currently resolves to an empty array. Swap the
 * query function for the real call once the SDK lands (PRD Req 7.1:
 * `GET /my-org/groups`).
 * @returns Connection group data and query state.
 * @internal
 */
export function useConnectionGroupTableService(): UseConnectionGroupTableServiceReturn {
  const { coreClient } = useCoreClient();

  const groupsQuery = useQuery({
    queryKey: connectionGroupQueryKeys.list(),
    queryFn: async (): Promise<ConnectionGroup[]> => {
      // TODO(SDK): replace with the real list call once available, e.g.
      //   const response = await coreClient!
      //     .getMyOrganizationApiClient()
      //     .organization.groups.list();
      //   return ConnectionGroupMappers.fromAPI(response.groups);
      return [];
    },
    enabled: !!coreClient,
  });

  return {
    groups: groupsQuery.data ?? [],
    isLoading: groupsQuery.isLoading,
    isFetching: groupsQuery.isFetching,
    groupsError: groupsQuery.error,
    refetchGroups: groupsQuery.refetch,
  };
}
