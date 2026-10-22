/**
 * Organization table hook.
 * Single public hook that consumes the internal service hook.
 * @module use-organization-table
 */

import { useCallback } from 'react';

import { useOrganizationTableService } from '@/hooks/my-account/shared/services/use-organization-table-service';
import { useCheckpointPagination } from '@/hooks/shared/use-checkpoint-pagination';
import { DEFAULT_PAGE_SIZE_OPTIONS } from '@/lib/constants/shared/constants';
import type { UseOrganizationTableResult } from '@/types/my-account/organization-management/organization-table-types';

/**
 * Hook for listing the organizations the authenticated user belongs to.
 * Manages checkpoint pagination and delegates fetching to the internal service hook.
 * @returns Hook state and methods
 */
export function useOrganizationTable(): UseOrganizationTableResult {
  const {
    pageSize,
    fromToken,
    currentPage,
    hasPreviousPage,
    goToNextPage,
    goToPreviousPage,
    changePageSize,
  } = useCheckpointPagination({
    defaultPageSize: DEFAULT_PAGE_SIZE_OPTIONS[0],
  });

  const { nextToken, ...service } = useOrganizationTableService({
    paginationParams: { pageSize, fromToken },
  });

  const handleNextPage = useCallback(() => {
    if (nextToken) {
      goToNextPage(nextToken);
    }
  }, [nextToken, goToNextPage]);

  return {
    ...service,
    pagination: {
      pageSize,
      currentPage,
      hasNextPage: !!nextToken,
      hasPreviousPage,
    },
    handleNextPage,
    handlePreviousPage: goToPreviousPage,
    handlePageSizeChange: changePageSize,
  };
}
