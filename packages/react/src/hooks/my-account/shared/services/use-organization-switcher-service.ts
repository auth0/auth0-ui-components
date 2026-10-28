/**
 * Internal organization switcher service hook.
 * Loads the user's organizations page by page (My Account API) for "load more".
 * @module use-organization-switcher-service
 * @internal
 */

import { userOrganizationQueryKeys } from '@auth0/universal-components-core';
import { useInfiniteQuery } from '@tanstack/react-query';

import { useCoreClient } from '@/hooks/shared/use-core-client';
import type {
  UseOrganizationSwitcherServiceOptions,
  UseOrganizationSwitcherServiceResult,
} from '@/types/my-account/organization-management/organization-switcher-types';

/**
 * Internal service hook for the accumulated organization list.
 * @param options - Service hook options.
 * @param options.pageSize - Organizations requested per page.
 * @returns Accumulated organizations and paging state.
 * @internal
 */
export function useOrganizationSwitcherService({
  pageSize,
}: UseOrganizationSwitcherServiceOptions): UseOrganizationSwitcherServiceResult {
  const { coreClient } = useCoreClient();

  const organizationsQuery = useInfiniteQuery({
    queryKey: userOrganizationQueryKeys.infinite({ pageSize }),
    queryFn: async ({ pageParam }: { pageParam?: string }) => {
      const { response } = await coreClient!.getMyAccountApiClient().organizations.list({
        take: pageSize,
        from: pageParam,
      });
      return {
        organizations: response?.organizations ?? [],
        next: response?.next,
      };
    },
    // Required by TanStack Query v5; v4 ignores it and starts with an undefined pageParam.
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (lastPage) => lastPage.next || undefined,
    enabled: !!coreClient,
  });

  return {
    organizations: organizationsQuery.data?.pages.flatMap((page) => page.organizations) ?? [],
    isLoading: organizationsQuery.isLoading,
    isError: organizationsQuery.isError,
    // Retrying after a failed first load puts the query back into its loading state.
    isRetrying: organizationsQuery.isLoading && organizationsQuery.errorUpdateCount > 0,
    hasNextPage: !!organizationsQuery.hasNextPage,
    isFetchingNextPage: organizationsQuery.isFetchingNextPage,
    fetchNextPage: () => {
      void organizationsQuery.fetchNextPage();
    },
    refetch: () => {
      void organizationsQuery.refetch();
    },
  };
}
