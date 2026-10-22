/**
 * Internal organization table service hook.
 * Lists the organizations the authenticated user belongs to (My Account API).
 * @module use-organization-table-service
 * @internal
 */

import { userOrganizationQueryKeys } from '@auth0/universal-components-core';
import { useQuery } from '@tanstack/react-query';

import { useCoreClient } from '@/hooks/shared/use-core-client';
import { getPreviousDataOption } from '@/lib/utils/tanstack-compat';
import type {
  UseOrganizationTableServiceOptions,
  UseOrganizationTableServiceResult,
} from '@/types/my-account/organization-management/organization-table-types';

const keepPreviousDataOption = getPreviousDataOption();

/**
 * Internal service hook for the paginated organization list.
 * @param options - Service hook options.
 * @param options.paginationParams - Page size and checkpoint cursor.
 * @returns Query state for the current page.
 * @internal
 */
export function useOrganizationTableService({
  paginationParams,
}: UseOrganizationTableServiceOptions = {}): UseOrganizationTableServiceResult {
  const { coreClient } = useCoreClient();

  const organizationsQuery = useQuery({
    queryKey: userOrganizationQueryKeys.list({
      pageSize: paginationParams?.pageSize,
      fromToken: paginationParams?.fromToken,
    }),
    queryFn: async () => {
      const { response } = await coreClient!.getMyAccountApiClient().organizations.list({
        take: paginationParams?.pageSize,
        from: paginationParams?.fromToken,
      });
      return {
        organizations: response?.organizations ?? [],
        next: response?.next ?? null,
      };
    },
    enabled: !!coreClient,
    ...keepPreviousDataOption,
  });

  return {
    organizations: organizationsQuery.data?.organizations ?? [],
    nextToken: organizationsQuery.data?.next ?? null,
    isFetching: organizationsQuery.isLoading,
    isRefetching: organizationsQuery.isFetching,
    isStale: organizationsQuery.isStale,
    isError: organizationsQuery.isError,
    updatedAt: organizationsQuery.dataUpdatedAt,
    refetch: organizationsQuery.refetch,
  };
}
