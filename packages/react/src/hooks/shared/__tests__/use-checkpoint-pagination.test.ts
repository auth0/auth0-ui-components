import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { useCheckpointPagination } from '@/hooks/shared/use-checkpoint-pagination';
import type { CheckpointPaginationOptions } from '@/hooks/shared/use-checkpoint-pagination';

interface TestFilter {
  roleId?: string;
  searchQuery?: string;
}

const renderPagination = (options?: CheckpointPaginationOptions<TestFilter>) =>
  renderHook(() => useCheckpointPagination<TestFilter>(options));

describe('useCheckpointPagination', () => {
  describe('Initial State', () => {
    it('should initialize with default values', () => {
      const { result } = renderPagination();

      expect(result.current.pageSize).toBe(10);
      expect(result.current.currentPage).toBe(1);
      expect(result.current.fromToken).toBeUndefined();
      expect(result.current.hasPreviousPage).toBe(false);
      expect(result.current.sortConfig).toEqual({ key: null, direction: 'asc' });
      expect(result.current.filters).toEqual({});
    });

    it('should initialize with custom defaults', () => {
      const { result } = renderPagination({
        defaultPageSize: 25,
        defaultSortConfig: { key: 'created_at', direction: 'desc' },
        defaultFilters: { roleId: 'role_admin' },
      });

      expect(result.current.pageSize).toBe(25);
      expect(result.current.sortConfig).toEqual({ key: 'created_at', direction: 'desc' });
      expect(result.current.filters).toEqual({ roleId: 'role_admin' });
    });
  });

  describe('goToNextPage', () => {
    it('should advance to the next page with a token', () => {
      const { result } = renderPagination();

      act(() => {
        result.current.goToNextPage('token_page2');
      });

      expect(result.current.currentPage).toBe(2);
      expect(result.current.fromToken).toBe('token_page2');
      expect(result.current.hasPreviousPage).toBe(true);
    });

    it('should track multiple page navigations', () => {
      const { result } = renderPagination();

      act(() => {
        result.current.goToNextPage('token_page2');
      });
      act(() => {
        result.current.goToNextPage('token_page3');
      });

      expect(result.current.currentPage).toBe(3);
      expect(result.current.fromToken).toBe('token_page3');
      expect(result.current.hasPreviousPage).toBe(true);
    });
  });

  describe('goToPreviousPage', () => {
    it('should go back to the previous page', () => {
      const { result } = renderPagination();

      act(() => {
        result.current.goToNextPage('token_page2');
      });
      act(() => {
        result.current.goToPreviousPage();
      });

      expect(result.current.currentPage).toBe(1);
      expect(result.current.fromToken).toBeUndefined();
      expect(result.current.hasPreviousPage).toBe(false);
    });

    it('should navigate back through multiple pages correctly', () => {
      const { result } = renderPagination();

      act(() => {
        result.current.goToNextPage('token_page2');
      });
      act(() => {
        result.current.goToNextPage('token_page3');
      });
      act(() => {
        result.current.goToPreviousPage();
      });

      expect(result.current.currentPage).toBe(2);
      expect(result.current.fromToken).toBe('token_page2');
      expect(result.current.hasPreviousPage).toBe(true);
    });

    it('should not go below page 1', () => {
      const { result } = renderPagination();

      act(() => {
        result.current.goToPreviousPage();
      });

      expect(result.current.currentPage).toBe(1);
    });
  });

  describe('changePageSize', () => {
    it('should update page size and reset pagination', () => {
      const { result } = renderPagination();

      act(() => {
        result.current.goToNextPage('token_page2');
      });
      act(() => {
        result.current.changePageSize(25);
      });

      expect(result.current.pageSize).toBe(25);
      expect(result.current.currentPage).toBe(1);
      expect(result.current.fromToken).toBeUndefined();
      expect(result.current.hasPreviousPage).toBe(false);
    });
  });

  describe('changeSortConfig', () => {
    it('should update sort config and reset pagination', () => {
      const { result } = renderPagination();

      act(() => {
        result.current.goToNextPage('token_page2');
      });
      act(() => {
        result.current.changeSortConfig({ key: 'created_at', direction: 'desc' });
      });

      expect(result.current.sortConfig).toEqual({ key: 'created_at', direction: 'desc' });
      expect(result.current.currentPage).toBe(1);
      expect(result.current.fromToken).toBeUndefined();
      expect(result.current.hasPreviousPage).toBe(false);
    });
  });

  describe('changeFilters', () => {
    it('should update filters with a direct value and reset pagination', () => {
      const { result } = renderPagination();

      act(() => {
        result.current.goToNextPage('token_page2');
      });
      act(() => {
        result.current.changeFilters({ roleId: 'role_admin' });
      });

      expect(result.current.filters).toEqual({ roleId: 'role_admin' });
      expect(result.current.currentPage).toBe(1);
      expect(result.current.fromToken).toBeUndefined();
    });

    it('should update filters with an updater function', () => {
      const { result } = renderPagination({
        defaultFilters: { searchQuery: 'test' },
      });

      act(() => {
        result.current.changeFilters((prev) => ({ ...prev, roleId: 'role_member' }));
      });

      expect(result.current.filters).toEqual({ searchQuery: 'test', roleId: 'role_member' });
    });
  });

  describe('reset', () => {
    it('should reset all state to defaults', () => {
      const { result } = renderPagination({
        defaultPageSize: 10,
        defaultSortConfig: { key: null, direction: 'asc' },
        defaultFilters: {},
      });

      act(() => {
        result.current.goToNextPage('token_page2');
        result.current.changePageSize(50);
      });
      act(() => {
        result.current.changeSortConfig({ key: 'created_at', direction: 'desc' });
      });
      act(() => {
        result.current.changeFilters({ roleId: 'role_admin' });
      });
      act(() => {
        result.current.reset();
      });

      expect(result.current.pageSize).toBe(10);
      expect(result.current.currentPage).toBe(1);
      expect(result.current.fromToken).toBeUndefined();
      expect(result.current.hasPreviousPage).toBe(false);
      expect(result.current.sortConfig).toEqual({ key: null, direction: 'asc' });
      expect(result.current.filters).toEqual({});
    });

    it('should reset to custom defaults when provided', () => {
      const { result } = renderPagination({
        defaultPageSize: 25,
        defaultSortConfig: { key: 'created_at', direction: 'desc' },
        defaultFilters: { roleId: 'role_admin' },
      });

      act(() => {
        result.current.changePageSize(50);
      });
      act(() => {
        result.current.changeSortConfig({ key: null, direction: 'asc' });
      });
      act(() => {
        result.current.changeFilters({});
      });
      act(() => {
        result.current.reset();
      });

      expect(result.current.pageSize).toBe(25);
      expect(result.current.sortConfig).toEqual({ key: 'created_at', direction: 'desc' });
      expect(result.current.filters).toEqual({ roleId: 'role_admin' });
    });
  });
});
