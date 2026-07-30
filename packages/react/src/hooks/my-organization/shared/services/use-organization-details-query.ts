import {
  OrganizationDetailsMappers,
  organizationDetailsQueryKeys,
} from '@auth0/universal-components-core';
import { useQuery } from '@tanstack/react-query';

import { useCoreClient } from '@/hooks/shared/use-core-client';

/**
 * Shared organization details query hook.
 * All services that need organization details should consume this
 * to ensure a single cache entry and consistent data across the app.
 * @returns The organization details query result.
 * @internal
 */
export function useOrganizationDetailsQuery() {
  const { coreClient } = useCoreClient();

  return useQuery({
    queryKey: organizationDetailsQueryKeys.details(),
    queryFn: async () => {
      const response = await coreClient!.getMyOrganizationApiClient().organizationDetails.get();
      return OrganizationDetailsMappers.fromAPI(response);
    },
    enabled: !!coreClient,
  });
}
