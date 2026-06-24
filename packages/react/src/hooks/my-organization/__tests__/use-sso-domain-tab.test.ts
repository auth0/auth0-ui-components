import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useSsoDomainTabService } from '@/hooks/my-organization/shared/services/use-sso-domain-tab-service';
import { useSsoDomainTab } from '@/hooks/my-organization/use-sso-domain-tab';
import { createMockSsoDomain, createMockSsoProvider, mockSsoDomainTabService } from '@/tests/utils';

vi.mock('@/hooks/shared/use-translator', () => ({
  useTranslator: () => ({ t: (key: string) => key }),
}));

vi.mock('@/hooks/shared/use-error-handler', () => ({
  useErrorHandler: () => vi.fn(),
}));

vi.mock('@/components/auth0/shared/toast', () => ({
  showToast: vi.fn(),
}));

vi.mock('@/hooks/my-organization/shared/services/use-sso-domain-tab-service', () => ({
  useSsoDomainTabService: vi.fn(() => mockSsoDomainTabService()),
}));

const mockDomain = createMockSsoDomain();
const mockProvider = createMockSsoProvider();

describe('useSsoDomainTab', () => {
  const defaultOptions = {
    provider: mockProvider,
    domains: {},
  };

  let mockService: ReturnType<typeof mockSsoDomainTabService>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockService = mockSsoDomainTabService();
    vi.mocked(useSsoDomainTabService).mockReturnValue(mockService);
  });

  describe('initialization', () => {
    it('should return correct initial state', () => {
      const { result } = renderHook(() => useSsoDomainTab('idp-1', defaultOptions));

      expect(result.current.isLoading).toBe(false);
      expect(result.current.domainsList).toEqual(mockService.domainsList);
      expect(result.current.idpDomains).toEqual(mockService.idpDomains);
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

    it('should pass options to the service hook', () => {
      renderHook(() => useSsoDomainTab('idp-1', defaultOptions));

      expect(useSsoDomainTabService).toHaveBeenCalledWith('idp-1', {
        customMessages: {},
        domains: defaultOptions.domains,
        provider: defaultOptions.provider,
      });
    });
  });

  describe('handleCreate', () => {
    it('should call createDomain and open verify modal on success', async () => {
      vi.mocked(mockService.createDomain).mockResolvedValue(mockDomain);

      const { result } = renderHook(() => useSsoDomainTab('idp-1', defaultOptions));

      await act(async () => {
        await result.current.handleCreate('newdomain.com');
      });

      expect(mockService.createDomain).toHaveBeenCalledWith({ domain: 'newdomain.com' });
      expect(result.current.selectedDomain).toEqual(mockDomain);
      expect(result.current.showCreateModal).toBe(false);
      expect(result.current.showVerifyModal).toBe(true);
    });

    it('should handle creation error', async () => {
      const error = new Error('Creation failed');
      vi.mocked(mockService.createDomain).mockRejectedValue(error);

      const { result } = renderHook(() => useSsoDomainTab('idp-1', defaultOptions));

      await act(async () => {
        await result.current.handleCreate('newdomain.com');
      });

      expect(result.current.showVerifyModal).toBe(false);
    });
  });

  describe('handleVerify', () => {
    it('should close verify modal and associate on success', async () => {
      vi.mocked(mockService.verifyDomain).mockResolvedValue({
        updatedDomain: { ...mockDomain, status: 'verified' },
        isVerified: true,
      });
      vi.mocked(mockService.associateToProvider).mockResolvedValue(mockDomain);

      const { result } = renderHook(() => useSsoDomainTab('idp-1', defaultOptions));

      await act(async () => {
        await result.current.handleVerify(mockDomain);
      });

      expect(mockService.verifyDomain).toHaveBeenCalledWith(mockDomain);
      expect(mockService.associateToProvider).toHaveBeenCalledWith(mockDomain);
      expect(result.current.showVerifyModal).toBe(false);
    });

    it('should set verifyError on verification failure', async () => {
      vi.mocked(mockService.verifyDomain).mockResolvedValue({
        updatedDomain: { ...mockDomain, status: 'failed' },
        isVerified: false,
      });

      const { result } = renderHook(() => useSsoDomainTab('idp-1', defaultOptions));

      await act(async () => {
        await result.current.handleVerify(mockDomain);
      });

      expect(result.current.verifyError).toBe('domain_verify.verification_failed');
      expect(mockService.associateToProvider).not.toHaveBeenCalled();
    });

    it('should handle verification error', async () => {
      vi.mocked(mockService.verifyDomain).mockRejectedValue(new Error('Verify failed'));

      const { result } = renderHook(() => useSsoDomainTab('idp-1', defaultOptions));

      await act(async () => {
        await result.current.handleVerify(mockDomain);
      });

      expect(result.current.showVerifyModal).toBe(false);
    });
  });

  describe('handleCloseVerifyModal', () => {
    it('should close verify modal and clear error', () => {
      const { result } = renderHook(() => useSsoDomainTab('idp-1', defaultOptions));

      act(() => {
        result.current.handleCloseVerifyModal();
      });

      expect(result.current.showVerifyModal).toBe(false);
      expect(result.current.verifyError).toBeUndefined();
    });
  });

  describe('handleDeleteClick', () => {
    it('should set selected domain and show delete modal', () => {
      const { result } = renderHook(() => useSsoDomainTab('idp-1', defaultOptions));

      act(() => {
        result.current.handleDeleteClick(mockDomain);
      });

      expect(result.current.selectedDomain).toEqual(mockDomain);
      expect(result.current.showDeleteModal).toBe(true);
      expect(result.current.showVerifyModal).toBe(false);
    });
  });

  describe('handleDelete', () => {
    it('should call deleteDomain and close modals on success', async () => {
      vi.mocked(mockService.deleteDomain).mockResolvedValue(mockDomain);

      const { result } = renderHook(() => useSsoDomainTab('idp-1', defaultOptions));

      await act(async () => {
        await result.current.handleDelete(mockDomain);
      });

      expect(mockService.deleteDomain).toHaveBeenCalledWith(mockDomain);
      expect(result.current.showDeleteModal).toBe(false);
      expect(result.current.showVerifyModal).toBe(false);
    });

    it('should handle deletion error', async () => {
      vi.mocked(mockService.deleteDomain).mockRejectedValue(new Error('Delete failed'));

      const { result } = renderHook(() => useSsoDomainTab('idp-1', defaultOptions));

      await act(async () => {
        await result.current.handleDelete(mockDomain);
      });

      expect(result.current.showDeleteModal).toBe(false);
    });
  });

  describe('handleVerifyActionColumn', () => {
    it('should verify and associate on success', async () => {
      vi.mocked(mockService.verifyDomain).mockResolvedValue({
        updatedDomain: { ...mockDomain, status: 'verified' },
        isVerified: true,
      });
      vi.mocked(mockService.associateToProvider).mockResolvedValue(mockDomain);

      const { result } = renderHook(() => useSsoDomainTab('idp-1', defaultOptions));

      await act(async () => {
        await result.current.handleVerifyActionColumn(mockDomain);
      });

      expect(mockService.verifyDomain).toHaveBeenCalledWith(mockDomain);
      expect(mockService.associateToProvider).toHaveBeenCalledWith(mockDomain);
      expect(result.current.isUpdating).toBe(false);
      expect(result.current.isUpdatingId).toBeNull();
    });

    it('should reset updating state on failure', async () => {
      vi.mocked(mockService.verifyDomain).mockResolvedValue({
        updatedDomain: { ...mockDomain, status: 'failed' },
        isVerified: false,
      });

      const { result } = renderHook(() => useSsoDomainTab('idp-1', defaultOptions));

      await act(async () => {
        await result.current.handleVerifyActionColumn(mockDomain);
      });

      expect(result.current.isUpdating).toBe(false);
      expect(result.current.isUpdatingId).toBeNull();
    });
  });

  describe('handleToggleSwitch', () => {
    it('should associate domain when toggled on', async () => {
      vi.mocked(mockService.associateToProvider).mockResolvedValue(mockDomain);

      const { result } = renderHook(() => useSsoDomainTab('idp-1', defaultOptions));

      await act(async () => {
        await result.current.handleToggleSwitch(mockDomain, true);
      });

      expect(mockService.associateToProvider).toHaveBeenCalledWith(mockDomain);
      expect(result.current.isUpdating).toBe(false);
      expect(result.current.isUpdatingId).toBeNull();
    });

    it('should delete from provider when toggled off', async () => {
      vi.mocked(mockService.deleteFromProvider).mockResolvedValue(mockDomain);

      const { result } = renderHook(() => useSsoDomainTab('idp-1', defaultOptions));

      await act(async () => {
        await result.current.handleToggleSwitch(mockDomain, false);
      });

      expect(mockService.deleteFromProvider).toHaveBeenCalledWith(mockDomain);
      expect(result.current.isUpdating).toBe(false);
      expect(result.current.isUpdatingId).toBeNull();
    });

    it('should handle association error', async () => {
      vi.mocked(mockService.associateToProvider).mockRejectedValue(new Error('Failed'));

      const { result } = renderHook(() => useSsoDomainTab('idp-1', defaultOptions));

      await act(async () => {
        await result.current.handleToggleSwitch(mockDomain, true);
      });

      expect(result.current.isUpdating).toBe(false);
      expect(result.current.isUpdatingId).toBeNull();
    });

    it('should handle delete from provider error', async () => {
      vi.mocked(mockService.deleteFromProvider).mockRejectedValue(new Error('Failed'));

      const { result } = renderHook(() => useSsoDomainTab('idp-1', defaultOptions));

      await act(async () => {
        await result.current.handleToggleSwitch(mockDomain, false);
      });

      expect(result.current.isUpdating).toBe(false);
      expect(result.current.isUpdatingId).toBeNull();
    });
  });

  describe('modal state management', () => {
    it('should manage modal state correctly', () => {
      const { result } = renderHook(() => useSsoDomainTab('idp-1', defaultOptions));

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

  describe('custom messages', () => {
    it('should pass custom messages to the service hook', () => {
      const customMessages = {
        'domain_create.success': 'Custom success message',
      };

      renderHook(() => useSsoDomainTab('idp-1', { ...defaultOptions, customMessages }));

      expect(useSsoDomainTabService).toHaveBeenCalledWith(
        'idp-1',
        expect.objectContaining({ customMessages }),
      );
    });
  });
});
