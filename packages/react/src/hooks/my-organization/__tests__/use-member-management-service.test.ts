import { memberManagementQueryKeys } from '@auth0/universal-components-core';
import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { useMemberManagementService } from '@/hooks/my-organization/shared/services/use-member-management-service';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import * as useTranslatorModule from '@/hooks/shared/use-translator';
import { createMockI18nService } from '@/tests/utils/__mocks__/core/i18n-service.mocks';
import { createMockInvitation } from '@/tests/utils/__mocks__/my-organization/member-management/invitation.mocks';
import { createTestQueryClientWrapper } from '@/tests/utils/test-provider';
import { mockCore, mockToast } from '@/tests/utils/test-setup';
import type { UseMemberManagementServiceOptions } from '@/types/my-organization/member-management/organization-member-management-types';

const { mockedShowToast } = mockToast();
const { initMockCoreClient } = mockCore();

const createDefaultOptions = (
  overrides?: Partial<UseMemberManagementServiceOptions>,
): UseMemberManagementServiceOptions => ({
  customMessages: {},
  activeTab: 'invitations',
  invitationParams: {
    pageSize: 10,
    fromToken: undefined,
    sortConfig: { key: null, direction: 'asc' },
    filters: {},
  },
  memberParams: {
    pageSize: 10,
    fromToken: undefined,
    sortConfig: { key: null, direction: 'asc' },
    filters: {},
  },
  ...overrides,
});

const renderService = (options: UseMemberManagementServiceOptions) => {
  const { wrapper, queryClient } = createTestQueryClientWrapper();
  return {
    queryClient,
    ...renderHook(() => useMemberManagementService(options), { wrapper }),
  };
};

describe('useMemberManagementService', () => {
  let mockCoreClient: ReturnType<typeof initMockCoreClient>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCoreClient = initMockCoreClient();

    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
      coreClient: mockCoreClient,
    });

    vi.spyOn(useTranslatorModule, 'useTranslator').mockReturnValue({
      t: createMockI18nService().translator('member_management'),
      changeLanguage: vi.fn(),
      currentLanguage: 'en',
      fallbackLanguage: 'en',
    });
  });

  describe('memberManagementQueryKeys', () => {
    it('should have correct base key', () => {
      expect(memberManagementQueryKeys.all).toEqual(['member-management']);
    });

    it('should have correct invitations key', () => {
      expect(memberManagementQueryKeys.invitations()).toEqual(['member-management', 'invitations']);
    });
  });

  describe('providersQuery', () => {
    it('should fetch identity providers when invitations tab is active', async () => {
      const options = createDefaultOptions({ activeTab: 'invitations' });
      const { result } = renderService(options);

      await waitFor(() => {
        expect(result.current.providersQuery.isSuccess).toBe(true);
      });

      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.list,
      ).toHaveBeenCalled();
    });

    it('should not fetch identity providers when members tab is active', async () => {
      const options = createDefaultOptions({ activeTab: 'members' });
      const { result } = renderService(options);

      // Wait for rolesQuery to settle (it's always enabled)
      await waitFor(() => {
        expect(result.current.rolesQuery.isSuccess).toBe(true);
      });

      expect(result.current.providersQuery.fetchStatus).toBe('idle');
    });
  });

  describe('rolesQuery', () => {
    it('should fetch roles when coreClient is available', async () => {
      const options = createDefaultOptions();
      const { result } = renderService(options);

      await waitFor(() => {
        expect(result.current.rolesQuery.isSuccess).toBe(true);
      });

      expect(result.current.rolesQuery.data).toBeDefined();
    });

    it('should return roles data', async () => {
      const options = createDefaultOptions();
      const { result } = renderService(options);

      await waitFor(() => {
        expect(result.current.rolesQuery.isSuccess).toBe(true);
      });

      expect(result.current.rolesQuery.data).toEqual([
        { id: 'rol_admin', name: 'admin', description: 'Admin role' },
      ]);
    });

    it('should fetch roles regardless of active tab', async () => {
      const options = createDefaultOptions({ activeTab: 'members' });
      const { result } = renderService(options);

      await waitFor(() => {
        expect(result.current.rolesQuery.isSuccess).toBe(true);
      });

      expect(result.current.rolesQuery.data).toBeDefined();
    });
  });

  describe('invitationsQuery', () => {
    it('should fetch invitations when invitations tab is active', async () => {
      const options = createDefaultOptions({ activeTab: 'invitations' });
      const { result } = renderService(options);

      await waitFor(() => {
        expect(result.current.invitationsQuery.isSuccess).toBe(true);
      });

      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.invitations.list,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 10,
          from: undefined,
          sort: undefined,
        }),
      );
    });

    it('should not fetch invitations when members tab is active', () => {
      const options = createDefaultOptions({ activeTab: 'members' });
      const { result } = renderService(options);

      expect(result.current.invitationsQuery.fetchStatus).toBe('idle');
    });

    it('should pass sort parameter when sort config has a valid key', async () => {
      const options = createDefaultOptions({
        invitationParams: {
          pageSize: 10,
          fromToken: undefined,
          sortConfig: { key: 'created_at', direction: 'desc' },
          filters: {},
        },
      });
      const { result } = renderService(options);

      await waitFor(() => {
        expect(result.current.invitationsQuery.isSuccess).toBe(true);
      });

      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.invitations.list,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          sort: 'created_at:-1',
        }),
      );
    });

    it('should pass fromToken when provided', async () => {
      const options = createDefaultOptions({
        invitationParams: {
          pageSize: 10,
          fromToken: 'token_abc',
          sortConfig: { key: null, direction: 'asc' },
          filters: {},
        },
      });
      const { result } = renderService(options);

      await waitFor(() => {
        expect(result.current.invitationsQuery.isSuccess).toBe(true);
      });

      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.invitations.list,
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'token_abc',
        }),
      );
    });

    it('should return parsed invitations data', async () => {
      const mockInvitation = createMockInvitation();
      mockCoreClient.getMyOrganizationApiClient().organization.invitations.list = vi
        .fn()
        .mockResolvedValue({
          data: [mockInvitation],
          response: { next: 'next_token' },
        });

      const options = createDefaultOptions();
      const { result } = renderService(options);

      await waitFor(() => {
        expect(result.current.invitationsQuery.isSuccess).toBe(true);
      });

      expect(result.current.invitationsQuery.data).toEqual({
        invitations: [mockInvitation],
        next: 'next_token',
      });
    });
  });

  describe('createInvitationMutation', () => {
    it('should create an invitation and show success toast', async () => {
      const options = createDefaultOptions();
      const { result } = renderService(options);

      await act(async () => {
        result.current.createInvitationMutation.mutate({
          invitees: [{ email: 'new@example.com', roles: ['role_admin'] }],
        });
      });

      await waitFor(() => {
        expect(result.current.createInvitationMutation.isSuccess).toBe(true);
      });

      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.invitations.create,
      ).toHaveBeenCalled();
      expect(mockedShowToast).toHaveBeenCalledWith(expect.objectContaining({ type: 'success' }));
    });

    it('should call onBefore action and cancel if it returns false', async () => {
      const onBefore = vi.fn().mockReturnValue(false);
      const options = createDefaultOptions({
        createInvitationAction: { onBefore },
      });
      const { result } = renderService(options);

      await act(async () => {
        result.current.createInvitationMutation.mutate({
          invitees: [{ email: 'new@example.com' }],
        });
      });

      await waitFor(() => {
        expect(result.current.createInvitationMutation.isError).toBe(true);
      });

      expect(onBefore).toHaveBeenCalled();
      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.invitations.create,
      ).not.toHaveBeenCalled();
    });

    it('should call onAfter action on success', async () => {
      const onAfter = vi.fn();
      const options = createDefaultOptions({
        createInvitationAction: { onAfter },
      });
      const { result } = renderService(options);

      await act(async () => {
        result.current.createInvitationMutation.mutate({
          invitees: [{ email: 'new@example.com' }],
        });
      });

      await waitFor(() => {
        expect(result.current.createInvitationMutation.isSuccess).toBe(true);
      });

      expect(onAfter).toHaveBeenCalled();
    });

    it('should show error toast on failure', async () => {
      mockCoreClient.getMyOrganizationApiClient().organization.invitations.create = vi
        .fn()
        .mockRejectedValue(new Error('Create failed'));

      const options = createDefaultOptions();
      const { result } = renderService(options);

      await act(async () => {
        result.current.createInvitationMutation.mutate({
          invitees: [{ email: 'new@example.com' }],
        });
      });

      await waitFor(() => {
        expect(result.current.createInvitationMutation.isError).toBe(true);
      });

      expect(mockedShowToast).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
    });
  });

  describe('revokeInvitationMutation', () => {
    it('should revoke an invitation and show success toast', async () => {
      const invitation = createMockInvitation();
      const options = createDefaultOptions();
      const { result } = renderService(options);

      await act(async () => {
        result.current.revokeInvitationMutation.mutate(invitation);
      });

      await waitFor(() => {
        expect(result.current.revokeInvitationMutation.isSuccess).toBe(true);
      });

      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.invitations.delete,
      ).toHaveBeenCalledWith(invitation.id);
      expect(mockedShowToast).toHaveBeenCalledWith(expect.objectContaining({ type: 'success' }));
    });

    it('should call onBefore action and cancel if it returns false', async () => {
      const onBefore = vi.fn().mockReturnValue(false);
      const invitation = createMockInvitation();
      const options = createDefaultOptions({
        revokeInvitationAction: { onBefore },
      });
      const { result } = renderService(options);

      await act(async () => {
        result.current.revokeInvitationMutation.mutate(invitation);
      });

      await waitFor(() => {
        expect(result.current.revokeInvitationMutation.isError).toBe(true);
      });

      expect(onBefore).toHaveBeenCalledWith(invitation);
      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.invitations.delete,
      ).not.toHaveBeenCalled();
    });

    it('should show error toast on failure', async () => {
      mockCoreClient.getMyOrganizationApiClient().organization.invitations.delete = vi
        .fn()
        .mockRejectedValue(new Error('Revoke failed'));

      const invitation = createMockInvitation();
      const options = createDefaultOptions();
      const { result } = renderService(options);

      await act(async () => {
        result.current.revokeInvitationMutation.mutate(invitation);
      });

      await waitFor(() => {
        expect(result.current.revokeInvitationMutation.isError).toBe(true);
      });

      expect(mockedShowToast).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
    });
  });

  describe('resendInvitationMutation', () => {
    it('should revoke and resend an invitation', async () => {
      const invitation = createMockInvitation();
      const options = createDefaultOptions();
      const { result } = renderService(options);

      await act(async () => {
        result.current.resendInvitationMutation.mutate(invitation);
      });

      await waitFor(() => {
        expect(result.current.resendInvitationMutation.isSuccess).toBe(true);
      });

      const orgApi = mockCoreClient.getMyOrganizationApiClient().organization;
      expect(orgApi.invitations.get).toHaveBeenCalledWith(invitation.id);
      expect(orgApi.invitations.delete).toHaveBeenCalled();
      expect(orgApi.invitations.create).toHaveBeenCalled();
      expect(mockedShowToast).toHaveBeenCalledWith(expect.objectContaining({ type: 'success' }));
    });

    it('should call onBefore action and cancel if it returns false', async () => {
      const onBefore = vi.fn().mockReturnValue(false);
      const invitation = createMockInvitation();
      const options = createDefaultOptions({
        resendInvitationAction: { onBefore },
      });
      const { result } = renderService(options);

      await act(async () => {
        result.current.resendInvitationMutation.mutate(invitation);
      });

      await waitFor(() => {
        expect(result.current.resendInvitationMutation.isError).toBe(true);
      });

      expect(onBefore).toHaveBeenCalledWith(invitation);
    });

    it('should show error toast on failure', async () => {
      mockCoreClient.getMyOrganizationApiClient().organization.invitations.get = vi
        .fn()
        .mockRejectedValue(new Error('Fetch failed'));

      const invitation = createMockInvitation();
      const options = createDefaultOptions();
      const { result } = renderService(options);

      await act(async () => {
        result.current.resendInvitationMutation.mutate(invitation);
      });

      await waitFor(() => {
        expect(result.current.resendInvitationMutation.isError).toBe(true);
      });

      expect(mockedShowToast).toHaveBeenCalledWith(expect.objectContaining({ type: 'error' }));
    });
  });

  describe('fetchInvitationDetails', () => {
    it('should fetch invitation details by id', async () => {
      const mockInvitation = createMockInvitation();
      const options = createDefaultOptions();
      const { result } = renderService(options);

      const details = await result.current.fetchInvitationDetails('inv_abc123xyz456');

      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.invitations.get,
      ).toHaveBeenCalledWith('inv_abc123xyz456');
      expect(details).toEqual(mockInvitation);
    });
  });
});
