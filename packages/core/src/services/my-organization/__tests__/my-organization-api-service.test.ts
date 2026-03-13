import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import type { SpaAuthConfig } from '../../../auth/auth-types';
import {
  createMockFetch,
  getConfigFromMockCalls,
  getFetcherFromMockCalls,
  getHeadersFromFetchCall,
} from '../../../internals/__mocks__/shared/sdk-client.mocks';
import { initializeMyOrganizationClient } from '../my-organization-api-service';

import {
  createMockContextInterface,
  createMockSpaConfig,
  mockProxyConfig,
  mockRequestInits,
  mockScopes,
  mockTokens,
} from './__mocks__/my-organization-api-service.mocks';

const TEST_URL = 'https://api.example.com/test';

// Hoist mock to avoid vi.mock hoisting issues
const mockMyOrganizationClient = vi.hoisted(() => vi.fn());

vi.mock('@auth0/myorganization-js', () => ({
  MyOrganizationClient: mockMyOrganizationClient,
}));

describe('initializeMyOrganizationClient', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch = createMockFetch();
    mockFetch.mockResolvedValue({ ok: true, json: async () => ({}) });
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe('proxy mode initialization', () => {
    describe('basic functionality', () => {
      it('should create MyOrganizationClient with proxy URL', () => {
        initializeMyOrganizationClient(mockProxyConfig);

        expect(mockMyOrganizationClient).toHaveBeenCalledTimes(1);
      });

      it('should construct correct base URL from proxy URL', () => {
        initializeMyOrganizationClient(mockProxyConfig);

        const config = getConfigFromMockCalls(mockMyOrganizationClient);
        expect(config.baseUrl).toBe('https://proxy.example.com/my-org');
      });

      it('should set domain to empty string in proxy mode', () => {
        initializeMyOrganizationClient(mockProxyConfig);

        const config = getConfigFromMockCalls(mockMyOrganizationClient);
        expect(config.domain).toBe('');
      });

      it('should disable telemetry in proxy mode', () => {
        initializeMyOrganizationClient(mockProxyConfig);

        const config = getConfigFromMockCalls(mockMyOrganizationClient);
        expect(config.telemetry).toBe(false);
      });

      it('should provide custom fetcher in proxy mode', () => {
        initializeMyOrganizationClient(mockProxyConfig);

        const config = getConfigFromMockCalls(mockMyOrganizationClient);
        expect(config.fetcher).toBeDefined();
        expect(typeof config.fetcher).toBe('function');
      });
    });

    describe('withScopes function', () => {
      it('should provide withScopes function', () => {
        const service = initializeMyOrganizationClient(mockProxyConfig);

        expect(typeof service.withScopes).toBe('function');
      });

      it('should return a new instance when called', () => {
        const service = initializeMyOrganizationClient(mockProxyConfig);
        const scoped = service.withScopes(mockScopes.organizationRead);

        expect(scoped).not.toBe(service);
        expect(mockMyOrganizationClient).toHaveBeenCalledTimes(2);
      });

      it('should handle empty scope string', () => {
        const service = initializeMyOrganizationClient(mockProxyConfig);

        expect(() => service.withScopes(mockScopes.empty)).not.toThrow();
      });

      it('should handle complex scope strings', () => {
        const service = initializeMyOrganizationClient(mockProxyConfig);

        expect(() => service.withScopes(mockScopes.complex)).not.toThrow();
      });
    });

    describe('custom fetcher behavior in proxy mode', () => {
      it('should create fetcher that calls fetch', async () => {
        initializeMyOrganizationClient(mockProxyConfig);

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);
        await fetcher!(TEST_URL, mockRequestInits.get);

        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      it('should add scope header when scopes are set via withScopes', async () => {
        const service = initializeMyOrganizationClient(mockProxyConfig); // call[0]
        service.withScopes(mockScopes.organizationRead); // call[1]

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient, 1);
        await fetcher!(TEST_URL, mockRequestInits.post);

        const headers = getHeadersFromFetchCall(mockFetch) as Headers;
        expect(headers.get('auth0-scope')).toBe(mockScopes.organizationRead);
      });

      it('should add Content-Type header when body is present', async () => {
        initializeMyOrganizationClient(mockProxyConfig);

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);
        await fetcher!(TEST_URL, mockRequestInits.post);

        const headers = getHeadersFromFetchCall(mockFetch) as Headers;
        expect(headers.get('Content-Type')).toBe('application/json');
      });

      it('should not add scope header when no withScopes called', async () => {
        initializeMyOrganizationClient(mockProxyConfig);

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);
        await fetcher!(TEST_URL, mockRequestInits.post);

        const headers = getHeadersFromFetchCall(mockFetch) as Record<string, string>;
        expect(headers['auth0-scope']).toBeUndefined();
      });

      it('should preserve existing headers', async () => {
        const service = initializeMyOrganizationClient(mockProxyConfig); // call[0]
        service.withScopes(mockScopes.organizationRead); // call[1]

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient, 1);
        await fetcher!(TEST_URL, mockRequestInits.postWithHeaders);

        const headers = getHeadersFromFetchCall(mockFetch) as Headers;
        expect(headers.get('X-Custom-Header')).toBe('custom-value');
        expect(headers.get('auth0-scope')).toBe(mockScopes.organizationRead);
      });

      it('should use different scopes with different withScopes calls', async () => {
        const service = initializeMyOrganizationClient(mockProxyConfig); // call[0]
        service.withScopes(mockScopes.organizationRead); // call[1]
        const fetcher1 = mockMyOrganizationClient.mock.calls[1]![0].fetcher;
        await fetcher1!(TEST_URL, mockRequestInits.post);

        service.withScopes(mockScopes.complex); // call[2]
        const fetcher2 = mockMyOrganizationClient.mock.calls[2]![0].fetcher;
        await fetcher2!(TEST_URL, mockRequestInits.post);

        const firstHeaders = getHeadersFromFetchCall(mockFetch, 0) as Headers;
        expect(firstHeaders.get('auth0-scope')).toBe(mockScopes.organizationRead);

        const secondHeaders = getHeadersFromFetchCall(mockFetch, 1) as Headers;
        expect(secondHeaders.get('auth0-scope')).toBe(mockScopes.complex);
      });

      it('should not add Content-Type header for GET requests without body', async () => {
        initializeMyOrganizationClient(mockProxyConfig);

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);
        await fetcher!(TEST_URL, mockRequestInits.get);

        const headers = getHeadersFromFetchCall(mockFetch) as Record<string, string>;
        expect(headers['Content-Type']).toBeUndefined();
      });

      it('should handle requests without init parameter', async () => {
        initializeMyOrganizationClient(mockProxyConfig);

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);
        await fetcher!(TEST_URL);

        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(mockFetch).toHaveBeenCalledWith(
          TEST_URL,
          expect.objectContaining({ headers: expect.any(Object) }),
        );
      });
    });

    describe('URL handling', () => {
      it('should handle proxy URL with path', () => {
        initializeMyOrganizationClient({
          mode: 'proxy',
          proxyUrl: 'https://proxy.example.com/api/v1',
        });

        const config = getConfigFromMockCalls(mockMyOrganizationClient);
        expect(config.baseUrl).toBe('https://proxy.example.com/api/v1/my-org');
      });

      it('should handle proxy URL with port', () => {
        initializeMyOrganizationClient({
          mode: 'proxy',
          proxyUrl: 'https://proxy.example.com:8080',
        });

        const config = getConfigFromMockCalls(mockMyOrganizationClient);
        expect(config.baseUrl).toBe('https://proxy.example.com:8080/my-org');
      });

      it('should handle proxy URL with query parameters', () => {
        initializeMyOrganizationClient({
          mode: 'proxy',
          proxyUrl: 'https://proxy.example.com?param=value',
        });

        const config = getConfigFromMockCalls(mockMyOrganizationClient);
        expect(config.baseUrl).toBe('https://proxy.example.com?param=value/my-org');
      });
    });
  });

  describe('SPA mode initialization', () => {
    describe('basic functionality', () => {
      it('should create MyOrganizationClient with domain', () => {
        initializeMyOrganizationClient(createMockSpaConfig());

        expect(mockMyOrganizationClient).toHaveBeenCalledTimes(1);
      });

      it('should not set baseUrl in SPA mode', () => {
        initializeMyOrganizationClient(createMockSpaConfig());

        const config = getConfigFromMockCalls(mockMyOrganizationClient);
        expect(config.baseUrl).toBeUndefined();
      });

      it('should disable telemetry in SPA mode', () => {
        initializeMyOrganizationClient(createMockSpaConfig());

        const config = getConfigFromMockCalls(mockMyOrganizationClient);
        expect(config.telemetry).toBe(false);
      });

      it('should provide custom fetcher in SPA mode', () => {
        initializeMyOrganizationClient(createMockSpaConfig());

        const config = getConfigFromMockCalls(mockMyOrganizationClient);
        expect(config.fetcher).toBeDefined();
        expect(typeof config.fetcher).toBe('function');
      });

      it('should provide withScopes function', () => {
        const service = initializeMyOrganizationClient(createMockSpaConfig());

        expect(typeof service.withScopes).toBe('function');
      });
    });

    describe('custom fetcher behavior in SPA mode', () => {
      it('should call getAccessTokenSilently with correct parameters', async () => {
        const auth = createMockSpaConfig();
        const service = initializeMyOrganizationClient(auth); // call[0]
        service.withScopes(mockScopes.organizationRead); // call[1]

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient, 1);
        await fetcher!(TEST_URL, mockRequestInits.post);

        expect(auth.contextInterface.getAccessTokenSilently).toHaveBeenCalledTimes(1);
        expect(auth.contextInterface.getAccessTokenSilently).toHaveBeenCalledWith(
          expect.objectContaining({
            authorizationParams: expect.objectContaining({
              scope: mockScopes.organizationRead,
              audience: expect.stringContaining('my-org'),
            }),
          }),
        );
      });

      it('should add Authorization header with token', async () => {
        const auth = createMockSpaConfig();
        initializeMyOrganizationClient(auth);

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);
        await fetcher!(TEST_URL, mockRequestInits.post);

        const headers = getHeadersFromFetchCall(mockFetch) as Headers;
        expect(headers.get('Authorization')).toBe(`Bearer ${mockTokens.standard}`);
      });

      it('should add Content-Type header when body is present', async () => {
        const auth = createMockSpaConfig();
        initializeMyOrganizationClient(auth);

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);
        await fetcher!(TEST_URL, mockRequestInits.post);

        const headers = getHeadersFromFetchCall(mockFetch) as Headers;
        expect(headers.get('Content-Type')).toBe('application/json');
      });

      it('should not override existing Content-Type header', async () => {
        const auth = createMockSpaConfig();
        initializeMyOrganizationClient(auth);

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);
        await fetcher!(TEST_URL, mockRequestInits.withContentType);

        const headers = getHeadersFromFetchCall(mockFetch) as Headers;
        expect(headers.get('Content-Type')).toBe('application/x-www-form-urlencoded');
      });

      it('should use different scopes with different withScopes calls', async () => {
        const auth = createMockSpaConfig();
        const service = initializeMyOrganizationClient(auth); // call[0]

        service.withScopes(mockScopes.organizationRead); // call[1]
        const fetcher1 = mockMyOrganizationClient.mock.calls[1]![0].fetcher;
        await fetcher1!(TEST_URL, mockRequestInits.post);

        service.withScopes(mockScopes.complex); // call[2]
        const fetcher2 = mockMyOrganizationClient.mock.calls[2]![0].fetcher;
        await fetcher2!(TEST_URL, mockRequestInits.post);

        expect(auth.contextInterface.getAccessTokenSilently).toHaveBeenNthCalledWith(
          1,
          expect.objectContaining({
            authorizationParams: expect.objectContaining({ scope: mockScopes.organizationRead }),
          }),
        );
        expect(auth.contextInterface.getAccessTokenSilently).toHaveBeenNthCalledWith(
          2,
          expect.objectContaining({
            authorizationParams: expect.objectContaining({ scope: mockScopes.complex }),
          }),
        );
      });

      it('should use Headers object for headers', async () => {
        const auth = createMockSpaConfig();
        initializeMyOrganizationClient(auth);

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);
        await fetcher!(TEST_URL, mockRequestInits.post);

        const headers = getHeadersFromFetchCall(mockFetch);
        expect(headers).toBeInstanceOf(Headers);
      });

      it('should handle requests without init parameter', async () => {
        const auth = createMockSpaConfig();
        initializeMyOrganizationClient(auth);

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);
        await fetcher!(TEST_URL);

        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(auth.contextInterface.getAccessTokenSilently).toHaveBeenCalledTimes(1);
      });

      it('should pass empty scope string when no withScopes called', async () => {
        const auth = createMockSpaConfig();
        initializeMyOrganizationClient(auth);

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);
        await fetcher!(TEST_URL, mockRequestInits.post);

        expect(auth.contextInterface.getAccessTokenSilently).toHaveBeenCalledWith(
          expect.objectContaining({
            authorizationParams: expect.objectContaining({ scope: '' }),
          }),
        );
      });

      it('should not add Content-Type for GET requests without body', async () => {
        const auth = createMockSpaConfig();
        initializeMyOrganizationClient(auth);

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);
        await fetcher!(TEST_URL, mockRequestInits.get);

        const headers = getHeadersFromFetchCall(mockFetch) as Headers;
        expect(headers.get('Content-Type')).toBeNull();
      });
    });

    describe('token retrieval errors', () => {
      it('should propagate token retrieval errors', async () => {
        const auth: SpaAuthConfig = {
          mode: 'spa',
          domain: 'test.auth0.com',
          contextInterface: {
            ...createMockContextInterface(),
            getAccessTokenSilently: vi.fn().mockRejectedValue(new Error('Token retrieval failed')),
          },
        };
        initializeMyOrganizationClient(auth);

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);

        await expect(fetcher!(TEST_URL, mockRequestInits.post)).rejects.toThrow(
          'Token retrieval failed',
        );
      });
    });
  });

  describe('edge cases', () => {
    it('should handle very long scope strings', async () => {
      const service = initializeMyOrganizationClient(mockProxyConfig); // call[0]
      const longScope = 'read:organization '.repeat(100).trim();
      service.withScopes(longScope); // call[1]

      const fetcher = mockMyOrganizationClient.mock.calls[1]![0].fetcher;
      await fetcher!(TEST_URL, mockRequestInits.post);

      expect((mockFetch.mock.calls[0]![1]!.headers as Headers).get('auth0-scope')).toBe(longScope);
    });

    it('should handle very long tokens', async () => {
      const auth = createMockSpaConfig(mockTokens.long);
      initializeMyOrganizationClient(auth);

      const fetcher = mockMyOrganizationClient.mock.calls[0]![0].fetcher;
      await fetcher!(TEST_URL, mockRequestInits.post);

      const headers = mockFetch.mock.calls[0]![1]!.headers;
      expect(headers.get('Authorization')).toBe(`Bearer ${mockTokens.long}`);
    });

    it('should handle tokens with special characters', async () => {
      const auth = createMockSpaConfig(mockTokens.withSpecialChars);
      initializeMyOrganizationClient(auth);

      const fetcher = mockMyOrganizationClient.mock.calls[0]![0].fetcher;
      await fetcher!(TEST_URL, mockRequestInits.post);

      const headers = mockFetch.mock.calls[0]![1]!.headers;
      expect(headers.get('Authorization')).toBe(`Bearer ${mockTokens.withSpecialChars}`);
    });

    it('should handle multiple withScopes calls with independent scopes', async () => {
      const service = initializeMyOrganizationClient(mockProxyConfig); // call[0]

      for (let i = 0; i < 5; i++) {
        service.withScopes(`scope${i}`); // call[i+1]
        const fetcher = mockMyOrganizationClient.mock.calls[i + 1]![0].fetcher;
        await fetcher!(TEST_URL, mockRequestInits.post);

        expect((mockFetch.mock.calls[i]![1]!.headers as Headers).get('auth0-scope')).toBe(
          `scope${i}`,
        );
      }
    });

    it('should handle Headers object in init.headers', async () => {
      const auth = createMockSpaConfig();
      initializeMyOrganizationClient(auth);

      const fetcher = mockMyOrganizationClient.mock.calls[0]![0].fetcher;

      const headersObj = new Headers();
      headersObj.set('X-Custom', 'value');

      await fetcher!(TEST_URL, {
        method: 'POST',
        body: JSON.stringify({ test: 'data' }),
        headers: headersObj,
      });

      const headers = mockFetch.mock.calls[0]![1]!.headers as Headers;
      expect(headers.get('X-Custom')).toBe('value');
      expect(headers.get('Authorization')).toBe(`Bearer ${mockTokens.standard}`);
    });

    it('should handle array-based headers in init.headers for proxy mode', async () => {
      initializeMyOrganizationClient(mockProxyConfig);

      const fetcher = mockMyOrganizationClient.mock.calls[0]![0].fetcher;

      await fetcher!(TEST_URL, {
        method: 'POST',
        body: JSON.stringify({ test: 'data' }),
        headers: { 'X-Custom': 'value' } as HeadersInit,
      });

      const headers = mockFetch.mock.calls[0]![1]!.headers as Headers;
      expect(headers.get('X-Custom')).toBe('value');
    });

    it('should handle scope strings with leading/trailing whitespace', async () => {
      const service = initializeMyOrganizationClient(mockProxyConfig); // call[0]
      service.withScopes(mockScopes.withSpaces); // call[1]

      const fetcher = mockMyOrganizationClient.mock.calls[1]![0].fetcher;
      await fetcher!(TEST_URL, mockRequestInits.post);

      const headers = mockFetch.mock.calls[0]![1]!.headers as Headers;
      // Headers API trims leading/trailing whitespace per HTTP spec
      expect(headers.get('auth0-scope')).toBe(mockScopes.withSpaces.trim());
    });

    it('should handle PATCH requests with body', async () => {
      const auth = createMockSpaConfig();
      initializeMyOrganizationClient(auth);

      const fetcher = mockMyOrganizationClient.mock.calls[0]![0].fetcher;
      await fetcher!(TEST_URL, mockRequestInits.patch);

      const headers = mockFetch.mock.calls[0]![1]!.headers;
      expect(headers.get('Content-Type')).toBe('application/json');
      expect(headers.get('Authorization')).toBe(`Bearer ${mockTokens.standard}`);
    });

    it('should handle undefined body', async () => {
      initializeMyOrganizationClient(mockProxyConfig);

      const fetcher = mockMyOrganizationClient.mock.calls[0]![0].fetcher;
      await fetcher!(TEST_URL, { method: 'POST', body: undefined });

      expect(mockFetch.mock.calls[0]![1]!.headers['Content-Type']).toBeUndefined();
    });

    it('should handle null body', async () => {
      initializeMyOrganizationClient(mockProxyConfig);

      const fetcher = mockMyOrganizationClient.mock.calls[0]![0].fetcher;
      await fetcher!(TEST_URL, { method: 'POST', body: null });

      expect(mockFetch.mock.calls[0]![1]!.headers['Content-Type']).toBeUndefined();
    });
  });

  describe('return value structure', () => {
    it('should return object with withScopes, organization, and organizationDetails', () => {
      const result = initializeMyOrganizationClient(mockProxyConfig);

      expect(result).toHaveProperty('withScopes');
      expect(result).toHaveProperty('organization');
      expect(result).toHaveProperty('organizationDetails');
    });

    it('should have withScopes as a function', () => {
      const result = initializeMyOrganizationClient(mockProxyConfig);

      expect(typeof result.withScopes).toBe('function');
    });

    it('should return a new instance from withScopes', () => {
      const result = initializeMyOrganizationClient(mockProxyConfig);
      const scoped = result.withScopes(mockScopes.organizationRead);

      expect(scoped).not.toBe(result);
    });

    it('should create new MyOrganizationClient on withScopes', () => {
      const result = initializeMyOrganizationClient(mockProxyConfig);
      result.withScopes(mockScopes.organizationRead);

      expect(mockMyOrganizationClient).toHaveBeenCalledTimes(2);
    });

    it('should have consistent return structure for proxy mode', () => {
      const result = initializeMyOrganizationClient(mockProxyConfig);

      expect(typeof result.withScopes).toBe('function');
      expect(result).toHaveProperty('organization');
      expect(result).toHaveProperty('organizationDetails');
    });

    it('should have consistent return structure for SPA mode', () => {
      const result = initializeMyOrganizationClient(createMockSpaConfig());

      expect(typeof result.withScopes).toBe('function');
      expect(result).toHaveProperty('organization');
      expect(result).toHaveProperty('organizationDetails');
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete proxy mode workflow', async () => {
      const service = initializeMyOrganizationClient(mockProxyConfig); // call[0]
      service.withScopes(mockScopes.organizationRead); // call[1]

      const fetcher = mockMyOrganizationClient.mock.calls[1]![0].fetcher;
      await fetcher!(TEST_URL, mockRequestInits.post);

      expect(mockFetch).toHaveBeenCalled();
      expect((mockFetch.mock.calls[0]![1]!.headers as Headers).get('auth0-scope')).toBe(
        mockScopes.organizationRead,
      );
    });

    it('should handle complete SPA mode workflow', async () => {
      const auth = createMockSpaConfig();
      const service = initializeMyOrganizationClient(auth); // call[0]
      service.withScopes(mockScopes.complex); // call[1]

      const fetcher = mockMyOrganizationClient.mock.calls[1]![0].fetcher;
      await fetcher!(TEST_URL, mockRequestInits.post);

      expect(auth.contextInterface.getAccessTokenSilently).toHaveBeenCalledWith(
        expect.objectContaining({
          authorizationParams: expect.objectContaining({ scope: mockScopes.complex }),
        }),
      );
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should support multiple clients with different configurations', () => {
      const proxyService = initializeMyOrganizationClient(mockProxyConfig);
      const spaService = initializeMyOrganizationClient(createMockSpaConfig());

      expect(typeof proxyService.withScopes).toBe('function');
      expect(typeof spaService.withScopes).toBe('function');
      expect(mockMyOrganizationClient).toHaveBeenCalledTimes(2);
    });
  });
});
