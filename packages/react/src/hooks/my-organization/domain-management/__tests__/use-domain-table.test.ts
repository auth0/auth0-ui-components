import type {
  CreateOrganizationDomainRequestContent,
  EnhancedTranslationFunction,
} from '@auth0/universal-components-core';
import { SilentError } from '@auth0/universal-components-core';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';

import {
  mockCore,
  createMockDomain,
  createMockIdentityProvider,
  createMockI18nService,
} from '../../../../internals';
import type { UseDomainTableOptions } from '../../../../types/my-organization/domain-management/domain-table-types';
import * as useCoreClientModule from '../../../use-core-client';
import * as useTranslatorModule from '../../../use-translator';
import { useDomainTable } from '../use-domain-table';

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

// ===== Tests =====

describe('useDomainTable', () => {
  let mockCoreClient: ReturnType<typeof initMockCoreClient>;
  let mockOptions: UseDomainTableOptions;
  let mockT: EnhancedTranslationFunction;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCoreClient = initMockCoreClient();
    mockOptions = createMockOptions();
    mockT = createMockI18nService().translator('my-organization');

    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
      coreClient: mockCoreClient,
    });

    vi.spyOn(useTranslatorModule, 'useTranslator').mockReturnValue({
      t: mockT,
      changeLanguage: vi.fn(),
      currentLanguage: 'en',
      fallbackLanguage: 'en',
    });
  });

  describe('Initial State', () => {
    it('should initialize with correct default state', () => {
      const { result } = renderHook(() => useDomainTable(mockOptions));

      expect(result.current.domains).toEqual([]);
      expect(result.current.providers).toEqual([]);
      expect(result.current.isFetching).toBe(false);
      expect(result.current.isCreating).toBe(false);
      expect(result.current.isDeleting).toBe(false);
      expect(result.current.isVerifying).toBe(false);
      expect(result.current.isLoadingProviders).toBe(false);
    });

    it('should provide all expected functions', () => {
      const { result } = renderHook(() => useDomainTable(mockOptions));

      expect(typeof result.current.fetchDomains).toBe('function');
      expect(typeof result.current.fetchProviders).toBe('function');
      expect(typeof result.current.onCreateDomain).toBe('function');
      expect(typeof result.current.onVerifyDomain).toBe('function');
      expect(typeof result.current.onDeleteDomain).toBe('function');
      expect(typeof result.current.onAssociateToProvider).toBe('function');
      expect(typeof result.current.onDeleteFromProvider).toBe('function');
    });
  });

  describe('fetchDomains', () => {
    it('should fetch domains successfully', async () => {
      const { result } = renderHook(() => useDomainTable(mockOptions));

      await act(async () => {
        await result.current.fetchDomains();
      });

      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.domains.list,
      ).toHaveBeenCalled();
    });

    it('should handle fetchDomains error and reset loading state', async () => {
      const { result } = renderHook(() => useDomainTable(mockOptions));

      const error = new Error('Network error');
      mockCoreClient.getMyOrganizationApiClient().organization.domains.list = vi
        .fn()
        .mockRejectedValue(error);

      await act(async () => {
        try {
          await result.current.fetchDomains();
        } catch (e) {
          expect(e).toBe(error);
        }
      });

      expect(result.current.isFetching).toBe(false);
    });

    it('should handle empty domains response', async () => {
      const { result } = renderHook(() => useDomainTable(mockOptions));

      await act(async () => {
        await result.current.fetchDomains();
      });

      expect(result.current.domains).toEqual([]);
    });
  });

  describe('fetchProviders', () => {
    it('should fetch providers with correct association status', async () => {
      const mockDomain = createMockDomain();
      const provider1 = createMockIdentityProvider({
        id: 'provider-1',
        display_name: 'Provider 1',
      });
      const provider2 = createMockIdentityProvider({
        id: 'provider-2',
        display_name: 'Provider 2',
      });
      const provider3 = createMockIdentityProvider({
        id: 'provider-3',
        display_name: 'Provider 3',
      });

      // Mock all providers response
      mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.list = vi
        .fn()
        .mockResolvedValue({
          identity_providers: [provider1, provider2, provider3],
        });

      // Mock associated providers response - only provider1 and provider3 are associated
      mockCoreClient.getMyOrganizationApiClient().organization.domains.identityProviders.get = vi
        .fn()
        .mockResolvedValue({
          identity_providers: [{ id: 'provider-1' }, { id: 'provider-3' }],
        });

      const { result } = renderHook(() => useDomainTable(mockOptions));

      await act(async () => {
        await result.current.fetchProviders(mockDomain);
      });

      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.list,
      ).toHaveBeenCalled();
      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.domains.identityProviders.get,
      ).toHaveBeenCalledWith(mockDomain.id);

      // Verify the providers are correctly matched with association status
      expect(result.current.providers).toHaveLength(3);

      // Provider 1 should be associated
      const resultProvider1 = result.current.providers.find((p) => p.id === 'provider-1');
      expect(resultProvider1).toBeDefined();
      expect(resultProvider1!.is_associated).toBe(true);
      expect(resultProvider1!.display_name).toBe('Provider 1');

      // Provider 2 should NOT be associated
      const resultProvider2 = result.current.providers.find((p) => p.id === 'provider-2');
      expect(resultProvider2).toBeDefined();
      expect(resultProvider2!.is_associated).toBe(false);
      expect(resultProvider2!.display_name).toBe('Provider 2');

      // Provider 3 should be associated
      const resultProvider3 = result.current.providers.find((p) => p.id === 'provider-3');
      expect(resultProvider3).toBeDefined();
      expect(resultProvider3!.is_associated).toBe(true);
      expect(resultProvider3!.display_name).toBe('Provider 3');
    });

    it('should handle providers with no associations', async () => {
      const mockDomain = createMockDomain();
      const provider1 = createMockIdentityProvider({
        id: 'provider-1',
        display_name: 'Provider 1',
      });
      const provider2 = createMockIdentityProvider({
        id: 'provider-2',
        display_name: 'Provider 2',
      });

      // Mock all providers response
      mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.list = vi
        .fn()
        .mockResolvedValue({
          identity_providers: [provider1, provider2],
        });

      // Mock empty associated providers response
      mockCoreClient.getMyOrganizationApiClient().organization.domains.identityProviders.get = vi
        .fn()
        .mockResolvedValue({
          identity_providers: [],
        });

      const { result } = renderHook(() => useDomainTable(mockOptions));

      await act(async () => {
        await result.current.fetchProviders(mockDomain);
      });

      // All providers should have is_associated = false
      expect(result.current.providers).toHaveLength(2);
      result.current.providers.forEach((provider) => {
        expect(provider.is_associated).toBe(false);
      });
    });

    it('should handle all providers being associated', async () => {
      const mockDomain = createMockDomain();
      const provider1 = createMockIdentityProvider({
        id: 'provider-1',
        display_name: 'Provider 1',
      });
      const provider2 = createMockIdentityProvider({
        id: 'provider-2',
        display_name: 'Provider 2',
      });

      // Mock all providers response
      mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.list = vi
        .fn()
        .mockResolvedValue({
          identity_providers: [provider1, provider2],
        });

      // Mock all providers as associated
      mockCoreClient.getMyOrganizationApiClient().organization.domains.identityProviders.get = vi
        .fn()
        .mockResolvedValue({
          identity_providers: [{ id: 'provider-1' }, { id: 'provider-2' }],
        });

      const { result } = renderHook(() => useDomainTable(mockOptions));

      await act(async () => {
        await result.current.fetchProviders(mockDomain);
      });

      // All providers should have is_associated = true
      expect(result.current.providers).toHaveLength(2);
      result.current.providers.forEach((provider) => {
        expect(provider.is_associated).toBe(true);
      });
    });

    it('should handle fetchProviders error and reset loading state', async () => {
      const mockDomain = createMockDomain();
      const { result } = renderHook(() => useDomainTable(mockOptions));

      const error = new Error('Network error');
      mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.list = vi
        .fn()
        .mockRejectedValue(error);

      await act(async () => {
        try {
          await result.current.fetchProviders(mockDomain);
        } catch (e) {
          expect(e).toBe(error);
        }
      });

      expect(result.current.isLoadingProviders).toBe(false);
    });

    it('should handle null/undefined responses gracefully', async () => {
      const mockDomain = createMockDomain();

      // Mock null responses
      mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.list = vi
        .fn()
        .mockResolvedValue({
          identity_providers: null,
        });
      mockCoreClient.getMyOrganizationApiClient().organization.domains.identityProviders.get = vi
        .fn()
        .mockResolvedValue({
          identity_providers: null,
        });

      const { result } = renderHook(() => useDomainTable(mockOptions));

      await act(async () => {
        await result.current.fetchProviders(mockDomain);
      });

      // Should handle null gracefully and return empty array
      expect(result.current.providers).toEqual([]);
    });
  });

  describe('onCreateDomain', () => {
    it('should create domain successfully with callbacks', async () => {
      const mockDomain = createMockDomain();
      const createData: CreateOrganizationDomainRequestContent = { domain: mockDomain.domain };

      const { result } = renderHook(() => useDomainTable(mockOptions));

      await act(async () => {
        await result.current.onCreateDomain(createData);
      });

      expect(mockOptions.createAction!.onBefore).toHaveBeenCalledWith(createData);
      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.domains.create,
      ).toHaveBeenCalledWith(createData);
    });

    it('should handle onBefore callback returning false', async () => {
      const createData: CreateOrganizationDomainRequestContent = { domain: 'test.com' };
      const mockOptionsWithFalseBefore = createMockOptions({
        createAction: {
          onBefore: vi.fn().mockReturnValue(false),
          onAfter: vi.fn(),
        },
      });

      const { result } = renderHook(() => useDomainTable(mockOptionsWithFalseBefore));

      await expect(
        act(async () => {
          await result.current.onCreateDomain(createData);
        }),
      ).rejects.toThrow(SilentError);

      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.domains.create,
      ).not.toHaveBeenCalled();
    });

    it('should handle create domain API error', async () => {
      const createData: CreateOrganizationDomainRequestContent = { domain: 'test.com' };
      const error = new Error('API error');
      mockCoreClient.getMyOrganizationApiClient().organization.domains.create = vi
        .fn()
        .mockRejectedValue(error);

      const { result } = renderHook(() => useDomainTable(mockOptions));

      await expect(
        act(async () => {
          await result.current.onCreateDomain(createData);
        }),
      ).rejects.toThrow('API error');

      expect(result.current.isCreating).toBe(false);
    });

    it('should work without onBefore and onAfter callbacks', async () => {
      const mockDomain = createMockDomain();
      const createData: CreateOrganizationDomainRequestContent = { domain: mockDomain.domain };
      const mockOptionsWithoutCallbacks = createMockOptions({
        createAction: undefined,
      });

      const { result } = renderHook(() => useDomainTable(mockOptionsWithoutCallbacks));

      await act(async () => {
        await result.current.onCreateDomain(createData);
      });

      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.domains.create,
      ).toHaveBeenCalledWith(createData);
    });
  });

  describe('onVerifyDomain', () => {
    it('should verify domain successfully and return true', async () => {
      const mockDomain = createMockDomain();
      const { result } = renderHook(() => useDomainTable(mockOptions));

      const isVerified = await act(async () => {
        return await result.current.onVerifyDomain(mockDomain);
      });

      expect(mockOptions.verifyAction!.onBefore).toHaveBeenCalledWith(mockDomain);
      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.domains.verify.create,
      ).toHaveBeenCalledWith(mockDomain.id);
      expect(isVerified).toBe(true);
    });

    it('should verify domain and return false when status is not verified', async () => {
      const mockDomain = createMockDomain();
      mockCoreClient.getMyOrganizationApiClient().organization.domains.verify.create = vi
        .fn()
        .mockResolvedValue({
          status: 'pending',
        });

      const { result } = renderHook(() => useDomainTable(mockOptions));

      const isVerified = await act(async () => {
        return await result.current.onVerifyDomain(mockDomain);
      });

      expect(isVerified).toBe(false);
    });

    it('should handle onBefore callback returning false', async () => {
      const mockDomain = createMockDomain();
      const mockOptionsWithFalseBefore = createMockOptions({
        verifyAction: {
          onBefore: vi.fn().mockReturnValue(false),
          onAfter: vi.fn(),
        },
      });

      const { result } = renderHook(() => useDomainTable(mockOptionsWithFalseBefore));

      await expect(
        act(async () => {
          await result.current.onVerifyDomain(mockDomain);
        }),
      ).rejects.toThrow(SilentError);

      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.domains.verify.create,
      ).not.toHaveBeenCalled();
    });

    it('should work without onBefore and onAfter callbacks', async () => {
      const mockDomain = createMockDomain();
      const mockOptionsWithoutCallbacks = createMockOptions({
        verifyAction: undefined,
      });

      const { result } = renderHook(() => useDomainTable(mockOptionsWithoutCallbacks));

      const isVerified = await act(async () => {
        return await result.current.onVerifyDomain(mockDomain);
      });

      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.domains.verify.create,
      ).toHaveBeenCalledWith(mockDomain.id);
      expect(isVerified).toBe(true);
    });
  });

  describe('onDeleteDomain', () => {
    it('should delete domain successfully with callbacks', async () => {
      const mockDomain = createMockDomain();
      const { result } = renderHook(() => useDomainTable(mockOptions));

      await act(async () => {
        await result.current.onDeleteDomain(mockDomain);
      });

      expect(mockOptions.deleteAction!.onBefore).toHaveBeenCalledWith(mockDomain);
      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.domains.delete,
      ).toHaveBeenCalledWith(mockDomain.id);
      expect(mockOptions.deleteAction!.onAfter).toHaveBeenCalledWith(mockDomain);
    });

    it('should handle onBefore callback returning false', async () => {
      const mockDomain = createMockDomain();
      const mockOptionsWithFalseBefore = createMockOptions({
        deleteAction: {
          onBefore: vi.fn().mockReturnValue(false),
          onAfter: vi.fn(),
        },
      });

      const { result } = renderHook(() => useDomainTable(mockOptionsWithFalseBefore));

      await expect(
        act(async () => {
          await result.current.onDeleteDomain(mockDomain);
        }),
      ).rejects.toThrow(SilentError);

      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.domains.delete,
      ).not.toHaveBeenCalled();
    });

    it('should work without onBefore and onAfter callbacks', async () => {
      const mockDomain = createMockDomain();
      const mockOptionsWithoutCallbacks = createMockOptions({
        deleteAction: undefined,
      });

      const { result } = renderHook(() => useDomainTable(mockOptionsWithoutCallbacks));

      await act(async () => {
        await result.current.onDeleteDomain(mockDomain);
      });

      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.domains.delete,
      ).toHaveBeenCalledWith(mockDomain.id);
    });
  });

  describe('onAssociateToProvider', () => {
    it('should associate domain to provider successfully', async () => {
      const mockDomain = createMockDomain();
      const mockProvider = createMockIdentityProvider();

      const { result } = renderHook(() => useDomainTable(mockOptions));

      await act(async () => {
        await result.current.onAssociateToProvider(mockDomain, mockProvider);
      });

      expect(mockOptions.associateToProviderAction!.onBefore).toHaveBeenCalledWith(
        mockDomain,
        mockProvider,
      );
      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.domains.create,
      ).toHaveBeenCalledWith(mockProvider.id, { domain: mockDomain.domain });
    });

    it('should handle onBefore callback returning false', async () => {
      const mockDomain = createMockDomain();
      const mockProvider = createMockIdentityProvider();
      const mockOptionsWithFalseBefore = createMockOptions({
        associateToProviderAction: {
          onBefore: vi.fn().mockReturnValue(false),
          onAfter: vi.fn(),
        },
      });

      const { result } = renderHook(() => useDomainTable(mockOptionsWithFalseBefore));

      await expect(
        act(async () => {
          await result.current.onAssociateToProvider(mockDomain, mockProvider);
        }),
      ).rejects.toThrow(SilentError);

      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.domains.create,
      ).not.toHaveBeenCalled();
    });

    it('should work without onBefore and onAfter callbacks', async () => {
      const mockDomain = createMockDomain();
      const mockProvider = createMockIdentityProvider();
      const mockOptionsWithoutCallbacks = createMockOptions({
        associateToProviderAction: undefined,
      });

      const { result } = renderHook(() => useDomainTable(mockOptionsWithoutCallbacks));

      await act(async () => {
        await result.current.onAssociateToProvider(mockDomain, mockProvider);
      });

      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.domains.create,
      ).toHaveBeenCalledWith(mockProvider.id, { domain: mockDomain.domain });
    });
  });

  describe('onDeleteFromProvider', () => {
    it('should delete domain from provider successfully', async () => {
      const mockDomain = createMockDomain();
      const mockProvider = createMockIdentityProvider();

      const { result } = renderHook(() => useDomainTable(mockOptions));

      await act(async () => {
        await result.current.onDeleteFromProvider(mockDomain, mockProvider);
      });

      expect(mockOptions.deleteFromProviderAction!.onBefore).toHaveBeenCalledWith(
        mockDomain,
        mockProvider,
      );
      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.domains.delete,
      ).toHaveBeenCalledWith(mockProvider.id, mockDomain.domain);
    });

    it('should handle onBefore callback returning false', async () => {
      const mockDomain = createMockDomain();
      const mockProvider = createMockIdentityProvider();
      const mockOptionsWithFalseBefore = createMockOptions({
        deleteFromProviderAction: {
          onBefore: vi.fn().mockReturnValue(false),
          onAfter: vi.fn(),
        },
      });

      const { result } = renderHook(() => useDomainTable(mockOptionsWithFalseBefore));

      await expect(
        act(async () => {
          await result.current.onDeleteFromProvider(mockDomain, mockProvider);
        }),
      ).rejects.toThrow(SilentError);

      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.domains.delete,
      ).not.toHaveBeenCalled();
    });

    it('should work without onBefore and onAfter callbacks', async () => {
      const mockDomain = createMockDomain();
      const mockProvider = createMockIdentityProvider();
      const mockOptionsWithoutCallbacks = createMockOptions({
        deleteFromProviderAction: undefined,
      });

      const { result } = renderHook(() => useDomainTable(mockOptionsWithoutCallbacks));

      await act(async () => {
        await result.current.onDeleteFromProvider(mockDomain, mockProvider);
      });

      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.domains.delete,
      ).toHaveBeenCalledWith(mockProvider.id, mockDomain.domain);
    });
  });

  describe('Edge Cases and Integration', () => {
    it('should handle provider with undefined id in onAssociateToProvider', async () => {
      const mockDomain = createMockDomain();
      const mockProvider = createMockIdentityProvider({ id: undefined });

      const { result } = renderHook(() => useDomainTable(mockOptions));

      await act(async () => {
        await result.current.onAssociateToProvider(mockDomain, mockProvider);
      });

      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.domains.create,
      ).toHaveBeenCalledWith(undefined, { domain: mockDomain.domain });
    });

    it('should handle provider with undefined id in onDeleteFromProvider', async () => {
      const mockDomain = createMockDomain();
      const mockProvider = createMockIdentityProvider({ id: undefined });

      const { result } = renderHook(() => useDomainTable(mockOptions));

      await act(async () => {
        await result.current.onDeleteFromProvider(mockDomain, mockProvider);
      });

      expect(
        mockCoreClient.getMyOrganizationApiClient().organization.identityProviders.domains.delete,
      ).toHaveBeenCalledWith(undefined, mockDomain.domain);
    });

    it('should call useTranslator with correct parameters', () => {
      const useTranslatorSpy = vi.spyOn(useTranslatorModule, 'useTranslator');
      renderHook(() => useDomainTable(mockOptions));

      expect(useTranslatorSpy).toHaveBeenCalledWith(
        'domain_management.domain_table.notifications',
        {},
      );
    });
  });

  describe('Callback Dependencies', () => {
    it('should update callbacks when options change', () => {
      const options1 = createMockOptions();
      const { result, rerender } = renderHook((props) => useDomainTable(props), {
        initialProps: options1,
      });

      const initialFetchDomains = result.current.fetchDomains;

      const options2 = createMockOptions({
        createAction: {
          onBefore: vi.fn().mockReturnValue(true),
          onAfter: vi.fn(),
        },
      });

      rerender(options2);

      // Functions should maintain their identity when dependencies don't change for core operations
      expect(result.current.fetchDomains).toBe(initialFetchDomains);
    });
  });
});
