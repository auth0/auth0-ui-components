import type {
  CreateOrganizationDomainRequestContent,
  EnhancedTranslationFunction,
} from '@auth0/universal-components-core';
import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import { useDomainTable } from '@/hooks/my-organization/use-domain-table';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import * as useErrorHandlerModule from '@/hooks/shared/use-error-handler';
import * as useTranslatorModule from '@/hooks/shared/use-translator';
import {
  mockCore,
  createMockDomain,
  createMockIdentityProvider,
  createMockI18nService,
  setupAllCommonMocks,
} from '@/tests/utils';
import { createTestQueryClientWrapper } from '@/tests/utils/test-provider';
import type { UseDomainTableOptions } from '@/types/my-organization/domain-management/domain-table-types';

// ===== Mock packages =====

const { initMockCoreClient } = mockCore();

// ===== Mock Data =====

const createMockOptions = (overrides?: Partial<UseDomainTableOptions>): UseDomainTableOptions => ({
  createAction: {
    onBefore: vi.fn().mockReturnValue(true),
    onAfter: vi.fn(),
  },
  deleteAction: {
    onBefore: vi.fn().mockReturnValue(true),
    onAfter: vi.fn(),
  },
  verifyAction: {
    onBefore: vi.fn().mockReturnValue(true),
    onAfter: vi.fn(),
  },
  associateToProviderAction: {
    onBefore: vi.fn().mockReturnValue(true),
    onAfter: vi.fn(),
  },
  deleteFromProviderAction: {
    onBefore: vi.fn().mockReturnValue(true),
    onAfter: vi.fn(),
  },
  customMessages: {},
  ...overrides,
});

const renderUseDomainTable = (options: UseDomainTableOptions) => {
  const { wrapper, queryClient } = createTestQueryClientWrapper();
  return {
    queryClient,
    ...renderHook(() => useDomainTable(options), { wrapper }),
  };
};

// ===== Tests =====

describe('useDomainTable', () => {
  let mockCoreClient: ReturnType<typeof initMockCoreClient>;
  let mockOptions: UseDomainTableOptions;
  let mockT: EnhancedTranslationFunction;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCoreClient = initMockCoreClient();
    mockOptions = createMockOptions();
    mockT = createMockI18nService().translator('domain_management');

    setupAllCommonMocks({
      coreClient: mockCoreClient,
      useCoreClientModule,
      useTranslatorModule,
      useErrorHandlerModule,
    });

    // Override translator with custom mock that has domain_management context
    vi.spyOn(useTranslatorModule, 'useTranslator').mockReturnValue({
      t: mockT,
      changeLanguage: vi.fn(),
      currentLanguage: 'en',
      fallbackLanguage: 'en',
    });
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

      await waitFor(() => {
        expect(result.current.isFetching).toBe(false);
      });
    });

    it('should fetch domains automatically on mount', async () => {
      const { result } = renderUseDomainTable(mockOptions);

      await waitFor(() => {
        expect(result.current.isFetching).toBe(false);
      });

      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.domains.list,
      ).toHaveBeenCalled();
    });
  });

  describe('Modal Management', () => {
    it('should open create modal', () => {
      const { result } = renderUseDomainTable(mockOptions);

      act(() => {
        result.current.handleCreateClick();
      });

      expect(result.current.showCreateModal).toBe(true);
    });

    it('should open delete modal', async () => {
      const mockDomain = createMockDomain();
      mockCoreClient.getMyOrganizationApiClient().organization.domains.list = vi
        .fn()
        .mockResolvedValue({ organization_domains: [mockDomain] });

      const { result } = renderUseDomainTable(mockOptions);

      await waitFor(() => {
        expect(result.current.isFetching).toBe(false);
      });

      act(() => {
        result.current.handleDeleteClick(mockDomain);
      });

      expect(result.current.showDeleteModal).toBe(true);
      expect(result.current.selectedDomain).toEqual(mockDomain);
    });

    it('should open configure modal for verified domain and fetch providers', async () => {
      const mockDomain = createMockDomain({ status: 'verified', id: 'domain-1' });
      const mockProvider = createMockIdentityProvider({ id: 'provider-1' });

      mockCoreClient.getMyOrganizationApiClient().organization.domains.list = vi
        .fn()
        .mockResolvedValue({ organization_domains: [mockDomain] });

      mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.list = vi
        .fn()
        .mockResolvedValue({ identity_providers: [mockProvider] });

      mockCoreClient.getMyOrganizationApiClient().organization.domains.identityProviders.get = vi
        .fn()
        .mockResolvedValue({ identity_providers: [] });

      const { result } = renderUseDomainTable(mockOptions);

      await waitFor(() => {
        expect(result.current.isFetching).toBe(false);
      });

      act(() => {
        result.current.handleConfigureClick(mockDomain);
      });

      expect(result.current.showConfigureModal).toBe(true);
      expect(result.current.selectedDomain).toEqual(mockDomain);

      // Should fetch providers
      await waitFor(() => {
        expect(result.current.isLoadingProviders).toBe(false);
      });

      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.list,
      ).toHaveBeenCalled();
      expect(result.current.providers).toHaveLength(1);
    });

    it('should open verify modal for unverified domain', async () => {
      const mockDomain = createMockDomain({ status: 'pending' });
      mockCoreClient.getMyOrganizationApiClient().organization.domains.list = vi
        .fn()
        .mockResolvedValue({ organization_domains: [mockDomain] });

      const { result } = renderUseDomainTable(mockOptions);

      await waitFor(() => {
        expect(result.current.isFetching).toBe(false);
      });

      act(() => {
        result.current.handleConfigureClick(mockDomain);
      });

      expect(result.current.showVerifyModal).toBe(true);
      expect(result.current.showConfigureModal).toBe(false);
    });

    it('should close all modals and clear verifyError', () => {
      const { result } = renderUseDomainTable(mockOptions);

      act(() => {
        result.current.handleCreateClick();
      });

      expect(result.current.showCreateModal).toBe(true);

      act(() => {
        result.current.closeModal();
      });

      expect(result.current.showCreateModal).toBe(false);
      expect(result.current.verifyError).toBeUndefined();
    });
  });

  describe('handleCreate', () => {
    it('should create domain and open verify modal', async () => {
      const mockDomain = createMockDomain();
      const domainUrl = mockDomain.domain;
      const expectedPayload: CreateOrganizationDomainRequestContent = { domain: domainUrl };

      mockCoreClient.getMyOrganizationApiClient().organization.domains.create = vi
        .fn()
        .mockResolvedValue(mockDomain);

      mockCoreClient.getMyOrganizationApiClient().organization.domains.list = vi
        .fn()
        .mockResolvedValue({ organization_domains: [mockDomain] });

      const { result } = renderUseDomainTable(mockOptions);

      await act(async () => {
        await result.current.handleCreate(domainUrl);
      });

      await waitFor(() => {
        expect(result.current.isCreating).toBe(false);
      });

      expect(mockOptions.createAction!.onBefore).toHaveBeenCalled();
      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.domains.create,
      ).toHaveBeenCalledWith(expectedPayload);
      expect(mockOptions.createAction!.onAfter).toHaveBeenCalled();

      // Should transition to verify modal
      expect(result.current.showVerifyModal).toBe(true);
      expect(result.current.selectedDomain?.id).toBe(mockDomain.id);
    });
  });

  describe('handleDelete', () => {
    it('should delete domain and close modal', async () => {
      const mockDomain = createMockDomain();

      const { result } = renderUseDomainTable(mockOptions);

      await act(async () => {
        await result.current.handleDelete(mockDomain);
      });

      await waitFor(() => {
        expect(result.current.isDeleting).toBe(false);
      });

      expect(mockOptions.deleteAction!.onBefore).toHaveBeenCalledWith(mockDomain);
      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.domains.delete,
      ).toHaveBeenCalledWith(mockDomain.id);
      expect(mockOptions.deleteAction!.onAfter).toHaveBeenCalled();

      // Should close modal and clear selection
      expect(result.current.showDeleteModal).toBe(false);
      expect(result.current.selectedDomain).toBeNull();
    });
  });

  describe('handleVerify', () => {
    it('should verify domain successfully and close modal', async () => {
      const mockDomain = createMockDomain();

      const { result } = renderUseDomainTable(mockOptions);

      await act(async () => {
        await result.current.handleVerify(mockDomain);
      });

      await waitFor(() => {
        expect(result.current.isVerifying).toBe(false);
      });

      expect(mockOptions.verifyAction!.onBefore).toHaveBeenCalledWith(mockDomain);
      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.domains.verify.create,
      ).toHaveBeenCalledWith(mockDomain.id);
      expect(mockOptions.verifyAction!.onAfter).toHaveBeenCalled();
    });

    it('should set verifyError when verification fails', async () => {
      const mockDomain = createMockDomain();
      mockCoreClient.getMyOrganizationApiClient().organization.domains.verify.create = vi
        .fn()
        .mockResolvedValue({ status: 'pending' });

      const { result } = renderUseDomainTable(mockOptions);

      await act(async () => {
        await result.current.handleVerify(mockDomain);
      });

      await waitFor(() => {
        expect(result.current.verifyError).toBeDefined();
      });

      expect(result.current.verifyError).toBeTruthy();
    });
  });

  describe('handleToggleSwitch', () => {
    it('should associate domain to provider when checked', async () => {
      const mockDomain = createMockDomain();
      const mockProvider = createMockIdentityProvider();

      const { result } = renderUseDomainTable(mockOptions);

      await act(async () => {
        await result.current.handleToggleSwitch(mockDomain, mockProvider, true);
      });

      expect(mockOptions.associateToProviderAction!.onBefore).toHaveBeenCalledWith(
        mockDomain,
        mockProvider,
      );
      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.domains.create,
      ).toHaveBeenCalledWith(mockProvider.id, { domain: mockDomain.domain });
    });

    it('should delete domain from provider when unchecked', async () => {
      const mockDomain = createMockDomain();
      const mockProvider = createMockIdentityProvider();

      const { result } = renderUseDomainTable(mockOptions);

      await act(async () => {
        await result.current.handleToggleSwitch(mockDomain, mockProvider, false);
      });

      expect(mockOptions.deleteFromProviderAction!.onBefore).toHaveBeenCalledWith(
        mockDomain,
        mockProvider,
      );
      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.domains.delete,
      ).toHaveBeenCalledWith(mockProvider.id, mockDomain.domain);
    });

    it('should abort associate when onBefore returns false', async () => {
      const mockDomain = createMockDomain();
      const mockProvider = createMockIdentityProvider();

      const options = createMockOptions({
        associateToProviderAction: {
          onBefore: vi.fn().mockReturnValue(false),
          onAfter: vi.fn(),
        },
      });

      const { result } = renderUseDomainTable(options);

      await waitFor(() => expect(result.current.isFetching).toBe(false));

      await expect(
        result.current.handleToggleSwitch(mockDomain, mockProvider, true),
      ).rejects.toThrow();

      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.domains.create,
      ).not.toHaveBeenCalled();
    });

    it('should abort delete from provider when onBefore returns false', async () => {
      const mockDomain = createMockDomain();
      const mockProvider = createMockIdentityProvider();

      const options = createMockOptions({
        deleteFromProviderAction: {
          onBefore: vi.fn().mockReturnValue(false),
          onAfter: vi.fn(),
        },
      });

      const { result } = renderUseDomainTable(options);

      await waitFor(() => expect(result.current.isFetching).toBe(false));

      await expect(
        result.current.handleToggleSwitch(mockDomain, mockProvider, false),
      ).rejects.toThrow();

      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.domains.delete,
      ).not.toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('should expose error from domains query', async () => {
      const error = new Error('Network error');
      const mockList = vi.fn().mockRejectedValue(error);

      // Set up the mock before creating the core client reference
      const apiService = mockCoreClient.getMyOrganizationApiClient();
      apiService.organization.domains.list = mockList;

      const { result } = renderUseDomainTable(mockOptions);

      await waitFor(() => {
        expect(result.current.isFetching).toBe(false);
      });

      // Error should be exposed even though handleError processes it
      expect(result.current.error).toBeTruthy();
      expect(mockList).toHaveBeenCalled();
    });

    it('should retry on error', async () => {
      const error = new Error('Network error');
      const mockList = vi
        .fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValue({ organization_domains: [] });

      // Set up error scenario
      const apiService = mockCoreClient.getMyOrganizationApiClient();
      apiService.organization.domains.list = mockList;

      const { result } = renderUseDomainTable(mockOptions);

      await waitFor(() => {
        expect(result.current.isFetching).toBe(false);
      });

      // Should have error after initial failed fetch
      expect(result.current.error).toBeTruthy();
      expect(mockList).toHaveBeenCalledTimes(1);

      // Retry should trigger another fetch
      await act(async () => {
        await result.current.retry();
      });

      await waitFor(() => {
        expect(mockList).toHaveBeenCalledTimes(2);
      });

      // Error should be cleared after successful retry
      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });

    it('should retry failed create mutation', async () => {
      const error = new Error('Create failed');
      const mockDomain = createMockDomain();

      mockCoreClient.getMyOrganizationApiClient().organization.domains.create = vi
        .fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValue(mockDomain);

      const { result } = renderUseDomainTable(mockOptions);

      await waitFor(() => expect(result.current.isFetching).toBe(false));

      await expect(result.current.handleCreate(mockDomain.domain)).rejects.toThrow('Create failed');

      await waitFor(() => {
        expect(result.current.error).toBe(error);
      });

      await act(async () => {
        await result.current.retry();
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });

    it('should retry failed verify mutation', async () => {
      const error = new Error('Verify failed');
      const mockDomain = createMockDomain();

      mockCoreClient.getMyOrganizationApiClient().organization.domains.verify.create = vi
        .fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValue({ status: 'verified' });

      const { result } = renderUseDomainTable(mockOptions);

      await waitFor(() => expect(result.current.isFetching).toBe(false));

      await expect(result.current.handleVerify(mockDomain)).rejects.toThrow('Verify failed');

      await waitFor(() => {
        expect(result.current.error).toBe(error);
      });

      await act(async () => {
        await result.current.retry();
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });

    it('should retry failed delete mutation', async () => {
      const error = new Error('Delete failed');
      const mockDomain = createMockDomain();

      mockCoreClient.getMyOrganizationApiClient().organization.domains.delete = vi
        .fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValue(undefined);

      const { result } = renderUseDomainTable(mockOptions);

      await waitFor(() => expect(result.current.isFetching).toBe(false));

      await expect(result.current.handleDelete(mockDomain)).rejects.toThrow('Delete failed');

      await waitFor(() => {
        expect(result.current.error).toBe(error);
      });

      await act(async () => {
        await result.current.retry();
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });

    it('should retry failed associate to provider mutation', async () => {
      const error = new Error('Associate failed');
      const mockDomain = createMockDomain();
      const mockProvider = createMockIdentityProvider();

      mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.domains.create = vi
        .fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValue(undefined);

      const { result } = renderUseDomainTable(mockOptions);

      await waitFor(() => expect(result.current.isFetching).toBe(false));

      await expect(
        result.current.handleToggleSwitch(mockDomain, mockProvider, true),
      ).rejects.toThrow('Associate failed');

      await waitFor(() => {
        expect(result.current.error).toBe(error);
      });

      await act(async () => {
        await result.current.retry();
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });

    it('should retry failed delete from provider mutation', async () => {
      const error = new Error('Disassociate failed');
      const mockDomain = createMockDomain();
      const mockProvider = createMockIdentityProvider();

      mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.domains.delete = vi
        .fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValue(undefined);

      const { result } = renderUseDomainTable(mockOptions);

      await waitFor(() => expect(result.current.isFetching).toBe(false));

      await expect(
        result.current.handleToggleSwitch(mockDomain, mockProvider, false),
      ).rejects.toThrow('Disassociate failed');

      await waitFor(() => {
        expect(result.current.error).toBe(error);
      });

      await act(async () => {
        await result.current.retry();
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });

    it('should retry providers query error', async () => {
      const error = new Error('Providers fetch failed');
      const mockDomain = createMockDomain({ status: 'verified', id: 'domain-1' });

      mockCoreClient.getMyOrganizationApiClient().organization.domains.list = vi
        .fn()
        .mockResolvedValue({ organization_domains: [mockDomain] });

      mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.list = vi
        .fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValue({ identity_providers: [] });

      mockCoreClient.getMyOrganizationApiClient().organization.domains.identityProviders.get = vi
        .fn()
        .mockResolvedValue({ identity_providers: [] });

      const { result } = renderUseDomainTable(mockOptions);

      await waitFor(() => expect(result.current.isFetching).toBe(false));

      act(() => {
        result.current.handleConfigureClick(mockDomain);
      });

      await waitFor(() => {
        expect(result.current.error).toBe(error);
      });

      await act(async () => {
        await result.current.retry();
      });

      await waitFor(() => {
        expect(result.current.error).toBeNull();
      });
    });
  });

  describe('handleVerifyClick', () => {
    it('should verify and transition to configure modal on success', async () => {
      const mockDomain = createMockDomain({ id: 'domain-1' });

      mockCoreClient.getMyOrganizationApiClient().organization.domains.list = vi
        .fn()
        .mockResolvedValue({ organization_domains: [mockDomain] });

      mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.list = vi
        .fn()
        .mockResolvedValue({ identity_providers: [] });

      mockCoreClient.getMyOrganizationApiClient().organization.domains.identityProviders.get = vi
        .fn()
        .mockResolvedValue({ identity_providers: [] });

      const { result } = renderUseDomainTable(mockOptions);

      await waitFor(() => expect(result.current.isFetching).toBe(false));

      await act(async () => {
        await result.current.handleVerifyClick(mockDomain);
      });

      await waitFor(() => {
        expect(result.current.isVerifying).toBe(false);
      });

      expect(result.current.showConfigureModal).toBe(true);
    });

    it('should set verifyError when verification fails during handleVerifyClick', async () => {
      const mockDomain = createMockDomain({ id: 'domain-1' });

      mockCoreClient.getMyOrganizationApiClient().organization.domains.list = vi
        .fn()
        .mockResolvedValue({ organization_domains: [mockDomain] });

      mockCoreClient.getMyOrganizationApiClient().organization.domains.verify.create = vi
        .fn()
        .mockResolvedValue({ status: 'pending' });

      const { result } = renderUseDomainTable(mockOptions);

      await waitFor(() => expect(result.current.isFetching).toBe(false));

      await act(async () => {
        await result.current.handleVerifyClick(mockDomain);
      });

      await waitFor(() => {
        expect(result.current.verifyError).toBeDefined();
      });

      expect(result.current.showConfigureModal).toBe(false);
    });
  });
});
