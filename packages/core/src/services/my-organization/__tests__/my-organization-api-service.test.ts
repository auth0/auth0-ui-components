import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import type { createTokenManager } from '../../../auth/token-manager';
import {
  createMockFetch,
  getConfigFromMockCalls,
  getFetcherFromMockCalls,
  getHeadersFromFetchCall,
} from '../../../internals/__mocks__/shared/sdk-client.mocks';
import { initializeMyOrganizationClient } from '../my-organization-api-service';

import {
  mockAuthWithDomain,
  mockAuthWithProxyUrl,
  mockAuthWithProxyUrlTrailingSlash,
  mockAuthWithBothDomainAndProxy,
  mockAuthWithNeither,
  mockAuthWithEmptyDomain,
  mockAuthWithEmptyProxyUrl,
  mockAuthWithDomainWhitespace,
  mockAuthWithProxyUrlWhitespace,
  createMockTokenManager,
  createMockTokenManagerWithScopes,
  createMockTokenManagerWithError,
  mockScopes,
  mockTokens,
  mockRequestInits,
  expectedErrors,
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
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });
    vi.stubGlobal('fetch', mockFetch);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe('proxy mode initialization', () => {
    describe('basic functionality', () => {
      it('should create MyOrganizationClient with proxy URL', () => {
        const tokenManager = createMockTokenManager();
        initializeMyOrganizationClient(mockAuthWithProxyUrl, tokenManager);

        expect(mockMyOrganizationClient).toHaveBeenCalledTimes(1);
      });

      it('should construct correct base URL from proxy URL', () => {
        const tokenManager = createMockTokenManager();
        initializeMyOrganizationClient(mockAuthWithProxyUrl, tokenManager);

        const config = getConfigFromMockCalls(mockMyOrganizationClient);
        expect(config.baseUrl).toBe('https://proxy.example.com/my-org');
      });

      it('should remove trailing slash from proxy URL', () => {
        const tokenManager = createMockTokenManager();
        initializeMyOrganizationClient(mockAuthWithProxyUrlTrailingSlash, tokenManager);

        const config = getConfigFromMockCalls(mockMyOrganizationClient);
        expect(config.baseUrl).toBe('https://proxy.example.com/my-org');
        expect(config.baseUrl).not.toContain('//my-org');
      });

      it('should set domain to empty string in proxy mode', () => {
        const tokenManager = createMockTokenManager();
        initializeMyOrganizationClient(mockAuthWithProxyUrl, tokenManager);

        const config = getConfigFromMockCalls(mockMyOrganizationClient);
        expect(config.domain).toBe('');
      });

      it('should disable telemetry in proxy mode', () => {
        const tokenManager = createMockTokenManager();
        initializeMyOrganizationClient(mockAuthWithProxyUrl, tokenManager);

        const config = getConfigFromMockCalls(mockMyOrganizationClient);
        expect(config.telemetry).toBe(false);
      });

      it('should provide custom fetcher in proxy mode', () => {
        const tokenManager = createMockTokenManager();
        initializeMyOrganizationClient(mockAuthWithProxyUrl, tokenManager);

        const config = getConfigFromMockCalls(mockMyOrganizationClient);
        expect(config.fetcher).toBeDefined();
        expect(typeof config.fetcher).toBe('function');
      });
    });

    describe('setLatestScopes function', () => {
      it('should provide setLatestScopes function', () => {
        const tokenManager = createMockTokenManager();
        const { setLatestScopes } = initializeMyOrganizationClient(
          mockAuthWithProxyUrl,
          tokenManager,
        );

        expect(setLatestScopes).toBeDefined();
        expect(typeof setLatestScopes).toBe('function');
      });

      it('should accept scope strings without throwing', () => {
        const tokenManager = createMockTokenManager();
        const { setLatestScopes } = initializeMyOrganizationClient(
          mockAuthWithProxyUrl,
          tokenManager,
        );

        expect(() => setLatestScopes(mockScopes.organizationRead)).not.toThrow();
      });

      it('should handle empty scope string', () => {
        const tokenManager = createMockTokenManager();
        const { setLatestScopes } = initializeMyOrganizationClient(
          mockAuthWithProxyUrl,
          tokenManager,
        );

        expect(() => setLatestScopes(mockScopes.empty)).not.toThrow();
      });

      it('should handle complex scope strings', () => {
        const tokenManager = createMockTokenManager();
        const { setLatestScopes } = initializeMyOrganizationClient(
          mockAuthWithProxyUrl,
          tokenManager,
        );

        expect(() => setLatestScopes(mockScopes.complex)).not.toThrow();
      });
    });

    describe('custom fetcher behavior in proxy mode', () => {
      it('should create fetcher that calls fetch', async () => {
        const tokenManager = createMockTokenManager();
        initializeMyOrganizationClient(mockAuthWithProxyUrl, tokenManager);

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);

        await fetcher!(TEST_URL, mockRequestInits.get);

        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      it('should add scope header when scopes are set', async () => {
        const tokenManager = createMockTokenManager();
        const { setLatestScopes } = initializeMyOrganizationClient(
          mockAuthWithProxyUrl,
          tokenManager,
        );

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);

        setLatestScopes(mockScopes.organizationRead);
        await fetcher!(TEST_URL, mockRequestInits.post);

        const headers = getHeadersFromFetchCall(mockFetch) as Record<string, string>;
        expect(headers['auth0-scope']).toBe(mockScopes.organizationRead);
      });

      it('should add Content-Type header when body is present', async () => {
        const tokenManager = createMockTokenManager();
        const { setLatestScopes } = initializeMyOrganizationClient(
          mockAuthWithProxyUrl,
          tokenManager,
        );

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);

        setLatestScopes(mockScopes.organizationRead);
        await fetcher!(TEST_URL, mockRequestInits.post);

        const headers = getHeadersFromFetchCall(mockFetch) as Record<string, string>;
        expect(headers['Content-Type']).toBe('application/json');
      });

      it('should not add scope header when scope is empty', async () => {
        const tokenManager = createMockTokenManager();
        initializeMyOrganizationClient(mockAuthWithProxyUrl, tokenManager);

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);

        await fetcher!(TEST_URL, mockRequestInits.post);

        const headers = getHeadersFromFetchCall(mockFetch) as Record<string, string>;
        expect(headers['auth0-scope']).toBeUndefined();
      });

      it('should preserve existing headers', async () => {
        const tokenManager = createMockTokenManager();
        const { setLatestScopes } = initializeMyOrganizationClient(
          mockAuthWithProxyUrl,
          tokenManager,
        );

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);

        setLatestScopes(mockScopes.organizationRead);
        await fetcher!(TEST_URL, mockRequestInits.postWithHeaders);

        const headers = getHeadersFromFetchCall(mockFetch) as Record<string, string>;
        expect(headers['X-Custom-Header']).toBe('custom-value');
        expect(headers['auth0-scope']).toBe(mockScopes.organizationRead);
      });

      it('should update scope header when scopes change', async () => {
        const tokenManager = createMockTokenManager();
        const { setLatestScopes } = initializeMyOrganizationClient(
          mockAuthWithProxyUrl,
          tokenManager,
        );

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);

        // First call with orgRead scope
        setLatestScopes(mockScopes.organizationRead);
        await fetcher!(TEST_URL, mockRequestInits.post);

        const firstCall = mockFetch.mock.calls[0]!;
        const firstHeaders = firstCall[1]!.headers;
        expect(firstHeaders['auth0-scope']).toBe(mockScopes.organizationRead);

        // Second call with complex scope
        setLatestScopes(mockScopes.complex);
        await fetcher!(TEST_URL, mockRequestInits.post);

        const secondCall = mockFetch.mock.calls[1]!;
        const secondHeaders = secondCall[1]!.headers;
        expect(secondHeaders['auth0-scope']).toBe(mockScopes.complex);
      });

      it('should not add Content-Type header for GET requests without body', async () => {
        const tokenManager = createMockTokenManager();
        initializeMyOrganizationClient(mockAuthWithProxyUrl, tokenManager);

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);

        await fetcher!(TEST_URL, mockRequestInits.get);

        const headers = getHeadersFromFetchCall(mockFetch) as Record<string, string>;
        expect(headers['Content-Type']).toBeUndefined();
      });

      it('should handle requests without init parameter', async () => {
        const tokenManager = createMockTokenManager();
        initializeMyOrganizationClient(mockAuthWithProxyUrl, tokenManager);

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);

        await fetcher!(TEST_URL);

        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(mockFetch).toHaveBeenCalledWith(
          TEST_URL,
          expect.objectContaining({
            headers: expect.any(Object),
          }),
        );
      });
    });

    describe('customFetch parameter in proxy mode', () => {
      it('should use customFetch when provided', async () => {
        const tokenManager = createMockTokenManager();
        const customFetch = vi.fn().mockResolvedValue(createMockFetch());

        initializeMyOrganizationClient(mockAuthWithProxyUrl, tokenManager, customFetch);

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);
        await fetcher!(TEST_URL, mockRequestInits.post);

        expect(customFetch).toHaveBeenCalledTimes(1);
        expect(mockFetch).not.toHaveBeenCalled();
      });

      it('should pass url and init to customFetch', async () => {
        const tokenManager = createMockTokenManager();
        const customFetch = vi.fn().mockResolvedValue(createMockFetch());

        initializeMyOrganizationClient(mockAuthWithProxyUrl, tokenManager, customFetch);

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);
        await fetcher!(TEST_URL, mockRequestInits.post);

        expect(customFetch).toHaveBeenCalledWith(
          TEST_URL,
          expect.objectContaining({
            body: mockRequestInits.post.body,
          }),
        );
      });
    });

    describe('URL handling', () => {
      it('should handle proxy URL with path', () => {
        const tokenManager = createMockTokenManager();
        const authWithPath = {
          authProxyUrl: 'https://proxy.example.com/api/v1',
        };
        initializeMyOrganizationClient(authWithPath, tokenManager);

        const config = getConfigFromMockCalls(mockMyOrganizationClient);
        expect(config.baseUrl).toBe('https://proxy.example.com/api/v1/my-org');
      });

      it('should handle proxy URL with port', () => {
        const tokenManager = createMockTokenManager();
        const authWithPort = {
          authProxyUrl: 'https://proxy.example.com:8080',
        };
        initializeMyOrganizationClient(authWithPort, tokenManager);

        const config = getConfigFromMockCalls(mockMyOrganizationClient);
        expect(config.baseUrl).toBe('https://proxy.example.com:8080/my-org');
      });

      it('should handle proxy URL with query parameters', () => {
        const tokenManager = createMockTokenManager();
        const authWithQuery = {
          authProxyUrl: 'https://proxy.example.com?param=value',
        };
        initializeMyOrganizationClient(authWithQuery, tokenManager);

        const config = getConfigFromMockCalls(mockMyOrganizationClient);
        expect(config.baseUrl).toBe('https://proxy.example.com?param=value/my-org');
      });

      it('should trim baseUrl after construction', () => {
        const tokenManager = createMockTokenManager();
        initializeMyOrganizationClient(mockAuthWithProxyUrlWhitespace, tokenManager);

        const config = getConfigFromMockCalls(mockMyOrganizationClient);
        // The trim() is applied to the final baseUrl
        expect(config.baseUrl!.trim()).toBe(config.baseUrl);
      });
    });
  });

  describe('domain mode initialization', () => {
    describe('basic functionality', () => {
      it('should create MyOrganizationClient with domain', () => {
        const tokenManager = createMockTokenManager();
        initializeMyOrganizationClient(mockAuthWithDomain, tokenManager);

        expect(mockMyOrganizationClient).toHaveBeenCalledTimes(1);
      });

      it('should trim whitespace from domain', () => {
        const tokenManager = createMockTokenManager();
        initializeMyOrganizationClient(mockAuthWithDomainWhitespace, tokenManager);

        const config = getConfigFromMockCalls(mockMyOrganizationClient);
        expect(config.domain).toBe('test.auth0.com');
      });

      it('should not set baseUrl in domain mode', () => {
        const tokenManager = createMockTokenManager();
        initializeMyOrganizationClient(mockAuthWithDomain, tokenManager);

        const config = getConfigFromMockCalls(mockMyOrganizationClient);
        expect(config.baseUrl).toBeUndefined();
      });

      it('should not set telemetry in domain mode', () => {
        const tokenManager = createMockTokenManager();
        initializeMyOrganizationClient(mockAuthWithDomain, tokenManager);

        const config = getConfigFromMockCalls(mockMyOrganizationClient);
        expect(config.telemetry).toBeUndefined();
      });

      it('should provide custom fetcher in domain mode', () => {
        const tokenManager = createMockTokenManager();
        initializeMyOrganizationClient(mockAuthWithDomain, tokenManager);

        const config = getConfigFromMockCalls(mockMyOrganizationClient);
        expect(config.fetcher).toBeDefined();
        expect(typeof config.fetcher).toBe('function');
      });

      it('should provide setLatestScopes function', () => {
        const tokenManager = createMockTokenManager();
        const { setLatestScopes } = initializeMyOrganizationClient(
          mockAuthWithDomain,
          tokenManager,
        );

        expect(setLatestScopes).toBeDefined();
        expect(typeof setLatestScopes).toBe('function');
      });
    });

    describe('custom fetcher behavior in domain mode', () => {
      it('should call tokenManager.getToken with correct parameters', async () => {
        const tokenManager = createMockTokenManagerWithScopes(mockTokens.standard);
        const { setLatestScopes } = initializeMyOrganizationClient(
          mockAuthWithDomain,
          tokenManager,
        );

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);

        setLatestScopes(mockScopes.organizationRead);
        await fetcher!(TEST_URL, mockRequestInits.post);

        expect(tokenManager.getToken).toHaveBeenCalledTimes(1);
        const getTokenCalls = (tokenManager.getToken as ReturnType<typeof vi.fn>).mock.calls;
        expect(getTokenCalls[0]![0]).toBe(mockScopes.organizationRead);
        expect(getTokenCalls[0]![1]).toBe('my-org');
      });

      it('should add Authorization header with token', async () => {
        const tokenManager = createMockTokenManager(mockTokens.standard);
        initializeMyOrganizationClient(mockAuthWithDomain, tokenManager);

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);

        await fetcher!(TEST_URL, mockRequestInits.post);

        const headers = getHeadersFromFetchCall(mockFetch) as Headers;
        expect(headers.get('Authorization')).toBe(`Bearer ${mockTokens.standard}`);
      });

      it('should add Content-Type header when body is present', async () => {
        const tokenManager = createMockTokenManager(mockTokens.standard);
        initializeMyOrganizationClient(mockAuthWithDomain, tokenManager);

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);

        await fetcher!(TEST_URL, mockRequestInits.post);

        const headers = getHeadersFromFetchCall(mockFetch) as Headers;
        expect(headers.get('Content-Type')).toBe('application/json');
      });

      it('should not add Authorization header when token is undefined', async () => {
        // Create a fresh mock that actually returns undefined
        const tokenManagerUndefined: ReturnType<typeof createTokenManager> = {
          getToken: vi.fn(async () => undefined),
        };
        initializeMyOrganizationClient(mockAuthWithDomain, tokenManagerUndefined);

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);

        await fetcher!(TEST_URL, mockRequestInits.post);

        const headers = getHeadersFromFetchCall(mockFetch) as Headers;
        expect(headers.get('Authorization')).toBeNull();
      });

      it('should not override existing Content-Type header', async () => {
        const tokenManager = createMockTokenManager(mockTokens.standard);
        initializeMyOrganizationClient(mockAuthWithDomain, tokenManager);

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);

        await fetcher!(TEST_URL, mockRequestInits.withContentType);

        const headers = getHeadersFromFetchCall(mockFetch) as Headers;
        expect(headers.get('Content-Type')).toBe('application/x-www-form-urlencoded');
      });

      it('should handle scope updates correctly', async () => {
        const tokenManager = createMockTokenManagerWithScopes(mockTokens.standard);
        const { setLatestScopes } = initializeMyOrganizationClient(
          mockAuthWithDomain,
          tokenManager,
        );

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);

        // First call with orgRead scope
        setLatestScopes(mockScopes.organizationRead);
        await fetcher!(TEST_URL, mockRequestInits.post);

        expect(tokenManager.lastScope).toBe(mockScopes.organizationRead);
        expect(tokenManager.lastAudiencePath).toBe('my-org');

        // Second call with complex scope
        setLatestScopes(mockScopes.complex);
        await fetcher!(TEST_URL, mockRequestInits.post);

        expect(tokenManager.lastScope).toBe(mockScopes.complex);
        expect(tokenManager.lastAudiencePath).toBe('my-org');
      });

      it('should use Headers object for headers', async () => {
        const tokenManager = createMockTokenManager(mockTokens.standard);
        initializeMyOrganizationClient(mockAuthWithDomain, tokenManager);

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);

        await fetcher!(TEST_URL, mockRequestInits.post);

        const headers = getHeadersFromFetchCall(mockFetch) as Record<string, string>;
        expect(headers).toBeInstanceOf(Headers);
      });

      it('should handle requests without init parameter', async () => {
        const tokenManager = createMockTokenManager(mockTokens.standard);
        initializeMyOrganizationClient(mockAuthWithDomain, tokenManager);

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);

        await fetcher!(TEST_URL);

        expect(mockFetch).toHaveBeenCalledTimes(1);
        expect(tokenManager.getToken).toHaveBeenCalledTimes(1);
      });

      it('should handle empty scope string', async () => {
        const tokenManager = createMockTokenManagerWithScopes(mockTokens.standard);
        initializeMyOrganizationClient(mockAuthWithDomain, tokenManager);

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);

        await fetcher!(TEST_URL, mockRequestInits.post);

        expect(tokenManager.lastScope).toBe('');
        expect(tokenManager.lastAudiencePath).toBe('my-org');
      });

      it('should not add Content-Type for GET requests without body', async () => {
        const tokenManager = createMockTokenManager(mockTokens.standard);
        initializeMyOrganizationClient(mockAuthWithDomain, tokenManager);

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);

        await fetcher!(TEST_URL, mockRequestInits.get);

        const headers = getHeadersFromFetchCall(mockFetch) as Headers;
        expect(headers.get('Content-Type')).toBeNull();
      });
    });

    describe('customFetch parameter in domain mode', () => {
      it('should use customFetch when provided', async () => {
        const tokenManager = createMockTokenManager(mockTokens.standard);
        const customFetch = vi.fn().mockResolvedValue(createMockFetch());

        initializeMyOrganizationClient(mockAuthWithDomain, tokenManager, customFetch);

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);
        await fetcher!(TEST_URL, mockRequestInits.post);

        expect(customFetch).toHaveBeenCalledTimes(1);
        expect(mockFetch).not.toHaveBeenCalled();
      });

      it('should pass url and init to customFetch', async () => {
        const tokenManager = createMockTokenManager();
        const customFetch = vi.fn().mockResolvedValue(createMockFetch());

        initializeMyOrganizationClient(mockAuthWithDomain, tokenManager, customFetch);

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);
        await fetcher!(TEST_URL, mockRequestInits.post);

        expect(customFetch).toHaveBeenCalledWith(TEST_URL, mockRequestInits.post);
      });

      it('should not call getToken when customFetch is provided', async () => {
        const tokenManager = createMockTokenManager();
        const customFetch = vi.fn().mockResolvedValue(createMockFetch());

        const { setLatestScopes } = initializeMyOrganizationClient(
          mockAuthWithDomain,
          tokenManager,
          customFetch,
        );

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);
        setLatestScopes(mockScopes.organizationRead);
        await fetcher!(TEST_URL, mockRequestInits.post);

        // tokenManager is not used when customFetch is provided
        expect(tokenManager.getToken).not.toHaveBeenCalled();
      });
    });
  });

  describe('priority and mode selection', () => {
    it('should prioritize proxy URL over domain when both are present', () => {
      const tokenManager = createMockTokenManager();
      initializeMyOrganizationClient(mockAuthWithBothDomainAndProxy, tokenManager);

      const calls = mockMyOrganizationClient.mock.calls;
      const config = calls[0]![0];
      expect(config.baseUrl).toBe('https://proxy.example.com/my-org');
      expect(config.domain).toBe('');
    });

    it('should use domain mode when only domain is provided', () => {
      const tokenManager = createMockTokenManager();
      initializeMyOrganizationClient(mockAuthWithDomain, tokenManager);

      const calls = mockMyOrganizationClient.mock.calls;
      const config = calls[0]![0];
      expect(config.domain).toBe('test.auth0.com');
      expect(config.baseUrl).toBeUndefined();
    });

    it('should use proxy mode when only proxy URL is provided', () => {
      const tokenManager = createMockTokenManager();
      initializeMyOrganizationClient(mockAuthWithProxyUrl, tokenManager);

      const calls = mockMyOrganizationClient.mock.calls;
      const config = calls[0]![0];
      expect(config.baseUrl).toBe('https://proxy.example.com/my-org');
      expect(config.domain).toBe('');
    });
  });

  describe('error handling', () => {
    it('should throw error when neither domain nor proxy URL is provided', () => {
      const tokenManager = createMockTokenManager();

      expect(() => {
        initializeMyOrganizationClient(mockAuthWithNeither, tokenManager);
      }).toThrow(expectedErrors.missingDomainOrProxy);
    });

    it('should throw error when domain is empty string', () => {
      const tokenManager = createMockTokenManager();

      expect(() => {
        initializeMyOrganizationClient(mockAuthWithEmptyDomain, tokenManager);
      }).toThrow(expectedErrors.missingDomainOrProxy);
    });

    it('should throw error when proxy URL is empty string', () => {
      const tokenManager = createMockTokenManager();

      expect(() => {
        initializeMyOrganizationClient(mockAuthWithEmptyProxyUrl, tokenManager);
      }).toThrow(expectedErrors.missingDomainOrProxy);
    });

    it('should handle token manager errors gracefully', async () => {
      const tokenManager = createMockTokenManagerWithError();
      initializeMyOrganizationClient(mockAuthWithDomain, tokenManager);

      const calls = mockMyOrganizationClient.mock.calls;
      const config = calls[0]![0];
      const fetcher = config.fetcher;

      await expect(fetcher(TEST_URL, mockRequestInits.post)).rejects.toThrow(
        expectedErrors.tokenManagerError,
      );
    });
  });

  describe('edge cases', () => {
    it('should handle very long scope strings', async () => {
      const tokenManager = createMockTokenManager();
      const { setLatestScopes } = initializeMyOrganizationClient(
        mockAuthWithProxyUrl,
        tokenManager,
      );

      const longScope = 'read:organization '.repeat(100).trim();
      const calls = mockMyOrganizationClient.mock.calls;
      const config = calls[0]![0];
      const fetcher = config.fetcher;

      setLatestScopes(longScope);
      await fetcher!(TEST_URL, mockRequestInits.post);

      const fetchCall = mockFetch.mock.calls[0]!;
      const headers = fetchCall[1]!.headers;
      expect(headers['auth0-scope']).toBe(longScope);
    });

    it('should handle very long tokens', async () => {
      const tokenManager = createMockTokenManager(mockTokens.long);
      initializeMyOrganizationClient(mockAuthWithDomain, tokenManager);

      const calls = mockMyOrganizationClient.mock.calls;
      const config = calls[0]![0];
      const fetcher = config.fetcher;

      await fetcher!(TEST_URL, mockRequestInits.post);

      const fetchCall = mockFetch.mock.calls[0]!;
      const headers = fetchCall[1]!.headers;
      expect(headers.get('Authorization')).toBe(`Bearer ${mockTokens.long}`);
    });

    it('should handle tokens with special characters', async () => {
      const tokenManager = createMockTokenManager(mockTokens.withSpecialChars);
      initializeMyOrganizationClient(mockAuthWithDomain, tokenManager);

      const calls = mockMyOrganizationClient.mock.calls;
      const config = calls[0]![0];
      const fetcher = config.fetcher;

      await fetcher!(TEST_URL, mockRequestInits.post);

      const fetchCall = mockFetch.mock.calls[0]!;
      const headers = fetchCall[1]!.headers;
      expect(headers.get('Authorization')).toBe(`Bearer ${mockTokens.withSpecialChars}`);
    });

    it('should handle multiple rapid scope changes', async () => {
      const tokenManager = createMockTokenManager();
      const { setLatestScopes } = initializeMyOrganizationClient(
        mockAuthWithProxyUrl,
        tokenManager,
      );

      const calls = mockMyOrganizationClient.mock.calls;
      const config = calls[0]![0];
      const fetcher = config.fetcher;

      for (let i = 0; i < 5; i++) {
        setLatestScopes(`scope${i}`);
        await fetcher!(TEST_URL, mockRequestInits.post);

        const fetchCall = mockFetch.mock.calls[i]!;
        const headers = fetchCall[1]!.headers;
        expect(headers['auth0-scope']).toBe(`scope${i}`);
      }
    });

    it('should handle Headers object in init.headers', async () => {
      const tokenManager = createMockTokenManager(mockTokens.standard);
      initializeMyOrganizationClient(mockAuthWithDomain, tokenManager);

      const calls = mockMyOrganizationClient.mock.calls;
      const config = calls[0]![0];
      const fetcher = config.fetcher;

      const headersObj = new Headers();
      headersObj.set('X-Custom', 'value');

      await fetcher!(TEST_URL, {
        method: 'POST',
        body: JSON.stringify({ test: 'data' }),
        headers: headersObj,
      });

      const fetchCall = mockFetch.mock.calls[0]!;
      const headers = fetchCall[1]!.headers;
      expect(headers.get('X-Custom')).toBe('value');
      expect(headers.get('Authorization')).toBe(`Bearer ${mockTokens.standard}`);
    });

    it('should handle array-based headers in init.headers for proxy mode', async () => {
      const tokenManager = createMockTokenManager();
      initializeMyOrganizationClient(mockAuthWithProxyUrl, tokenManager);

      const calls = mockMyOrganizationClient.mock.calls;
      const config = calls[0]![0];
      const fetcher = config.fetcher;

      // Note: The proxy mode implementation spreads init.headers directly
      // Array headers get spread as array indices, not header key-value pairs
      await fetcher!(TEST_URL, {
        method: 'POST',
        body: JSON.stringify({ test: 'data' }),
        headers: { 'X-Custom': 'value' } as HeadersInit,
      });

      const fetchCall = mockFetch.mock.calls[0]!;
      const headers = fetchCall[1]!.headers;
      expect(headers['X-Custom']).toBe('value');
    });

    it('should handle scope strings with leading/trailing whitespace', async () => {
      const tokenManager = createMockTokenManager();
      const { setLatestScopes } = initializeMyOrganizationClient(
        mockAuthWithProxyUrl,
        tokenManager,
      );

      const calls = mockMyOrganizationClient.mock.calls;
      const config = calls[0]![0];
      const fetcher = config.fetcher;

      setLatestScopes(mockScopes.withSpaces);
      await fetcher!(TEST_URL, mockRequestInits.post);

      const fetchCall = mockFetch.mock.calls[0]!;
      const headers = fetchCall[1]!.headers;
      expect(headers['auth0-scope']).toBe(mockScopes.withSpaces);
    });

    it('should handle PATCH requests with body', async () => {
      const tokenManager = createMockTokenManager(mockTokens.standard);
      initializeMyOrganizationClient(mockAuthWithDomain, tokenManager);

      const calls = mockMyOrganizationClient.mock.calls;
      const config = calls[0]![0];
      const fetcher = config.fetcher;

      await fetcher!(TEST_URL, mockRequestInits.patch);

      const fetchCall = mockFetch.mock.calls[0]!;
      const headers = fetchCall[1]!.headers;
      expect(headers.get('Content-Type')).toBe('application/json');
      expect(headers.get('Authorization')).toBe(`Bearer ${mockTokens.standard}`);
    });

    it('should handle undefined body', async () => {
      const tokenManager = createMockTokenManager();
      initializeMyOrganizationClient(mockAuthWithProxyUrl, tokenManager);

      const calls = mockMyOrganizationClient.mock.calls;
      const config = calls[0]![0];
      const fetcher = config.fetcher;

      await fetcher!(TEST_URL, {
        method: 'POST',
        body: undefined,
      });

      const fetchCall = mockFetch.mock.calls[0]!;
      const headers = fetchCall[1]!.headers;
      expect(headers['Content-Type']).toBeUndefined();
    });

    it('should handle null body', async () => {
      const tokenManager = createMockTokenManager();
      initializeMyOrganizationClient(mockAuthWithProxyUrl, tokenManager);

      const calls = mockMyOrganizationClient.mock.calls;
      const config = calls[0]![0];
      const fetcher = config.fetcher;

      await fetcher!(TEST_URL, {
        method: 'POST',
        body: null,
      });

      const fetchCall = mockFetch.mock.calls[0]!;
      const headers = fetchCall[1]!.headers;
      expect(headers['Content-Type']).toBeUndefined();
    });
  });

  describe('return value structure', () => {
    it('should return object with client and setLatestScopes', () => {
      const tokenManager = createMockTokenManager();
      const result = initializeMyOrganizationClient(mockAuthWithProxyUrl, tokenManager);

      expect(result).toHaveProperty('client');
      expect(result).toHaveProperty('setLatestScopes');
    });

    it('should return MyOrganizationClient instance as client', () => {
      const tokenManager = createMockTokenManager();
      const { client } = initializeMyOrganizationClient(mockAuthWithProxyUrl, tokenManager);

      expect(client).toBeInstanceOf(mockMyOrganizationClient);
    });

    it('should return function as setLatestScopes', () => {
      const tokenManager = createMockTokenManager();
      const { setLatestScopes } = initializeMyOrganizationClient(
        mockAuthWithProxyUrl,
        tokenManager,
      );

      expect(typeof setLatestScopes).toBe('function');
    });

    it('should have consistent return structure for proxy mode', () => {
      const tokenManager = createMockTokenManager();
      const result = initializeMyOrganizationClient(mockAuthWithProxyUrl, tokenManager);

      expect(Object.keys(result).sort()).toEqual(['client', 'setLatestScopes'].sort());
    });

    it('should have consistent return structure for domain mode', () => {
      const tokenManager = createMockTokenManager();
      const result = initializeMyOrganizationClient(mockAuthWithDomain, tokenManager);

      expect(Object.keys(result).sort()).toEqual(['client', 'setLatestScopes'].sort());
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete proxy mode workflow', async () => {
      const tokenManager = createMockTokenManager();
      const { client, setLatestScopes } = initializeMyOrganizationClient(
        mockAuthWithProxyUrl,
        tokenManager,
      );

      expect(client).toBeInstanceOf(mockMyOrganizationClient);

      const calls = mockMyOrganizationClient.mock.calls;
      const config = calls[0]![0];
      const fetcher = config.fetcher;

      setLatestScopes(mockScopes.organizationRead);
      await fetcher!(TEST_URL, mockRequestInits.post);

      expect(mockFetch).toHaveBeenCalled();
      const fetchCall = mockFetch.mock.calls[0]!;
      const headers = fetchCall[1]!.headers;
      expect(headers['auth0-scope']).toBe(mockScopes.organizationRead);
    });

    it('should handle complete domain mode workflow', async () => {
      const tokenManager = createMockTokenManagerWithScopes(mockTokens.standard);
      const { client, setLatestScopes } = initializeMyOrganizationClient(
        mockAuthWithDomain,
        tokenManager,
      );

      expect(client).toBeInstanceOf(mockMyOrganizationClient);

      const calls = mockMyOrganizationClient.mock.calls;
      const config = calls[0]![0];
      const fetcher = config.fetcher;

      setLatestScopes(mockScopes.complex);
      await fetcher!(TEST_URL, mockRequestInits.post);

      expect(tokenManager.getToken).toHaveBeenCalledWith(mockScopes.complex, 'my-org');
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should support multiple clients with different configurations', () => {
      const tokenManager1 = createMockTokenManager();
      const tokenManager2 = createMockTokenManager();

      const proxyClient = initializeMyOrganizationClient(mockAuthWithProxyUrl, tokenManager1);
      const domainClient = initializeMyOrganizationClient(mockAuthWithDomain, tokenManager2);

      expect(proxyClient.client).toBeInstanceOf(mockMyOrganizationClient);
      expect(domainClient.client).toBeInstanceOf(mockMyOrganizationClient);
      expect(mockMyOrganizationClient).toHaveBeenCalledTimes(2);
    });
  });
});
