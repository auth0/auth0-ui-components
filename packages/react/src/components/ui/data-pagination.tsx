import { useMemo, useRef, useEffect } from 'react';

import { cn } from '../../lib/utils';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from './pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

export interface DataPaginationLabels {
  showing: string;
  to: string;
  of: string;
  results: string;
  totalResults: string;
  show: string;
  perPage: string;
  previous: string;
  next: string;
  goToPage: string;
  goToPrevious: string;
  goToNext: string;
  morePages: string;
}

export const defaultLabels: DataPaginationLabels = {
  showing: 'Showing',
  to: 'to',
  of: 'of',
  results: 'results',
  totalResults: 'total results',
  show: 'Show',
  perPage: 'per page',
  previous: 'Previous',
  next: 'Next',
  goToPage: 'Go to page {page}',
  goToPrevious: 'Go to previous page',
  goToNext: 'Go to next page',
  morePages: 'More pages',
};

export interface RegularPaginationState {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalItems: number;
  maxVisiblePages?: number;
}

export interface CheckpointPaginationState {
  pageSize: number;
  totalItems?: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface DataPaginationProps {
  type: 'regular' | 'checkpoint';
  paginationState: RegularPaginationState | CheckpointPaginationState;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
  showPageInfo?: boolean;
  className?: string;
  labels?: Partial<DataPaginationLabels>;
  locale?: string;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  onNextPage?: () => void;
  onPreviousPage?: () => void;
}

const formatNumber = (num: number | undefined | null, locale?: string): string => {
  if (num === null || num === undefined || isNaN(num)) {
    return '0';
  }

  const resolvedLocale =
    locale ?? (typeof navigator !== 'undefined' ? navigator.language : 'en-US');
  return num.toLocaleString(resolvedLocale);
};

const interpolate = (str: string, values: Record<string, string | number>): string =>
  str.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''));

const generatePageNumbers = (
  currentPage: number,
  totalPages: number,
  maxVisible: number = 5,
): (number | 'ellipsis')[] => {
  if (totalPages <= maxVisible) return Array.from({ length: totalPages }, (_, i) => i + 1);

  const pages: (number | 'ellipsis')[] = [1];
  const range = Math.floor((maxVisible - 3) / 2);
  let start = Math.max(2, currentPage - range);
  let end = Math.min(totalPages - 1, currentPage + range);

  if (currentPage <= range + 2) end = maxVisible - 2;
  if (currentPage >= totalPages - range - 1) start = totalPages - (maxVisible - 2);

  if (start > 2) pages.push('ellipsis');
  for (let i = start; i <= end; i++) pages.push(i);
  if (end < totalPages - 1) pages.push('ellipsis');
  pages.push(totalPages);

  return pages;
};

export function DataPagination({
  type,
  paginationState,
  pageSizeOptions,
  showPageSizeSelector = false,
  showPageInfo = false,
  className,
  labels: customLabels,
  locale,
  onPageChange,
  onPageSizeChange,
  onNextPage,
  onPreviousPage,
}: DataPaginationProps) {
  const labels = useMemo(() => ({ ...defaultLabels, ...customLabels }), [customLabels]);
  const ariaLiveRegionRef = useRef<HTMLDivElement | null>(null);

  const isRegular = type === 'regular';
  const regularState = isRegular ? (paginationState as RegularPaginationState) : null;
  const checkpointState = !isRegular ? (paginationState as CheckpointPaginationState) : null;

  const currentPageSize = paginationState ? paginationState.pageSize : undefined;

  const shouldShowPageSizeSelector = showPageSizeSelector;

  const allPageSizeOptions = useMemo(() => {
    if (!shouldShowPageSizeSelector || !pageSizeOptions || currentPageSize === undefined) return [];
    const uniqueOptions = new Set([...pageSizeOptions, currentPageSize]);
    return Array.from(uniqueOptions).sort((a, b) => a - b);
  }, [shouldShowPageSizeSelector, pageSizeOptions, currentPageSize]);

  const pageNumbers = useMemo(
    () =>
      isRegular && regularState
        ? generatePageNumbers(
            regularState.currentPage,
            regularState.totalPages,
            regularState.maxVisiblePages,
          )
        : [],
    [isRegular, regularState],
  );

  useEffect(() => {
    if (ariaLiveRegionRef.current) {
      if (isRegular && regularState) {
        ariaLiveRegionRef.current.textContent = `Page ${regularState.currentPage} loaded.`;
      } else if (checkpointState) {
        ariaLiveRegionRef.current.textContent = 'Content loaded.';
      }
    }
  }, [type, paginationState, isRegular, regularState, checkpointState]);

  if (!paginationState) {
    return null;
  }

  const shouldShowPageNumbers = isRegular;
  const safeCurrentPageSize = currentPageSize as number;

  return (
    <div
      className={cn('flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end', className)}
    >
      <div
        ref={ariaLiveRegionRef}
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      />

      {showPageInfo && (
        <div className="text-sm text-foreground whitespace-nowrap sm:mr-auto">
          {isRegular && regularState ? (
            <>
              {labels.showing}{' '}
              <span className="font-medium text-foreground">
                {formatNumber(
                  regularState.totalItems === 0
                    ? 0
                    : (regularState.currentPage - 1) * regularState.pageSize + 1,
                  locale,
                )}
              </span>{' '}
              {labels.to}{' '}
              <span className="font-medium text-foreground">
                {formatNumber(
                  Math.min(
                    regularState.currentPage * regularState.pageSize,
                    regularState.totalItems,
                  ),
                  locale,
                )}
              </span>{' '}
              {labels.of}{' '}
              <span className="font-medium text-foreground">
                {formatNumber(regularState.totalItems, locale)}
              </span>{' '}
              {labels.results}
            </>
          ) : checkpointState?.totalItems !== undefined ? (
            <>
              <span className="font-medium text-foreground">
                {formatNumber(checkpointState.totalItems, locale)}
              </span>{' '}
              <span>{labels.totalResults}</span>
            </>
          ) : null}
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        {shouldShowPageSizeSelector && allPageSizeOptions.length > 0 && (
          <div className="flex items-center justify-center gap-2 whitespace-nowrap sm:justify-start">
            <span className="text-sm text-foreground">{labels.show}</span>
            <Select
              value={safeCurrentPageSize.toString()}
              onValueChange={(value) => onPageSizeChange?.(Number(value))}
            >
              <SelectTrigger className="w-20 h-9">
                <SelectValue placeholder={formatNumber(safeCurrentPageSize, locale)} />
              </SelectTrigger>
              <SelectContent>
                {allPageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {formatNumber(size, locale)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-sm text-foreground">{labels.perPage}</span>
          </div>
        )}

        <Pagination role="navigation" aria-label="Pagination Navigation">
          <PaginationContent>
            {isRegular && regularState ? (
              <>
                <PaginationItem>
                  <PaginationPrevious
                    label={labels.previous}
                    onClick={() => onPageChange?.(Math.max(1, regularState.currentPage - 1))}
                    className={cn(
                      regularState.currentPage <= 1 &&
                        'pointer-events-none opacity-50 text-foreground',
                    )}
                    aria-label={labels.goToPrevious}
                    aria-disabled={regularState.currentPage <= 1}
                  />
                </PaginationItem>

                {shouldShowPageNumbers &&
                  pageNumbers.map((page, idx) => (
                    <PaginationItem key={`page-${idx}`}>
                      {page === 'ellipsis' ? (
                        <PaginationEllipsis>
                          <span className="sr-only">{labels.morePages}</span>
                        </PaginationEllipsis>
                      ) : (
                        <PaginationLink
                          onClick={() => onPageChange?.(page)}
                          isActive={regularState.currentPage === page}
                          aria-label={interpolate(labels.goToPage, {
                            page: formatNumber(page, locale),
                          })}
                          aria-current={regularState.currentPage === page ? 'page' : undefined}
                        >
                          {formatNumber(page, locale)}
                        </PaginationLink>
                      )}
                    </PaginationItem>
                  ))}

                <PaginationItem>
                  <PaginationNext
                    label={labels.next}
                    onClick={() =>
                      onPageChange?.(
                        Math.min(regularState.totalPages, regularState.currentPage + 1),
                      )
                    }
                    className={cn(
                      regularState.currentPage >= regularState.totalPages &&
                        'pointer-events-none opacity-50 text-foreground',
                    )}
                    aria-label={labels.goToNext}
                    aria-disabled={regularState.currentPage >= regularState.totalPages}
                  />
                </PaginationItem>
              </>
            ) : checkpointState ? (
              <>
                <PaginationItem>
                  <PaginationPrevious
                    label={labels.previous}
                    onClick={() => onPreviousPage?.()}
                    className={cn(
                      !checkpointState.hasPreviousPage &&
                        'pointer-events-none opacity-50 text-foreground',
                    )}
                    aria-label={labels.goToPrevious}
                    aria-disabled={!checkpointState.hasPreviousPage}
                  />
                </PaginationItem>

                <PaginationItem>
                  <PaginationNext
                    label={labels.next}
                    onClick={() => onNextPage?.()}
                    className={cn(
                      !checkpointState.hasNextPage &&
                        'pointer-events-none opacity-50 text-foreground',
                    )}
                    aria-label={labels.goToNext}
                    aria-disabled={!checkpointState.hasNextPage}
                  />
                </PaginationItem>
              </>
            ) : null}
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
