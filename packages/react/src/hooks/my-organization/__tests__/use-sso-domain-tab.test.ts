import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useSsoDomainTab } from '@/hooks/my-organization/use-sso-domain-tab';
import {
  createMockSsoDomain,
  createMockVerifiedSsoDomain,
  createMockSsoProvider,
} from '@/tests/utils/__mocks__/my-organization/idp-management/sso-domain.mocks';
import { mockToast } from '@/tests/utils/test-setup';

const { mockedShowToast } = mockToast();

const mockDomain = createMockSsoDomain();
const mockVerifiedDomain = createMockVerifiedSsoDomain();
const mockProvider = createMockSsoProvider();

const { mockServiceReturn, mockHandleError } = vi.hoisted(() => ({
  mockServiceReturn: {
    domainsList: [] as unknown[],
    isLoading: false,
    isRefetchingDomains: false,
    isDomainsStale: false,
    domainsUpdatedAt: 0,
    nextToken: null,
    refetchDomains: vi.fn(),
    idpDomains: [] as string[],
    isCreating: false,
    isVerifying: false,
    isDeleting: false,
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

  const renderUseSsoDomainTab = () => {
    return renderHook(() =>
      useSsoDomainTab('idp-1', {
        provider: defaultProvider,
      }),
    );
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
});
