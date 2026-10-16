import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { useConnectionGroupDetailService } from '@/hooks/my-organization/shared/services/use-connection-group-detail-service';
import { connectionGroupQueryKeys } from '@/hooks/my-organization/shared/services/use-connection-group-table-service';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import { createMockAvailableRoles } from '@/tests/utils/__mocks__/my-organization/member-management/member.mocks';
import { createQueryClientWrapper } from '@/tests/utils/test-provider';
import { mockCore } from '@/tests/utils/test-setup';

const { initMockCoreClient } = mockCore();

const GROUP_ID = 'grp_engineering';

const ALL_ENABLED = { canViewRoles: true, canAssignRoles: true };

function renderService(
  groupId = GROUP_ID,
  withClient = true,
  options: { canViewRoles: boolean; canAssignRoles: boolean } = ALL_ENABLED,
) {
  const mockCoreClient = initMockCoreClient();
  const availableRoles = createMockAvailableRoles();
  const apiService = mockCoreClient.getMyOrganizationApiClient();
  (apiService.organization.roles.list as ReturnType<typeof vi.fn>).mockResolvedValue({
    data: availableRoles,
  });

  vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
    coreClient: withClient ? mockCoreClient : null,
  });

  const { wrapper, queryClient } = createQueryClientWrapper();
  const hookResult = renderHook(() => useConnectionGroupDetailService(groupId, options), {
    wrapper,
  });
  return { ...hookResult, queryClient, apiService, availableRoles };
}

describe('useConnectionGroupDetailService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('connectionGroupQueryKeys', () => {
    it('builds a roles key scoped by group id under the shared root', () => {
      expect(connectionGroupQueryKeys.roles('g1')).toEqual(['connection-groups', 'roles', 'g1']);
    });
  });

  describe('stub queries', () => {
    it('resolves the group roles query to an empty array', async () => {
      const { result, queryClient } = renderService();

      await waitFor(() => expect(result.current.rolesQuery.isSuccess).toBe(true));
      expect(result.current.rolesQuery.data).toEqual([]);
      expect(queryClient.getQueryState(connectionGroupQueryKeys.roles(GROUP_ID))).toBeDefined();
    });

    it('does not run queries without a core client', () => {
      const { result } = renderService(GROUP_ID, false);

      expect(result.current.rolesQuery.fetchStatus).toBe('idle');
      expect(result.current.availableRolesQuery.fetchStatus).toBe('idle');
    });
  });

  describe('available roles', () => {
    it('loads available roles from organization.roles.list once search is enabled', async () => {
      const { result, apiService, availableRoles } = renderService();
      expect(result.current.availableRolesQuery.fetchStatus).toBe('idle');
      act(() => result.current.enableRoleSearch());

      await waitFor(() => expect(result.current.availableRolesQuery.data).toEqual(availableRoles));
      expect(apiService.organization.roles.list).toHaveBeenCalled();
    });

    it('passes the search term as a name filter', async () => {
      const { result, apiService } = renderService();
      act(() => {
        result.current.enableRoleSearch();
        result.current.setRoleSearchTerm('adm');
      });

      await waitFor(() =>
        expect(apiService.organization.roles.list).toHaveBeenCalledWith(
          expect.objectContaining({ name: 'adm' }),
        ),
      );
    });
  });

  describe('permission gating', () => {
    it('keeps the group roles query idle without canViewRoles', () => {
      const { result } = renderService(GROUP_ID, true, {
        canViewRoles: false,
        canAssignRoles: true,
      });
      expect(result.current.rolesQuery.fetchStatus).toBe('idle');
    });

    it('keeps the available roles query idle without canAssignRoles', () => {
      const { result, apiService } = renderService(GROUP_ID, true, {
        canViewRoles: true,
        canAssignRoles: false,
      });
      act(() => result.current.enableRoleSearch());
      expect(result.current.availableRolesQuery.fetchStatus).toBe('idle');
      expect(apiService.organization.roles.list).not.toHaveBeenCalled();
    });
  });

  describe('mutations', () => {
    it.each(['assignRolesMutation', 'removeRolesMutation'] as const)(
      '%s resolves and invalidates the roles and list keys',
      async (name) => {
        const { result, queryClient } = renderService();
        const invalidate = vi.spyOn(queryClient, 'invalidateQueries');

        await act(async () => {
          await result.current[name].mutateAsync({ roleIds: ['rol_admin'] });
        });

        expect(invalidate).toHaveBeenCalledWith({
          queryKey: connectionGroupQueryKeys.roles(GROUP_ID),
        });
        expect(invalidate).toHaveBeenCalledWith({ queryKey: connectionGroupQueryKeys.list() });
      },
    );
  });
});
