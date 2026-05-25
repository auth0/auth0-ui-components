import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useDomainTable } from '../use-domain-table';

import { showToast } from '@/components/auth0/shared/toast';
import { useErrorHandler } from '@/hooks/shared/use-error-handler';
import { createMockDomain, createMockIdentityProvider } from '@/tests/utils';

vi.mock('@/hooks/shared/use-translator', () => ({
  useTranslator: () => ({ t: (key: string) => key }),
}));

const mockHandleError = vi.fn();
vi.mock('@/hooks/shared/use-error-handler', () => ({
  useErrorHandler: () => mockHandleError,
}));

vi.mock('@/components/auth0/shared/toast', () => ({
  showToast: vi.fn(),
}));

const mockService = {
  domains: [],
  providers: [],
  isFetching: false,
  isCreating: false,
  isDeleting: false,
  isVerifying: false,
  isLoadingProviders: false,
  fetchProviders: vi.fn(),
  fetchDomains: vi.fn(),
  onCreateDomain: vi.fn(),
  onVerifyDomain: vi.fn(),
  onDeleteDomain: vi.fn(),
  onAssociateToProvider: vi.fn(),
  onDeleteFromProvider: vi.fn(),
};

vi.mock('@/hooks/my-organization/shared/services/use-domain-table-service', () => ({
  useDomainTableService: () => mockService,
}));

describe('useDomainTable', () => {
  const defaultOptions = {
    createAction: { onBefore: vi.fn(() => true), onAfter: vi.fn() },
    deleteAction: { onBefore: vi.fn(() => true), onAfter: vi.fn() },
    verifyAction: { onBefore: vi.fn(() => true), onAfter: vi.fn() },
    associateToProviderAction: { onBefore: vi.fn(() => true), onAfter: vi.fn() },
    deleteFromProviderAction: { onBefore: vi.fn(() => true), onAfter: vi.fn() },
    customMessages: {},
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should return correct initial state', () => {
      const { result } = renderHook(() => useDomainTable(defaultOptions));

      expect(result.current.showCreateModal).toBe(false);
      expect(result.current.showConfigureModal).toBe(false);
      expect(result.current.showVerifyModal).toBe(false);
      expect(result.current.showDeleteModal).toBe(false);
      expect(result.current.verifyError).toBeUndefined();
      expect(result.current.selectedDomain).toBeNull();
      expect(result.current.domains).toEqual([]);
      expect(result.current.providers).toEqual([]);
    });

    it('should call fetchDomains on mount', () => {
      renderHook(() => useDomainTable(defaultOptions));
      expect(mockService.fetchDomains).toHaveBeenCalledTimes(1);
    });
  });

  describe('handleCreateClick', () => {
    it('should show create modal', () => {
      const { result } = renderHook(() => useDomainTable(defaultOptions));

      act(() => {
        result.current.handleCreateClick();
      });

      expect(result.current.showCreateModal).toBe(true);
    });
  });

  describe('handleCreate', () => {
    it('should create domain, show toast, and open verify modal', async () => {
      const mockDomain = createMockDomain({ domain: 'test.com' });
      mockService.onCreateDomain.mockResolvedValue(mockDomain);

      const { result } = renderHook(() => useDomainTable(defaultOptions));

      await act(async () => {
        await result.current.handleCreate('test.com');
      });

      expect(mockService.onCreateDomain).toHaveBeenCalledWith({ domain: 'test.com' });
      expect(showToast).toHaveBeenCalledWith({
        type: 'success',
        message: 'domain_table.notifications.domain_create.success',
      });
      expect(result.current.selectedDomain).toEqual(mockDomain);
      expect(result.current.showCreateModal).toBe(false);
      expect(result.current.showVerifyModal).toBe(true);
    });

    it('should handle create error', async () => {
      const error = new Error('Create failed');
      mockService.onCreateDomain.mockRejectedValue(error);

      const { result } = renderHook(() => useDomainTable(defaultOptions));

      await act(async () => {
        await result.current.handleCreate('test.com');
      });

      expect(mockHandleError).toHaveBeenCalledWith(error, {
        fallbackMessage: 'domain_table.notifications.domain_create.error',
      });
    });
  });

  describe('handleVerify', () => {
    it('should verify domain successfully and close verify modal', async () => {
      const mockDomain = createMockDomain();
      mockService.onVerifyDomain.mockResolvedValue(true);

      const { result } = renderHook(() => useDomainTable(defaultOptions));

      await act(async () => {
        await result.current.handleVerify(mockDomain);
      });

      expect(result.current.showVerifyModal).toBe(false);
      expect(showToast).toHaveBeenCalledWith({
        type: 'success',
        message: 'domain_table.notifications.domain_verify.success',
      });
    });

    it('should set verify error on verification failure', async () => {
      const mockDomain = createMockDomain({ domain: 'test.com' });
      mockService.onVerifyDomain.mockResolvedValue(false);

      const { result } = renderHook(() => useDomainTable(defaultOptions));

      await act(async () => {
        await result.current.handleVerify(mockDomain);
      });

      expect(result.current.verifyError).toBe('domain_verify.modal.errors.verification_failed');
    });

    it('should handle verify error', async () => {
      const mockDomain = createMockDomain();
      const error = new Error('Verify failed');
      mockService.onVerifyDomain.mockRejectedValue(error);

      const { result } = renderHook(() => useDomainTable(defaultOptions));

      await act(async () => {
        await result.current.handleVerify(mockDomain);
      });

      expect(mockHandleError).toHaveBeenCalledWith(error, {
        fallbackMessage: 'domain_table.notifications.domain_verify.error',
      });
    });
  });

  describe('handleDelete', () => {
    it('should delete domain and close modals', async () => {
      const mockDomain = createMockDomain({ domain: 'test.com' });
      mockService.onDeleteDomain.mockResolvedValue(undefined);

      const { result } = renderHook(() => useDomainTable(defaultOptions));

      await act(async () => {
        await result.current.handleDelete(mockDomain);
      });

      expect(mockService.onDeleteDomain).toHaveBeenCalledWith(mockDomain);
      expect(showToast).toHaveBeenCalledWith({
        type: 'success',
        message: 'domain_table.notifications.domain_delete.success',
      });
      expect(result.current.showDeleteModal).toBe(false);
      expect(result.current.showVerifyModal).toBe(false);
    });

    it('should handle delete error', async () => {
      const mockDomain = createMockDomain();
      const error = new Error('Delete failed');
      mockService.onDeleteDomain.mockRejectedValue(error);

      const { result } = renderHook(() => useDomainTable(defaultOptions));

      await act(async () => {
        await result.current.handleDelete(mockDomain);
      });

      expect(mockHandleError).toHaveBeenCalledWith(error, {
        fallbackMessage: 'domain_table.notifications.domain_delete.error',
      });
    });
  });

  describe('handleToggleSwitch', () => {
    it('should associate domain to provider when checked is true', async () => {
      const mockDomain = createMockDomain({ domain: 'test.com' });
      const mockProvider = createMockIdentityProvider({ name: 'TestIDP' });
      mockService.onAssociateToProvider.mockResolvedValue(undefined);

      const { result } = renderHook(() => useDomainTable(defaultOptions));

      await act(async () => {
        await result.current.handleToggleSwitch(mockDomain, mockProvider, true);
      });

      expect(mockService.onAssociateToProvider).toHaveBeenCalledWith(mockDomain, mockProvider);
      expect(showToast).toHaveBeenCalledWith({
        type: 'success',
        message: 'domain_table.notifications.domain_associate_provider.success',
      });
    });

    it('should delete domain from provider when checked is false', async () => {
      const mockDomain = createMockDomain({ domain: 'test.com' });
      const mockProvider = createMockIdentityProvider({ name: 'TestIDP' });
      mockService.onDeleteFromProvider.mockResolvedValue(undefined);

      const { result } = renderHook(() => useDomainTable(defaultOptions));

      await act(async () => {
        await result.current.handleToggleSwitch(mockDomain, mockProvider, false);
      });

      expect(mockService.onDeleteFromProvider).toHaveBeenCalledWith(mockDomain, mockProvider);
      expect(showToast).toHaveBeenCalledWith({
        type: 'success',
        message: 'domain_table.notifications.domain_delete_provider.success',
      });
    });

    it('should handle associate to provider error', async () => {
      const mockDomain = createMockDomain();
      const mockProvider = createMockIdentityProvider();
      const error = new Error('Associate failed');
      mockService.onAssociateToProvider.mockRejectedValue(error);

      const { result } = renderHook(() => useDomainTable(defaultOptions));

      await act(async () => {
        await result.current.handleToggleSwitch(mockDomain, mockProvider, true);
      });

      expect(mockHandleError).toHaveBeenCalledWith(error, {
        fallbackMessage: 'domain_table.notifications.domain_associate_provider.error',
      });
    });

    it('should handle delete from provider error', async () => {
      const mockDomain = createMockDomain();
      const mockProvider = createMockIdentityProvider();
      const error = new Error('Delete from provider failed');
      mockService.onDeleteFromProvider.mockRejectedValue(error);

      const { result } = renderHook(() => useDomainTable(defaultOptions));

      await act(async () => {
        await result.current.handleToggleSwitch(mockDomain, mockProvider, false);
      });

      expect(mockHandleError).toHaveBeenCalledWith(error, {
        fallbackMessage: 'domain_table.notifications.domain_delete_provider.error',
      });
    });
  });

  describe('handleCloseVerifyModal', () => {
    it('should close verify modal and clear verify error', async () => {
      const mockDomain = createMockDomain();
      mockService.onVerifyDomain.mockResolvedValue(false);

      const { result } = renderHook(() => useDomainTable(defaultOptions));

      // Trigger verify error
      await act(async () => {
        await result.current.handleVerify(mockDomain);
      });
      expect(result.current.verifyError).toBeDefined();

      // Close modal
      act(() => {
        result.current.handleCloseVerifyModal();
      });

      expect(result.current.showVerifyModal).toBe(false);
      expect(result.current.verifyError).toBeUndefined();
    });
  });

  describe('handleConfigureClick', () => {
    it('should show verify modal for unverified domain', async () => {
      const mockDomain = createMockDomain({ status: 'pending' });

      const { result } = renderHook(() => useDomainTable(defaultOptions));

      await act(async () => {
        await result.current.handleConfigureClick(mockDomain);
      });

      expect(result.current.selectedDomain).toEqual(mockDomain);
      expect(result.current.showVerifyModal).toBe(true);
    });

    it('should fetch providers and show configure modal for verified domain', async () => {
      const mockDomain = createMockDomain({ status: 'verified' });
      mockService.fetchProviders.mockResolvedValue(undefined);

      const { result } = renderHook(() => useDomainTable(defaultOptions));

      await act(async () => {
        await result.current.handleConfigureClick(mockDomain);
      });

      expect(result.current.selectedDomain).toEqual(mockDomain);
      expect(mockService.fetchProviders).toHaveBeenCalledWith(mockDomain);
      expect(result.current.showConfigureModal).toBe(true);
    });

    it('should handle fetchProviders error for verified domain', async () => {
      const mockDomain = createMockDomain({ status: 'verified' });
      const error = new Error('Fetch providers failed');
      mockService.fetchProviders.mockRejectedValue(error);

      const { result } = renderHook(() => useDomainTable(defaultOptions));

      await act(async () => {
        await result.current.handleConfigureClick(mockDomain);
      });

      expect(mockHandleError).toHaveBeenCalledWith(error, {
        fallbackMessage: 'domain_table.notifications.fetch_providers_error',
      });
    });
  });

  describe('handleVerifyClick', () => {
    it('should verify, fetch providers, and show configure modal on success', async () => {
      const mockDomain = createMockDomain({ domain: 'test.com' });
      mockService.onVerifyDomain.mockResolvedValue(true);
      mockService.fetchProviders.mockResolvedValue(undefined);

      const { result } = renderHook(() => useDomainTable(defaultOptions));

      await act(async () => {
        await result.current.handleVerifyClick(mockDomain);
      });

      expect(result.current.selectedDomain).toEqual(mockDomain);
      expect(mockService.onVerifyDomain).toHaveBeenCalledWith(mockDomain);
      expect(mockService.fetchProviders).toHaveBeenCalledWith(mockDomain);
      expect(result.current.showConfigureModal).toBe(true);
      expect(showToast).toHaveBeenCalledWith({
        type: 'success',
        message: 'domain_table.notifications.domain_verify.success',
      });
    });

    it('should show error toast on verification failure', async () => {
      const mockDomain = createMockDomain({ domain: 'test.com' });
      mockService.onVerifyDomain.mockResolvedValue(false);

      const { result } = renderHook(() => useDomainTable(defaultOptions));

      await act(async () => {
        await result.current.handleVerifyClick(mockDomain);
      });

      expect(showToast).toHaveBeenCalledWith({
        type: 'error',
        message: 'domain_table.notifications.domain_verify.verification_failed',
      });
    });

    it('should handle verify click error', async () => {
      const mockDomain = createMockDomain();
      const error = new Error('Verify click failed');
      mockService.onVerifyDomain.mockRejectedValue(error);

      const { result } = renderHook(() => useDomainTable(defaultOptions));

      await act(async () => {
        await result.current.handleVerifyClick(mockDomain);
      });

      expect(mockHandleError).toHaveBeenCalledWith(error, {
        fallbackMessage: 'domain_table.notifications.domain_verify.error',
      });
    });
  });

  describe('handleDeleteClick', () => {
    it('should set selected domain, close verify modal, and show delete modal', () => {
      const mockDomain = createMockDomain();

      const { result } = renderHook(() => useDomainTable(defaultOptions));

      // Open verify modal first
      act(() => {
        result.current.setShowVerifyModal(true);
      });

      act(() => {
        result.current.handleDeleteClick(mockDomain);
      });

      expect(result.current.selectedDomain).toEqual(mockDomain);
      expect(result.current.showVerifyModal).toBe(false);
      expect(result.current.showDeleteModal).toBe(true);
    });
  });
});
