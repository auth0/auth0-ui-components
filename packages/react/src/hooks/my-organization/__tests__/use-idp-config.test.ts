import type { IdpStrategy } from '@auth0/universal-components-core';
import { QueryClient } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useIdpConfig } from '@/hooks/my-organization/use-idp-config';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import * as useErrorHandlerModule from '@/hooks/shared/use-error-handler';
import * as useTranslatorModule from '@/hooks/shared/use-translator';
import { setupAllCommonMocks, setupMockUseCoreClientNull } from '@/tests/utils';
import { createMockCoreClient } from '@/tests/utils/__mocks__/core/core-client.mocks';
import { createTestQueryClientWrapper } from '@/tests/utils/test-provider';

const createMockIdpConfig = (overrides = {}) => ({
  strategies: {
    okta: {
      enabled_features: ['provisioning'],
      provisioning_methods: ['scim'],
    },
  },
  ...overrides,
});

describe('useIdpConfig', () => {
  let mockCoreClient: ReturnType<typeof createMockCoreClient>;
  let mockGet: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCoreClient = createMockCoreClient();
    mockGet = vi.fn().mockResolvedValue(createMockIdpConfig());

    // Set up the mock chain properly
    const apiClient = mockCoreClient.getMyOrganizationApiClient();
    apiClient.organization.configuration.identityProviders.get = mockGet;

    setupAllCommonMocks({
      coreClient: mockCoreClient,
      useCoreClientModule,
      useTranslatorModule,
      useErrorHandlerModule,
    });
  });

  const renderUseIdpConfig = () => {
    const { wrapper, queryClient } = createTestQueryClientWrapper();
    const hook = renderHook(() => useIdpConfig(), { wrapper });
    return { queryClient, ...hook };
  };

  describe('initial fetch', () => {
    it('returns idpConfig on success', async () => {
      const mockConfig = createMockIdpConfig();
      mockGet.mockResolvedValue(mockConfig);

      const { result } = renderUseIdpConfig();

      await waitFor(() => expect(result.current.isLoadingIdpConfig).toBe(false));

      expect(result.current.idpConfig).toEqual(mockConfig);
      expect(result.current.isIdpConfigValid).toBe(true);
    });

    it('does not fetch when coreClient is unavailable', async () => {
      setupMockUseCoreClientNull(useCoreClientModule);

      const { wrapper } = createTestQueryClientWrapper();
      const { result } = renderHook(() => useIdpConfig(), { wrapper });

      expect(result.current.isLoadingIdpConfig).toBe(false);
      expect(mockGet).not.toHaveBeenCalled();
    });
  });

  describe('isIdpConfigValid', () => {
    it('is true when strategies has items', async () => {
      mockGet.mockResolvedValue(createMockIdpConfig());

      const { result } = renderUseIdpConfig();

      await waitFor(() => expect(result.current.isLoadingIdpConfig).toBe(false));

      expect(result.current.isIdpConfigValid).toBe(true);
    });

    it('is false when strategies is empty', async () => {
      mockGet.mockResolvedValue(createMockIdpConfig({ strategies: {} }));

      const { result } = renderUseIdpConfig();

      await waitFor(() => expect(result.current.isLoadingIdpConfig).toBe(false));

      expect(result.current.isIdpConfigValid).toBe(false);
    });

    it('is false when strategies is undefined', async () => {
      mockGet.mockResolvedValue({ strategies: undefined });

      const { result } = renderUseIdpConfig();

      await waitFor(() => expect(result.current.isLoadingIdpConfig).toBe(false));

      expect(result.current.isIdpConfigValid).toBe(false);
    });
  });

  describe('isProvisioningEnabled', () => {
    it.each([
      ['okta', ['provisioning'], true],
      ['okta', ['sso'], false],
      ['okta', [], false],
    ])('returns %s for strategy=%s with features=%s', async (strategy, features, expected) => {
      mockGet.mockResolvedValue(
        createMockIdpConfig({
          strategies: {
            okta: { enabled_features: features, provisioning_methods: ['scim'] },
          },
        }),
      );

      const { result } = renderUseIdpConfig();

      await waitFor(() => expect(result.current.isLoadingIdpConfig).toBe(false));

      expect(result.current.isProvisioningEnabled(strategy as IdpStrategy)).toBe(expected);
    });

    it('returns false for strategy not in config', async () => {
      mockGet.mockResolvedValue(createMockIdpConfig());

      const { result } = renderUseIdpConfig();

      await waitFor(() => expect(result.current.isLoadingIdpConfig).toBe(false));

      expect(result.current.isProvisioningEnabled('google-apps')).toBe(false);
    });

    it('returns false for undefined strategy', async () => {
      mockGet.mockResolvedValue(createMockIdpConfig());

      const { result } = renderUseIdpConfig();

      await waitFor(() => expect(result.current.isLoadingIdpConfig).toBe(false));

      expect(result.current.isProvisioningEnabled(undefined)).toBe(false);
    });
  });

  describe('isProvisioningMethodEnabled', () => {
    it.each([
      ['okta', ['scim'], true],
      ['okta', ['jit'], false],
      ['okta', [], false],
    ])('returns %s for strategy=%s with methods=%s', async (strategy, methods, expected) => {
      mockGet.mockResolvedValue(
        createMockIdpConfig({
          strategies: {
            okta: { enabled_features: ['provisioning'], provisioning_methods: methods },
          },
        }),
      );

      const { result } = renderUseIdpConfig();

      await waitFor(() => expect(result.current.isLoadingIdpConfig).toBe(false));

      expect(result.current.isProvisioningMethodEnabled(strategy as IdpStrategy)).toBe(expected);
    });

    it('returns false for strategy not in config', async () => {
      mockGet.mockResolvedValue(createMockIdpConfig());

      const { result } = renderUseIdpConfig();

      await waitFor(() => expect(result.current.isLoadingIdpConfig).toBe(false));

      expect(result.current.isProvisioningMethodEnabled('google-apps')).toBe(false);
    });

    it('returns false for undefined strategy', async () => {
      mockGet.mockResolvedValue(createMockIdpConfig());

      const { result } = renderUseIdpConfig();

      await waitFor(() => expect(result.current.isLoadingIdpConfig).toBe(false));

      expect(result.current.isProvisioningMethodEnabled(undefined)).toBe(false);
    });
  });

  describe('error handling', () => {
    it('returns null on 404', async () => {
      mockGet.mockRejectedValue({ body: { status: 404 } });

      const { result } = renderUseIdpConfig();

      await waitFor(() => expect(result.current.isLoadingIdpConfig).toBe(false));

      expect(result.current.idpConfig).toBeNull();
      expect(result.current.isIdpConfigValid).toBe(false);
    });
  });

  describe('fetchIdpConfig', () => {
    it('triggers refetch', async () => {
      mockGet.mockResolvedValue(createMockIdpConfig());
      const { result } = renderUseIdpConfig();

      await waitFor(() => expect(result.current.isLoadingIdpConfig).toBe(false));

      mockGet.mockClear();
      result.current.fetchIdpConfig();

      await waitFor(() => expect(mockGet).toHaveBeenCalled());
    });
  });

  describe('retry', () => {
    it('triggers refetch', async () => {
      mockGet.mockResolvedValue(createMockIdpConfig());
      const { result } = renderUseIdpConfig();

      await waitFor(() => expect(result.current.isLoadingIdpConfig).toBe(false));

      mockGet.mockClear();
      await result.current.retry();

      await waitFor(() => expect(mockGet).toHaveBeenCalled());
    });
  });

  describe('error retry logic', () => {
    it('retries up to 3 times on non-404 errors', async () => {
      const error = new Error('Network error');
      mockGet.mockRejectedValue(error);

      // Create a query client that allows retries with minimal delay
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: 3,
            retryDelay: 1,
            gcTime: 0,
            staleTime: 0,
          },
        },
      });

      const { wrapper } = createTestQueryClientWrapper(queryClient);
      renderHook(() => useIdpConfig(), { wrapper });

      await waitFor(
        () => {
          // Should retry 3 times (initial + 3 retries = 4 total calls)
          expect(mockGet).toHaveBeenCalledTimes(4);
        },
        { timeout: 5000 },
      );
    });

    it('does not retry on 404 errors', async () => {
      mockGet.mockRejectedValue({ body: { status: 404 } });

      const { wrapper } = createTestQueryClientWrapper();
      renderHook(() => useIdpConfig(), { wrapper });

      await waitFor(() => {
        // Should only call once, no retries for 404
        expect(mockGet).toHaveBeenCalledTimes(1);
      });
    });
  });
});
