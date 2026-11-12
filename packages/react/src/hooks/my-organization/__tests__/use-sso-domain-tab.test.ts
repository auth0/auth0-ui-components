import { renderHook, act } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useSsoDomainTab } from '@/hooks/my-organization/use-sso-domain-tab';
import { PermissionContext } from '@/providers/permission-provider';
import {
  createMockSsoDomain,
  createMockVerifiedSsoDomain,
  createMockSsoProvider,
} from '@/tests/utils/__mocks__/my-organization/idp-management/sso-domain.mocks';
import { ALL_MY_ORG_PERMISSIONS } from '@/tests/utils/__mocks__/permissions/permission.mocks';
import { mockToast } from '@/tests/utils/test-setup';

const { mockedShowToast } = mockToast();

const mockDomain = createMockSsoDomain();
const mockVerifiedDomain = createMockVerifiedSsoDomain();
const mockProvider = createMockSsoProvider();

const { mockServiceReturn, mockHandleError } = vi.hoisted(() => ({
  mockServiceReturn: {
    domainsList: [] as unknown[],
    availableDomains: [] as unknown[],
    isLoading: false,
    isRefetchingDomains: false,
    isDomainsStale: false,
    domainsUpdatedAt: 0,
    nextToken: null as string | null,
    refetchDomains: vi.fn(),
    idpDomains: [] as string[],
    isCreating: false,
    isVerifying: false,
    isDeleting: false,
    isAssociating: false,
    createDomain: vi.fn(),
    verifyDomain: vi.fn(),
    deleteDomain: vi.fn(),
    associateToProvider: vi.fn(),
    deleteFromProvider: vi.fn(),
  },
  mockHandleError: vi.fn(),
}));

vi.mock('@/hooks/my-organization/shared/services/use-sso-domain-tab-service', () => ({
  useSsoDomainTabService: () => mockServiceReturn,
}));

vi.mock('@/hooks/shared/use-error-handler', () => ({
  useErrorHandler: () => mockHandleError,
}));

vi.mock('@/hooks/shared/use-translator', () => ({
  useTranslator: () => ({
    t: (key: string, params?: Record<string, unknown>) => {
      if (params) return key;
      return key;
    },
  }),
}));

describe('useSsoDomainTab', () => {
  const defaultProvider = { ...mockProvider, domains: [mockDomain.domain] };

  beforeEach(() => {
    vi.clearAllMocks();
    mockServiceReturn.domainsList = [mockDomain];
    mockServiceReturn.idpDomains = [mockDomain.id];
    (mockServiceReturn.createDomain as ReturnType<typeof vi.fn>).mockResolvedValue(mockDomain);
    (mockServiceReturn.verifyDomain as ReturnType<typeof vi.fn>).mockResolvedValue({
      updatedDomain: mockVerifiedDomain,
      isVerified: true,
    });
    (mockServiceReturn.deleteDomain as ReturnType<typeof vi.fn>).mockResolvedValue(mockDomain);
    (mockServiceReturn.associateToProvider as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockDomain,
    );
    (mockServiceReturn.deleteFromProvider as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockDomain,
    );
  });

  const renderUseSsoDomainTab = (
    options?: Parameters<typeof useSsoDomainTab>[1],
    permissions: string[] = ALL_MY_ORG_PERMISSIONS,
  ) => {
    const wrapper = ({ children }: { children: ReactNode }) =>
      createElement(
        PermissionContext.Provider,
        { value: { permissions, isLoading: false } },
        children,
      );
    return renderHook(() => useSsoDomainTab('idp-1', { provider: defaultProvider, ...options }), {
      wrapper,
    });
  };

  describe('initialization', () => {
    it('should initialize with default state', () => {
      const { result } = renderUseSsoDomainTab();

      expect(result.current.isLoading).toBe(false);
      expect(result.current.domainsList).toEqual([mockDomain]);
      expect(result.current.idpDomains).toContain(mockDomain.id);
      expect(result.current.isCreating).toBe(false);
      expect(result.current.selectedDomain).toBeNull();
      expect(result.current.showVerifyModal).toBe(false);
      expect(result.current.showDeleteModal).toBe(false);
      expect(result.current.isVerifying).toBe(false);
      expect(result.current.verifyError).toBeUndefined();
      expect(result.current.isDeleting).toBe(false);
      expect(result.current.showCreateModal).toBe(false);
      expect(result.current.isUpdating).toBe(false);
      expect(result.current.isUpdatingId).toBeNull();
    });
  });

  describe('domain creation', () => {
    it('should create domain and show verify modal on success', async () => {
      const { result } = renderUseSsoDomainTab();

      await act(async () => {
        await result.current.handleCreate('newdomain.com');
      });

      expect(mockServiceReturn.createDomain).toHaveBeenCalledWith({ domain: 'newdomain.com' });
      expect(mockedShowToast).toHaveBeenCalledWith({
        type: 'success',
        message: expect.any(String),
      });
      expect(result.current.selectedDomain).toEqual(mockDomain);
      expect(result.current.showCreateModal).toBe(false);
      expect(result.current.showVerifyModal).toBe(true);
    });

    it('should handle domain creation error', async () => {
      const error = new Error('Creation failed');
      (mockServiceReturn.createDomain as ReturnType<typeof vi.fn>).mockRejectedValue(error);

      const { result } = renderUseSsoDomainTab();

      await act(async () => {
        await result.current.handleCreate('newdomain.com');
      });

      expect(mockHandleError).toHaveBeenCalledWith(error, {
        fallbackMessage: 'domain_create.error',
      });
    });
  });

  describe('domain verification', () => {
    it('should verify domain and associate to provider on success', async () => {
      const { result } = renderUseSsoDomainTab();

      await act(async () => {
        await result.current.handleCreate('example.com');
      });
      expect(result.current.showVerifyModal).toBe(true);

      await act(async () => {
        await result.current.handleVerify(mockDomain);
      });

      expect(mockServiceReturn.verifyDomain).toHaveBeenCalledWith(mockDomain);
      expect(result.current.showVerifyModal).toBe(false);
      expect(mockedShowToast).toHaveBeenCalledWith({
        type: 'success',
        message: expect.any(String),
      });
      expect(mockServiceReturn.associateToProvider).toHaveBeenCalledWith(mockDomain);
    });

    it('should set verify error when verification fails', async () => {
      (mockServiceReturn.verifyDomain as ReturnType<typeof vi.fn>).mockResolvedValue({
        updatedDomain: { ...mockDomain, status: 'failed' },
        isVerified: false,
      });

      const { result } = renderUseSsoDomainTab();

      await act(async () => {
        await result.current.handleVerify(mockDomain);
      });

      expect(result.current.verifyError).toBe('domain_verify.verification_failed');
    });

    it('should handle verification error', async () => {
      const error = new Error('Verification failed');
      (mockServiceReturn.verifyDomain as ReturnType<typeof vi.fn>).mockRejectedValue(error);

      const { result } = renderUseSsoDomainTab();

      await act(async () => {
        await result.current.handleVerify(mockDomain);
      });

      expect(mockHandleError).toHaveBeenCalledWith(error, {
        fallbackMessage: 'domain_verify.verification_failed',
      });
    });

    it('should handle verification action column', async () => {
      const { result } = renderUseSsoDomainTab();

      await act(async () => {
        await result.current.handleVerifyActionColumn(mockDomain);
      });

      expect(result.current.isUpdating).toBe(false);
      expect(result.current.isUpdatingId).toBeNull();
      expect(mockedShowToast).toHaveBeenCalledWith({
        type: 'success',
        message: expect.any(String),
      });
    });

    it('should show error toast when action column verification fails', async () => {
      (mockServiceReturn.verifyDomain as ReturnType<typeof vi.fn>).mockResolvedValue({
        updatedDomain: { ...mockDomain, status: 'failed' },
        isVerified: false,
      });

      const { result } = renderUseSsoDomainTab();

      await act(async () => {
        await result.current.handleVerifyActionColumn(mockDomain);
      });

      expect(mockedShowToast).toHaveBeenCalledWith({
        type: 'error',
        message: expect.any(String),
      });
      expect(result.current.isUpdating).toBe(false);
      expect(result.current.isUpdatingId).toBeNull();
    });

    it('should close verify modal and clear error', () => {
      const { result } = renderUseSsoDomainTab();

      act(() => {
        result.current.handleCloseVerifyModal();
      });

      expect(result.current.showVerifyModal).toBe(false);
      expect(result.current.verifyError).toBeUndefined();
    });
  });

  describe('domain deletion', () => {
    it('should delete domain successfully', async () => {
      const { result } = renderUseSsoDomainTab();

      await act(async () => {
        await result.current.handleCreate('example.com');
      });
      expect(result.current.showVerifyModal).toBe(true);

      act(() => {
        result.current.setShowDeleteModal(true);
      });
      expect(result.current.showDeleteModal).toBe(true);

      await act(async () => {
        await result.current.handleDelete(mockDomain);
      });

      expect(mockServiceReturn.deleteDomain).toHaveBeenCalledWith(mockDomain);
      expect(mockedShowToast).toHaveBeenCalledWith({
        type: 'success',
        message: expect.any(String),
      });
      expect(result.current.showDeleteModal).toBe(false);
      expect(result.current.showVerifyModal).toBe(false);
    });

    it('should handle deletion error', async () => {
      const error = new Error('Deletion failed');
      (mockServiceReturn.deleteDomain as ReturnType<typeof vi.fn>).mockRejectedValue(error);

      const { result } = renderUseSsoDomainTab();

      await act(async () => {
        await result.current.handleDelete(mockDomain);
      });

      expect(mockHandleError).toHaveBeenCalledWith(error, {
        fallbackMessage: 'domain_delete.error',
      });
    });

    it('should handle delete click', () => {
      const { result } = renderUseSsoDomainTab();

      act(() => {
        result.current.handleDeleteClick(mockDomain);
      });

      expect(result.current.selectedDomain).toEqual(mockDomain);
      expect(result.current.showVerifyModal).toBe(false);
      expect(result.current.showDeleteModal).toBe(true);
    });
  });

  describe('provider association toggle', () => {
    it('should associate domain to provider on toggle on', async () => {
      const { result } = renderUseSsoDomainTab();

      await act(async () => {
        await result.current.handleToggleSwitch(mockDomain, true);
      });

      expect(mockServiceReturn.associateToProvider).toHaveBeenCalledWith(mockDomain);
      expect(mockedShowToast).toHaveBeenCalledWith({
        type: 'success',
        message: expect.any(String),
      });
      expect(result.current.isUpdating).toBe(false);
      expect(result.current.isUpdatingId).toBeNull();
    });

    it('should remove domain from provider on toggle off', async () => {
      const { result } = renderUseSsoDomainTab();

      await act(async () => {
        await result.current.handleToggleSwitch(mockDomain, false);
      });

      expect(mockServiceReturn.deleteFromProvider).toHaveBeenCalledWith(mockDomain);
      expect(mockedShowToast).toHaveBeenCalledWith({
        type: 'success',
        message: expect.any(String),
      });
    });

    it('should handle provider association error', async () => {
      const error = new Error('Association failed');
      (mockServiceReturn.associateToProvider as ReturnType<typeof vi.fn>).mockRejectedValue(error);

      const { result } = renderUseSsoDomainTab();

      await act(async () => {
        await result.current.handleToggleSwitch(mockDomain, true);
      });

      expect(mockHandleError).toHaveBeenCalledWith(error, {
        fallbackMessage: 'general_error',
      });
      expect(result.current.isUpdating).toBe(false);
    });

    it('should handle provider deletion error', async () => {
      const error = new Error('Deletion failed');
      (mockServiceReturn.deleteFromProvider as ReturnType<typeof vi.fn>).mockRejectedValue(error);

      const { result } = renderUseSsoDomainTab();

      await act(async () => {
        await result.current.handleToggleSwitch(mockDomain, false);
      });

      expect(mockHandleError).toHaveBeenCalledWith(error, {
        fallbackMessage: 'general_error',
      });
      expect(result.current.isUpdating).toBe(false);
    });
  });

  describe('modal state management', () => {
    it('should manage modal state correctly', () => {
      const { result } = renderUseSsoDomainTab();

      act(() => {
        result.current.setShowCreateModal(true);
      });
      expect(result.current.showCreateModal).toBe(true);

      act(() => {
        result.current.setShowCreateModal(false);
      });
      expect(result.current.showCreateModal).toBe(false);

      act(() => {
        result.current.setShowDeleteModal(true);
      });
      expect(result.current.showDeleteModal).toBe(true);

      act(() => {
        result.current.setShowDeleteModal(false);
      });
      expect(result.current.showDeleteModal).toBe(false);
    });
  });

  describe('pagination', () => {
    it('should report a single page because every assigned domain is shown', () => {
      mockServiceReturn.domainsList = [mockDomain, mockVerifiedDomain];
      const { result } = renderUseSsoDomainTab();

      expect(result.current.pagination).toEqual({
        pageSize: 2,
        currentPage: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    });

    it('should keep the paging handlers as no-ops', () => {
      const { result } = renderUseSsoDomainTab();

      act(() => {
        result.current.handleNextPage();
        result.current.handlePreviousPage();
        result.current.handlePageSizeChange(50);
      });

      expect(result.current.pagination.currentPage).toBe(1);
    });
  });

  describe('assigning domains', () => {
    const domainA = createMockVerifiedSsoDomain({ id: 'domain-a', domain: 'a.com' });
    const domainB = createMockVerifiedSsoDomain({ id: 'domain-b', domain: 'b.com' });

    it('should expose the available domains from the service', () => {
      mockServiceReturn.availableDomains = [domainA];
      const { result } = renderUseSsoDomainTab();

      expect(result.current.availableDomains).toEqual([domainA]);
    });

    it('should open and close the assign modal', () => {
      const { result } = renderUseSsoDomainTab();

      expect(result.current.showAssignModal).toBe(false);
      act(() => result.current.setShowAssignModal(true));
      expect(result.current.showAssignModal).toBe(true);
      act(() => result.current.setShowAssignModal(false));
      expect(result.current.showAssignModal).toBe(false);
    });

    it('should associate every selected domain, one at a time, and report success', async () => {
      const calls: string[] = [];
      (mockServiceReturn.associateToProvider as ReturnType<typeof vi.fn>).mockImplementation(
        async (domain: { domain: string }) => void calls.push(domain.domain),
      );
      const { result } = renderUseSsoDomainTab();

      let assignedAll = false;
      await act(async () => {
        assignedAll = await result.current.handleAssign([domainA, domainB]);
      });

      expect(calls).toEqual(['a.com', 'b.com']);
      expect(assignedAll).toBe(true);
      expect(result.current.isAssigning).toBe(false);
      expect(mockedShowToast).toHaveBeenCalledTimes(1);
      expect(mockedShowToast).toHaveBeenCalledWith({
        type: 'success',
        message: 'domain_assign.success',
      });
      expect(mockHandleError).not.toHaveBeenCalled();
    });

    it('should keep going after a failure and report which domains failed', async () => {
      const error = new Error('Domain Already Associated');
      (mockServiceReturn.associateToProvider as ReturnType<typeof vi.fn>)
        .mockRejectedValueOnce(error)
        .mockResolvedValueOnce(domainB);
      const { result } = renderUseSsoDomainTab();

      let assignedAll = true;
      await act(async () => {
        assignedAll = await result.current.handleAssign([domainA, domainB]);
      });

      expect(mockServiceReturn.associateToProvider).toHaveBeenCalledTimes(2);
      expect(assignedAll).toBe(false);
      expect(mockedShowToast).toHaveBeenCalledWith({
        type: 'success',
        message: 'domain_assign.success',
      });
      expect(mockHandleError).toHaveBeenCalledTimes(1);
      expect(mockHandleError).toHaveBeenCalledWith(error, {
        fallbackMessage: 'domain_assign.error',
      });
      expect(result.current.isAssigning).toBe(false);
    });

    it('should not show a success toast when every domain fails', async () => {
      (mockServiceReturn.associateToProvider as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error('boom'),
      );
      const { result } = renderUseSsoDomainTab();

      await act(async () => {
        await result.current.handleAssign([domainA]);
      });

      expect(mockedShowToast).not.toHaveBeenCalled();
      expect(mockHandleError).toHaveBeenCalledTimes(1);
    });

    it('should do nothing when no domain is selected', async () => {
      const { result } = renderUseSsoDomainTab();

      let assignedAll = true;
      await act(async () => {
        assignedAll = await result.current.handleAssign([]);
      });

      expect(assignedAll).toBe(false);
      expect(mockServiceReturn.associateToProvider).not.toHaveBeenCalled();
    });

    it('should refuse to assign without the create provider-domain scope', async () => {
      const { result } = renderUseSsoDomainTab(undefined, [
        'read:my_org:domains',
        'read:my_org:identity_providers',
        'delete:my_org:identity_providers_domains',
      ]);

      await act(async () => {
        await result.current.handleAssign([domainA]);
      });

      expect(mockServiceReturn.associateToProvider).not.toHaveBeenCalled();
    });

    it('should refuse to assign when readOnly is set', async () => {
      const { result } = renderUseSsoDomainTab({ readOnly: true });

      await act(async () => {
        await result.current.handleAssign([domainA]);
      });

      expect(mockServiceReturn.associateToProvider).not.toHaveBeenCalled();
    });
  });

  describe('removing a domain', () => {
    it('should dissociate the domain with the same success toast as the old toggle', async () => {
      const { result } = renderUseSsoDomainTab();

      await act(async () => {
        await result.current.handleRemove(mockDomain);
      });

      expect(mockServiceReturn.deleteFromProvider).toHaveBeenCalledWith(mockDomain);
      expect(mockedShowToast).toHaveBeenCalledWith({
        type: 'success',
        message: 'domain_delete_provider.success',
      });
      expect(result.current.isUpdating).toBe(false);
    });

    it('should report errors through the error handler', async () => {
      const error = new Error('Delete failed');
      (mockServiceReturn.deleteFromProvider as ReturnType<typeof vi.fn>).mockRejectedValue(error);
      const { result } = renderUseSsoDomainTab();

      await act(async () => {
        await result.current.handleRemove(mockDomain);
      });

      expect(mockHandleError).toHaveBeenCalledWith(error, { fallbackMessage: 'general_error' });
    });

    it('should refuse to remove without the delete provider-domain scope', async () => {
      const { result } = renderUseSsoDomainTab(undefined, [
        'read:my_org:domains',
        'read:my_org:identity_providers',
        'create:my_org:identity_providers_domains',
      ]);

      await act(async () => {
        await result.current.handleRemove(mockDomain);
      });

      expect(mockServiceReturn.deleteFromProvider).not.toHaveBeenCalled();
    });
  });

  describe('permission guards', () => {
    const VIEWER = ['read:my_org:domains', 'read:my_org:identity_providers'];

    it('should refuse to create a domain without create:my_org:domains', async () => {
      const { result } = renderUseSsoDomainTab(undefined, VIEWER);

      await act(async () => {
        await result.current.handleCreate('example.com');
      });

      expect(mockServiceReturn.createDomain).not.toHaveBeenCalled();
    });

    it('should refuse to verify a domain without update:my_org:domains', async () => {
      const { result } = renderUseSsoDomainTab(undefined, VIEWER);

      await act(async () => {
        await result.current.handleVerify(mockDomain);
      });

      expect(mockServiceReturn.verifyDomain).not.toHaveBeenCalled();
    });

    it('should refuse to verify from the action column without update:my_org:domains', async () => {
      const { result } = renderUseSsoDomainTab(undefined, VIEWER);

      await act(async () => {
        await result.current.handleVerifyActionColumn(mockDomain);
      });

      expect(mockServiceReturn.verifyDomain).not.toHaveBeenCalled();
    });

    it('should refuse to delete a domain without delete:my_org:domains', async () => {
      const { result } = renderUseSsoDomainTab(undefined, VIEWER);

      await act(async () => {
        await result.current.handleDelete(mockDomain);
      });

      expect(mockServiceReturn.deleteDomain).not.toHaveBeenCalled();
    });

    it('should refuse to open the delete modal without delete:my_org:domains', () => {
      const { result } = renderUseSsoDomainTab(undefined, VIEWER);

      act(() => {
        result.current.handleDeleteClick(mockDomain);
      });

      expect(result.current.showDeleteModal).toBe(false);
    });

    it('should refuse to associate a domain without the create provider-domain scope', async () => {
      const { result } = renderUseSsoDomainTab(undefined, [
        ...VIEWER,
        'delete:my_org:identity_providers_domains',
      ]);

      await act(async () => {
        await result.current.handleToggleSwitch(mockDomain, true);
      });

      expect(mockServiceReturn.associateToProvider).not.toHaveBeenCalled();
    });

    it('should refuse to dissociate a domain without the delete provider-domain scope', async () => {
      const { result } = renderUseSsoDomainTab(undefined, [
        ...VIEWER,
        'create:my_org:identity_providers_domains',
      ]);

      await act(async () => {
        await result.current.handleToggleSwitch(mockDomain, false);
      });

      expect(mockServiceReturn.deleteFromProvider).not.toHaveBeenCalled();
    });

    it('should refuse every action when readOnly is set, even with the scopes granted', async () => {
      const { result } = renderUseSsoDomainTab({ readOnly: true });

      await act(async () => {
        await result.current.handleCreate('example.com');
      });

      expect(mockServiceReturn.createDomain).not.toHaveBeenCalled();
    });
  });
});
