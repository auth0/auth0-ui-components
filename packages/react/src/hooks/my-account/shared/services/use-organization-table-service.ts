/**
 * Internal organization table service hook.
 * Lists the organizations the authenticated user belongs to (My Account API).
 * @module use-organization-table-service
 * @internal
 */

import { userOrganizationQueryKeys } from '@auth0/universal-components-core';
import { useQuery } from '@tanstack/react-query';

import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useQueryErrorToast } from '@/hooks/shared/use-query-error-toast';
import { useTranslator } from '@/hooks/shared/use-translator';
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
  const { t: tCommon } = useTranslator('common');

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

  // Only a failed refresh needs a toast; a failed first load already shows the error card. The
  // `isFetching` check re-arms it, since a failed query stays in error until a refetch succeeds.
  const hasRows = (organizationsQuery.data?.organizations.length ?? 0) > 0;
  useQueryErrorToast(
    {
      isError: organizationsQuery.isError && hasRows && !organizationsQuery.isFetching,
      error: organizationsQuery.error,
    },
    tCommon('error.generic'),
  );

  return {
    organizations: organizationsQuery.data?.organizations ?? [],
    nextToken: organizationsQuery.data?.next ?? null,
    isLoading: organizationsQuery.isLoading,
    isFetching: organizationsQuery.isFetching,
    isStale: organizationsQuery.isStale,
    isError: organizationsQuery.isError,
    updatedAt: organizationsQuery.dataUpdatedAt,
    refetch: organizationsQuery.refetch,
  };
}
