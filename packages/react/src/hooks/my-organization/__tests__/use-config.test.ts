import { AVAILABLE_STRATEGY_LIST } from '@auth0/universal-components-core';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useConfig } from '../use-config';

import * as useCoreClientModule from '@/hooks/shared/use-core-client';
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
    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
      coreClient: mockCoreClient,
    });
    mockGet = vi.mocked(mockCoreClient.getMyOrganizationApiClient().organization.configuration.get);
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
});
