import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useOrganizationTable } from '../use-organization-table';

import { useOrganizationTableService } from '@/hooks/my-account/shared/services/use-organization-table-service';
import { DEFAULT_PAGE_SIZE_OPTIONS } from '@/lib/constants/shared/constants';
import { createMockUserOrganizations } from '@/tests/utils/__mocks__/my-account/organization-management/organization-table.mocks';
import type { UseOrganizationTableServiceResult } from '@/types/my-account/organization-management/organization-table-types';

vi.mock('@/hooks/my-account/shared/services/use-organization-table-service', () => ({
  useOrganizationTableService: vi.fn(),
}));

const mockUseOrganizationTableService = vi.mocked(useOrganizationTableService);

const createServiceResult = (
  overrides: Partial<UseOrganizationTableServiceResult> = {},
): UseOrganizationTableServiceResult => ({
  organizations: createMockUserOrganizations(),
  nextToken: null,
  isFetching: false,
  isRefetching: false,
  isStale: false,
  isError: false,
  updatedAt: 0,
  refetch: vi.fn(),
  ...overrides,
});

const lastPaginationParams = () =>
  mockUseOrganizationTableService.mock.lastCall?.[0]?.paginationParams;

describe('useOrganizationTable', () => {
  beforeEach(() => {
    mockUseOrganizationTableService.mockReturnValue(createServiceResult());
  });

  describe('on first render', () => {
    it('requests the first page with the default page size', () => {
      const { result } = renderHook(() => useOrganizationTable());

      expect(lastPaginationParams()).toEqual({
        pageSize: DEFAULT_PAGE_SIZE_OPTIONS[0],
        fromToken: undefined,
      });
      expect(result.current.pagination).toEqual({
        pageSize: DEFAULT_PAGE_SIZE_OPTIONS[0],
        currentPage: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    });

    it('passes the service state through without the next token', () => {
      const { result } = renderHook(() => useOrganizationTable());

      expect(result.current.organizations).toHaveLength(3);
      expect(result.current).not.toHaveProperty('nextToken');
    });
  });

  describe('when there is a next page', () => {
    beforeEach(() => {
      mockUseOrganizationTableService.mockReturnValue(createServiceResult({ nextToken: 'next_1' }));
    });

    it('moves to it with the next token', () => {
      const { result } = renderHook(() => useOrganizationTable());

      expect(result.current.pagination.hasNextPage).toBe(true);

      act(() => result.current.handleNextPage());

      expect(lastPaginationParams()?.fromToken).toBe('next_1');
      expect(result.current.pagination.currentPage).toBe(2);
      expect(result.current.pagination.hasPreviousPage).toBe(true);
    });

    it('goes back to the first page', () => {
      const { result } = renderHook(() => useOrganizationTable());

      act(() => result.current.handleNextPage());
      act(() => result.current.handlePreviousPage());

      expect(lastPaginationParams()?.fromToken).toBeUndefined();
      expect(result.current.pagination.currentPage).toBe(1);
    });
  });

  describe('when there is no next page', () => {
    it('stays on the current page', () => {
      const { result } = renderHook(() => useOrganizationTable());

      act(() => result.current.handleNextPage());

      expect(result.current.pagination.currentPage).toBe(1);
      expect(lastPaginationParams()?.fromToken).toBeUndefined();
    });
  });

  describe('when the page size changes', () => {
    it('requests the first page with the new size', () => {
      mockUseOrganizationTableService.mockReturnValue(createServiceResult({ nextToken: 'next_1' }));
      const { result } = renderHook(() => useOrganizationTable());

      act(() => result.current.handleNextPage());
      act(() => result.current.handlePageSizeChange(25));

      expect(lastPaginationParams()).toEqual({
        pageSize: 25,
        fromToken: undefined,
      });
      expect(result.current.pagination.currentPage).toBe(1);
    });
  });
});
