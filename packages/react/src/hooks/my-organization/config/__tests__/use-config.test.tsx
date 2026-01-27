import { AVAILABLE_STRATEGY_LIST } from '@auth0/universal-components-core';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { createTestQueryClientWrapper } from '../../../../internals/test-provider';
import { mockCore } from '../../../../internals/test-setup';
import * as useCoreClientModule from '../../../use-core-client';
import { useConfig } from '../use-config';

const { initMockCoreClient } = mockCore();

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

  const renderUseConfig = () => {
    const { wrapper, queryClient } = createTestQueryClientWrapper();
    return { queryClient, ...renderHook(() => useConfig(), { wrapper }) };
  };

  it('should fetch config on mount', async () => {
    const mockConfig = {
      allowed_strategies: ['okta', 'google-apps'],
      connection_deletion_behavior: 'allow',
    };
    mockGet.mockResolvedValue(mockConfig);

    const { result } = renderUseConfig();

    expect(result.current.isLoadingConfig).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoadingConfig).toBe(false);
    });

    expect(result.current.config).toEqual(mockConfig);
    expect(result.current.isConfigValid).toBe(true);
    expect(mockGet).toHaveBeenCalledTimes(1);
  });

  it('should filter strategies based on allowed_strategies', async () => {
    const mockConfig = {
      allowed_strategies: ['okta', 'google-apps'],
      connection_deletion_behavior: 'allow',
    };
    mockGet.mockResolvedValue(mockConfig);

    const { result } = renderUseConfig();

    await waitFor(() => {
      expect(result.current.isLoadingConfig).toBe(false);
    });

    expect(result.current.filteredStrategies).toEqual(['google-apps', 'okta']);
  });

  it('should return all available strategies when allowed_strategies is not set', async () => {
    const mockConfig = {
      connection_deletion_behavior: 'allow',
    };
    mockGet.mockResolvedValue(mockConfig);

    const { result } = renderUseConfig();

    await waitFor(() => {
      expect(result.current.isLoadingConfig).toBe(false);
    });

    expect(result.current.filteredStrategies).toEqual(AVAILABLE_STRATEGY_LIST);
  });

  it('should set isConfigValid to false when config has no allowed_strategies', async () => {
    const mockConfig = {
      connection_deletion_behavior: 'allow',
    };
    mockGet.mockResolvedValue(mockConfig);

    const { result } = renderUseConfig();

    await waitFor(() => {
      expect(result.current.isLoadingConfig).toBe(false);
    });

    expect(result.current.isConfigValid).toBe(false);
  });

  it('should handle 404 error and set config to null', async () => {
    mockGet.mockRejectedValue({
      body: { status: 404 },
    });

    const { result } = renderUseConfig();

    await waitFor(() => {
      expect(result.current.isLoadingConfig).toBe(false);
    });

    expect(result.current.config).toBeNull();
    expect(result.current.isConfigValid).toBe(false);
  });

  it('should allow deletion when connection_deletion_behavior is "allow"', async () => {
    const mockConfig = {
      allowed_strategies: ['okta'],
      connection_deletion_behavior: 'allow',
    };
    mockGet.mockResolvedValue(mockConfig);

    const { result } = renderUseConfig();

    await waitFor(() => {
      expect(result.current.isLoadingConfig).toBe(false);
    });

    expect(result.current.shouldAllowDeletion).toBe(true);
  });

  it('should allow deletion when connection_deletion_behavior is "allow_if_empty"', async () => {
    const mockConfig = {
      allowed_strategies: ['okta'],
      connection_deletion_behavior: 'allow_if_empty',
    };
    mockGet.mockResolvedValue(mockConfig);

    const { result } = renderUseConfig();

    await waitFor(() => {
      expect(result.current.isLoadingConfig).toBe(false);
    });

    expect(result.current.shouldAllowDeletion).toBe(true);
  });

  it('should not allow deletion when connection_deletion_behavior is "deny"', async () => {
    const mockConfig = {
      allowed_strategies: ['okta'],
      connection_deletion_behavior: 'deny',
    };
    mockGet.mockResolvedValue(mockConfig);

    const { result } = renderUseConfig();

    await waitFor(() => {
      expect(result.current.isLoadingConfig).toBe(false);
    });

    expect(result.current.shouldAllowDeletion).toBe(false);
  });

  it('should refetch config when fetchConfig is called', async () => {
    const mockConfig = {
      allowed_strategies: ['okta'],
      connection_deletion_behavior: 'allow',
    };
    mockGet.mockResolvedValue(mockConfig);

    const { result, queryClient } = renderUseConfig();

    await waitFor(() => {
      expect(result.current.isLoadingConfig).toBe(false);
    });

    expect(mockGet).toHaveBeenCalledTimes(1);

    queryClient.setQueryData(['config', 'details'], mockConfig, {
      updatedAt: Date.now() - 6 * 60 * 1000,
    });

    await result.current.fetchConfig();

    await waitFor(() => {
      result.current.fetchConfig();
      expect(mockGet).toHaveBeenCalledTimes(2);
    });
  });

  it('should not fetch config when coreClient is not available', async () => {
    vi.spyOn(useCoreClientModule, 'useCoreClient').mockReturnValue({
      coreClient: null,
    });

    const { result } = renderUseConfig();

    await waitFor(() => {
      expect(result.current.isLoadingConfig).toBe(false);
    });

    expect(mockGet).not.toHaveBeenCalled();
  });
});
