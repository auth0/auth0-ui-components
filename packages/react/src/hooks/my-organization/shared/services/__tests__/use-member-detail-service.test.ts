import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { useMemberDetailService } from '@/hooks/my-organization/shared/services/use-member-detail-service';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import * as useTranslatorModule from '@/hooks/shared/use-translator';
import { createMockI18nService } from '@/tests/utils/__mocks__/core/i18n-service.mocks';
import {
  createMockMember,
  createMockMemberRoles,
  createMockMemberRole,
} from '@/tests/utils/__mocks__/my-organization/member-management/member.mocks';
import { createQueryClientWrapper } from '@/tests/utils/test-provider';
import { mockCore, mockToast } from '@/tests/utils/test-setup';
import type { UseMemberDetailServiceOptions } from '@/types/my-organization/member-management/organization-member-detail-types';

const { mockedShowToast } = mockToast();
const { initMockCoreClient } = mockCore();

const VALID_USER_ID = 'auth0|testuser123';

function createMockApiService(coreClient: ReturnType<typeof initMockCoreClient>) {
  const mockMember = createMockMember();
  const mockRoles = createMockMemberRoles();
  const apiService = coreClient.getMyOrganizationApiClient();

  (apiService.organization.members.get as ReturnType<typeof vi.fn>).mockResolvedValue(mockMember);
  (apiService.organization.members.roles.list as ReturnType<typeof vi.fn>).mockResolvedValue({
    data: mockRoles,
  });

  return { apiService, mockMember, mockRoles };
}

const createDefaultOptions = (
  overrides?: Partial<UseMemberDetailServiceOptions>,
): UseMemberDetailServiceOptions => ({
  userId: VALID_USER_ID,
  customMessages: {},
  ...overrides,
});

async function renderUseMemberDetailService(
  options: UseMemberDetailServiceOptions = createDefaultOptions(),
) {
  const mockCoreClient = initMockCoreClient();
  const { apiService, mockMember, mockRoles } = createMockApiService(mockCoreClient);

  vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
    coreClient: mockCoreClient,
  });
  vi.spyOn(useTranslatorModule, 'useTranslator').mockReturnValue({
    t: createMockI18nService().translator('member_management'),
    changeLanguage: vi.fn(),
    currentLanguage: 'en',
    fallbackLanguage: 'en',
  });

  const { wrapper, queryClient } = createQueryClientWrapper();
  const hookResult = renderHook(() => useMemberDetailService(options), { wrapper });

  return { ...hookResult, queryClient, mockCoreClient, apiService, mockMember, mockRoles };
}

describe('useMemberDetailService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading member data', () => {
    it('should fetch member on mount', async () => {
      const { result, apiService, mockMember } = await renderUseMemberDetailService();

      await waitFor(() => {
        expect(result.current.memberQuery.data).toEqual(mockMember);
      });

      expect(apiService.organization.members.get).toHaveBeenCalledWith(VALID_USER_ID);
    });

    it('should have no data before fetch completes', async () => {
      const { result } = await renderUseMemberDetailService();

      expect(result.current.memberQuery.data).toBeUndefined();
    });

    it('should not fetch when userId is empty', async () => {
      const { result } = await renderUseMemberDetailService(createDefaultOptions({ userId: '' }));

      expect(result.current.memberQuery.isFetching).toBe(false);
    });
  });

  describe('loading member roles', () => {
    it('should fetch member roles after member loads', async () => {
      const { result, apiService, mockRoles } = await renderUseMemberDetailService();

      await waitFor(() => {
        expect(result.current.memberRolesQuery.data).toEqual(mockRoles);
      });

      expect(apiService.organization.members.roles.list).toHaveBeenCalledWith(VALID_USER_ID);
    });

    it('should have no data before fetch completes', async () => {
      const { result } = await renderUseMemberDetailService();

      expect(result.current.memberRolesQuery.data).toBeUndefined();
    });

    it('should not fetch when userId is empty', async () => {
      const { result } = await renderUseMemberDetailService(createDefaultOptions({ userId: '' }));

      expect(result.current.memberRolesQuery.isFetching).toBe(false);
    });
  });

  describe('loading organization details', () => {
    it('should fetch organization details on mount', async () => {
      const { result, apiService } = await renderUseMemberDetailService();

      await waitFor(() => {
        expect(result.current.organizationQuery.isSuccess).toBe(true);
      });

      expect(apiService.organizationDetails.get).toHaveBeenCalled();
    });

    it('should have no data before fetch completes', async () => {
      const { result } = await renderUseMemberDetailService();

      expect(result.current.organizationQuery.data).toBeUndefined();
    });
  });

  describe('removing roles', () => {
    it('should unassign roles and show success toast', async () => {
      const roles = [createMockMemberRole({ id: 'rol_admin', name: 'Admin' })];
      const { result, apiService } = await renderUseMemberDetailService();

      await act(async () => {
        await result.current.removeRolesMutation.mutateAsync(roles);
      });

      expect(apiService.organization.members.roles.unassignLegacy).toHaveBeenCalledWith(
        VALID_USER_ID,
        {
          role_ids: ['rol_admin'],
        },
      );
      expect(mockedShowToast).toHaveBeenCalledWith(expect.objectContaining({ type: 'success' }));
    });

    it('should show plural success message when removing multiple roles', async () => {
      const roles = createMockMemberRoles();
      const { result } = await renderUseMemberDetailService();

      await act(async () => {
        await result.current.removeRolesMutation.mutateAsync(roles);
      });

      expect(mockedShowToast).toHaveBeenCalledWith(expect.objectContaining({ type: 'success' }));
    });

    it('should cancel when onBefore returns false', async () => {
      const onBefore = vi.fn().mockReturnValue(false);
      const roles = [createMockMemberRole()];
      const { result, apiService } = await renderUseMemberDetailService(
        createDefaultOptions({ removeRolesAction: { onBefore } }),
      );

      await act(async () => {
        await result.current.removeRolesMutation.mutateAsync(roles).catch(() => {});
      });

      expect(onBefore).toHaveBeenCalledWith({ userId: VALID_USER_ID, roleIds: ['rol_abc123'] });
      expect(apiService.organization.members.roles.unassignLegacy).not.toHaveBeenCalled();
    });

    it('should call onAfter on success', async () => {
      const onAfter = vi.fn();
      const roles = [createMockMemberRole()];
      const { result } = await renderUseMemberDetailService(
        createDefaultOptions({ removeRolesAction: { onAfter } }),
      );

      await act(async () => {
        await result.current.removeRolesMutation.mutateAsync(roles);
      });

      expect(onAfter).toHaveBeenCalled();
    });

    it('should show error toast on API failure', async () => {
      const roles = [createMockMemberRole()];
      const { result, apiService } = await renderUseMemberDetailService();
      (
        apiService.organization.members.roles.unassignLegacy as ReturnType<typeof vi.fn>
      ).mockRejectedValue(new Error('Remove failed'));

      await act(async () => {
        await result.current.removeRolesMutation.mutateAsync(roles).catch(() => {});
      });

      expect(mockedShowToast).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
    });

    it('should return aborted when role count exceeds MAX_ROLES_PER_REQUEST', async () => {
      const manyRoles = Array.from({ length: 51 }, (_, i) =>
        createMockMemberRole({ id: `rol_${i}`, name: `Role ${i}` }),
      );
      const { result, apiService } = await renderUseMemberDetailService();

      let returnValue: { aborted: boolean } | undefined;
      await act(async () => {
        returnValue = await result.current.removeRolesMutation.mutateAsync(manyRoles);
      });

      expect(returnValue?.aborted).toBe(true);
      expect(apiService.organization.members.roles.unassignLegacy).not.toHaveBeenCalled();
    });
  });
});
