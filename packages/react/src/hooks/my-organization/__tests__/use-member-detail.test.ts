import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import * as useMemberDetailServiceModule from '@/hooks/my-organization/shared/services/use-member-detail-service';
import { useOrganizationMemberDetail } from '@/hooks/my-organization/use-member-detail';
import * as useErrorHandlerModule from '@/hooks/shared/use-error-handler';
import * as useTranslatorModule from '@/hooks/shared/use-translator';
import {
  setupMockUseTranslator,
  setupMockUseErrorHandler,
  createQueryClientWrapper,
} from '@/tests/utils';
import {
  createMockMember,
  createMockMemberRole,
  createMockMemberRoles,
} from '@/tests/utils/__mocks__/my-organization/member-management/member.mocks';
import {
  type MockService,
  makeMockService,
} from '@/tests/utils/__mocks__/my-organization/member-management/use-member-detail.mocks';
import type {
  MemberDetailServiceResult,
  UseOrganizationMemberDetailOptions,
} from '@/types/my-organization/member-management/organization-member-detail-types';

vi.mock('@/hooks/my-organization/shared/services/use-member-detail-service', async () => {
  const actual = await vi.importActual(
    '@/hooks/my-organization/shared/services/use-member-detail-service',
  );
  return {
    ...actual,
    useMemberDetailService: vi.fn(),
  };
});

let mockService: MockService;

const VALID_USER_ID = 'auth0|testuser123';

const createDefaultOptions = (
  overrides?: Partial<UseOrganizationMemberDetailOptions>,
): UseOrganizationMemberDetailOptions => ({
  userId: VALID_USER_ID,
  onBack: vi.fn(),
  customMessages: {},
  readOnly: false,
  ...overrides,
});

const render = (options: UseOrganizationMemberDetailOptions = createDefaultOptions()) => {
  const { wrapper } = createQueryClientWrapper();
  return renderHook(() => useOrganizationMemberDetail(options), { wrapper });
};

describe('useOrganizationMemberDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMockUseTranslator(useTranslatorModule);
    setupMockUseErrorHandler(useErrorHandlerModule);
    mockService = makeMockService();
    vi.mocked(useMemberDetailServiceModule.useMemberDetailService).mockReturnValue(
      mockService as unknown as MemberDetailServiceResult,
    );
  });

  describe('initial state', () => {
    it('should return member data from service', () => {
      const { result } = render();

      expect(result.current.member).toEqual(createMockMember());
    });

    it('should return null when member data is undefined', () => {
      vi.mocked(useMemberDetailServiceModule.useMemberDetailService).mockReturnValue({
        ...mockService,
        memberQuery: { ...mockService.memberQuery, data: undefined },
      } as unknown as MemberDetailServiceResult);

      const { result } = render();

      expect(result.current.member).toBeNull();
    });

    it('should return organization display name', () => {
      const { result } = render();

      expect(result.current.organizationDisplayName).toBe('Test Org');
    });

    it('should return empty string when organization data is missing', () => {
      vi.mocked(useMemberDetailServiceModule.useMemberDetailService).mockReturnValue({
        ...mockService,
        organizationQuery: { ...mockService.organizationQuery, data: undefined },
      } as unknown as MemberDetailServiceResult);

      const { result } = render();

      expect(result.current.organizationDisplayName).toBe('');
    });

    it('should start with details tab active', () => {
      const { result } = render();

      expect(result.current.activeTab).toBe('details');
    });

    it('should start with no modal open', () => {
      const { result } = render();

      expect(result.current.modalState).toEqual({ type: null });
    });

    it('should compute searchedRoles by filtering out assigned roles', () => {
      const memberRoles = [createMockMemberRole({ id: 'rol_admin' })];
      const searchResults = [...memberRoles, createMockMemberRole({ id: 'rol_member' })];
      vi.mocked(useMemberDetailServiceModule.useMemberDetailService).mockReturnValue({
        ...mockService,
        memberRolesQuery: { ...mockService.memberRolesQuery, data: memberRoles },
        rolesSearchQuery: { ...mockService.rolesSearchQuery, data: searchResults },
      } as unknown as MemberDetailServiceResult);

      const { result } = render();

      expect(result.current.searchedRoles).toEqual([createMockMemberRole({ id: 'rol_member' })]);
    });
  });

  describe('setActiveTab', () => {
    it('should update activeTab', () => {
      const { result } = render();

      act(() => {
        result.current.setActiveTab('roles');
      });

      expect(result.current.activeTab).toBe('roles');
    });
  });

  describe('openModal / closeModal', () => {
    it('should open removeFromOrganization modal', () => {
      const { result } = render();

      act(() => {
        result.current.openModal({ type: 'removeFromOrganization' });
      });

      expect(result.current.modalState).toEqual({ type: 'removeFromOrganization' });
    });

    it('should open assignRoles modal', () => {
      const { result } = render();

      act(() => {
        result.current.openModal({ type: 'assignRoles' });
      });

      expect(result.current.modalState).toEqual({ type: 'assignRoles' });
    });

    it('should enable role search when the assignRoles modal opens', () => {
      const { result } = render();

      expect(mockService.enableRoleSearch).not.toHaveBeenCalled();

      act(() => {
        result.current.openModal({ type: 'assignRoles' });
      });

      expect(mockService.enableRoleSearch).toHaveBeenCalled();
    });

    it('should open removeRoles modal with roles', () => {
      const roles = [createMockMemberRole()];
      const { result } = render();

      act(() => {
        result.current.openModal({ type: 'removeRoles', roles });
      });

      expect(result.current.modalState).toEqual({ type: 'removeRoles', roles });
    });

    it('should close modal', () => {
      const { result } = render();

      act(() => {
        result.current.openModal({ type: 'assignRoles' });
      });
      act(() => {
        result.current.closeModal();
      });

      expect(result.current.modalState).toEqual({ type: null });
    });

    it('should not open modal when readOnly is true', () => {
      const { result } = render(createDefaultOptions({ readOnly: true }));

      act(() => {
        result.current.openModal({ type: 'assignRoles' });
      });

      expect(result.current.modalState).toEqual({ type: null });
    });
  });

  describe('handleBack', () => {
    it('should call onBack', () => {
      const onBack = vi.fn();
      const { result } = render(createDefaultOptions({ onBack }));

      act(() => {
        result.current.handleBack();
      });

      expect(onBack).toHaveBeenCalledTimes(1);
    });

    it('should not throw when onBack is not provided', () => {
      const { result } = render(createDefaultOptions({ onBack: undefined }));

      expect(() => {
        act(() => {
          result.current.handleBack();
        });
      }).not.toThrow();
    });
  });

  describe('handleRemoveFromOrganizationConfirm', () => {
    it('should call removeFromOrganizationMutation.mutate with correct args', () => {
      const { result } = render();

      act(() => {
        result.current.handleRemoveFromOrganizationConfirm(
          'auth0|testuser123',
          'Test User',
          'Test Org',
        );
      });

      expect(mockService.removeFromOrganizationMutation.mutate).toHaveBeenCalledWith(
        { userId: 'auth0|testuser123', memberName: 'Test User', organizationName: 'Test Org' },
        expect.objectContaining({ onSuccess: expect.any(Function) }),
      );
    });

    it('should close modal and call onBack on success', () => {
      const onBack = vi.fn();
      vi.mocked(mockService.removeFromOrganizationMutation.mutate).mockImplementation(
        (_args, options) => (options?.onSuccess as (() => void) | undefined)?.(),
      );

      const { result } = render(createDefaultOptions({ onBack }));

      act(() => {
        result.current.openModal({ type: 'removeFromOrganization' });
      });
      act(() => {
        result.current.handleRemoveFromOrganizationConfirm(VALID_USER_ID);
      });

      expect(result.current.modalState).toEqual({ type: null });
      expect(onBack).toHaveBeenCalled();
    });
  });

  describe('handleAssignRolesSubmit', () => {
    it('should call assignRolesMutation.mutate with correct args', () => {
      const memberRoles = createMockMemberRoles();
      const { result } = render();

      act(() => {
        result.current.handleAssignRolesSubmit(['rol_admin'], memberRoles, VALID_USER_ID);
      });

      expect(mockService.assignRolesMutation.mutate).toHaveBeenCalledWith(
        { roleIds: ['rol_admin'], memberRoles, userId: VALID_USER_ID },
        expect.objectContaining({ onSuccess: expect.any(Function) }),
      );
    });

    it('should close modal on success when not aborted', () => {
      vi.mocked(mockService.assignRolesMutation.mutate).mockImplementation((_args, options) =>
        (options?.onSuccess as ((r: { aborted: boolean }) => void) | undefined)?.({
          aborted: false,
        }),
      );

      const { result } = render();

      act(() => {
        result.current.openModal({ type: 'assignRoles' });
        result.current.handleAssignRolesSubmit(['rol_admin'], [], VALID_USER_ID);
      });

      expect(result.current.modalState).toEqual({ type: null });
    });

    it('should not close modal when result is aborted', () => {
      vi.mocked(mockService.assignRolesMutation.mutate).mockImplementation((_args, options) =>
        (options?.onSuccess as ((r: { aborted: boolean }) => void) | undefined)?.({
          aborted: true,
        }),
      );

      const { result } = render();

      act(() => {
        result.current.openModal({ type: 'assignRoles' });
        result.current.handleAssignRolesSubmit(['rol_admin'], [], VALID_USER_ID);
      });

      expect(result.current.modalState).toEqual({ type: 'assignRoles' });
    });
  });

  describe('handleRemoveRolesConfirm', () => {
    it('should call removeRolesMutation.mutate with roles from modal state', () => {
      const roles = [createMockMemberRole()];
      const { result } = render();

      act(() => {
        result.current.openModal({ type: 'removeRoles', roles });
      });
      act(() => {
        result.current.handleRemoveRolesConfirm();
      });

      expect(mockService.removeRolesMutation.mutate).toHaveBeenCalledWith(
        roles,
        expect.objectContaining({ onSuccess: expect.any(Function) }),
      );
    });

    it('should clear selectedRoles and close modal on success when not aborted', () => {
      vi.mocked(mockService.removeRolesMutation.mutate).mockImplementation((_args, options) =>
        (options?.onSuccess as ((r: { aborted: boolean }) => void) | undefined)?.({
          aborted: false,
        }),
      );

      const roles = [createMockMemberRole()];
      const { result } = render();

      act(() => {
        result.current.setSelectedRoles(roles);
        result.current.openModal({ type: 'removeRoles', roles });
      });
      act(() => {
        result.current.handleRemoveRolesConfirm();
      });

      expect(result.current.selectedRoles).toEqual([]);
      expect(result.current.modalState).toEqual({ type: null });
    });

    it('should not fire when modal type is not removeRoles', () => {
      const { result } = render();

      act(() => {
        result.current.handleRemoveRolesConfirm();
      });

      expect(mockService.removeRolesMutation.mutate).not.toHaveBeenCalled();
    });
  });

  describe('handleRemoveRolesCancel', () => {
    it('should close the modal', () => {
      const { result } = render();

      act(() => {
        result.current.openModal({ type: 'removeRoles', roles: [createMockMemberRole()] });
        result.current.handleRemoveRolesCancel();
      });

      expect(result.current.modalState).toEqual({ type: null });
    });
  });

  describe('memberRolesQuery error handling', () => {
    it('should call handleError when memberRolesQuery errors', async () => {
      const handleError = vi.fn();
      setupMockUseErrorHandler(useErrorHandlerModule, handleError);

      const error = new Error('Failed to fetch roles');
      vi.mocked(useMemberDetailServiceModule.useMemberDetailService).mockReturnValue({
        ...mockService,
        memberRolesQuery: { ...mockService.memberRolesQuery, isError: true, error },
      } as unknown as MemberDetailServiceResult);

      render();

      await waitFor(() => {
        expect(handleError).toHaveBeenCalledWith(
          error,
          expect.objectContaining({ fallbackMessage: expect.any(String) }),
        );
      });
    });

    it('should not call handleError twice for same error', async () => {
      const handleError = vi.fn();
      setupMockUseErrorHandler(useErrorHandlerModule, handleError);

      const error = new Error('Failed to fetch roles');
      vi.mocked(useMemberDetailServiceModule.useMemberDetailService).mockReturnValue({
        ...mockService,
        memberRolesQuery: { ...mockService.memberRolesQuery, isError: true, error },
      } as unknown as MemberDetailServiceResult);

      render();

      await waitFor(() => {
        expect(handleError).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('memberError', () => {
    it('should return error message when memberQuery errors', () => {
      vi.mocked(useMemberDetailServiceModule.useMemberDetailService).mockReturnValue({
        ...mockService,
        memberQuery: { ...mockService.memberQuery, isError: true, error: new Error('Not found') },
      } as unknown as MemberDetailServiceResult);

      const { result } = render();

      expect(result.current.memberError).not.toBeNull();
    });

    it('should return null memberError when memberQuery succeeds', () => {
      const { result } = render();

      expect(result.current.memberError).toBeNull();
    });
  });
});
