import { AVAILABLE_STRATEGY_LIST } from '@auth0/universal-components-core';
import { QueryClient } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useConfig } from '@/hooks/my-organization/use-config';
import * as useCoreClientModule from '@/hooks/shared/use-core-client';
import * as useErrorHandlerModule from '@/hooks/shared/use-error-handler';
import * as useTranslatorModule from '@/hooks/shared/use-translator';
import { setupAllCommonMocks } from '@/tests/utils';
import { createTestQueryClientWrapper } from '@/tests/utils/test-provider';
import { mockCore } from '@/tests/utils/test-setup';

const { initMockCoreClient } = mockCore();

const createMockConfig = (overrides = {}) => ({
  allowed_strategies: ['okta', 'google-apps'],
  connection_deletion_behavior: 'allow' as const,
  ...overrides,
});

describe('useConfig', () => {
  let mockGet: ReturnType<typeof vi.fn>;
  let mockCoreClient: ReturnType<typeof initMockCoreClient>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockCoreClient = initMockCoreClient();
    mockGet = vi.mocked(mockCoreClient.getMyOrganizationApiClient().organization.configuration.get);

    setupAllCommonMocks({
      coreClient: mockCoreClient,
      useCoreClientModule,
      useTranslatorModule,
      useErrorHandlerModule,
    });
  });

  const renderUseConfig = async () => {
    const { wrapper, queryClient } = createTestQueryClientWrapper();
    const hook = renderHook(() => useConfig(), { wrapper });
    await waitFor(() => expect(hook.result.current.isLoadingConfig).toBe(false));
    return { queryClient, ...hook };
  };

  describe('initial fetch', () => {
    it('returns config data on success', async () => {
      const mockConfig = createMockConfig();
      mockGet.mockResolvedValue(mockConfig);

      const { result } = await renderUseConfig();

      expect(result.current.config).toEqual(mockConfig);
      expect(result.current.isConfigValid).toBe(true);
    });

    it('does not fetch when coreClient is unavailable', async () => {
      vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
        coreClient: null,
      });

      const { wrapper } = createTestQueryClientWrapper();
      const { result } = renderHook(() => useConfig(), { wrapper });

      expect(result.current.isLoadingConfig).toBe(false);
      expect(mockGet).not.toHaveBeenCalled();
    });
  });

  describe('filteredStrategies', () => {
    it('filters to allowed strategies only', async () => {
      mockGet.mockResolvedValue(createMockConfig({ allowed_strategies: ['okta'] }));

      const { result } = await renderUseConfig();

      expect(result.current.filteredStrategies).toEqual(['okta']);
    });

    it('returns all strategies when allowed_strategies is undefined', async () => {
      mockGet.mockResolvedValue(createMockConfig({ allowed_strategies: undefined }));

      const { result } = await renderUseConfig();

      expect(result.current.filteredStrategies).toEqual(AVAILABLE_STRATEGY_LIST);
    });

    it('returns empty array when allowed_strategies is empty', async () => {
      mockGet.mockResolvedValue(createMockConfig({ allowed_strategies: [] }));

      const { result } = await renderUseConfig();

      expect(result.current.filteredStrategies).toEqual([]);
    });
  });

  describe('isConfigValid', () => {
    it('is true when allowed_strategies has items', async () => {
      mockGet.mockResolvedValue(createMockConfig());

      const { result } = await renderUseConfig();

      expect(result.current.isConfigValid).toBe(true);
    });

    it('is false when allowed_strategies is empty', async () => {
      mockGet.mockResolvedValue(createMockConfig({ allowed_strategies: [] }));

      const { result } = await renderUseConfig();

      expect(result.current.isConfigValid).toBe(false);
    });

    it('is false when allowed_strategies is undefined', async () => {
      mockGet.mockResolvedValue(createMockConfig({ allowed_strategies: undefined }));

      const { result } = await renderUseConfig();

      expect(result.current.isConfigValid).toBe(false);
    });
  });

  describe('shouldAllowDeletion', () => {
    it.each([
      ['allow', true],
      ['allow_if_empty', true],
      ['deny', false],
      [undefined, false],
    ])('is %s when connection_deletion_behavior is "%s"', async (behavior, expected) => {
      mockGet.mockResolvedValue(createMockConfig({ connection_deletion_behavior: behavior }));

      const { result } = await renderUseConfig();

      expect(result.current.shouldAllowDeletion).toBe(expected);
    });
  });

  describe('error handling', () => {
    it('returns null config on 404', async () => {
      mockGet.mockRejectedValue({ body: { status: 404 } });

      const { result } = await renderUseConfig();

      expect(result.current.config).toBeNull();
      expect(result.current.isConfigValid).toBe(false);
    });

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
      renderHook(() => useConfig(), { wrapper });

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
      renderHook(() => useConfig(), { wrapper });

      await waitFor(() => {
        // Should only call once, no retries for 404
        expect(mockGet).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('fetchConfig', () => {
    it('triggers refetch', async () => {
      mockGet.mockResolvedValue(createMockConfig());
      const { result } = await renderUseConfig();

      mockGet.mockClear();
      result.current.fetchConfig();

      await waitFor(() => expect(mockGet).toHaveBeenCalled());
    });
  });

  describe('retry', () => {
    it('triggers refetch', async () => {
      mockGet.mockResolvedValue(createMockConfig());
      const { result } = await renderUseConfig();

      mockGet.mockClear();
      await result.current.retry();

      await waitFor(() => expect(mockGet).toHaveBeenCalled());
    });
  });
});
