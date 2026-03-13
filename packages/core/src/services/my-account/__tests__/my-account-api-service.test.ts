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
  mockScopes,
  mockTokens,
} from './__mocks__/my-account-api-service.mocks';

const TEST_URL = 'https://test.com';

// Hoist mock to avoid vi.mock hoisting issues
const mockMyAccountClient = vi.hoisted(() =>
  vi.fn().mockImplementation((config) => ({
    config,
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

    describe('withScopes function', () => {
      it('should provide withScopes function', () => {
        const service = initializeMyAccountClient(mockProxyConfig);

        expect(typeof service.withScopes).toBe('function');
      });

      it('should return a new instance when called', () => {
        const service = initializeMyAccountClient(mockProxyConfig);
        const scoped = service.withScopes(mockScopes.mfa);

        expect(scoped).not.toBe(service);
        expect(mockMyAccountClient).toHaveBeenCalledTimes(2);
      });

      it('should handle empty scope string', () => {
        const service = initializeMyAccountClient(mockProxyConfig);

        expect(() => service.withScopes('')).not.toThrow();
      });

      it('should handle complex scope strings', () => {
        const service = initializeMyAccountClient(mockProxyConfig);
        const complexScopes = `${mockScopes.mfa} ${mockScopes.profile} ${mockScopes.email}`;

        expect(() => service.withScopes(complexScopes)).not.toThrow();
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

      it('should add scope header when scopes are set via withScopes', async () => {
        const mockFetch = createMockFetch();
        vi.stubGlobal('fetch', mockFetch);

        const service = initializeMyAccountClient(mockProxyConfig); // call[0]
        service.withScopes(mockScopes.mfa); // call[1]

        const fetcher = getFetcherFromMockCalls(mockMyAccountClient, 1);
        await fetcher!(TEST_URL, {});

        expect(mockFetch).toHaveBeenCalled();
        const headers = getHeadersFromFetchCall(mockFetch) as Headers;
        expect(headers.get('auth0-scope')).toBe(mockScopes.mfa);
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

      it('should not add scope header when no withScopes called', async () => {
        const mockFetch = createMockFetch();
        vi.stubGlobal('fetch', mockFetch);

        initializeMyAccountClient(mockProxyConfig);

        const fetcher = getFetcherFromMockCalls(mockMyAccountClient);
        await fetcher!(TEST_URL, {});

        const headers = getHeadersFromFetchCall(mockFetch) as Record<string, string>;
        expect(headers['auth0-scope']).toBeUndefined();
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

      it('should use different scopes with different withScopes calls', async () => {
        const mockFetch = createMockFetch();
        vi.stubGlobal('fetch', mockFetch);

        const service = initializeMyAccountClient(mockProxyConfig); // call[0]

        service.withScopes(mockScopes.mfa); // call[1]
        const fetcher1 = getFetcherFromMockCalls(mockMyAccountClient, 1);
        await fetcher1!(TEST_URL, {});

        service.withScopes(mockScopes.profile); // call[2]
        const fetcher2 = getFetcherFromMockCalls(mockMyAccountClient, 2);
        await fetcher2!(TEST_URL, {});

        expect(mockFetch).toHaveBeenCalledTimes(2);
        const headers1 = getHeadersFromFetchCall(mockFetch, 0) as Headers;
        expect(headers1.get('auth0-scope')).toBe(mockScopes.mfa);
        const headers2 = getHeadersFromFetchCall(mockFetch, 1) as Headers;
        expect(headers2.get('auth0-scope')).toBe(mockScopes.profile);
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

      it('should provide withScopes function', () => {
        const service = initializeMyAccountClient(createMockSpaConfig());

        expect(typeof service.withScopes).toBe('function');
      });
    });

    describe('withScopes function in SPA mode', () => {
      it('should return a new instance when called', () => {
        const service = initializeMyAccountClient(createMockSpaConfig());
        const scoped = service.withScopes(mockScopes.mfa);

        expect(scoped).not.toBe(service);
      });

      it('should handle multiple scope updates independently', () => {
        const service = initializeMyAccountClient(createMockSpaConfig());

        expect(() => service.withScopes(mockScopes.mfa)).not.toThrow();
        expect(() => service.withScopes(mockScopes.profile)).not.toThrow();
      });
    });

    describe('custom fetcher behavior in SPA mode', () => {
      it('should call getAccessTokenSilently with scopes and audience', async () => {
        const mockFetch = createMockFetch();
        vi.stubGlobal('fetch', mockFetch);

        const auth = createMockSpaConfig();
        const service = initializeMyAccountClient(auth); // call[0]
        service.withScopes(mockScopes.mfa); // call[1]

        const fetcher = getFetcherFromMockCalls(mockMyAccountClient, 1);
        await fetcher!(TEST_URL, {});

        expect(auth.contextInterface.getAccessTokenSilently).toHaveBeenCalledWith(
          expect.objectContaining({
            authorizationParams: expect.objectContaining({ scope: mockScopes.mfa }),
          }),
        );
      });

      it('should add Authorization header with Bearer token', async () => {
        const mockFetch = createMockFetch();
        vi.stubGlobal('fetch', mockFetch);

        const auth = createMockSpaConfig();
        initializeMyAccountClient(auth);

        const fetcher = getFetcherFromMockCalls(mockMyAccountClient);
        await fetcher!(TEST_URL, {});

        const headers = getHeadersFromFetchCall(mockFetch) as Headers;
        expect(headers.get('Authorization')).toBe(`Bearer ${mockTokens.standard}`);
      });

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
      it('should request token with latest scopes', async () => {
        const mockFetch = createMockFetch();
        vi.stubGlobal('fetch', mockFetch);

        const auth = createMockSpaConfig();
        const service = initializeMyAccountClient(auth); // call[0]
        service.withScopes(mockScopes.mfa); // call[1]

        const fetcher = getFetcherFromMockCalls(mockMyAccountClient, 1);
        await fetcher!(TEST_URL, {});

        expect(auth.contextInterface.getAccessTokenSilently).toHaveBeenCalledWith(
          expect.objectContaining({
            authorizationParams: expect.objectContaining({ scope: mockScopes.mfa }),
          }),
        );
      });

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

      it('should handle very long tokens', async () => {
        const mockFetch = createMockFetch();
        vi.stubGlobal('fetch', mockFetch);

        const auth = createMockSpaConfig('a'.repeat(2000));
        initializeMyAccountClient(auth);

        const fetcher = getFetcherFromMockCalls(mockMyAccountClient);
        await fetcher!(TEST_URL, {});

        const headers = getHeadersFromFetchCall(mockFetch) as Headers;
        expect(headers.get('Authorization')).toBe(`Bearer ${'a'.repeat(2000)}`);
      });

      it('should handle tokens with special characters', async () => {
        const mockFetch = createMockFetch();
        vi.stubGlobal('fetch', mockFetch);

        const auth = createMockSpaConfig(mockTokens.withSpecialChars);
        initializeMyAccountClient(auth);

        const fetcher = getFetcherFromMockCalls(mockMyAccountClient);
        await fetcher!(TEST_URL, {});

        const headers = getHeadersFromFetchCall(mockFetch) as Headers;
        expect(headers.get('Authorization')).toBe(`Bearer ${mockTokens.withSpecialChars}`);
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

        expect(typeof result.withScopes).toBe('function');
      });

      it('should handle proxy URL with encoded characters', () => {
        const result = initializeMyAccountClient({
          mode: 'proxy',
          proxyUrl: 'https://example.com/path%20with%20spaces',
        });

        expect(typeof result.withScopes).toBe('function');
      });

      it('should handle international domains', () => {
        const auth: SpaAuthConfig = {
          mode: 'spa',
          domain: 'münchen.auth0.com',
          contextInterface: createMockContextInterface(),
        };

        const result = initializeMyAccountClient(auth);

        expect(typeof result.withScopes).toBe('function');
      });
    });

    describe('multiple consecutive calls', () => {
      it('should handle multiple scope updates', () => {
        const service = initializeMyAccountClient(mockProxyConfig);

        expect(() => {
          service.withScopes(mockScopes.mfa);
          service.withScopes(mockScopes.profile);
          service.withScopes(mockScopes.email);
          service.withScopes('');
        }).not.toThrow();
      });

      it('should create independent instances on each top-level call', () => {
        const service1 = initializeMyAccountClient(mockProxyConfig);
        const service2 = initializeMyAccountClient(mockProxyConfig);

        expect(service1).not.toBe(service2);
      });
    });

    describe('concurrent operations', () => {
      it('should handle concurrent withScopes calls', () => {
        const service = initializeMyAccountClient(mockProxyConfig);

        expect(() => {
          service.withScopes(mockScopes.mfa);
          service.withScopes(mockScopes.profile);
        }).not.toThrow();
      });

      it('should handle concurrent fetcher calls in proxy mode', async () => {
        const mockFetch = createMockFetch();
        vi.stubGlobal('fetch', mockFetch);

        const service = initializeMyAccountClient(mockProxyConfig); // call[0]
        service.withScopes(mockScopes.mfa); // call[1]

        const fetcher = getFetcherFromMockCalls(mockMyAccountClient, 1);

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
        const service = initializeMyAccountClient(auth); // call[0]
        service.withScopes(mockScopes.mfa); // call[1]

        const fetcher = getFetcherFromMockCalls(mockMyAccountClient, 1);

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
    it('should return object with withScopes, factors, and authenticationMethods', () => {
      const result = initializeMyAccountClient(mockProxyConfig);

      expect(result).toHaveProperty('withScopes');
      expect(result).toHaveProperty('factors');
      expect(result).toHaveProperty('authenticationMethods');
    });

    it('should have withScopes as a function', () => {
      const result = initializeMyAccountClient(mockProxyConfig);

      expect(typeof result.withScopes).toBe('function');
    });

    it('should return a new instance from withScopes', () => {
      const result = initializeMyAccountClient(mockProxyConfig);
      const scoped = result.withScopes(mockScopes.mfa);

      expect(scoped).not.toBe(result);
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

      const service = initializeMyAccountClient(mockProxyConfig); // call[0]
      service.withScopes(mockScopes.mfa); // call[1]

      const config = getConfigFromMockCalls(mockMyAccountClient, 1);
      const fetcher = config.fetcher;

      await fetcher!(TEST_URL, { body: JSON.stringify({ test: 'data' }) });

      expect(config.baseUrl).toBeDefined();
      expect(config.domain).toBe('');
      expect(config.telemetry).toBe(false);

      expect(mockFetch).toHaveBeenCalled();
      const headers = getHeadersFromFetchCall(mockFetch) as Headers;
      expect(headers.get('auth0-scope')).toBe(mockScopes.mfa);
      expect(headers.get('Content-Type')).toBe('application/json');
    });

    it('should handle complete SPA mode workflow', async () => {
      const mockFetch = createMockFetch();
      vi.stubGlobal('fetch', mockFetch);

      const auth = createMockSpaConfig();
      const service = initializeMyAccountClient(auth); // call[0]
      service.withScopes(mockScopes.mfa); // call[1]

      const config = getConfigFromMockCalls(mockMyAccountClient, 1);
      const fetcher = config.fetcher;

      await fetcher!(TEST_URL, { body: JSON.stringify({ test: 'data' }) });

      expect(config.domain).toBe('test.auth0.com');
      expect(config.baseUrl).toBeUndefined();

      expect(auth.contextInterface.getAccessTokenSilently).toHaveBeenCalledWith(
        expect.objectContaining({
          authorizationParams: expect.objectContaining({ scope: mockScopes.mfa }),
        }),
      );

      const headers = getHeadersFromFetchCall(mockFetch) as Headers;
      expect(headers.get('Authorization')).toBe(`Bearer ${mockTokens.standard}`);
      expect(headers.get('Content-Type')).toBe('application/json');
    });

    it('should handle switching from empty scope to populated scope', async () => {
      const mockFetch = createMockFetch();
      vi.stubGlobal('fetch', mockFetch);

      const auth = createMockSpaConfig();
      const service = initializeMyAccountClient(auth); // call[0]

      // Use initial (empty scope) fetcher
      const fetcher0 = getConfigFromMockCalls(mockMyAccountClient, 0).fetcher;
      await fetcher0!(TEST_URL, {});

      // Use scoped fetcher
      service.withScopes(mockScopes.mfa); // call[1]
      const fetcher1 = getConfigFromMockCalls(mockMyAccountClient, 1).fetcher;
      await fetcher1!(TEST_URL, {});

      expect(auth.contextInterface.getAccessTokenSilently).toHaveBeenCalledTimes(2);
      expect(auth.contextInterface.getAccessTokenSilently).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({
          authorizationParams: expect.objectContaining({ scope: '' }),
        }),
      );
      expect(auth.contextInterface.getAccessTokenSilently).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({
          authorizationParams: expect.objectContaining({ scope: mockScopes.mfa }),
        }),
      );
    });
  });
});
