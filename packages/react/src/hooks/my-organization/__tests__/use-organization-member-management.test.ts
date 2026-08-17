import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import * as useMemberManagementServiceModule from '@/hooks/my-organization/shared/services/use-member-management-service';
import { useOrganizationMemberManagement } from '@/hooks/my-organization/use-organization-member-management';
import * as useErrorHandlerModule from '@/hooks/shared/use-error-handler';
import * as useTranslatorModule from '@/hooks/shared/use-translator';
import {
  createMockPendingInvitation,
  createMockRoles,
} from '@/tests/utils/__mocks__/my-organization/member-management/invitation.mocks';
import { createQueryClientWrapper } from '@/tests/utils/test-provider';
import { setupMockUseTranslator, setupMockUseErrorHandler } from '@/tests/utils/test-utilities';
import type {
  MemberManagementServiceResult,
  UseOrganizationMemberManagementOptions,
} from '@/types/my-organization/member-management/organization-member-management-types';

vi.mock('@/hooks/my-organization/shared/services/use-member-management-service', async () => {
  const actual = await vi.importActual(
    '@/hooks/my-organization/shared/services/use-member-management-service',
  );
  return {
    ...actual,
    useMemberManagementService: vi.fn(),
  };
});

const idleQuery = {
  data: undefined,
  isLoading: false,
  isFetching: false,
  isError: false,
  isSuccess: false,
  error: null,
};

const idleMutation = { mutate: vi.fn(), mutateAsync: vi.fn(), isPending: false };

const makeMockService = (overrides?: Record<string, unknown>) =>
  ({
    providersQuery: { ...idleQuery, data: [] },
    userStoresQuery: { ...idleQuery, data: [] },
    invitationRolesQuery: { ...idleQuery, data: [] },
    rolesSearchQuery: { ...idleQuery, data: [] },
    setRoleSearchTerm: vi.fn(),
    enableRoleSearch: vi.fn(),
    invitationsQuery: { ...idleQuery, data: { invitations: [], next: null }, dataUpdatedAt: 0 },
    membersQuery: { ...idleQuery, data: { members: [], next: null }, dataUpdatedAt: 0 },
    organizationQuery: { ...idleQuery, data: { display_name: 'Test Org' } },
    createInvitationMutation: idleMutation,
    revokeInvitationMutation: idleMutation,
    resendInvitationMutation: idleMutation,
    assignRolesMutation: idleMutation,
    removeFromOrganizationMutation: idleMutation,
    fetchInvitationDetails: vi.fn().mockResolvedValue(createMockPendingInvitation()),
    ...overrides,
  }) as unknown as MemberManagementServiceResult;

const createDefaultOptions = (
  overrides?: Partial<UseOrganizationMemberManagementOptions>,
): UseOrganizationMemberManagementOptions => ({
  customMessages: {},
  readOnly: false,
  ...overrides,
});

const render = (options: UseOrganizationMemberManagementOptions = createDefaultOptions()) => {
  const { wrapper } = createQueryClientWrapper();
  return renderHook(() => useOrganizationMemberManagement(options), { wrapper });
};

const mockedUseMemberManagementService = vi.mocked(
  useMemberManagementServiceModule.useMemberManagementService,
);

describe('useOrganizationMemberManagement', () => {
  let mockHandleError: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    setupMockUseTranslator(useTranslatorModule);
    mockHandleError = setupMockUseErrorHandler(useErrorHandlerModule);
    mockedUseMemberManagementService.mockReturnValue(makeMockService());
  });

  describe('invitation roles', () => {
    it('should not request invitation roles while no details modal is open', () => {
      render();

      expect(mockedUseMemberManagementService).toHaveBeenCalledWith(
        expect.objectContaining({ invitationRolesId: null }),
      );
    });

    it('should request roles for the invitation shown in the details modal', async () => {
      const invitation = createMockPendingInvitation({ id: 'uinv_1' });
      mockedUseMemberManagementService.mockReturnValue(
        makeMockService({ fetchInvitationDetails: vi.fn().mockResolvedValue(invitation) }),
      );

      const { result } = render();

      await act(async () => {
        await result.current.openModal({ type: 'details', invitation });
      });

      await waitFor(() => {
        expect(mockedUseMemberManagementService).toHaveBeenLastCalledWith(
          expect.objectContaining({ invitationRolesId: 'uinv_1' }),
        );
      });
    });

    it('should expose the fetched roles and their loading state', () => {
      const roles = createMockRoles();
      mockedUseMemberManagementService.mockReturnValue(
        makeMockService({
          invitationRolesQuery: { ...idleQuery, data: roles, isSuccess: true },
        }),
      );

      const { result } = render();

      expect(result.current.invitationRoles).toEqual(roles);
      expect(result.current.isFetchingInvitationRoles).toBe(false);
    });

    it('should report loading while the roles request is in flight', () => {
      mockedUseMemberManagementService.mockReturnValue(
        makeMockService({
          invitationRolesQuery: { ...idleQuery, isLoading: true },
        }),
      );

      const { result } = render();

      expect(result.current.invitationRoles).toEqual([]);
      expect(result.current.isFetchingInvitationRoles).toBe(true);
    });

    it('should default to an empty list when the query has no data', () => {
      mockedUseMemberManagementService.mockReturnValue(
        makeMockService({ invitationRolesQuery: { ...idleQuery, data: undefined } }),
      );

      const { result } = render();

      expect(result.current.invitationRoles).toEqual([]);
    });
  });

  describe('invitation roles error handling', () => {
    it('should surface a single error when the roles request fails', () => {
      const error = new Error('boom');
      mockedUseMemberManagementService.mockReturnValue(
        makeMockService({
          invitationRolesQuery: { ...idleQuery, isError: true, error },
        }),
      );

      const { rerender } = render();
      rerender();

      expect(mockHandleError).toHaveBeenCalledTimes(1);
      expect(mockHandleError).toHaveBeenCalledWith(error, {
        fallbackMessage: 'invitation.error.fetch_roles_failed',
      });
    });

    it('should not report an error when the roles request succeeds', () => {
      mockedUseMemberManagementService.mockReturnValue(
        makeMockService({
          invitationRolesQuery: { ...idleQuery, data: createMockRoles(), isSuccess: true },
        }),
      );

      render();

      expect(mockHandleError).not.toHaveBeenCalled();
    });

    it('should report again after the query recovers and fails a second time', () => {
      const firstError = new Error('first');
      mockedUseMemberManagementService.mockReturnValue(
        makeMockService({
          invitationRolesQuery: { ...idleQuery, isError: true, error: firstError },
        }),
      );

      const { rerender } = render();
      expect(mockHandleError).toHaveBeenCalledTimes(1);

      // Recovery clears the one-shot guard.
      mockedUseMemberManagementService.mockReturnValue(
        makeMockService({
          invitationRolesQuery: { ...idleQuery, data: createMockRoles(), isSuccess: true },
        }),
      );
      rerender();
      expect(mockHandleError).toHaveBeenCalledTimes(1);

      const secondError = new Error('second');
      mockedUseMemberManagementService.mockReturnValue(
        makeMockService({
          invitationRolesQuery: { ...idleQuery, isError: true, error: secondError },
        }),
      );
      rerender();

      expect(mockHandleError).toHaveBeenCalledTimes(2);
      expect(mockHandleError).toHaveBeenLastCalledWith(secondError, {
        fallbackMessage: 'invitation.error.fetch_roles_failed',
      });
    });
  });
});
