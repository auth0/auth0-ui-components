import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { createMockCoreClient } from '../../../../internals/__mocks__/core/core-client.mocks';
import { createTestQueryClientWrapper } from '../../../../internals/test-provider';
import { useCoreClient } from '../../../use-core-client';
import { useIdpConfig } from '../use-idp-config';

vi.mock('../../../use-core-client');

describe('useIdpConfig', () => {
  const mockCoreClient = createMockCoreClient();
  const mockGet = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    const mockMyOrganizationClient = mockCoreClient.getMyOrganizationApiClient();
    mockMyOrganizationClient.organization.configuration.identityProviders.get = mockGet;
    vi.mocked(useCoreClient).mockReturnValue({ coreClient: mockCoreClient });
  });

  const renderUseIdpConfig = () => {
    const { wrapper, queryClient } = createTestQueryClientWrapper();
    return { queryClient, ...renderHook(() => useIdpConfig(), { wrapper }) };
  };

  it('should fetch idp config on mount', async () => {
    const mockIdpConfig = {
      strategies: {
        okta: {
          enabled_features: ['provisioning'],
          provisioning_methods: ['scim'],
        },
      },
    };

    mockGet.mockResolvedValue(mockIdpConfig);

    const { result } = renderUseIdpConfig();

    expect(result.current.isLoadingIdpConfig).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoadingIdpConfig).toBe(false);
    });

    expect(result.current.idpConfig).toEqual(mockIdpConfig);
    expect(result.current.isIdpConfigValid).toBe(true);
    expect(mockGet).toHaveBeenCalledTimes(1);
  });

  it('should set isIdpConfigValid to false when strategies is empty', async () => {
    const mockIdpConfig = {
      strategies: {},
    };
    mockGet.mockResolvedValue(mockIdpConfig);

    const { result } = renderUseIdpConfig();

    await waitFor(() => {
      expect(result.current.isLoadingIdpConfig).toBe(false);
    });

    expect(result.current.isIdpConfigValid).toBe(false);
  });

  it('should handle 404 error and set idpConfig to null', async () => {
    mockGet.mockRejectedValue({
      body: { status: 404 },
    });

    const { result } = renderUseIdpConfig();

    await waitFor(() => {
      expect(result.current.isLoadingIdpConfig).toBe(false);
    });

    expect(result.current.idpConfig).toBeNull();
    expect(result.current.isIdpConfigValid).toBe(false);
  });

  it('should return true when provisioning is enabled for a strategy', async () => {
    const mockIdpConfig = {
      strategies: {
        okta: {
          enabled_features: ['provisioning', 'sso'],
          provisioning_methods: ['scim'],
        },
      },
    };
    mockGet.mockResolvedValue(mockIdpConfig);

    const { result } = renderUseIdpConfig();

    await waitFor(() => {
      expect(result.current.isLoadingIdpConfig).toBe(false);
    });

    expect(result.current.isProvisioningEnabled('okta')).toBe(true);
  });

  it('should return false when provisioning is not enabled for a strategy', async () => {
    const mockIdpConfig = {
      strategies: {
        okta: {
          enabled_features: ['sso'],
          provisioning_methods: ['scim'],
        },
      },
    };
    mockGet.mockResolvedValue(mockIdpConfig);

    const { result } = renderUseIdpConfig();

    await waitFor(() => {
      expect(result.current.isLoadingIdpConfig).toBe(false);
    });

    expect(result.current.isProvisioningEnabled('okta')).toBe(false);
  });

  it('should return false when strategy is undefined', async () => {
    const mockIdpConfig = {
      strategies: {
        okta: {
          enabled_features: ['provisioning'],
          provisioning_methods: ['scim'],
        },
      },
    };
    mockGet.mockResolvedValue(mockIdpConfig);

    const { result } = renderUseIdpConfig();

    await waitFor(() => {
      expect(result.current.isLoadingIdpConfig).toBe(false);
    });

    expect(result.current.isProvisioningEnabled(undefined)).toBe(false);
  });

  it('should return false when strategy does not exist in config', async () => {
    const mockIdpConfig = {
      strategies: {
        okta: {
          enabled_features: ['provisioning'],
          provisioning_methods: ['scim'],
        },
      },
    };
    mockGet.mockResolvedValue(mockIdpConfig);

    const { result } = renderUseIdpConfig();

    await waitFor(() => {
      expect(result.current.isLoadingIdpConfig).toBe(false);
    });

    expect(result.current.isProvisioningEnabled('google-apps')).toBe(false);
  });

  it('should return true when scim provisioning method is enabled', async () => {
    const mockIdpConfig = {
      strategies: {
        okta: {
          enabled_features: ['provisioning'],
          provisioning_methods: ['scim', 'jit'],
        },
      },
    };
    mockGet.mockResolvedValue(mockIdpConfig);

    const { result } = renderUseIdpConfig();

    await waitFor(() => {
      expect(result.current.isLoadingIdpConfig).toBe(false);
    });

    expect(result.current.isProvisioningMethodEnabled('okta')).toBe(true);
  });

  it('should return false when scim provisioning method is not enabled', async () => {
    const mockIdpConfig = {
      strategies: {
        okta: {
          enabled_features: ['provisioning'],
          provisioning_methods: ['jit'],
        },
      },
    };
    mockGet.mockResolvedValue(mockIdpConfig);

    const { result } = renderUseIdpConfig();

    await waitFor(() => {
      expect(result.current.isLoadingIdpConfig).toBe(false);
    });

    expect(result.current.isProvisioningMethodEnabled('okta')).toBe(false);
  });

  it('should refetch idp config when fetchIdpConfig is called', async () => {
    const mockIdpConfig = {
      strategies: {
        okta: {
          enabled_features: ['provisioning'],
          provisioning_methods: ['scim'],
        },
      },
    };
    mockGet.mockResolvedValue(mockIdpConfig);

    const { result, queryClient } = renderUseIdpConfig();

    await waitFor(() => {
      expect(result.current.isLoadingIdpConfig).toBe(false);
    });

    expect(mockGet).toHaveBeenCalledTimes(1);

    queryClient.setQueryData(['idp-config', 'config'], mockIdpConfig, {
      updatedAt: Date.now() - 11 * 60 * 1000,
    });

    await result.current.fetchIdpConfig();

    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledTimes(2);
    });
  });

  it('should invalidate and refetch when fetchIdpConfig is called', async () => {
    const mockIdpConfig = {
      strategies: {
        okta: {
          enabled_features: ['provisioning'],
          provisioning_methods: ['scim'],
        },
      },
    };
    mockGet.mockResolvedValue(mockIdpConfig);

    const { result } = renderUseIdpConfig();

    await waitFor(() => {
      expect(result.current.isLoadingIdpConfig).toBe(false);
    });

    const initialCallCount = mockGet.mock.calls.length;

    // Call fetchIdpConfig - should always invalidate and trigger refetch
    await result.current.fetchIdpConfig();

    // Should trigger a refetch
    await waitFor(() => {
      expect(mockGet.mock.calls.length).toBeGreaterThan(initialCallCount);
    });
  });

  it('should not fetch idp config when coreClient is not available', async () => {
    vi.mocked(useCoreClient).mockReturnValue({ coreClient: null });

    const { result } = renderUseIdpConfig();

    await waitFor(() => {
      expect(result.current.isLoadingIdpConfig).toBe(false);
    });

    expect(mockGet).not.toHaveBeenCalled();
  });
});
