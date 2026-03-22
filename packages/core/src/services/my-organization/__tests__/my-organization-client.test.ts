import { MyOrganizationClient } from '@auth0/myorganization-js';
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
  createMyOrganizationClient,
  MY_ORGANIZATION_DPOP_NONCE_ID,
  MY_ORGANIZATION_PROXY_PATH,
} from '../my-organization-client';

vi.mock('@auth0/myorganization-js', () => ({ MyOrganizationClient: vi.fn() }));

describe('createMyOrganizationClient', () => {
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
    createMyOrganizationClient(mockProxyConfig);

    expect(MyOrganizationClient).toHaveBeenCalledWith(
      expect.objectContaining({
        baseUrl: new URL(MY_ORGANIZATION_PROXY_PATH, mockProxyConfig.proxyUrl).href,
        telemetry: false,
      }),
    );
  });

  it('creates client with domain in SPA mode', () => {
    createMyOrganizationClient(createSpaConfig());

    expect(MyOrganizationClient).toHaveBeenCalledWith(
      expect.objectContaining({
        domain: TEST_DOMAIN,
        telemetry: false,
      }),
    );
  });

  it('calls SDK createFetcher with correct dpopNonceId in SPA mode', () => {
    createMyOrganizationClient(createSpaConfig());

    expect(mockCreateFetcher).toHaveBeenCalledWith({
      dpopNonceId: MY_ORGANIZATION_DPOP_NONCE_ID,
    });
  });

  describe('proxy mode fetcher', () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('sets auth0-scope header when authParams has scope array', async () => {
      const mockFetch = stubFetch();
      createMyOrganizationClient(mockProxyConfig);

      const constructorOptions = vi.mocked(MyOrganizationClient).mock.calls[0]![0];
      const fetcher = constructorOptions.fetcher as FetcherSupplier;

      await fetcher(
        'https://example.com',
        { method: 'GET' },
        { scope: ['read:org', 'write:org'], audience: 'test-audience' },
      );

      const [, requestInit] = mockFetch.mock.calls[0]!;
      expect((requestInit?.headers as Headers).get(AUTH0_SCOPE_HEADER)).toBe('read:org write:org');
    });
  });

  describe('SPA mode fetcher', () => {
    it('calls SDK fetchWithAuth with scope and audience', async () => {
      createMyOrganizationClient(createSpaConfig());

      const constructorOptions = vi.mocked(MyOrganizationClient).mock.calls[0]![0];
      const fetcher = constructorOptions.fetcher as FetcherSupplier;

      await fetcher(
        'https://example.com',
        { method: 'POST', body: '{}' },
        { scope: ['read:org'], audience: 'https://tenant.auth0.com/my-org/' },
      );

      expect(mockFetchWithAuth).toHaveBeenCalledWith(
        'https://example.com',
        expect.objectContaining({ method: 'POST', body: '{}' }),
        { scope: ['read:org'], audience: 'https://tenant.auth0.com/my-org/' },
      );
    });
  });
});
