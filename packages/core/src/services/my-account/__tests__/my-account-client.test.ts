import { MyAccountClient } from '@auth0/myaccount-js';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { stubFetch } from '../../../api/__tests__/__mocks__/api-utils.mocks';
import { AUTH0_SCOPE_HEADER } from '../../../api/api-utils';
import type { FetcherSupplier, SpaAuthConfig } from '../../../auth/auth-types';
import {
  createMockContextInterface,
  mockProxyConfig,
  TEST_DOMAIN,
} from '../../../internals/__mocks__/shared/api-service.mocks';
import {
  createMyAccountClient,
  MY_ACCOUNT_DPOP_NONCE_ID,
  MY_ACCOUNT_PROXY_PATH,
} from '../my-account-client';

vi.mock('@auth0/myaccount-js', () => ({ MyAccountClient: vi.fn() }));

describe('createMyAccountClient', () => {
  const mockFetchWithAuth = vi.fn().mockResolvedValue(new Response());
  const mockCreateFetcher = vi.fn().mockReturnValue({
    fetchWithAuth: mockFetchWithAuth,
  });

  const createSpaConfig = (): SpaAuthConfig => ({
    mode: 'spa',
    domain: TEST_DOMAIN,
    contextInterface: {
      ...createMockContextInterface(),
      createFetcher: mockCreateFetcher,
    },
  });

  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateFetcher.mockReturnValue({
      fetchWithAuth: mockFetchWithAuth,
    });
  });

  it('creates client with baseUrl in proxy mode', () => {
    createMyAccountClient(mockProxyConfig);

    expect(MyAccountClient).toHaveBeenCalledWith(
      expect.objectContaining({
        baseUrl: new URL(MY_ACCOUNT_PROXY_PATH, mockProxyConfig.proxyUrl).href,
        telemetry: false,
      }),
    );
  });

  it('creates client with domain in SPA mode', () => {
    createMyAccountClient(createSpaConfig());

    expect(MyAccountClient).toHaveBeenCalledWith(
      expect.objectContaining({
        domain: TEST_DOMAIN,
        telemetry: false,
      }),
    );
  });

  it('calls SDK createFetcher with correct dpopNonceId in SPA mode', () => {
    createMyAccountClient(createSpaConfig());

    expect(mockCreateFetcher).toHaveBeenCalledWith({
      dpopNonceId: MY_ACCOUNT_DPOP_NONCE_ID,
    });
  });

  describe('proxy mode fetcher', () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('sets auth0-scope header when authParams has scope array', async () => {
      const mockFetch = stubFetch();
      createMyAccountClient(mockProxyConfig);

      const constructorOptions = vi.mocked(MyAccountClient).mock.calls[0]![0];
      const fetcher = constructorOptions.fetcher as FetcherSupplier;

      await fetcher(
        'https://example.com',
        { method: 'GET' },
        { scope: ['read:users', 'write:users'], audience: 'test-audience' },
      );

      expect(mockFetch).toHaveBeenCalledWith(
        'https://example.com',
        expect.objectContaining({ method: 'GET' }),
      );

      const [, requestInit] = mockFetch.mock.calls[0]!;
      expect((requestInit?.headers as Headers).get(AUTH0_SCOPE_HEADER)).toBe(
        'read:users write:users',
      );
    });

    it('does not set auth0-scope header when authParams has empty scope array', async () => {
      const mockFetch = stubFetch();
      createMyAccountClient(mockProxyConfig);

      const constructorOptions = vi.mocked(MyAccountClient).mock.calls[0]![0];
      const fetcher = constructorOptions.fetcher as FetcherSupplier;

      await fetcher('https://example.com', { method: 'GET' }, { scope: [], audience: 'test' });

      const [, requestInit] = mockFetch.mock.calls[0]!;
      expect((requestInit?.headers as Headers).get(AUTH0_SCOPE_HEADER)).toBeNull();
    });
  });

  describe('SPA mode fetcher', () => {
    it('calls SDK fetchWithAuth with scope and audience', async () => {
      createMyAccountClient(createSpaConfig());

      const constructorOptions = vi.mocked(MyAccountClient).mock.calls[0]![0];
      const fetcher = constructorOptions.fetcher as FetcherSupplier;

      await fetcher(
        'https://example.com',
        { method: 'GET' },
        { scope: ['read:users', 'write:users'], audience: 'https://tenant.auth0.com/me/' },
      );

      expect(mockFetchWithAuth).toHaveBeenCalledWith(
        'https://example.com',
        expect.objectContaining({ method: 'GET' }),
        { scope: ['read:users', 'write:users'], audience: 'https://tenant.auth0.com/me/' },
      );
    });

    it('handles undefined authParams', async () => {
      createMyAccountClient(createSpaConfig());

      const constructorOptions = vi.mocked(MyAccountClient).mock.calls[0]![0];
      const fetcher = constructorOptions.fetcher as FetcherSupplier;

      await fetcher('https://example.com', { method: 'GET' }, undefined);

      expect(mockFetchWithAuth).toHaveBeenCalledWith(
        'https://example.com',
        expect.objectContaining({ method: 'GET' }),
        { scope: undefined, audience: undefined },
      );
    });
  });
});
