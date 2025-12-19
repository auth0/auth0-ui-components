import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import {
  mockCore,
  mockToast,
  createMockDomain,
  createMockIdentityProvider,
  createMockI18nService,
} from '../../../../internals';
import type { UseDomainTableLogicOptions } from '../../../../types/my-org/domain-management/domain-table-types';
import * as useCoreClientModule from '../../../use-core-client';
import * as useErrorHandlerModule from '../../../use-error-handler';
import { useDomainTableLogic } from '../use-domain-table-logic';

// ===== Mock packages =====

const { mockedShowToast } = mockToast();
const { initMockCoreClient } = mockCore();

// ===== Mock Data =====

const createMockOptions = (
  overrides?: Partial<UseDomainTableLogicOptions>,
): UseDomainTableLogicOptions => ({
  t: createMockI18nService().translator('my-org'),
  onCreateDomain: vi.fn(),
  onVerifyDomain: vi.fn(),
  onDeleteDomain: vi.fn(),
  onAssociateToProvider: vi.fn(),
  onDeleteFromProvider: vi.fn(),
  fetchProviders: vi.fn(),
  fetchDomains: vi.fn(),
  ...overrides,
});

// ===== Tests =====

describe('useDomainTableLogic', () => {
  let mockCoreClient: ReturnType<typeof initMockCoreClient>;
  let mockHandleError: ReturnType<typeof vi.fn>;
  let mockOptions: UseDomainTableLogicOptions;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCoreClient = initMockCoreClient();
    mockHandleError = vi.fn();
    mockOptions = createMockOptions();

    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
      coreClient: mockCoreClient,
    });

    vi.spyOn(useErrorHandlerModule, 'useErrorHandler').mockReturnValue({
      handleError: mockHandleError,
    });
  });

  describe('Initial State', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useDomainTableLogic(mockOptions));

      expect(result.current.showCreateModal).toBe(false);
      expect(result.current.showConfigureModal).toBe(false);
      expect(result.current.showVerifyModal).toBe(false);
      expect(result.current.showDeleteModal).toBe(false);
      expect(result.current.verifyError).toBeUndefined();
      expect(result.current.selectedDomain).toBeNull();
    });

    it('should call fetchDomains on mount when coreClient is available', async () => {
      renderHook(() => useDomainTableLogic(mockOptions));

      await waitFor(() => {
        expect(mockOptions.fetchDomains).toHaveBeenCalledTimes(1);
      });
    });

    it('should handle fetchDomains error on initialization', async () => {
      const error = new Error('Fetch domains failed');
      const mockFetchDomains = vi.fn().mockImplementation(() => {
        throw error;
      });
      const options = createMockOptions({ fetchDomains: mockFetchDomains });

      renderHook(() => useDomainTableLogic(options));

      await waitFor(() => {
        expect(mockHandleError).toHaveBeenCalledWith(error, {
          fallbackMessage: 'domain_table.notifications.fetch_domains_error',
        });
      });
    });
  });

  describe('Modal State Management', () => {
    it('should update create modal state', () => {
      const { result } = renderHook(() => useDomainTableLogic(mockOptions));

      act(() => {
        result.current.setShowCreateModal(true);
      });

      expect(result.current.showCreateModal).toBe(true);
    });

    it('should update configure modal state', () => {
      const { result } = renderHook(() => useDomainTableLogic(mockOptions));

      act(() => {
        result.current.setShowConfigureModal(true);
      });

      expect(result.current.showConfigureModal).toBe(true);
    });

    it('should update verify modal state', () => {
      const { result } = renderHook(() => useDomainTableLogic(mockOptions));

      act(() => {
        result.current.setShowVerifyModal(true);
      });

      expect(result.current.showVerifyModal).toBe(true);
    });

    it('should update delete modal state', () => {
      const { result } = renderHook(() => useDomainTableLogic(mockOptions));

      act(() => {
        result.current.setShowDeleteModal(true);
      });

      expect(result.current.showDeleteModal).toBe(true);
    });
  });

  describe('handleCreate', () => {
    it('should create domain successfully and show verify modal', async () => {
      const mockDomain = createMockDomain({ domain: 'test.com' });
      const mockOnCreateDomain = vi.fn().mockResolvedValue(mockDomain);
      const options = createMockOptions({ onCreateDomain: mockOnCreateDomain });

      const { result } = renderHook(() => useDomainTableLogic(options));

      await act(async () => {
        await result.current.handleCreate('test.com');
      });

      expect(mockOnCreateDomain).toHaveBeenCalledWith({ domain: 'test.com' });
      expect(mockedShowToast).toHaveBeenCalledWith({
        type: 'success',
        message: 'domain_table.notifications.domain_create.success',
      });
      expect(result.current.selectedDomain).toEqual(mockDomain);
      expect(result.current.showCreateModal).toBe(false);
      expect(result.current.showVerifyModal).toBe(true);
    });

    it('should handle create domain error', async () => {
      const error = new Error('Create failed');
      const mockOnCreateDomain = vi.fn().mockRejectedValue(error);
      const options = createMockOptions({ onCreateDomain: mockOnCreateDomain });

      const { result } = renderHook(() => useDomainTableLogic(options));

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
      const mockOnVerifyDomain = vi.fn().mockResolvedValue(true);
      const options = createMockOptions({ onVerifyDomain: mockOnVerifyDomain });

      const { result } = renderHook(() => useDomainTableLogic(options));

      await act(async () => {
        await result.current.handleVerify(mockDomain);
      });

      expect(mockOnVerifyDomain).toHaveBeenCalledWith(mockDomain);
      expect(result.current.showVerifyModal).toBe(false);
      expect(mockedShowToast).toHaveBeenCalledWith({
        type: 'success',
        message: 'domain_table.notifications.domain_verify.success',
      });
    });

    it('should handle verification failure and set verify error', async () => {
      const mockDomain = createMockDomain({ domain: 'test.com' });
      const mockOnVerifyDomain = vi.fn().mockResolvedValue(false);
      const options = createMockOptions({ onVerifyDomain: mockOnVerifyDomain });

      const { result } = renderHook(() => useDomainTableLogic(options));

      await act(async () => {
        await result.current.handleVerify(mockDomain);
      });

      expect(result.current.verifyError).toBe('domain_verify.modal.errors.verification_failed');
    });

    it('should handle verify domain error', async () => {
      const mockDomain = createMockDomain();
      const error = new Error('Verify failed');
      const mockOnVerifyDomain = vi.fn().mockRejectedValue(error);
      const options = createMockOptions({ onVerifyDomain: mockOnVerifyDomain });

      const { result } = renderHook(() => useDomainTableLogic(options));

      await act(async () => {
        await result.current.handleVerify(mockDomain);
      });

      expect(mockHandleError).toHaveBeenCalledWith(error, {
        fallbackMessage: 'domain_table.notifications.domain_verify.error',
      });
    });
  });

  describe('handleDelete', () => {
    it('should delete domain successfully', async () => {
      const mockDomain = createMockDomain({ domain: 'test.com' });
      const mockOnDeleteDomain = vi.fn().mockResolvedValue(undefined);
      const options = createMockOptions({ onDeleteDomain: mockOnDeleteDomain });

      const { result } = renderHook(() => useDomainTableLogic(options));

      await act(async () => {
        await result.current.handleDelete(mockDomain);
      });

      expect(mockOnDeleteDomain).toHaveBeenCalledWith(mockDomain);
      expect(mockedShowToast).toHaveBeenCalledWith({
        type: 'success',
        message: 'domain_table.notifications.domain_delete.success',
      });
      expect(result.current.showDeleteModal).toBe(false);
      expect(result.current.showVerifyModal).toBe(false);
    });

    it('should handle delete domain error', async () => {
      const mockDomain = createMockDomain();
      const error = new Error('Delete failed');
      const mockOnDeleteDomain = vi.fn().mockRejectedValue(error);
      const options = createMockOptions({ onDeleteDomain: mockOnDeleteDomain });

      const { result } = renderHook(() => useDomainTableLogic(options));

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
      const mockOnAssociateToProvider = vi.fn().mockResolvedValue(undefined);
      const options = createMockOptions({ onAssociateToProvider: mockOnAssociateToProvider });

      const { result } = renderHook(() => useDomainTableLogic(options));

      await act(async () => {
        await result.current.handleToggleSwitch(mockDomain, mockProvider, true);
      });

      expect(mockOnAssociateToProvider).toHaveBeenCalledWith(mockDomain, mockProvider);
      expect(mockedShowToast).toHaveBeenCalledWith({
        type: 'success',
        message: 'domain_table.notifications.domain_associate_provider.success',
      });
    });

    it('should delete domain from provider when checked is false', async () => {
      const mockDomain = createMockDomain({ domain: 'test.com' });
      const mockProvider = createMockIdentityProvider({ name: 'TestIDP' });
      const mockOnDeleteFromProvider = vi.fn().mockResolvedValue(undefined);
      const options = createMockOptions({ onDeleteFromProvider: mockOnDeleteFromProvider });

      const { result } = renderHook(() => useDomainTableLogic(options));

      await act(async () => {
        await result.current.handleToggleSwitch(mockDomain, mockProvider, false);
      });

      expect(mockOnDeleteFromProvider).toHaveBeenCalledWith(mockDomain, mockProvider);
      expect(mockedShowToast).toHaveBeenCalledWith({
        type: 'success',
        message: 'domain_table.notifications.domain_delete_provider.success',
      });
    });

    it('should handle associate to provider error', async () => {
      const mockDomain = createMockDomain();
      const mockProvider = createMockIdentityProvider();
      const error = new Error('Associate failed');
      const mockOnAssociateToProvider = vi.fn().mockRejectedValue(error);
      const options = createMockOptions({ onAssociateToProvider: mockOnAssociateToProvider });

      const { result } = renderHook(() => useDomainTableLogic(options));

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
      const mockOnDeleteFromProvider = vi.fn().mockRejectedValue(error);
      const options = createMockOptions({ onDeleteFromProvider: mockOnDeleteFromProvider });

      const { result } = renderHook(() => useDomainTableLogic(options));

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
      const { result } = renderHook(() => useDomainTableLogic(mockOptions));

      // Set initial state
      act(() => {
        result.current.setShowVerifyModal(true);
      });

      // Simulate verify error
      await act(async () => {
        await result.current.handleVerify(createMockDomain());
      });

      // Close modal
      act(() => {
        result.current.handleCloseVerifyModal();
      });

      expect(result.current.showVerifyModal).toBe(false);
      expect(result.current.verifyError).toBeUndefined();
    });
  });

  describe('handleCreateClick', () => {
    it('should show create modal', () => {
      const { result } = renderHook(() => useDomainTableLogic(mockOptions));

      act(() => {
        result.current.handleCreateClick();
      });

      expect(result.current.showCreateModal).toBe(true);
    });
  });

  describe('handleConfigureClick', () => {
    it('should show verify modal for unverified domain', async () => {
      const mockDomain = createMockDomain({ status: 'pending' });
      const { result } = renderHook(() => useDomainTableLogic(mockOptions));

      await act(async () => {
        await result.current.handleConfigureClick(mockDomain);
      });

      expect(result.current.selectedDomain).toEqual(mockDomain);
      expect(result.current.showVerifyModal).toBe(true);
    });

    it('should fetch providers and show configure modal for verified domain', async () => {
      const mockDomain = createMockDomain({ status: 'verified' });
      const mockFetchProviders = vi.fn().mockResolvedValue(undefined);
      const options = createMockOptions({ fetchProviders: mockFetchProviders });

      const { result } = renderHook(() => useDomainTableLogic(options));

      await act(async () => {
        await result.current.handleConfigureClick(mockDomain);
      });

      expect(result.current.selectedDomain).toEqual(mockDomain);
      expect(mockFetchProviders).toHaveBeenCalledWith(mockDomain);
      expect(result.current.showConfigureModal).toBe(true);
    });

    it('should handle fetchProviders error for verified domain', async () => {
      const mockDomain = createMockDomain({ status: 'verified' });
      const error = new Error('Fetch providers failed');
      const mockFetchProviders = vi.fn().mockRejectedValue(error);
      const options = createMockOptions({ fetchProviders: mockFetchProviders });

      const { result } = renderHook(() => useDomainTableLogic(options));

      await act(async () => {
        await result.current.handleConfigureClick(mockDomain);
      });

      expect(mockHandleError).toHaveBeenCalledWith(error, {
        fallbackMessage: 'domain_table.notifications.fetch_providers_error',
      });
    });
  });

  describe('handleVerifyClick', () => {
    it('should verify domain and show configure modal on success', async () => {
      const mockDomain = createMockDomain({ domain: 'test.com' });
      const mockOnVerifyDomain = vi.fn().mockResolvedValue(true);
      const options = createMockOptions({ onVerifyDomain: mockOnVerifyDomain });

      const { result } = renderHook(() => useDomainTableLogic(options));

      await act(async () => {
        await result.current.handleVerifyClick(mockDomain);
      });

      expect(result.current.selectedDomain).toEqual(mockDomain);
      expect(mockOnVerifyDomain).toHaveBeenCalledWith(mockDomain);
      expect(result.current.showConfigureModal).toBe(true);
      expect(mockedShowToast).toHaveBeenCalledWith({
        type: 'success',
        message: 'domain_table.notifications.domain_verify.success',
      });
    });

    it('should show error toast on verification failure', async () => {
      const mockDomain = createMockDomain({ domain: 'test.com' });
      const mockOnVerifyDomain = vi.fn().mockResolvedValue(false);
      const options = createMockOptions({ onVerifyDomain: mockOnVerifyDomain });

      const { result } = renderHook(() => useDomainTableLogic(options));

      await act(async () => {
        await result.current.handleVerifyClick(mockDomain);
      });

      expect(mockedShowToast).toHaveBeenCalledWith({
        type: 'error',
        message: 'domain_table.notifications.domain_verify.verification_failed',
      });
    });

    it('should handle verify click error', async () => {
      const mockDomain = createMockDomain();
      const error = new Error('Verify click failed');
      const mockOnVerifyDomain = vi.fn().mockRejectedValue(error);
      const options = createMockOptions({ onVerifyDomain: mockOnVerifyDomain });

      const { result } = renderHook(() => useDomainTableLogic(options));

      await act(async () => {
        await result.current.handleVerifyClick(mockDomain);
      });

      expect(mockHandleError).toHaveBeenCalledWith(error, {
        fallbackMessage: 'domain_table.notifications.domain_verify.error',
      });
    });
  });

  describe('handleDeleteClick', () => {
    it('should set selected domain and show delete modal', () => {
      const mockDomain = createMockDomain();
      const { result } = renderHook(() => useDomainTableLogic(mockOptions));

      // Set verify modal to true initially
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

  describe('Edge Cases and Integration', () => {
    it('should handle multiple modal state changes correctly', () => {
      const { result } = renderHook(() => useDomainTableLogic(mockOptions));

      act(() => {
        result.current.setShowCreateModal(true);
        result.current.setShowConfigureModal(true);
        result.current.setShowVerifyModal(true);
        result.current.setShowDeleteModal(true);
      });

      expect(result.current.showCreateModal).toBe(true);
      expect(result.current.showConfigureModal).toBe(true);
      expect(result.current.showVerifyModal).toBe(true);
      expect(result.current.showDeleteModal).toBe(true);

      act(() => {
        result.current.setShowCreateModal(false);
        result.current.setShowConfigureModal(false);
        result.current.setShowVerifyModal(false);
        result.current.setShowDeleteModal(false);
      });

      expect(result.current.showCreateModal).toBe(false);
      expect(result.current.showConfigureModal).toBe(false);
      expect(result.current.showVerifyModal).toBe(false);
      expect(result.current.showDeleteModal).toBe(false);
    });

    it('should handle domain creation with null return value', async () => {
      const mockOnCreateDomain = vi.fn().mockResolvedValue(null);
      const options = createMockOptions({ onCreateDomain: mockOnCreateDomain });

      const { result } = renderHook(() => useDomainTableLogic(options));

      await act(async () => {
        await result.current.handleCreate('test.com');
      });

      expect(result.current.selectedDomain).toBeNull();
      expect(result.current.showCreateModal).toBe(false);
      expect(result.current.showVerifyModal).toBe(true);
    });

    it('should handle various domain statuses in handleConfigureClick', async () => {
      const { result } = renderHook(() => useDomainTableLogic(mockOptions));

      // Test with 'failed' status
      const failedDomain = createMockDomain({ status: 'failed' });
      await act(async () => {
        await result.current.handleConfigureClick(failedDomain);
      });
      expect(result.current.showVerifyModal).toBe(true);

      // Reset state
      act(() => {
        result.current.setShowVerifyModal(false);
      });

      // Test with 'verified' status
      const verifiedDomain = createMockDomain({ status: 'verified' });
      await act(async () => {
        await result.current.handleConfigureClick(verifiedDomain);
      });
      expect(result.current.showConfigureModal).toBe(true);
    });
  });

  describe('Callback Dependencies', () => {
    it('should update callbacks when dependencies change', () => {
      const { result, rerender } = renderHook((options) => useDomainTableLogic(options), {
        initialProps: mockOptions,
      });

      const initialHandleCreate = result.current.handleCreate;

      // Update the options with a new onCreateDomain function
      const newOptions = createMockOptions({
        onCreateDomain: vi.fn(),
      });

      rerender(newOptions);

      // The callback should be different due to dependency change
      expect(result.current.handleCreate).not.toBe(initialHandleCreate);
    });
  });
});
