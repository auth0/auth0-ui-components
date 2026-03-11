import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { useDomainTable } from '@/hooks/my-organization/use-domain-table';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import * as useErrorHandlerModule from '@/hooks/shared/use-error-handler';
import * as useTranslatorModule from '@/hooks/shared/use-translator';
import {
  mockCore,
  mockToast,
  createMockDomain,
  createMockIdentityProvider,
  createMockI18nService,
} from '@/tests/utils';
import { createTestQueryClientWrapper } from '@/tests/utils/test-provider';
import type { UseDomainTableOptions } from '@/types/my-organization/domain-management/domain-table-types';

// ===== Mock packages =====

const { mockedShowToast } = mockToast();
const { initMockCoreClient } = mockCore();

// ===== Mock Data =====

const createMockOptions = (overrides?: Partial<UseDomainTableOptions>): UseDomainTableOptions => ({
  createAction: { onBefore: vi.fn().mockReturnValue(true), onAfter: vi.fn() },
  deleteAction: { onBefore: vi.fn().mockReturnValue(true), onAfter: vi.fn() },
  verifyAction: { onBefore: vi.fn().mockReturnValue(true), onAfter: vi.fn() },
  associateToProviderAction: { onBefore: vi.fn().mockReturnValue(true), onAfter: vi.fn() },
  deleteFromProviderAction: { onBefore: vi.fn().mockReturnValue(true), onAfter: vi.fn() },
  customMessages: {},
  ...overrides,
});

const renderUseDomainTable = (options: UseDomainTableOptions) => {
  const { wrapper, queryClient } = createTestQueryClientWrapper();
  return { queryClient, ...renderHook(() => useDomainTable(options), { wrapper }) };
};

// ===== Tests =====

describe('useDomainTable', () => {
  let mockCoreClient: ReturnType<typeof initMockCoreClient>;
  let mockOptions: UseDomainTableOptions;
  let mockHandleError: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCoreClient = initMockCoreClient();
    mockOptions = createMockOptions();
    mockHandleError = vi.fn();

    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
      coreClient: mockCoreClient,
    });
    vi.spyOn(useTranslatorModule, 'useTranslator').mockReturnValue({
      t: createMockI18nService().translator('my-organization'),
      changeLanguage: vi.fn(),
      currentLanguage: 'en',
      fallbackLanguage: 'en',
    });
    vi.spyOn(useErrorHandlerModule, 'useErrorHandler').mockReturnValue(mockHandleError);
  });

  describe('Initial State', () => {
    it('should initialize with correct default state', async () => {
      const { result } = renderUseDomainTable(mockOptions);

      expect(result.current.domains).toEqual([]);
      expect(result.current.providers).toEqual([]);
      expect(result.current.isCreating).toBe(false);
      expect(result.current.isDeleting).toBe(false);
      expect(result.current.isVerifying).toBe(false);
      expect(result.current.showCreateModal).toBe(false);
      expect(result.current.showConfigureModal).toBe(false);
      expect(result.current.showVerifyModal).toBe(false);
      expect(result.current.showDeleteModal).toBe(false);
      expect(result.current.verifyError).toBeUndefined();
      expect(result.current.selectedDomain).toBeNull();

      await waitFor(() => {
        expect(result.current.isFetching).toBe(false);
      });
    });

    it('should provide all expected handler functions', () => {
      const { result } = renderUseDomainTable(mockOptions);

      expect(typeof result.current.handleCreate).toBe('function');
      expect(typeof result.current.handleVerify).toBe('function');
      expect(typeof result.current.handleDelete).toBe('function');
      expect(typeof result.current.handleToggleSwitch).toBe('function');
      expect(typeof result.current.handleCreateClick).toBe('function');
      expect(typeof result.current.handleConfigureClick).toBe('function');
      expect(typeof result.current.handleVerifyClick).toBe('function');
      expect(typeof result.current.handleDeleteClick).toBe('function');
      expect(typeof result.current.handleCloseVerifyModal).toBe('function');
    });

    it('should call useTranslator with correct namespace', () => {
      const useTranslatorSpy = vi.spyOn(useTranslatorModule, 'useTranslator');
      renderUseDomainTable(mockOptions);
      expect(useTranslatorSpy).toHaveBeenCalledWith('domain_management', {});
    });
  });

  describe('Modal State Management', () => {
    it('should update create modal state', () => {
      const { result } = renderUseDomainTable(mockOptions);
      act(() => {
        result.current.setShowCreateModal(true);
      });
      expect(result.current.showCreateModal).toBe(true);
    });

    it('should update configure modal state', () => {
      const { result } = renderUseDomainTable(mockOptions);
      act(() => {
        result.current.setShowConfigureModal(true);
      });
      expect(result.current.showConfigureModal).toBe(true);
    });

    it('should update verify modal state', () => {
      const { result } = renderUseDomainTable(mockOptions);
      act(() => {
        result.current.setShowVerifyModal(true);
      });
      expect(result.current.showVerifyModal).toBe(true);
    });

    it('should update delete modal state', () => {
      const { result } = renderUseDomainTable(mockOptions);
      act(() => {
        result.current.setShowDeleteModal(true);
      });
      expect(result.current.showDeleteModal).toBe(true);
    });

    it('should handle multiple modal state changes correctly', () => {
      const { result } = renderUseDomainTable(mockOptions);

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
  });

  describe('handleCreateClick', () => {
    it('should show create modal', () => {
      const { result } = renderUseDomainTable(mockOptions);
      act(() => {
        result.current.handleCreateClick();
      });
      expect(result.current.showCreateModal).toBe(true);
    });
  });

  describe('handleCreate', () => {
    it('should create domain successfully and show verify modal', async () => {
      const mockDomain = createMockDomain({ domain: 'test.com' });
      (
        mockCoreClient.getMyOrganizationApiClient().organization.domains.create as ReturnType<
          typeof vi.fn
        >
      ).mockResolvedValue(mockDomain);

      const { result } = renderUseDomainTable(mockOptions);

      await act(async () => {
        await result.current.handleCreate('test.com');
      });

      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.domains.create,
      ).toHaveBeenCalledWith({ domain: 'test.com' });
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
      (
        mockCoreClient.getMyOrganizationApiClient().organization.domains.create as ReturnType<
          typeof vi.fn
        >
      ).mockRejectedValue(error);

      const { result } = renderUseDomainTable(mockOptions);

      await act(async () => {
        await result.current.handleCreate('test.com');
      });

      expect(mockHandleError).toHaveBeenCalledWith(error, {
        fallbackMessage: 'domain_table.notifications.domain_create.error',
      });
    });

    it('should handle null return value from create', async () => {
      (
        mockCoreClient.getMyOrganizationApiClient().organization.domains.create as ReturnType<
          typeof vi.fn
        >
      ).mockResolvedValue(null);

      const { result } = renderUseDomainTable(mockOptions);

      await act(async () => {
        await result.current.handleCreate('test.com');
      });

      expect(result.current.selectedDomain).toBeNull();
      expect(result.current.showCreateModal).toBe(false);
      expect(result.current.showVerifyModal).toBe(true);
    });

    it('should call onBefore and proceed when it returns true', async () => {
      const mockDomain = createMockDomain({ domain: 'test.com' });
      (
        mockCoreClient.getMyOrganizationApiClient().organization.domains.create as ReturnType<
          typeof vi.fn
        >
      ).mockResolvedValue(mockDomain);
      const options = createMockOptions({
        createAction: { onBefore: vi.fn().mockReturnValue(true), onAfter: vi.fn() },
      });

      const { result } = renderUseDomainTable(options);

      await act(async () => {
        await result.current.handleCreate('test.com');
      });

      expect(options.createAction!.onBefore).toHaveBeenCalled();
      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.domains.create,
      ).toHaveBeenCalled();
    });

    it('should call onAfter after successful creation', async () => {
      const mockDomain = createMockDomain({ domain: 'test.com' });
      (
        mockCoreClient.getMyOrganizationApiClient().organization.domains.create as ReturnType<
          typeof vi.fn
        >
      ).mockResolvedValue(mockDomain);

      const { result } = renderUseDomainTable(mockOptions);

      await act(async () => {
        await result.current.handleCreate('test.com');
      });

      await waitFor(() => {
        expect(mockOptions.createAction!.onAfter).toHaveBeenCalledWith(mockDomain);
      });
    });
  });

  describe('handleVerify', () => {
    it('should verify domain successfully and close verify modal', async () => {
      const mockDomain = createMockDomain();

      const { result } = renderUseDomainTable(mockOptions);

      await act(async () => {
        await result.current.handleVerify(mockDomain);
      });

      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.domains.verify.create,
      ).toHaveBeenCalledWith(mockDomain.id);
      expect(result.current.showVerifyModal).toBe(false);
      expect(mockedShowToast).toHaveBeenCalledWith({
        type: 'success',
        message: 'domain_table.notifications.domain_verify.success',
      });
    });

    it('should set verifyError when verification returns false', async () => {
      const mockDomain = createMockDomain({ domain: 'test.com' });
      (
        mockCoreClient.getMyOrganizationApiClient().organization.domains.verify
          .create as ReturnType<typeof vi.fn>
      ).mockResolvedValue({ status: 'pending' });

      const { result } = renderUseDomainTable(mockOptions);

      await act(async () => {
        await result.current.handleVerify(mockDomain);
      });

      expect(result.current.verifyError).toBe('domain_verify.modal.errors.verification_failed');
    });

    it('should handle verify domain error', async () => {
      const mockDomain = createMockDomain();
      const error = new Error('Verify failed');
      (
        mockCoreClient.getMyOrganizationApiClient().organization.domains.verify
          .create as ReturnType<typeof vi.fn>
      ).mockRejectedValue(error);

      const { result } = renderUseDomainTable(mockOptions);

      await act(async () => {
        await result.current.handleVerify(mockDomain);
      });

      expect(mockHandleError).toHaveBeenCalledWith(error, {
        fallbackMessage: 'domain_table.notifications.domain_verify.error',
      });
    });

    it('should call onAfter after successful verification', async () => {
      const mockDomain = createMockDomain();

      const { result } = renderUseDomainTable(mockOptions);

      await act(async () => {
        await result.current.handleVerify(mockDomain);
      });

      await waitFor(() => {
        expect(mockOptions.verifyAction!.onAfter).toHaveBeenCalledWith(mockDomain);
      });
    });
  });

  describe('handleDelete', () => {
    it('should delete domain successfully and close modals', async () => {
      const mockDomain = createMockDomain({ domain: 'test.com' });

      const { result } = renderUseDomainTable(mockOptions);

      await act(async () => {
        await result.current.handleDelete(mockDomain);
      });

      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.domains.delete,
      ).toHaveBeenCalledWith(mockDomain.id);
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
      (
        mockCoreClient.getMyOrganizationApiClient().organization.domains.delete as ReturnType<
          typeof vi.fn
        >
      ).mockRejectedValue(error);

      const { result } = renderUseDomainTable(mockOptions);

      await act(async () => {
        await result.current.handleDelete(mockDomain);
      });

      expect(mockHandleError).toHaveBeenCalledWith(error, {
        fallbackMessage: 'domain_table.notifications.domain_delete.error',
      });
    });

    it('should call onAfter after successful deletion', async () => {
      const mockDomain = createMockDomain();

      const { result } = renderUseDomainTable(mockOptions);

      await act(async () => {
        await result.current.handleDelete(mockDomain);
      });

      await waitFor(() => {
        expect(mockOptions.deleteAction!.onAfter).toHaveBeenCalledWith(mockDomain);
      });
    });
  });

  describe('handleToggleSwitch', () => {
    it('should associate domain to provider when checked is true', async () => {
      const mockDomain = createMockDomain({ domain: 'test.com' });
      const mockProvider = createMockIdentityProvider({ name: 'TestIDP' });

      const { result } = renderUseDomainTable(mockOptions);

      await act(async () => {
        await result.current.handleToggleSwitch(mockDomain, mockProvider, true);
      });

      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.domains.create,
      ).toHaveBeenCalledWith(mockProvider.id, { domain: mockDomain.domain });
      expect(mockedShowToast).toHaveBeenCalledWith({
        type: 'success',
        message: 'domain_table.notifications.domain_associate_provider.success',
      });
    });

    it('should delete domain from provider when checked is false', async () => {
      const mockDomain = createMockDomain({ domain: 'test.com' });
      const mockProvider = createMockIdentityProvider({ name: 'TestIDP' });

      const { result } = renderUseDomainTable(mockOptions);

      await act(async () => {
        await result.current.handleToggleSwitch(mockDomain, mockProvider, false);
      });

      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.domains.delete,
      ).toHaveBeenCalledWith(mockProvider.id, mockDomain.domain);
      expect(mockedShowToast).toHaveBeenCalledWith({
        type: 'success',
        message: 'domain_table.notifications.domain_delete_provider.success',
      });
    });

    it('should handle associate to provider error', async () => {
      const mockDomain = createMockDomain();
      const mockProvider = createMockIdentityProvider();
      const error = new Error('Associate failed');
      (
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.domains
          .create as ReturnType<typeof vi.fn>
      ).mockRejectedValue(error);

      const { result } = renderUseDomainTable(mockOptions);

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
      (
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.domains
          .delete as ReturnType<typeof vi.fn>
      ).mockRejectedValue(error);

      const { result } = renderUseDomainTable(mockOptions);

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
      const { result } = renderUseDomainTable(mockOptions);

      act(() => {
        result.current.setShowVerifyModal(true);
      });

      // Trigger a verify error
      (
        mockCoreClient.getMyOrganizationApiClient().organization.domains.verify
          .create as ReturnType<typeof vi.fn>
      ).mockResolvedValue({ status: 'pending' });
      await act(async () => {
        await result.current.handleVerify(createMockDomain());
      });

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
      const { result } = renderUseDomainTable(mockOptions);

      await act(async () => {
        await result.current.handleConfigureClick(mockDomain);
      });

      expect(result.current.selectedDomain).toEqual(mockDomain);
      expect(result.current.showVerifyModal).toBe(true);
    });

    it('should show verify modal for failed domain', async () => {
      const failedDomain = createMockDomain({ status: 'failed' });
      const { result } = renderUseDomainTable(mockOptions);

      await act(async () => {
        await result.current.handleConfigureClick(failedDomain);
      });

      expect(result.current.showVerifyModal).toBe(true);
    });

    it('should fetch providers and show configure modal for verified domain', async () => {
      const verifiedDomain = createMockDomain({ status: 'verified' });
      const provider = createMockIdentityProvider({ id: 'provider-1', display_name: 'Provider 1' });

      (
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders
          .list as ReturnType<typeof vi.fn>
      ).mockResolvedValue({ identity_providers: [provider] });
      (
        mockCoreClient.getMyOrganizationApiClient().organization.domains.identityProviders
          .get as ReturnType<typeof vi.fn>
      ).mockResolvedValue({ identity_providers: [{ id: 'provider-1' }] });

      const { result } = renderUseDomainTable(mockOptions);

      await act(async () => {
        await result.current.handleConfigureClick(verifiedDomain);
      });

      expect(result.current.selectedDomain).toEqual(verifiedDomain);
      expect(result.current.showConfigureModal).toBe(true);
    });

    it('should handle fetchProviders error for verified domain', async () => {
      const verifiedDomain = createMockDomain({ status: 'verified' });
      const error = new Error('Fetch providers failed');
      (
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders
          .list as ReturnType<typeof vi.fn>
      ).mockRejectedValue(error);

      const { result } = renderUseDomainTable(mockOptions);

      await act(async () => {
        await result.current.handleConfigureClick(verifiedDomain);
      });

      expect(mockHandleError).toHaveBeenCalledWith(error, {
        fallbackMessage: 'domain_table.notifications.fetch_providers_error',
      });
    });
  });

  describe('handleVerifyClick', () => {
    it('should verify domain and show configure modal on success', async () => {
      const mockDomain = createMockDomain({ domain: 'test.com' });

      const { result } = renderUseDomainTable(mockOptions);

      await act(async () => {
        await result.current.handleVerifyClick(mockDomain);
      });

      expect(result.current.selectedDomain).toEqual(mockDomain);
      expect(result.current.showConfigureModal).toBe(true);
      expect(mockedShowToast).toHaveBeenCalledWith({
        type: 'success',
        message: 'domain_table.notifications.domain_verify.success',
      });
    });

    it('should show error toast on verification failure', async () => {
      const mockDomain = createMockDomain({ domain: 'test.com' });
      (
        mockCoreClient.getMyOrganizationApiClient().organization.domains.verify
          .create as ReturnType<typeof vi.fn>
      ).mockResolvedValue({ status: 'pending' });

      const { result } = renderUseDomainTable(mockOptions);

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
      (
        mockCoreClient.getMyOrganizationApiClient().organization.domains.verify
          .create as ReturnType<typeof vi.fn>
      ).mockRejectedValue(error);

      const { result } = renderUseDomainTable(mockOptions);

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
      const { result } = renderUseDomainTable(mockOptions);

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

  describe('Provider association logic', () => {
    it('should correctly map associated providers', async () => {
      const verifiedDomain = createMockDomain({ status: 'verified' });
      const provider1 = createMockIdentityProvider({ id: 'p1', display_name: 'Provider 1' });
      const provider2 = createMockIdentityProvider({ id: 'p2', display_name: 'Provider 2' });
      const provider3 = createMockIdentityProvider({ id: 'p3', display_name: 'Provider 3' });

      (
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders
          .list as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        identity_providers: [provider1, provider2, provider3],
      });
      (
        mockCoreClient.getMyOrganizationApiClient().organization.domains.identityProviders
          .get as ReturnType<typeof vi.fn>
      ).mockResolvedValue({
        identity_providers: [{ id: 'p1' }, { id: 'p3' }],
      });

      const { result } = renderUseDomainTable(mockOptions);

      await act(async () => {
        await result.current.handleConfigureClick(verifiedDomain);
      });

      await waitFor(() => {
        expect(result.current.providers).toHaveLength(3);
      });

      expect(result.current.providers.find((p) => p.id === 'p1')!.is_associated).toBe(true);
      expect(result.current.providers.find((p) => p.id === 'p2')!.is_associated).toBe(false);
      expect(result.current.providers.find((p) => p.id === 'p3')!.is_associated).toBe(true);
    });

    it('should handle null provider responses gracefully', async () => {
      const verifiedDomain = createMockDomain({ status: 'verified' });

      (
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders
          .list as ReturnType<typeof vi.fn>
      ).mockResolvedValue({ identity_providers: null });
      (
        mockCoreClient.getMyOrganizationApiClient().organization.domains.identityProviders
          .get as ReturnType<typeof vi.fn>
      ).mockResolvedValue({ identity_providers: null });

      const { result } = renderUseDomainTable(mockOptions);

      await act(async () => {
        await result.current.handleConfigureClick(verifiedDomain);
      });

      expect(result.current.providers).toEqual([]);
    });
  });
});
