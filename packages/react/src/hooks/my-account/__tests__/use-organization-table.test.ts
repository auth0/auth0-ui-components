import { userOrganizationQueryKeys } from '@auth0/universal-components-core';
import { act, renderHook } from '@testing-library/react';
import { createElement, type PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useOrganizationTable } from '../use-organization-table';

import { useOrganizationTableService } from '@/hooks/my-account/shared/services/use-organization-table-service';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import { DEFAULT_PAGE_SIZE_OPTIONS } from '@/lib/constants/shared/constants';
import { PermissionContext } from '@/providers/permission-provider';
import { createMockUserOrganizations } from '@/tests/utils/__mocks__/my-account/organization-management/organization-table.mocks';
import { createMockUseConfig } from '@/tests/utils/__mocks__/my-organization/config/config.mocks';
import { createTestQueryClientWrapper } from '@/tests/utils/test-provider';
import { mockCore, mockToast } from '@/tests/utils/test-setup';
import type {
  UseOrganizationTableOptions,
  UseOrganizationTableServiceResult,
} from '@/types/my-account/organization-management/organization-table-types';

vi.mock('@/hooks/my-account/shared/services/use-organization-table-service', () => ({
  useOrganizationTableService: vi.fn(),
}));

const mockUseConfig = vi.fn(() => createMockUseConfig());
vi.mock('@/hooks/my-organization/shared/services/use-config-service', () => ({
  useConfig: () => mockUseConfig(),
}));

const mockUseOrganizationTableService = vi.mocked(useOrganizationTableService);
const { initMockCoreClient } = mockCore();
mockToast();

const renderTableHook = (
  options?: UseOrganizationTableOptions,
  {
    queryClient,
    permissions = [],
  }: {
    queryClient?: ReturnType<typeof createTestQueryClientWrapper>['queryClient'];
    permissions?: string[];
  } = {},
) => {
  const { wrapper: QueryWrapper, queryClient: client } = createTestQueryClientWrapper(queryClient);
  const wrapper = ({ children }: PropsWithChildren) =>
    createElement(
      QueryWrapper,
      null,
      createElement(
        PermissionContext.Provider,
        { value: { permissions, isLoading: false } },
        children,
      ),
    );
  return { ...renderHook(() => useOrganizationTable(options), { wrapper }), queryClient: client };
};

const createServiceResult = (
  overrides: Partial<UseOrganizationTableServiceResult> = {},
): UseOrganizationTableServiceResult => ({
  organizations: createMockUserOrganizations(),
  nextToken: null,
  isLoading: false,
  isFetching: false,
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
    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
      coreClient: initMockCoreClient(),
    });
  });

  describe('on first render', () => {
    it('requests the first page with the default page size', () => {
      const { result } = renderTableHook();

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
      const { result } = renderTableHook();

      expect(result.current.organizations).toHaveLength(3);
      expect(result.current).not.toHaveProperty('nextToken');
    });
  });

  describe('when there is a next page', () => {
    beforeEach(() => {
      mockUseOrganizationTableService.mockReturnValue(createServiceResult({ nextToken: 'next_1' }));
    });

    it('moves to it with the next token', () => {
      const { result } = renderTableHook();

      expect(result.current.pagination.hasNextPage).toBe(true);

      act(() => result.current.handleNextPage());

      expect(lastPaginationParams()?.fromToken).toBe('next_1');
      expect(result.current.pagination.currentPage).toBe(2);
      expect(result.current.pagination.hasPreviousPage).toBe(true);
    });

    it('goes back to the first page', () => {
      const { result } = renderTableHook();

      act(() => result.current.handleNextPage());
      act(() => result.current.handlePreviousPage());

      expect(lastPaginationParams()?.fromToken).toBeUndefined();
      expect(result.current.pagination.currentPage).toBe(1);
    });
  });

  describe('when there is no next page', () => {
    it('stays on the current page', () => {
      const { result } = renderTableHook();

      act(() => result.current.handleNextPage());

      expect(result.current.pagination.currentPage).toBe(1);
      expect(lastPaginationParams()?.fromToken).toBeUndefined();
    });
  });

  describe('while another page is loading', () => {
    // The real service keeps showing the previous page (and its next token) until the new one arrives.
    beforeEach(() => {
      mockUseOrganizationTableService.mockImplementation(({ paginationParams } = {}) =>
        createServiceResult({
          nextToken: 'next_1',
          isFetching: paginationParams?.fromToken === 'next_1',
        }),
      );
    });

    it('ignores a second Next click, so the page count and history stay correct', () => {
      const { result } = renderTableHook();

      act(() => result.current.handleNextPage());
      act(() => result.current.handleNextPage());

      expect(result.current.pagination.currentPage).toBe(2);
      expect(lastPaginationParams()?.fromToken).toBe('next_1');
    });

    it('disables Next until the page has loaded', () => {
      const { result } = renderTableHook();

      act(() => result.current.handleNextPage());

      expect(result.current.pagination.hasNextPage).toBe(false);
    });
  });

  describe('when the page size changes', () => {
    it('requests the first page with the new size', () => {
      mockUseOrganizationTableService.mockReturnValue(createServiceResult({ nextToken: 'next_1' }));
      const { result } = renderTableHook();

      act(() => result.current.handleNextPage());
      act(() => result.current.handlePageSizeChange(25));

      expect(lastPaginationParams()).toEqual({
        pageSize: 25,
        fromToken: undefined,
      });
      expect(result.current.pagination.currentPage).toBe(1);
    });
  });

  describe('when the signed-in organization is deleted', () => {
    it('removes it from every cached list of the user organizations', async () => {
      const mockCoreClient = initMockCoreClient();
      vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
        coreClient: mockCoreClient,
      });
      const [acme, fabrikam] = createMockUserOrganizations();
      const { queryClient } = createTestQueryClientWrapper();
      const tableKey = userOrganizationQueryKeys.list({ pageSize: 10 });
      // The switcher keeps its pages under the same prefix.
      const switcherKey = [...userOrganizationQueryKeys.all, 'infinite', { pageSize: 10 }];
      queryClient.setQueryData(tableKey, { organizations: [acme, fabrikam], next: null });
      queryClient.setQueryData(switcherKey, {
        pages: [{ organizations: [acme, fabrikam] }],
        pageParams: [undefined],
      });

      const { result } = renderTableHook(
        { currentOrganizationId: acme!.id, deleteAction: {} },
        { queryClient, permissions: ['delete:my_org:organizations'] },
      );

      act(() => result.current.organizationDelete.open(acme!));
      await act(async () => {
        await expect(result.current.organizationDelete.confirm()).resolves.toBe(true);
      });

      expect(queryClient.getQueryData(tableKey)).toEqual({ organizations: [fabrikam], next: null });
      expect(queryClient.getQueryData(switcherKey)).toMatchObject({
        pages: [{ organizations: [fabrikam] }],
      });
    });

    it('disables delete while the configuration loads', () => {
      mockUseConfig.mockReturnValueOnce(createMockUseConfig({ isLoadingConfig: true }));
      const [acme] = createMockUserOrganizations();

      const { result } = renderTableHook(
        { currentOrganizationId: acme!.id, deleteAction: {} },
        { permissions: ['delete:my_org:organizations'] },
      );

      expect(result.current.organizationDelete.getState(acme!)).toBe('disabled');
    });

    it('disables delete when the deletion behavior does not permit it', () => {
      mockUseConfig.mockReturnValue(
        createMockUseConfig({ shouldAllowOrganizationDeletion: false }),
      );
      const [acme] = createMockUserOrganizations();

      const { result } = renderTableHook(
        { currentOrganizationId: acme!.id, deleteAction: {} },
        { permissions: ['delete:my_org:organizations'] },
      );

      expect(result.current.organizationDelete.getState(acme!)).toBe('disabled');
      mockUseConfig.mockImplementation(() => createMockUseConfig());
    });

    it('does not delete another organization even when asked directly', async () => {
      const mockCoreClient = initMockCoreClient();
      vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
        coreClient: mockCoreClient,
      });
      const [acme, fabrikam] = createMockUserOrganizations();

      const { result } = renderTableHook(
        { currentOrganizationId: acme!.id, deleteAction: {} },
        { permissions: ['delete:my_org:organizations'] },
      );

      act(() => result.current.organizationDelete.open(fabrikam!));

      expect(result.current.organizationDelete.target).toBeNull();
      await expect(result.current.organizationDelete.confirm()).resolves.toBe(false);
      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.delete,
      ).not.toHaveBeenCalled();
    });
  });
});
