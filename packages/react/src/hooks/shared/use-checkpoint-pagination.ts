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
  const [cursor, setCursor] = React.useState<{
    fromToken: string | undefined;
    previousTokens: (string | undefined)[];
    currentPage: number;
  }>({
    fromToken: undefined,
    previousTokens: [],
    currentPage: 1,
  });
  const [sortConfig, setSortConfig] = React.useState<SortConfig>(defaultSortConfig);
  const [filters, setFilters] = React.useState<TFilter>(defaultFilters);

  const resetCursor = React.useCallback(() => {
    setCursor({ fromToken: undefined, previousTokens: [], currentPage: 1 });
  }, []);

  const goToNextPage = React.useCallback((nextToken: string) => {
    setCursor((prev) => ({
      previousTokens: [...prev.previousTokens, prev.fromToken],
      fromToken: nextToken,
      currentPage: prev.currentPage + 1,
    }));
  }, []);

  const goToPreviousPage = React.useCallback(() => {
    setCursor((prev) => {
      if (prev.previousTokens.length === 0) return prev;

      const newStack = [...prev.previousTokens];
      const prevToken = newStack.pop();

      return {
        previousTokens: newStack,
        fromToken: prevToken,
        currentPage: Math.max(1, prev.currentPage - 1),
      };
    });
  }, []);

  const changePageSize = React.useCallback(
    (newPageSize: number) => {
      setPageSize(newPageSize);
      resetCursor();
    },
    [resetCursor],
  );

  const changeSortConfig = React.useCallback(
    (newSortConfig: SortConfig) => {
      setSortConfig(newSortConfig);
      resetCursor();
    },
    [resetCursor],
  );

  const changeFilters = React.useCallback(
    (updater: TFilter | ((prev: TFilter) => TFilter)) => {
      setFilters(updater);
      resetCursor();
    },
    [resetCursor],
  );

  const reset = React.useCallback(() => {
    setPageSize(defaultPageSize);
    setSortConfig(defaultSortConfig);
    setFilters(defaultFilters);
    resetCursor();
  }, [defaultPageSize, defaultSortConfig, defaultFilters, resetCursor]);

  return {
    pageSize,
    currentPage: cursor.currentPage,
    fromToken: cursor.fromToken,
    hasPreviousPage: cursor.previousTokens.length > 0,
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
