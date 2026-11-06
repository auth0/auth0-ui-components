import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useOrganizationTableService } from '@/hooks/my-account/shared/services/use-organization-table-service';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import * as useErrorHandlerModule from '@/hooks/shared/use-error-handler';
import * as useTranslatorModule from '@/hooks/shared/use-translator';
import {
  createMockUserOrganizations,
  createMockUserOrganizationsPage,
} from '@/tests/utils/__mocks__/my-account/organization-management/organization-table.mocks';
import { createQueryClientWrapper } from '@/tests/utils/test-provider';
import { mockCore } from '@/tests/utils/test-setup';
import { setupMockUseErrorHandler, setupMockUseTranslator } from '@/tests/utils/test-utilities';

const { initMockCoreClient } = mockCore();

describe('useOrganizationTableService', () => {
  let mockCoreClient: ReturnType<typeof initMockCoreClient>;
  let listOrganizations: ReturnType<typeof vi.fn>;
  let mockHandleError: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockCoreClient = initMockCoreClient();
    listOrganizations = mockCoreClient.getMyAccountApiClient().organizations.list as ReturnType<
      typeof vi.fn
    >;
    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
      coreClient: mockCoreClient,
    });
    setupMockUseTranslator(useTranslatorModule);
    mockHandleError = setupMockUseErrorHandler(useErrorHandlerModule);
  });

  const render = (options: Parameters<typeof useOrganizationTableService>[0] = {}) => {
    const { wrapper } = createQueryClientWrapper();
    return renderHook(() => useOrganizationTableService(options), { wrapper });
  };

  describe('when the list loads', () => {
    it('returns the organizations and the next token', async () => {
      const organizations = createMockUserOrganizations();
      listOrganizations.mockResolvedValue(createMockUserOrganizationsPage(organizations, 'next_1'));

      const { result } = render();

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.organizations).toEqual(organizations);
      expect(result.current.nextToken).toBe('next_1');
      expect(result.current.isError).toBe(false);
    });

    it('passes the page size and cursor to the API', async () => {
      listOrganizations.mockResolvedValue(createMockUserOrganizationsPage([]));

      const { result } = render({ paginationParams: { pageSize: 25, fromToken: 'cursor_2' } });

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(listOrganizations).toHaveBeenCalledWith({ take: 25, from: 'cursor_2' });
    });

    it('returns no next token on the last page', async () => {
      listOrganizations.mockResolvedValue(createMockUserOrganizationsPage([]));

      const { result } = render();

      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.organizations).toEqual([]);
      expect(result.current.nextToken).toBeNull();
    });
  });

  describe('while another page loads', () => {
    it('keeps the previous page and reports a fetch, not a first load', async () => {
      const firstPage = createMockUserOrganizations();
      listOrganizations
        .mockResolvedValueOnce(createMockUserOrganizationsPage(firstPage, 'next_1'))
        .mockReturnValueOnce(new Promise(() => {}));
      const { wrapper } = createQueryClientWrapper();
      const initialProps: Parameters<typeof useOrganizationTableService>[0] = {};
      const { result, rerender } = renderHook(
        (options: Parameters<typeof useOrganizationTableService>[0]) =>
          useOrganizationTableService(options),
        { wrapper, initialProps },
      );
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      rerender({ paginationParams: { fromToken: 'next_1' } });

      await waitFor(() => expect(result.current.isFetching).toBe(true));
      expect(result.current.isLoading).toBe(false);
      expect(result.current.organizations).toEqual(firstPage);
    });
  });

  describe('when a refresh fails', () => {
    const loadFirstPage = async () => {
      const view = render();
      await waitFor(() => expect(view.result.current.isLoading).toBe(false));
      return view;
    };

    it('reports the error and keeps the rows that were loaded', async () => {
      const error = new Error('Network error');
      listOrganizations
        .mockResolvedValueOnce(createMockUserOrganizationsPage(createMockUserOrganizations()))
        .mockRejectedValueOnce(error);
      const { result } = await loadFirstPage();

      act(() => {
        result.current.refetch();
      });

      await waitFor(() =>
        expect(mockHandleError).toHaveBeenCalledWith(error, { fallbackMessage: 'error.generic' }),
      );
      expect(result.current.organizations).toHaveLength(3);
    });

    it('reports each failed refresh, not only the first', async () => {
      const firstError = new Error('First failure');
      const secondError = new Error('Second failure');
      listOrganizations
        .mockResolvedValueOnce(createMockUserOrganizationsPage(createMockUserOrganizations()))
        .mockRejectedValueOnce(firstError)
        // Delayed like a real request: an instant rejection never renders the in-flight state.
        .mockImplementationOnce(
          () => new Promise((_, reject) => setTimeout(() => reject(secondError), 20)),
        );
      const { result } = await loadFirstPage();

      act(() => {
        result.current.refetch();
      });
      await waitFor(() => expect(mockHandleError).toHaveBeenCalledTimes(1));

      act(() => {
        result.current.refetch();
      });
      await waitFor(() => expect(mockHandleError).toHaveBeenCalledTimes(2));
      expect(mockHandleError).toHaveBeenLastCalledWith(secondError, {
        fallbackMessage: 'error.generic',
      });
    });
  });

  describe('when the list fails to load', () => {
    it('reports the error without data', async () => {
      listOrganizations.mockRejectedValue(new Error('Network error'));

      const { result } = render();

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.organizations).toEqual([]);
    });

    it('leaves it to the error card, with no toast, when there are no rows to keep', async () => {
      listOrganizations.mockRejectedValue(new Error('Network error'));

      const { result } = render();

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(mockHandleError).not.toHaveBeenCalled();
    });
  });
});
