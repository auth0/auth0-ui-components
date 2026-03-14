import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import type { SpaAuthConfig } from '../../../auth/auth-types';
import {
  createMockFetch,
  getConfigFromMockCalls,
  getFetcherFromMockCalls,
  getHeadersFromFetchCall,
} from '../../../internals/__mocks__/shared/sdk-client.mocks';
import { initializeMyAccountClient } from '../my-account-api-service';

import {
  createMockContextInterface,
  createMockSpaConfig,
  getExpectedProxyBaseUrl,
  mockProxyConfig,
  mockRequestInits,
} from './__mocks__/my-account-api-service.mocks';

const TEST_URL = 'https://test.com';

// Hoist mock to avoid vi.mock hoisting issues
const mockMyAccountClient = vi.hoisted(() =>
  vi.fn().mockImplementation((config) => ({
    config,
    factors: {},
    authenticationMethods: {
      list: vi.fn(),
    },
  })),
);

vi.mock('@auth0/myaccount-js', () => ({
  MyAccountClient: mockMyAccountClient,
}));

describe('initializeMyAccountClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockMyAccountClient.mockImplementation((config) => ({
      config,
      factors: {},
      authenticationMethods: { list: vi.fn() },
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe('proxy mode initialization', () => {
    describe('basic functionality', () => {
      it('should create MyAccountClient with proxy URL', () => {
        initializeMyAccountClient(mockProxyConfig);

        expect(mockMyAccountClient).toHaveBeenCalled();
      });

      it('should construct correct base URL from proxy URL', () => {
        initializeMyAccountClient(mockProxyConfig);

        const config = getConfigFromMockCalls(mockMyAccountClient);

        expect(config.baseUrl).toBe(getExpectedProxyBaseUrl(mockProxyConfig.proxyUrl));
      });

      it('should set domain to empty string in proxy mode', () => {
        initializeMyAccountClient(mockProxyConfig);

        const config = getConfigFromMockCalls(mockMyAccountClient);

        expect(config.domain).toBe('');
      });

      it('should disable telemetry in proxy mode', () => {
        initializeMyAccountClient(mockProxyConfig);

        const config = getConfigFromMockCalls(mockMyAccountClient);

        expect(config.telemetry).toBe(false);
      });

      it('should provide custom fetcher in proxy mode', () => {
        initializeMyAccountClient(mockProxyConfig);

        const config = getConfigFromMockCalls(mockMyAccountClient);

        expect(config.fetcher).toBeDefined();
        expect(typeof config.fetcher).toBe('function');
      });
    });

    describe('custom fetcher behavior in proxy mode', () => {
      it('should create fetcher that calls fetch', async () => {
        const mockFetch = createMockFetch();
        vi.stubGlobal('fetch', mockFetch);

        initializeMyAccountClient(mockProxyConfig);

        const fetcher = getFetcherFromMockCalls(mockMyAccountClient);
        await fetcher!(TEST_URL, {});

        expect(mockFetch).toHaveBeenCalled();
      });

      it('should add Content-Type header when body is present', async () => {
        const mockFetch = createMockFetch();
        vi.stubGlobal('fetch', mockFetch);

        initializeMyAccountClient(mockProxyConfig);

        const fetcher = getFetcherFromMockCalls(mockMyAccountClient);
        await fetcher!(TEST_URL, { body: JSON.stringify({ test: 'data' }) });

        expect(mockFetch).toHaveBeenCalled();
        const headers = getHeadersFromFetchCall(mockFetch) as Headers;
        expect(headers.get('Content-Type')).toBe('application/json');
      });

      it('should preserve existing headers', async () => {
        const mockFetch = createMockFetch();
        vi.stubGlobal('fetch', mockFetch);

        initializeMyAccountClient(mockProxyConfig);

        const fetcher = getFetcherFromMockCalls(mockMyAccountClient);
        await fetcher!(TEST_URL, {
          headers: {
            'X-Custom-Header': 'custom-value',
          },
        });

        expect(mockFetch).toHaveBeenCalled();
        const headers = getHeadersFromFetchCall(mockFetch) as Headers;
        expect(headers.get('X-Custom-Header')).toBe('custom-value');
      });
    });

    describe('URL handling', () => {
      it('should handle proxy URL with path', () => {
        initializeMyAccountClient({ mode: 'proxy', proxyUrl: 'https://example.com/api/v1' });

        const config = getConfigFromMockCalls(mockMyAccountClient);

        expect(config.baseUrl).toBe('https://example.com/api/v1/me');
      });

      it('should handle proxy URL with port', () => {
        initializeMyAccountClient({ mode: 'proxy', proxyUrl: 'https://example.com:8080' });

        const config = getConfigFromMockCalls(mockMyAccountClient);

        expect(config.baseUrl).toBe('https://example.com:8080/me');
      });

      it('should handle proxy URL with query parameters', () => {
        initializeMyAccountClient({ mode: 'proxy', proxyUrl: 'https://example.com?param=value' });

        const config = getConfigFromMockCalls(mockMyAccountClient);

        expect(config.baseUrl).toBe('https://example.com?param=value/me');
      });
    });
  });

  describe('SPA mode initialization', () => {
    describe('basic functionality', () => {
      it('should create MyAccountClient with domain', () => {
        initializeMyAccountClient(createMockSpaConfig());

        expect(mockMyAccountClient).toHaveBeenCalled();
      });

      it('should not set baseUrl when using domain', () => {
        initializeMyAccountClient(createMockSpaConfig());

        const config = getConfigFromMockCalls(mockMyAccountClient);

        expect(config.baseUrl).toBeUndefined();
      });

      it('should provide custom fetcher in SPA mode', () => {
        initializeMyAccountClient(createMockSpaConfig());

        const config = getConfigFromMockCalls(mockMyAccountClient);

        expect(config.fetcher).toBeDefined();
        expect(typeof config.fetcher).toBe('function');
      });
    });

    describe('custom fetcher behavior in SPA mode', () => {
      it('should add Content-Type header when body is present', async () => {
        const mockFetch = createMockFetch();
        vi.stubGlobal('fetch', mockFetch);

        const auth = createMockSpaConfig();
        initializeMyAccountClient(auth);

        const fetcher = getFetcherFromMockCalls(mockMyAccountClient);
        await fetcher!(TEST_URL, { body: JSON.stringify({ test: 'data' }) });

        const headers = getHeadersFromFetchCall(mockFetch) as Headers;
        expect(headers.get('Content-Type')).toBe('application/json');
      });

      it('should not override existing Content-Type header', async () => {
        const mockFetch = createMockFetch();
        vi.stubGlobal('fetch', mockFetch);

        const auth = createMockSpaConfig();
        initializeMyAccountClient(auth);

        const fetcher = getFetcherFromMockCalls(mockMyAccountClient);
        await fetcher!(TEST_URL, {
          body: JSON.stringify({ test: 'data' }),
          headers: { 'Content-Type': 'application/custom' },
        });

        const headers = getHeadersFromFetchCall(mockFetch) as Headers;
        expect(headers.get('Content-Type')).toBe('application/custom');
      });

      it('should use Headers object for header management', async () => {
        const mockFetch = createMockFetch();
        vi.stubGlobal('fetch', mockFetch);

        const auth = createMockSpaConfig();
        initializeMyAccountClient(auth);

        const fetcher = getFetcherFromMockCalls(mockMyAccountClient);
        await fetcher!(TEST_URL, {});

        const fetchCall = mockFetch.mock.calls[0]!;
        expect(fetchCall[1]!.headers).toBeInstanceOf(Headers);
      });

      it('should preserve existing headers from init', async () => {
        const mockFetch = createMockFetch();
        vi.stubGlobal('fetch', mockFetch);

        const auth = createMockSpaConfig();
        initializeMyAccountClient(auth);

        const fetcher = getFetcherFromMockCalls(mockMyAccountClient);
        await fetcher!(TEST_URL, { headers: { 'X-Custom-Header': 'custom-value' } });

        const headers = getHeadersFromFetchCall(mockFetch) as Headers;
        expect(headers.get('X-Custom-Header')).toBe('custom-value');
      });

      it('should not add Content-Type for GET requests without body', async () => {
        const mockFetch = createMockFetch();
        vi.stubGlobal('fetch', mockFetch);

        const auth = createMockSpaConfig();
        initializeMyAccountClient(auth);

        const fetcher = getFetcherFromMockCalls(mockMyAccountClient);
        await fetcher!(TEST_URL, { method: 'GET' });

        const headers = getHeadersFromFetchCall(mockFetch) as Headers;
        expect(headers.get('Content-Type')).toBeNull();
      });
    });

    describe('token retrieval', () => {
      it('should request token with "me" audience', async () => {
        const mockFetch = createMockFetch();
        vi.stubGlobal('fetch', mockFetch);

        const auth = createMockSpaConfig();
        initializeMyAccountClient(auth);

        const fetcher = getFetcherFromMockCalls(mockMyAccountClient);
        await fetcher!(TEST_URL, {});

        expect(auth.contextInterface.getAccessTokenSilently).toHaveBeenCalledWith(
          expect.objectContaining({
            authorizationParams: expect.objectContaining({
              audience: expect.stringContaining('me'),
            }),
          }),
        );
      });

      it('should not call getConfiguration — domain is always explicitly provided', async () => {
        const mockFetch = createMockFetch();
        vi.stubGlobal('fetch', mockFetch);

        const contextInterface = createMockContextInterface();
        const auth: SpaAuthConfig = { mode: 'spa', domain: 'direct.auth0.com', contextInterface };
        initializeMyAccountClient(auth);

        const fetcher = getFetcherFromMockCalls(mockMyAccountClient);
        await fetcher!(TEST_URL, {});

        expect(contextInterface.getConfiguration).not.toHaveBeenCalled();
        expect(mockMyAccountClient).toHaveBeenCalledWith(
          expect.objectContaining({ domain: 'direct.auth0.com' }),
        );
      });

      it('should propagate token retrieval errors', async () => {
        const auth: SpaAuthConfig = {
          mode: 'spa',
          domain: 'test.auth0.com',
          contextInterface: {
            ...createMockContextInterface(),
            getAccessTokenSilently: vi.fn().mockRejectedValue(new Error('Token retrieval failed')),
          },
        };
        initializeMyAccountClient(auth);

        const fetcher = getFetcherFromMockCalls(mockMyAccountClient);

        await expect(fetcher!(TEST_URL, mockRequestInits.post)).rejects.toThrow(
          'Token retrieval failed',
        );
      });
    });
  });

  describe('edge cases', () => {
    describe('special characters in URLs', () => {
      it('should handle domain with special characters', () => {
        const auth: SpaAuthConfig = {
          mode: 'spa',
          domain: 'my-domain.eu.auth0.com',
          contextInterface: createMockContextInterface(),
        };

        const result = initializeMyAccountClient(auth);

        expect(result).toHaveProperty('factors');
      });

      it('should handle proxy URL with encoded characters', () => {
        const result = initializeMyAccountClient({
          mode: 'proxy',
          proxyUrl: 'https://example.com/path%20with%20spaces',
        });

        expect(result).toHaveProperty('factors');
      });

      it('should handle international domains', () => {
        const auth: SpaAuthConfig = {
          mode: 'spa',
          domain: 'münchen.auth0.com',
          contextInterface: createMockContextInterface(),
        };

        const result = initializeMyAccountClient(auth);

        expect(result).toHaveProperty('factors');
      });
    });

    describe('concurrent operations', () => {
      it('should handle concurrent fetcher calls in proxy mode', async () => {
        const mockFetch = createMockFetch();
        vi.stubGlobal('fetch', mockFetch);

        initializeMyAccountClient(mockProxyConfig);

        const fetcher = getFetcherFromMockCalls(mockMyAccountClient);

        await Promise.all([
          fetcher!('https://test.com/1', {}),
          fetcher!('https://test.com/2', {}),
          fetcher!('https://test.com/3', {}),
        ]);

        expect(mockFetch).toHaveBeenCalledTimes(3);
      });

      it('should handle concurrent fetcher calls in SPA mode', async () => {
        const mockFetch = createMockFetch();
        vi.stubGlobal('fetch', mockFetch);

        const auth = createMockSpaConfig();
        initializeMyAccountClient(auth);

        const fetcher = getFetcherFromMockCalls(mockMyAccountClient);

        await Promise.all([
          fetcher!('https://test.com/1', {}),
          fetcher!('https://test.com/2', {}),
          fetcher!('https://test.com/3', {}),
        ]);

        expect(mockFetch).toHaveBeenCalledTimes(3);
        expect(auth.contextInterface.getAccessTokenSilently).toHaveBeenCalledTimes(3);
      });
    });
  });

  describe('return value structure', () => {
    it('should return object with factors and authenticationMethods', () => {
      const result = initializeMyAccountClient(mockProxyConfig);

      expect(result).toHaveProperty('factors');
      expect(result).toHaveProperty('authenticationMethods');
    });

    it('should return new top-level instances on each call', () => {
      const result1 = initializeMyAccountClient(mockProxyConfig);
      const result2 = initializeMyAccountClient(mockProxyConfig);

      expect(result1).not.toBe(result2);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete proxy mode workflow', async () => {
      const mockFetch = createMockFetch();
      vi.stubGlobal('fetch', mockFetch);

      initializeMyAccountClient(mockProxyConfig);

      const config = getConfigFromMockCalls(mockMyAccountClient);
      const fetcher = config.fetcher;

      await fetcher!(TEST_URL, { body: JSON.stringify({ test: 'data' }) });

      expect(config.baseUrl).toBeDefined();
      expect(config.domain).toBe('');
      expect(config.telemetry).toBe(false);

      expect(mockFetch).toHaveBeenCalled();
      const headers = getHeadersFromFetchCall(mockFetch) as Headers;
      expect(headers.get('Content-Type')).toBe('application/json');
    });

    it('should handle complete SPA mode workflow', async () => {
      const mockFetch = createMockFetch();
      vi.stubGlobal('fetch', mockFetch);

      const auth = createMockSpaConfig();
      initializeMyAccountClient(auth);

      const config = getConfigFromMockCalls(mockMyAccountClient);
      const fetcher = config.fetcher;

      await fetcher!(TEST_URL, { body: JSON.stringify({ test: 'data' }) });

      expect(config.domain).toBe('test.auth0.com');
      expect(config.baseUrl).toBeUndefined();

      expect(auth.contextInterface.getAccessTokenSilently).toHaveBeenCalled();

      const headers = getHeadersFromFetchCall(mockFetch) as Headers;
      expect(headers.get('Content-Type')).toBe('application/json');
    });
  });
});
