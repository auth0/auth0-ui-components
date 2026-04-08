import * as React from 'react';

interface SortConfig {
  key: string | null;
  direction: 'asc' | 'desc';
}

export interface CheckpointPaginationOptions<TFilter extends object> {
  defaultPageSize?: number;
  defaultSortConfig?: SortConfig;
  defaultFilters?: TFilter;
}

export interface UseCheckpointPaginationResult<TFilter extends object> {
  pageSize: number;
  fromToken: string | undefined;
  sortConfig: SortConfig;
  filters: TFilter;
  currentPage: number;
  hasPreviousPage: boolean;
  goToNextPage: (nextToken: string) => void;
  goToPreviousPage: () => void;
  changePageSize: (pageSize: number) => void;
  changeSortConfig: (sortConfig: SortConfig) => void;
  changeFilters: (updater: TFilter | ((prev: TFilter) => TFilter)) => void;
  reset: () => void;
}

const DEFAULT_PAGE_SIZE = 10;
const DEFAULT_SORT_CONFIG: SortConfig = { key: null, direction: 'asc' };

/**
 * Hook for checkpoint-based pagination with sort, filter, and auto-reset.
 * @param options - Pagination configuration options.
 * @returns Pagination state and control functions.
 */
export function useCheckpointPagination<TFilter extends object = Record<string, unknown>>(
  options: CheckpointPaginationOptions<TFilter> = {},
): UseCheckpointPaginationResult<TFilter> {
  const {
    defaultPageSize = DEFAULT_PAGE_SIZE,
    defaultSortConfig = DEFAULT_SORT_CONFIG,
    defaultFilters = {} as TFilter,
  } = options;

  const [pageSize, setPageSize] = React.useState(defaultPageSize);
  const [fromToken, setFromToken] = React.useState<string | undefined>(undefined);
  const [previousTokens, setPreviousTokens] = React.useState<Array<string | undefined>>([]);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [sortConfig, setSortConfig] = React.useState<SortConfig>(defaultSortConfig);
  const [filters, setFilters] = React.useState<TFilter>(defaultFilters);

  const resetPagination = React.useCallback(() => {
    setFromToken(undefined);
    setPreviousTokens([]);
    setCurrentPage(1);
  }, []);

  const goToNextPage = React.useCallback(
    (nextToken: string) => {
      setPreviousTokens((prev) => [...prev, fromToken]);
      setFromToken(nextToken);
      setCurrentPage((prev) => prev + 1);
    },
    [fromToken],
  );

  const goToPreviousPage = React.useCallback(() => {
    setPreviousTokens((prev) => {
      const token = prev[prev.length - 1];
      setFromToken(token);
      return prev.slice(0, -1);
    });
    setCurrentPage((prev) => Math.max(1, prev - 1));
  }, []);

  const changePageSize = React.useCallback(
    (newPageSize: number) => {
      setPageSize(newPageSize);
      resetPagination();
    },
    [resetPagination],
  );

  const changeSortConfig = React.useCallback(
    (newSortConfig: SortConfig) => {
      setSortConfig(newSortConfig);
      resetPagination();
    },
    [resetPagination],
  );

  const changeFilters = React.useCallback(
    (updater: TFilter | ((prev: TFilter) => TFilter)) => {
      setFilters(updater);
      resetPagination();
    },
    [resetPagination],
  );

  const reset = React.useCallback(() => {
    setPageSize(defaultPageSize);
    setSortConfig(defaultSortConfig);
    setFilters(defaultFilters);
    resetPagination();
  }, [defaultPageSize, defaultSortConfig, defaultFilters, resetPagination]);

  return {
    pageSize,
    currentPage,
    fromToken,
    hasPreviousPage: previousTokens.length > 0,
    sortConfig,
    filters,
    goToNextPage,
    goToPreviousPage,
    changePageSize,
    changeSortConfig,
    changeFilters,
    reset,
  };
}
