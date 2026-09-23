import type { IdpStrategy } from '@auth0/universal-components-core';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useIdpConfig } from '@/hooks/my-organization/shared/services/use-idp-config-service';
import { useCoreClient } from '@/hooks/shared/use-core-client';
import { createMockCoreClient } from '@/tests/utils/__mocks__/core/core-client.mocks';
import { createTestQueryClientWrapper } from '@/tests/utils/test-provider';

vi.mock('@/hooks/shared/use-core-client');

const createMockCrossAppAccessConfig = (overrides = {}) => ({
  status: {
    default_value: 'disabled' as const,
    allowed_values: ['disabled', 'enabled'] as ('disabled' | 'enabled')[],
  },
  ...overrides,
});

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
  const mockCoreClient = createMockCoreClient();
  const mockGet = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockCoreClient.getMyOrganizationApiClient().organization.configuration.identityProviders.get =
      mockGet;
    vi.mocked(useCoreClient).mockReturnValue({ coreClient: mockCoreClient });
  });

  const renderUseIdpConfig = async () => {
    const { wrapper, queryClient } = createTestQueryClientWrapper();
    const hook = renderHook(() => useIdpConfig(), { wrapper });
    await waitFor(() => expect(hook.result.current.isLoadingIdpConfig).toBe(false));
    return { queryClient, ...hook };
  };

  describe('initial fetch', () => {
    it('returns idpConfig on success', async () => {
      const mockConfig = createMockIdpConfig();
      mockGet.mockResolvedValue(mockConfig);

      const { result } = await renderUseIdpConfig();

      expect(result.current.idpConfig).toEqual(mockConfig);
      expect(result.current.isIdpConfigValid).toBe(true);
    });

    it('does not fetch when coreClient is unavailable', async () => {
      vi.mocked(useCoreClient).mockReturnValue({ coreClient: null });

      const { wrapper } = createTestQueryClientWrapper();
      const { result } = renderHook(() => useIdpConfig(), { wrapper });

      expect(result.current.isLoadingIdpConfig).toBe(false);
      expect(mockGet).not.toHaveBeenCalled();
    });
  });

  describe('isIdpConfigValid', () => {
    it('is true when strategies has items', async () => {
      mockGet.mockResolvedValue(createMockIdpConfig());

      const { result } = await renderUseIdpConfig();

      expect(result.current.isIdpConfigValid).toBe(true);
    });

    it('is false when strategies is empty', async () => {
      mockGet.mockResolvedValue(createMockIdpConfig({ strategies: {} }));

      const { result } = await renderUseIdpConfig();

      expect(result.current.isIdpConfigValid).toBe(false);
    });

    it('is false when strategies is undefined', async () => {
      mockGet.mockResolvedValue({ strategies: undefined });

      const { result } = await renderUseIdpConfig();

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

      const { result } = await renderUseIdpConfig();

      expect(result.current.isProvisioningEnabled(strategy as IdpStrategy)).toBe(expected);
    });

    it('returns false for strategy not in config', async () => {
      mockGet.mockResolvedValue(createMockIdpConfig());

      const { result } = await renderUseIdpConfig();

      expect(result.current.isProvisioningEnabled('google-apps')).toBe(false);
    });

    it('returns false for undefined strategy', async () => {
      mockGet.mockResolvedValue(createMockIdpConfig());

      const { result } = await renderUseIdpConfig();

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

      const { result } = await renderUseIdpConfig();

      expect(result.current.isProvisioningMethodEnabled(strategy as IdpStrategy)).toBe(expected);
    });

    it('returns false for strategy not in config', async () => {
      mockGet.mockResolvedValue(createMockIdpConfig());

      const { result } = await renderUseIdpConfig();

      expect(result.current.isProvisioningMethodEnabled('google-apps')).toBe(false);
    });

    it('returns false for undefined strategy', async () => {
      mockGet.mockResolvedValue(createMockIdpConfig());

      const { result } = await renderUseIdpConfig();

      expect(result.current.isProvisioningMethodEnabled(undefined)).toBe(false);
    });
  });

  describe('error handling', () => {
    it('returns null on 404', async () => {
      mockGet.mockRejectedValue({ body: { status: 404 } });

      const { result } = await renderUseIdpConfig();

      expect(result.current.idpConfig).toBeNull();
      expect(result.current.isIdpConfigValid).toBe(false);
    });
  });

  describe('fetchIdpConfig', () => {
    it('returns cached data without refetching', async () => {
      const mockConfig = createMockIdpConfig();
      mockGet.mockResolvedValue(mockConfig);
      const { result } = await renderUseIdpConfig();

      mockGet.mockClear();
      const cachedData = await result.current.fetchIdpConfig();

      expect(cachedData).toEqual(mockConfig);
      expect(mockGet).not.toHaveBeenCalled();
    });
  });

  describe('showCrossAppAccess', () => {
    it.each(['oidc', 'okta', 'samlp'] as IdpStrategy[])(
      'returns true for %s when cross_app_access_resource_app is present',
      async (strategy) => {
        mockGet.mockResolvedValue(
          createMockIdpConfig({
            strategies: {
              [strategy]: {
                enabled_features: [],
                provisioning_methods: [],
                cross_app_access_resource_app: createMockCrossAppAccessConfig(),
              },
            },
          }),
        );

        const { result } = await renderUseIdpConfig();

        expect(result.current.showCrossAppAccess(strategy)).toBe(true);
      },
    );

    it.each(['oidc', 'okta', 'samlp'] as IdpStrategy[])(
      'returns false for %s when cross_app_access_resource_app is absent',
      async (strategy) => {
        mockGet.mockResolvedValue(
          createMockIdpConfig({
            strategies: {
              [strategy]: {
                enabled_features: [],
                provisioning_methods: [],
              },
            },
          }),
        );

        const { result } = await renderUseIdpConfig();

        expect(result.current.showCrossAppAccess(strategy)).toBe(false);
      },
    );

    it.each(['adfs', 'waad', 'google-apps', 'pingfederate'] as IdpStrategy[])(
      'returns false for unsupported strategy %s',
      async (strategy) => {
        mockGet.mockResolvedValue(createMockIdpConfig());

        const { result } = await renderUseIdpConfig();

        expect(result.current.showCrossAppAccess(strategy)).toBe(false);
      },
    );

    it('returns false for undefined strategy', async () => {
      mockGet.mockResolvedValue(createMockIdpConfig());

      const { result } = await renderUseIdpConfig();

      expect(result.current.showCrossAppAccess(undefined)).toBe(false);
    });
  });

  describe('isCrossAppAccessReadOnly', () => {
    it('returns false when allowed_values has multiple values', async () => {
      mockGet.mockResolvedValue(
        createMockIdpConfig({
          strategies: {
            oidc: {
              enabled_features: [],
              provisioning_methods: [],
              cross_app_access_resource_app: createMockCrossAppAccessConfig({
                status: {
                  default_value: 'disabled',
                  allowed_values: ['disabled', 'enabled'],
                },
              }),
            },
          },
        }),
      );

      const { result } = await renderUseIdpConfig();

      expect(result.current.isCrossAppAccessReadOnly('oidc')).toBe(false);
    });

    it('returns true when allowed_values has single value', async () => {
      mockGet.mockResolvedValue(
        createMockIdpConfig({
          strategies: {
            oidc: {
              enabled_features: [],
              provisioning_methods: [],
              cross_app_access_resource_app: createMockCrossAppAccessConfig({
                status: {
                  default_value: 'disabled',
                  allowed_values: ['disabled'],
                },
              }),
            },
          },
        }),
      );

      const { result } = await renderUseIdpConfig();

      expect(result.current.isCrossAppAccessReadOnly('oidc')).toBe(true);
    });

    it('returns true when allowed_values is empty', async () => {
      mockGet.mockResolvedValue(
        createMockIdpConfig({
          strategies: {
            oidc: {
              enabled_features: [],
              provisioning_methods: [],
              cross_app_access_resource_app: createMockCrossAppAccessConfig({
                status: {
                  default_value: 'disabled',
                  allowed_values: [],
                },
              }),
            },
          },
        }),
      );

      const { result } = await renderUseIdpConfig();

      expect(result.current.isCrossAppAccessReadOnly('oidc')).toBe(true);
    });

    it('returns true when cross_app_access_resource_app is absent', async () => {
      mockGet.mockResolvedValue(
        createMockIdpConfig({
          strategies: {
            oidc: {
              enabled_features: [],
              provisioning_methods: [],
            },
          },
        }),
      );

      const { result } = await renderUseIdpConfig();

      expect(result.current.isCrossAppAccessReadOnly('oidc')).toBe(true);
    });

    it('returns true for undefined strategy', async () => {
      mockGet.mockResolvedValue(createMockIdpConfig());

      const { result } = await renderUseIdpConfig();

      expect(result.current.isCrossAppAccessReadOnly(undefined)).toBe(true);
    });
  });

  describe('getCrossAppAccessDefaultValue', () => {
    it('returns default_value when editable (multiple allowed_values)', async () => {
      mockGet.mockResolvedValue(
        createMockIdpConfig({
          strategies: {
            oidc: {
              enabled_features: [],
              provisioning_methods: [],
              cross_app_access_resource_app: createMockCrossAppAccessConfig({
                status: {
                  default_value: 'disabled',
                  allowed_values: ['disabled', 'enabled'],
                },
              }),
            },
          },
        }),
      );

      const { result } = await renderUseIdpConfig();

      expect(result.current.getCrossAppAccessDefaultValue('oidc')).toBe('disabled');
    });

    it('returns allowed_values[0] when read-only (single allowed_value)', async () => {
      mockGet.mockResolvedValue(
        createMockIdpConfig({
          strategies: {
            oidc: {
              enabled_features: [],
              provisioning_methods: [],
              cross_app_access_resource_app: createMockCrossAppAccessConfig({
                status: {
                  default_value: 'disabled',
                  allowed_values: ['enabled'],
                },
              }),
            },
          },
        }),
      );

      const { result } = await renderUseIdpConfig();

      expect(result.current.getCrossAppAccessDefaultValue('oidc')).toBe('enabled');
    });

    it('returns undefined when cross_app_access_resource_app is absent', async () => {
      mockGet.mockResolvedValue(
        createMockIdpConfig({
          strategies: {
            oidc: {
              enabled_features: [],
              provisioning_methods: [],
            },
          },
        }),
      );

      const { result } = await renderUseIdpConfig();

      expect(result.current.getCrossAppAccessDefaultValue('oidc')).toBeUndefined();
    });

    it('returns undefined for undefined strategy', async () => {
      mockGet.mockResolvedValue(createMockIdpConfig());

      const { result } = await renderUseIdpConfig();

      expect(result.current.getCrossAppAccessDefaultValue(undefined)).toBeUndefined();
    });
  });
});
