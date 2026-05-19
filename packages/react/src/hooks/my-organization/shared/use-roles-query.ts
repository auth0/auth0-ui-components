import { memberManagementQueryKeys, type Role } from '@auth0/universal-components-core';
import { useQuery, type UseQueryResult } from '@tanstack/react-query';

import { useCoreClient } from '@/hooks/shared/use-core-client';

/**
 * Shared query hook for fetching organization roles.
 * @returns Query result containing the list of roles.
 */
export function useRolesQuery(): UseQueryResult<Role[]> {
  const { coreClient } = useCoreClient();

  return useQuery({
    queryKey: memberManagementQueryKeys.roles(),
    queryFn: async () => {
      const response = await coreClient!
        .getMyOrganizationApiClient()
        .organization.roles.list({ take: 50 });
      return response.data;
    },
    enabled: !!coreClient,
  });
}
