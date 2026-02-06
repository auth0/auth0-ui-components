import type { IdpStrategy } from '@auth0/universal-components-core';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useIdpConfig } from '../use-idp-config';

import { useCoreClient } from '@/hooks/shared/use-core-client';
import { createMockCoreClient } from '@/tests/utils/__mocks__/core/core-client.mocks';
import { createTestQueryClientWrapper } from '@/tests/utils/test-provider';

vi.mock('@/hooks/shared/use-core-client');

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
    it('triggers refetch', async () => {
      mockGet.mockResolvedValue(createMockIdpConfig());
      const { result } = await renderUseIdpConfig();

      mockGet.mockClear();
      result.current.fetchIdpConfig();

      await waitFor(() => expect(mockGet).toHaveBeenCalled());
    });
  });
});
