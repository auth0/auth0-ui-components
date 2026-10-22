import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useOrganizationTableService } from '@/hooks/my-account/shared/services/use-organization-table-service';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import {
  createMockUserOrganizations,
  createMockUserOrganizationsPage,
} from '@/tests/utils/__mocks__/my-account/organization-management/organization-table.mocks';
import { createQueryClientWrapper } from '@/tests/utils/test-provider';
import { mockCore } from '@/tests/utils/test-setup';

const { initMockCoreClient } = mockCore();

describe('useOrganizationTableService', () => {
  let mockCoreClient: ReturnType<typeof initMockCoreClient>;
  let listOrganizations: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockCoreClient = initMockCoreClient();
    listOrganizations = mockCoreClient.getMyAccountApiClient().organizations.list as ReturnType<
      typeof vi.fn
    >;
    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
      coreClient: mockCoreClient,
    });
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

      await waitFor(() => expect(result.current.isFetching).toBe(false));
      expect(result.current.organizations).toEqual(organizations);
      expect(result.current.nextToken).toBe('next_1');
      expect(result.current.isError).toBe(false);
    });

    it('passes the page size and cursor to the API', async () => {
      listOrganizations.mockResolvedValue(createMockUserOrganizationsPage([]));

      const { result } = render({ paginationParams: { pageSize: 25, fromToken: 'cursor_2' } });

      await waitFor(() => expect(result.current.isFetching).toBe(false));
      expect(listOrganizations).toHaveBeenCalledWith({ take: 25, from: 'cursor_2' });
    });

    it('returns no next token on the last page', async () => {
      listOrganizations.mockResolvedValue(createMockUserOrganizationsPage([]));

      const { result } = render();

      await waitFor(() => expect(result.current.isFetching).toBe(false));
      expect(result.current.organizations).toEqual([]);
      expect(result.current.nextToken).toBeNull();
    });
  });

  describe('when the list fails to load', () => {
    it('reports the error without data', async () => {
      listOrganizations.mockRejectedValue(new Error('Network error'));

      const { result } = render();

      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.organizations).toEqual([]);
    });
  });
});
