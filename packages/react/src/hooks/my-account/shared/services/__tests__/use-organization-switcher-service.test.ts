import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { useOrganizationSwitcherService } from '@/hooks/my-account/shared/services/use-organization-switcher-service';
import { useOrganizationTableService } from '@/hooks/my-account/shared/services/use-organization-table-service';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import {
  createMockUserOrganizations,
  createMockUserOrganizationsPage,
} from '@/tests/utils/__mocks__/my-account/organization-management/organization-table.mocks';
import { createQueryClientWrapper } from '@/tests/utils/test-provider';
import { mockCore } from '@/tests/utils/test-setup';

const { initMockCoreClient } = mockCore();

describe('useOrganizationSwitcherService', () => {
  const organizations = createMockUserOrganizations();
  let listOrganizations: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    const mockCoreClient = initMockCoreClient();
    listOrganizations = mockCoreClient.getMyAccountApiClient().organizations.list as ReturnType<
      typeof vi.fn
    >;
    listOrganizations.mockResolvedValue(createMockUserOrganizationsPage(organizations));
    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
      coreClient: mockCoreClient,
    });
  });

  describe('when the organization table shows the same first page', () => {
    it('shares one request with it', async () => {
      const { wrapper } = createQueryClientWrapper();
      const { result } = renderHook(
        () => ({
          switcher: useOrganizationSwitcherService({ pageSize: 10 }),
          table: useOrganizationTableService({ paginationParams: { pageSize: 10 } }),
        }),
        { wrapper },
      );

      await waitFor(() => expect(result.current.switcher.organizations).toEqual(organizations));
      await waitFor(() => expect(result.current.table.organizations).toEqual(organizations));

      expect(listOrganizations).toHaveBeenCalledTimes(1);
    });
  });
});
