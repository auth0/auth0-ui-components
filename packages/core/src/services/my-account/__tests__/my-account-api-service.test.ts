import { MyAccountClient } from '@auth0/myaccount-js';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import type { createTokenManager } from '../../../auth/token-manager';
import { initializeMyAccountClient } from '../my-account-api-service';

import {
  mockAuthWithDomain,
  mockAuthWithProxyUrl,
  mockAuthWithProxyUrlTrailingSlash,
  mockAuthWithBothDomainAndProxy,
  mockAuthWithNeither,
  mockAuthWithDomainWhitespace,
  mockAuthWithProxyUrlWhitespace,
  createMockTokenManager,
  getExpectedProxyBaseUrl,
  mockScopes,
  mockTokens,
  expectedErrors,
} from './__mocks__/my-account-api-service.mocks';

// Store original fetch
const originalFetch = global.fetch;

// Mock MyAccountClient to capture constructor options
vi.mock('@auth0/myaccount-js', () => {
  return {
    MyAccountClient: vi.fn().mockImplementation((config) => {
      return {
        config,
        authenticationMethods: {
          list: vi.fn(),
        },
      };
    }),
  };
});

describe('initializeMyAccountClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  describe('proxy mode initialization', () => {
    describe('basic functionality', () => {
      it('should create MyAccountClient with proxy URL', () => {
        const tokenManager = createMockTokenManager();
        const result = initializeMyAccountClient(mockAuthWithProxyUrl, tokenManager);

        expect(result).toHaveProperty('client');
        expect(result).toHaveProperty('setLatestScopes');
        expect(MyAccountClient).toHaveBeenCalled();
      });

      it('should construct correct base URL from proxy URL', () => {
        const tokenManager = createMockTokenManager();
        initializeMyAccountClient(mockAuthWithProxyUrl, tokenManager);

        const calls = vi.mocked(MyAccountClient).mock.calls;
        const config = calls[0]![0];

        expect(config.baseUrl).toBe(getExpectedProxyBaseUrl(mockAuthWithProxyUrl.authProxyUrl!));
      });

      it('should remove trailing slash from proxy URL', () => {
        const tokenManager = createMockTokenManager();
        initializeMyAccountClient(mockAuthWithProxyUrlTrailingSlash, tokenManager);

        const calls = vi.mocked(MyAccountClient).mock.calls;
        const config = calls[0]![0];

        // Should not have double slashes
        expect(config.baseUrl).not.toContain('//me');
        expect(config.baseUrl).toContain('/me');
      });

      it('should set domain to empty string in proxy mode', () => {
        const tokenManager = createMockTokenManager();
        initializeMyAccountClient(mockAuthWithProxyUrl, tokenManager);

        const calls = vi.mocked(MyAccountClient).mock.calls;
        const config = calls[0]![0];

        expect(config.domain).toBe('');
      });

      it('should disable telemetry in proxy mode', () => {
        const tokenManager = createMockTokenManager();
        initializeMyAccountClient(mockAuthWithProxyUrl, tokenManager);

        const calls = vi.mocked(MyAccountClient).mock.calls;
        const config = calls[0]![0];

        expect(config.telemetry).toBe(false);
      });

      it('should provide custom fetcher in proxy mode', () => {
        const tokenManager = createMockTokenManager();
        initializeMyAccountClient(mockAuthWithProxyUrl, tokenManager);

        const calls = vi.mocked(MyAccountClient).mock.calls;
        const config = calls[0]![0];

        expect(config.fetcher).toBeDefined();
        expect(typeof config.fetcher).toBe('function');
      });
    });

    describe('setLatestScopes function', () => {
      it('should provide setLatestScopes function', () => {
        const tokenManager = createMockTokenManager();
        const result = initializeMyAccountClient(mockAuthWithProxyUrl, tokenManager);

        expect(result.setLatestScopes).toBeDefined();
        expect(typeof result.setLatestScopes).toBe('function');
      });

      it('should accept scope strings without throwing', () => {
        const tokenManager = createMockTokenManager();
        const result = initializeMyAccountClient(mockAuthWithProxyUrl, tokenManager);

        expect(() => result.setLatestScopes(mockScopes.mfa)).not.toThrow();
      });

      it('should handle empty scope string', () => {
        const tokenManager = createMockTokenManager();
        const result = initializeMyAccountClient(mockAuthWithProxyUrl, tokenManager);

        expect(() => result.setLatestScopes('')).not.toThrow();
      });

      it('should handle complex scope strings', () => {
        const tokenManager = createMockTokenManager();
        const result = initializeMyAccountClient(mockAuthWithProxyUrl, tokenManager);

        const complexScopes = `${mockScopes.mfa} ${mockScopes.profile} ${mockScopes.email}`;
        expect(() => result.setLatestScopes(complexScopes)).not.toThrow();
      });
    });

    describe('custom fetcher behavior in proxy mode', () => {
      it('should create fetcher that calls fetch', async () => {
        const mockFetch = vi.fn().mockResolvedValue({ ok: true });
        global.fetch = mockFetch;

        const tokenManager = createMockTokenManager();
        initializeMyAccountClient(mockAuthWithProxyUrl, tokenManager);

        const calls = vi.mocked(MyAccountClient).mock.calls;
        const config = calls[0]![0];
        const fetcher = config.fetcher;

        await fetcher!('https://test.com', {});

        expect(mockFetch).toHaveBeenCalled();
      });

      it('should add scope header when scopes are set', async () => {
        const mockFetch = vi.fn().mockResolvedValue({ ok: true });
        global.fetch = mockFetch;

        const tokenManager = createMockTokenManager();
        const result = initializeMyAccountClient(mockAuthWithProxyUrl, tokenManager);
        result.setLatestScopes(mockScopes.mfa);

        const calls = vi.mocked(MyAccountClient).mock.calls;
        const config = calls[0]![0];
        const fetcher = config.fetcher;

        await fetcher!('https://test.com', {});

        expect(mockFetch).toHaveBeenCalledWith(
          'https://test.com',
          expect.objectContaining({
            headers: expect.objectContaining({
              'auth0-scope': mockScopes.mfa,
            }),
          }),
        );
      });

      it('should add Content-Type header when body is present', async () => {
        const mockFetch = vi.fn().mockResolvedValue({ ok: true });
        global.fetch = mockFetch;

        const tokenManager = createMockTokenManager();
        initializeMyAccountClient(mockAuthWithProxyUrl, tokenManager);

        const calls = vi.mocked(MyAccountClient).mock.calls;
        const config = calls[0]![0];
        const fetcher = config.fetcher;

        await fetcher!('https://test.com', { body: JSON.stringify({ test: 'data' }) });

        expect(mockFetch).toHaveBeenCalledWith(
          'https://test.com',
          expect.objectContaining({
            headers: expect.objectContaining({
              'Content-Type': 'application/json',
            }),
          }),
        );
      });

      it('should not add scope header when scope is empty', async () => {
        const mockFetch = vi.fn().mockResolvedValue({ ok: true });
        global.fetch = mockFetch;

        const tokenManager = createMockTokenManager();
        const result = initializeMyAccountClient(mockAuthWithProxyUrl, tokenManager);
        result.setLatestScopes('');

        const calls = vi.mocked(MyAccountClient).mock.calls;
        const config = calls[0]![0];
        const fetcher = config.fetcher;

        await fetcher!('https://test.com', {});

        const fetchCall = mockFetch.mock.calls[0]!;
        const headers = fetchCall[1]!.headers as Record<string, string>;
        expect(headers['auth0-scope']).toBeUndefined();
      });

      it('should preserve existing headers', async () => {
        const mockFetch = vi.fn().mockResolvedValue({ ok: true });
        global.fetch = mockFetch;

        const tokenManager = createMockTokenManager();
        initializeMyAccountClient(mockAuthWithProxyUrl, tokenManager);

        const calls = vi.mocked(MyAccountClient).mock.calls;
        const config = calls[0]![0];
        const fetcher = config.fetcher;

        await fetcher!('https://test.com', {
          headers: {
            'X-Custom-Header': 'custom-value',
          },
        });

        expect(mockFetch).toHaveBeenCalledWith(
          'https://test.com',
          expect.objectContaining({
            headers: expect.objectContaining({
              'X-Custom-Header': 'custom-value',
            }),
          }),
        );
      });

      it('should update scope header when scopes change', async () => {
        const mockFetch = vi.fn().mockResolvedValue({ ok: true });
        global.fetch = mockFetch;

        const tokenManager = createMockTokenManager();
        const result = initializeMyAccountClient(mockAuthWithProxyUrl, tokenManager);

        const calls = vi.mocked(MyAccountClient).mock.calls;
        const config = calls[0]![0];
        const fetcher = config.fetcher;

        result.setLatestScopes(mockScopes.mfa);
        await fetcher!('https://test.com', {});

        result.setLatestScopes(mockScopes.profile);
        await fetcher!('https://test.com', {});

        expect(mockFetch).toHaveBeenNthCalledWith(
          1,
          'https://test.com',
          expect.objectContaining({
            headers: expect.objectContaining({
              'auth0-scope': mockScopes.mfa,
            }),
          }),
        );

        expect(mockFetch).toHaveBeenNthCalledWith(
          2,
          'https://test.com',
          expect.objectContaining({
            headers: expect.objectContaining({
              'auth0-scope': mockScopes.profile,
            }),
          }),
        );
      });
    });

    describe('URL handling', () => {
      it('should handle proxy URL with path', () => {
        const authWithPath = { authProxyUrl: 'https://example.com/api/v1' };
        const tokenManager = createMockTokenManager();
        initializeMyAccountClient(authWithPath, tokenManager);

        const calls = vi.mocked(MyAccountClient).mock.calls;
        const config = calls[0]![0];

        expect(config.baseUrl).toBe('https://example.com/api/v1/me');
      });

      it('should handle proxy URL with port', () => {
        const authWithPort = { authProxyUrl: 'https://example.com:8080' };
        const tokenManager = createMockTokenManager();
        initializeMyAccountClient(authWithPort, tokenManager);

        const calls = vi.mocked(MyAccountClient).mock.calls;
        const config = calls[0]![0];

        expect(config.baseUrl).toBe('https://example.com:8080/me');
      });

      it('should handle proxy URL with query parameters', () => {
        const authWithQuery = { authProxyUrl: 'https://example.com?param=value' };
        const tokenManager = createMockTokenManager();
        initializeMyAccountClient(authWithQuery, tokenManager);

        const calls = vi.mocked(MyAccountClient).mock.calls;
        const config = calls[0]![0];

        expect(config.baseUrl).toBe('https://example.com?param=value/me');
      });

      it('should trim whitespace from proxy URL', () => {
        const tokenManager = createMockTokenManager();
        initializeMyAccountClient(mockAuthWithProxyUrlWhitespace, tokenManager);

        const calls = vi.mocked(MyAccountClient).mock.calls;
        const config = calls[0]![0];

        expect(config.baseUrl).not.toMatch(/^\s/);
        expect(config.baseUrl).not.toMatch(/\s$/);
        expect(config.baseUrl).toContain('/me');
      });
    });
  });

  describe('domain mode initialization', () => {
    describe('basic functionality', () => {
      it('should create MyAccountClient with domain', () => {
        const tokenManager = createMockTokenManager();
        const result = initializeMyAccountClient(mockAuthWithDomain, tokenManager);

        expect(result).toHaveProperty('client');
        expect(result).toHaveProperty('setLatestScopes');
        expect(MyAccountClient).toHaveBeenCalled();
      });

      it('should trim whitespace from domain', () => {
        const tokenManager = createMockTokenManager();
        initializeMyAccountClient(mockAuthWithDomainWhitespace, tokenManager);

        const calls = vi.mocked(MyAccountClient).mock.calls;
        const config = calls[0]![0];

        expect(config.domain).not.toMatch(/^\s/);
        expect(config.domain).not.toMatch(/\s$/);
      });

      it('should not set baseUrl when using domain', () => {
        const tokenManager = createMockTokenManager();
        initializeMyAccountClient(mockAuthWithDomain, tokenManager);

        const calls = vi.mocked(MyAccountClient).mock.calls;
        const config = calls[0]![0];

        expect(config.baseUrl).toBeUndefined();
      });

      it('should provide custom fetcher in domain mode', () => {
        const tokenManager = createMockTokenManager();
        initializeMyAccountClient(mockAuthWithDomain, tokenManager);

        const calls = vi.mocked(MyAccountClient).mock.calls;
        const config = calls[0]![0];

        expect(config.fetcher).toBeDefined();
        expect(typeof config.fetcher).toBe('function');
      });
    });

    describe('setLatestScopes function', () => {
      it('should provide setLatestScopes function in domain mode', () => {
        const tokenManager = createMockTokenManager();
        const result = initializeMyAccountClient(mockAuthWithDomain, tokenManager);

        expect(result.setLatestScopes).toBeDefined();
        expect(typeof result.setLatestScopes).toBe('function');
      });

      it('should track scope changes in domain mode', () => {
        const tokenManager = createMockTokenManager();
        const result = initializeMyAccountClient(mockAuthWithDomain, tokenManager);

        expect(() => result.setLatestScopes(mockScopes.mfa)).not.toThrow();
        expect(() => result.setLatestScopes(mockScopes.profile)).not.toThrow();
      });
    });

    describe('custom fetcher behavior in domain mode', () => {
      it('should call tokenManager.getToken with scopes and audience', async () => {
        const mockFetch = vi.fn().mockResolvedValue({ ok: true });
        global.fetch = mockFetch;

        const tokenManager = createMockTokenManager();
        const result = initializeMyAccountClient(mockAuthWithDomain, tokenManager);
        result.setLatestScopes(mockScopes.mfa);

        const calls = vi.mocked(MyAccountClient).mock.calls;
        const config = calls[0]![0];
        const fetcher = config.fetcher;

        await fetcher!('https://test.com', {});

        expect(tokenManager.getToken).toHaveBeenCalledWith(mockScopes.mfa, 'me');
      });

      it('should add Authorization header with Bearer token', async () => {
        const mockFetch = vi.fn().mockResolvedValue({ ok: true });
        global.fetch = mockFetch;

        const tokenManager = createMockTokenManager('mock-access-token');
        initializeMyAccountClient(mockAuthWithDomain, tokenManager);

        const calls = vi.mocked(MyAccountClient).mock.calls;
        const config = calls[0]![0];
        const fetcher = config.fetcher;

        await fetcher!('https://test.com', {});

        const fetchCall = mockFetch.mock.calls[0]!;
        const headers = fetchCall[1]!.headers as Headers;
        expect(headers.get('Authorization')).toBe('Bearer mock-access-token');
      });

      it('should add Content-Type header when body is present', async () => {
        const mockFetch = vi.fn().mockResolvedValue({ ok: true });
        global.fetch = mockFetch;

        const tokenManager = createMockTokenManager();
        initializeMyAccountClient(mockAuthWithDomain, tokenManager);

        const calls = vi.mocked(MyAccountClient).mock.calls;
        const config = calls[0]![0];
        const fetcher = config.fetcher;

        await fetcher!('https://test.com', { body: JSON.stringify({ test: 'data' }) });

        const fetchCall = mockFetch.mock.calls[0]!;
        const headers = fetchCall[1]!.headers as Headers;
        expect(headers.get('Content-Type')).toBe('application/json');
      });

      it('should not override existing Content-Type header', async () => {
        const mockFetch = vi.fn().mockResolvedValue({ ok: true });
        global.fetch = mockFetch;

        const tokenManager = createMockTokenManager();
        initializeMyAccountClient(mockAuthWithDomain, tokenManager);

        const calls = vi.mocked(MyAccountClient).mock.calls;
        const config = calls[0]![0];
        const fetcher = config.fetcher;

        await fetcher!('https://test.com', {
          body: JSON.stringify({ test: 'data' }),
          headers: {
            'Content-Type': 'application/custom',
          },
        });

        const fetchCall = mockFetch.mock.calls[0]!;
        const headers = fetchCall[1]!.headers as Headers;
        expect(headers.get('Content-Type')).toBe('application/custom');
      });

      it('should handle undefined token', async () => {
        const mockFetch = vi.fn().mockResolvedValue({ ok: true });
        global.fetch = mockFetch;

        const tokenManager: ReturnType<typeof createTokenManager> = {
          getToken: vi.fn(async () => undefined),
        };
        initializeMyAccountClient(mockAuthWithDomain, tokenManager);

        const calls = vi.mocked(MyAccountClient).mock.calls;
        const config = calls[0]![0];
        const fetcher = config.fetcher;

        await expect(fetcher!('https://test.com', {})).resolves.toBeDefined();

        const fetchCall = mockFetch.mock.calls[0]!;
        const headers = fetchCall[1]!.headers as Headers;
        expect(headers.get('Authorization')).toBeNull();
      });

      it('should handle empty token', async () => {
        const mockFetch = vi.fn().mockResolvedValue({ ok: true });
        global.fetch = mockFetch;

        const tokenManager = createMockTokenManager('');
        initializeMyAccountClient(mockAuthWithDomain, tokenManager);

        const calls = vi.mocked(MyAccountClient).mock.calls;
        const config = calls[0]![0];
        const fetcher = config.fetcher;

        await fetcher!('https://test.com', {});

        const fetchCall = mockFetch.mock.calls[0]!;
        const headers = fetchCall[1]!.headers as Headers;
        expect(headers.get('Authorization')).toBeNull();
      });

      it('should use Headers object for header management', async () => {
        const mockFetch = vi.fn().mockResolvedValue({ ok: true });
        global.fetch = mockFetch;

        const tokenManager = createMockTokenManager();
        initializeMyAccountClient(mockAuthWithDomain, tokenManager);

        const calls = vi.mocked(MyAccountClient).mock.calls;
        const config = calls[0]![0];
        const fetcher = config.fetcher;

        await fetcher!('https://test.com', {});

        const fetchCall = mockFetch.mock.calls[0]!;
        expect(fetchCall[1]!.headers).toBeInstanceOf(Headers);
      });

      it('should preserve existing headers from init', async () => {
        const mockFetch = vi.fn().mockResolvedValue({ ok: true });
        global.fetch = mockFetch;

        const tokenManager = createMockTokenManager();
        initializeMyAccountClient(mockAuthWithDomain, tokenManager);

        const calls = vi.mocked(MyAccountClient).mock.calls;
        const config = calls[0]![0];
        const fetcher = config.fetcher;

        await fetcher!('https://test.com', {
          headers: {
            'X-Custom-Header': 'custom-value',
          },
        });

        const fetchCall = mockFetch.mock.calls[0]!;
        const headers = fetchCall[1]!.headers as Headers;
        expect(headers.get('X-Custom-Header')).toBe('custom-value');
      });

      it('should not add Content-Type for GET requests without body', async () => {
        const mockFetch = vi.fn().mockResolvedValue({ ok: true });
        global.fetch = mockFetch;

        const tokenManager = createMockTokenManager();
        initializeMyAccountClient(mockAuthWithDomain, tokenManager);

        const calls = vi.mocked(MyAccountClient).mock.calls;
        const config = calls[0]![0];
        const fetcher = config.fetcher;

        await fetcher!('https://test.com', { method: 'GET' });

        const fetchCall = mockFetch.mock.calls[0]!;
        const headers = fetchCall[1]!.headers as Headers;
        expect(headers.get('Content-Type')).toBeNull();
      });
    });

    describe('token retrieval', () => {
      it('should request token with latest scopes', async () => {
        const mockFetch = vi.fn().mockResolvedValue({ ok: true });
        global.fetch = mockFetch;

        const tokenManager = createMockTokenManager();
        const result = initializeMyAccountClient(mockAuthWithDomain, tokenManager);
        result.setLatestScopes(mockScopes.mfa);

        const calls = vi.mocked(MyAccountClient).mock.calls;
        const config = calls[0]![0];
        const fetcher = config.fetcher;

        await fetcher!('https://test.com', {});

        expect(tokenManager.getToken).toHaveBeenCalledWith(mockScopes.mfa, 'me');
      });

      it('should request token with "me" audience path', async () => {
        const mockFetch = vi.fn().mockResolvedValue({ ok: true });
        global.fetch = mockFetch;

        const tokenManager = createMockTokenManager();
        initializeMyAccountClient(mockAuthWithDomain, tokenManager);

        const calls = vi.mocked(MyAccountClient).mock.calls;
        const config = calls[0]![0];
        const fetcher = config.fetcher;

        await fetcher!('https://test.com', {});

        const getTokenCalls = vi.mocked(tokenManager.getToken).mock.calls;
        expect(getTokenCalls[0]![1]).toBe('me');
      });

      it('should handle very long tokens', async () => {
        const mockFetch = vi.fn().mockResolvedValue({ ok: true });
        global.fetch = mockFetch;

        const longToken = 'a'.repeat(2000);
        const tokenManager = createMockTokenManager(longToken);
        initializeMyAccountClient(mockAuthWithDomain, tokenManager);

        const calls = vi.mocked(MyAccountClient).mock.calls;
        const config = calls[0]![0];
        const fetcher = config.fetcher;

        await fetcher!('https://test.com', {});

        const fetchCall = mockFetch.mock.calls[0]!;
        const headers = fetchCall[1]!.headers as Headers;
        expect(headers.get('Authorization')).toBe(`Bearer ${longToken}`);
      });

      it('should handle tokens with special characters', async () => {
        const mockFetch = vi.fn().mockResolvedValue({ ok: true });
        global.fetch = mockFetch;

        const specialToken = 'token+with/special=chars';
        const tokenManager = createMockTokenManager(specialToken);
        initializeMyAccountClient(mockAuthWithDomain, tokenManager);

        const calls = vi.mocked(MyAccountClient).mock.calls;
        const config = calls[0]![0];
        const fetcher = config.fetcher;

        await fetcher!('https://test.com', {});

        const fetchCall = mockFetch.mock.calls[0]!;
        const headers = fetchCall[1]!.headers as Headers;
        expect(headers.get('Authorization')).toBe(`Bearer ${specialToken}`);
      });
    });
  });

  describe('priority and mode selection', () => {
    it('should prioritize proxy URL over domain when both are provided', () => {
      const tokenManager = createMockTokenManager();
      initializeMyAccountClient(mockAuthWithBothDomainAndProxy, tokenManager);

      const calls = vi.mocked(MyAccountClient).mock.calls;
      const config = calls[0]![0];

      // Proxy mode should be used (has baseUrl, domain is '')
      expect(config.baseUrl).toBeDefined();
      expect(config.domain).toBe('');
    });

    it('should use domain mode when only domain is provided', () => {
      const tokenManager = createMockTokenManager();
      initializeMyAccountClient(mockAuthWithDomain, tokenManager);

      const calls = vi.mocked(MyAccountClient).mock.calls;
      const config = calls[0]![0];

      expect(config.domain).toBe(mockAuthWithDomain.domain?.trim());
      expect(config.baseUrl).toBeUndefined();
    });

    it('should use proxy mode when only proxy URL is provided', () => {
      const tokenManager = createMockTokenManager();
      initializeMyAccountClient(mockAuthWithProxyUrl, tokenManager);

      const calls = vi.mocked(MyAccountClient).mock.calls;
      const config = calls[0]![0];

      expect(config.baseUrl).toBeDefined();
      expect(config.domain).toBe('');
    });
  });

  describe('error handling', () => {
    it('should throw error when neither domain nor proxy URL is provided', () => {
      const tokenManager = createMockTokenManager();

      expect(() => {
        initializeMyAccountClient(mockAuthWithNeither, tokenManager);
      }).toThrow(expectedErrors.missingDomainOrProxy);
    });

    it('should throw error when auth object is empty', () => {
      const tokenManager = createMockTokenManager();

      expect(() => {
        initializeMyAccountClient({}, tokenManager);
      }).toThrow();
    });

    it('should throw error when auth is null', () => {
      const tokenManager = createMockTokenManager();

      expect(() => {
        initializeMyAccountClient(null!, tokenManager);
      }).toThrow();
    });

    it('should throw error when auth is undefined', () => {
      const tokenManager = createMockTokenManager();

      expect(() => {
        initializeMyAccountClient(undefined!, tokenManager);
      }).toThrow();
    });
  });

  describe('edge cases', () => {
    describe('whitespace handling', () => {
      it('should handle domain with leading and trailing whitespace', () => {
        const tokenManager = createMockTokenManager();
        initializeMyAccountClient(mockAuthWithDomainWhitespace, tokenManager);

        const calls = vi.mocked(MyAccountClient).mock.calls;
        const config = calls[0]![0];

        expect(config.domain).toBe(mockAuthWithDomain.domain);
      });

      it('should handle proxy URL with leading and trailing whitespace', () => {
        const tokenManager = createMockTokenManager();
        initializeMyAccountClient(mockAuthWithProxyUrlWhitespace, tokenManager);

        const calls = vi.mocked(MyAccountClient).mock.calls;
        const config = calls[0]![0];

        // baseUrl should have whitespace only on the URL itself - trim() is only called on final baseUrl
        expect(config.baseUrl).toContain('/me');
      });

      it('should treat only-whitespace domain as empty string after trim', () => {
        const tokenManager = createMockTokenManager();
        const authWithWhitespace = { domain: '   ' };

        // This will create a MyAccountClient with empty string domain after trim()
        // which is allowed by MyAccountClient, so it should not throw
        const result = initializeMyAccountClient(authWithWhitespace, tokenManager);

        const calls = vi.mocked(MyAccountClient).mock.calls;
        const config = calls[0]![0];

        expect(result.client).toBeDefined();
        expect(config.domain).toBe('');
      });
    });

    describe('special characters in URLs', () => {
      it('should handle domain with special characters', () => {
        const tokenManager = createMockTokenManager();
        const authWithSpecialChars = { domain: 'my-domain.eu.auth0.com' };

        const result = initializeMyAccountClient(authWithSpecialChars, tokenManager);

        expect(result.client).toBeDefined();
      });

      it('should handle proxy URL with encoded characters', () => {
        const tokenManager = createMockTokenManager();
        const authWithEncoded = { authProxyUrl: 'https://example.com/path%20with%20spaces' };

        const result = initializeMyAccountClient(authWithEncoded, tokenManager);

        expect(result.client).toBeDefined();
      });

      it('should handle international domains', () => {
        const tokenManager = createMockTokenManager();
        const authWithIntl = { domain: 'münchen.auth0.com' };

        const result = initializeMyAccountClient(authWithIntl, tokenManager);

        expect(result.client).toBeDefined();
      });
    });

    describe('multiple consecutive calls', () => {
      it('should handle multiple scope updates', () => {
        const tokenManager = createMockTokenManager();
        const result = initializeMyAccountClient(mockAuthWithProxyUrl, tokenManager);

        expect(() => {
          result.setLatestScopes(mockScopes.mfa);
          result.setLatestScopes(mockScopes.profile);
          result.setLatestScopes(mockScopes.email);
          result.setLatestScopes('');
        }).not.toThrow();
      });

      it('should create independent instances on each call', () => {
        const tokenManager = createMockTokenManager();
        const result1 = initializeMyAccountClient(mockAuthWithProxyUrl, tokenManager);
        const result2 = initializeMyAccountClient(mockAuthWithProxyUrl, tokenManager);

        expect(result1.client).not.toBe(result2.client);
        expect(result1.setLatestScopes).not.toBe(result2.setLatestScopes);
      });
    });

    describe('concurrent operations', () => {
      it('should handle concurrent scope updates', () => {
        const tokenManager = createMockTokenManager();
        const result = initializeMyAccountClient(mockAuthWithProxyUrl, tokenManager);

        expect(() => {
          result.setLatestScopes(mockScopes.mfa);
          result.setLatestScopes(mockScopes.profile);
        }).not.toThrow();
      });

      it('should handle concurrent fetcher calls in proxy mode', async () => {
        const mockFetch = vi.fn().mockResolvedValue({ ok: true });
        global.fetch = mockFetch;

        const tokenManager = createMockTokenManager();
        const result = initializeMyAccountClient(mockAuthWithProxyUrl, tokenManager);
        result.setLatestScopes(mockScopes.mfa);

        const calls = vi.mocked(MyAccountClient).mock.calls;
        const config = calls[0]![0];
        const fetcher = config.fetcher;

        await Promise.all([
          fetcher!('https://test.com/1', {}),
          fetcher!('https://test.com/2', {}),
          fetcher!('https://test.com/3', {}),
        ]);

        expect(mockFetch).toHaveBeenCalledTimes(3);
      });

      it('should handle concurrent fetcher calls in domain mode', async () => {
        const mockFetch = vi.fn().mockResolvedValue({ ok: true });
        global.fetch = mockFetch;

        const tokenManager = createMockTokenManager();
        const result = initializeMyAccountClient(mockAuthWithDomain, tokenManager);
        result.setLatestScopes(mockScopes.mfa);

        const calls = vi.mocked(MyAccountClient).mock.calls;
        const config = calls[0]![0];
        const fetcher = config.fetcher;

        await Promise.all([
          fetcher!('https://test.com/1', {}),
          fetcher!('https://test.com/2', {}),
          fetcher!('https://test.com/3', {}),
        ]);

        expect(mockFetch).toHaveBeenCalledTimes(3);
        expect(tokenManager.getToken).toHaveBeenCalledTimes(3);
      });
    });
  });

  describe('return value structure', () => {
    it('should return object with client and setLatestScopes', () => {
      const tokenManager = createMockTokenManager();
      const result = initializeMyAccountClient(mockAuthWithProxyUrl, tokenManager);

      expect(result).toHaveProperty('client');
      expect(result).toHaveProperty('setLatestScopes');
      expect(Object.keys(result)).toHaveLength(2);
    });

    it('should have client as MyAccountClient instance', () => {
      const tokenManager = createMockTokenManager();
      const result = initializeMyAccountClient(mockAuthWithProxyUrl, tokenManager);

      expect(result.client).toBeDefined();
      expect(MyAccountClient).toHaveBeenCalled();
    });

    it('should have setLatestScopes as a function', () => {
      const tokenManager = createMockTokenManager();
      const result = initializeMyAccountClient(mockAuthWithProxyUrl, tokenManager);

      expect(typeof result.setLatestScopes).toBe('function');
    });

    it('should return new instances on each call', () => {
      const tokenManager = createMockTokenManager();
      const result1 = initializeMyAccountClient(mockAuthWithProxyUrl, tokenManager);
      const result2 = initializeMyAccountClient(mockAuthWithProxyUrl, tokenManager);

      expect(result1).not.toBe(result2);
      expect(result1.client).not.toBe(result2.client);
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete proxy mode workflow', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true });
      global.fetch = mockFetch;

      const tokenManager = createMockTokenManager();
      const result = initializeMyAccountClient(mockAuthWithProxyUrl, tokenManager);

      // Set scopes
      result.setLatestScopes(mockScopes.mfa);

      // Get the fetcher
      const calls = vi.mocked(MyAccountClient).mock.calls;
      const config = calls[0]![0];
      const fetcher = config.fetcher;

      // Make a request
      await fetcher!('https://test.com', { body: JSON.stringify({ test: 'data' }) });

      // Verify configuration
      expect(config.baseUrl).toBeDefined();
      expect(config.domain).toBe('');
      expect(config.telemetry).toBe(false);

      // Verify fetch was called correctly
      expect(mockFetch).toHaveBeenCalledWith(
        'https://test.com',
        expect.objectContaining({
          headers: expect.objectContaining({
            'auth0-scope': mockScopes.mfa,
            'Content-Type': 'application/json',
          }),
        }),
      );
    });

    it('should handle complete domain mode workflow', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true });
      global.fetch = mockFetch;

      const tokenManager = createMockTokenManager(mockTokens.standard);
      const result = initializeMyAccountClient(mockAuthWithDomain, tokenManager);

      // Set scopes
      result.setLatestScopes(mockScopes.mfa);

      // Get the fetcher
      const calls = vi.mocked(MyAccountClient).mock.calls;
      const config = calls[0]![0];
      const fetcher = config.fetcher;

      // Make a request
      await fetcher!('https://test.com', { body: JSON.stringify({ test: 'data' }) });

      // Verify configuration
      expect(config.domain).toBe(mockAuthWithDomain.domain);
      expect(config.baseUrl).toBeUndefined();

      // Verify token was requested
      expect(tokenManager.getToken).toHaveBeenCalledWith(mockScopes.mfa, 'me');

      // Verify fetch was called correctly
      const fetchCall = mockFetch.mock.calls[0]!;
      const headers = fetchCall[1]!.headers as Headers;
      expect(headers.get('Authorization')).toBe(`Bearer ${mockTokens.standard}`);
      expect(headers.get('Content-Type')).toBe('application/json');
    });

    it('should handle switching from empty scope to populated scope', async () => {
      const mockFetch = vi.fn().mockResolvedValue({ ok: true });
      global.fetch = mockFetch;

      const tokenManager = createMockTokenManager(mockTokens.standard);
      const result = initializeMyAccountClient(mockAuthWithDomain, tokenManager);

      const calls = vi.mocked(MyAccountClient).mock.calls;
      const config = calls[0]![0];
      const fetcher = config.fetcher;

      // Start with empty scope
      result.setLatestScopes('');
      await fetcher!('https://test.com', {});

      // Change to populated scope
      result.setLatestScopes(mockScopes.mfa);
      await fetcher!('https://test.com', {});

      // Verify both calls
      expect(tokenManager.getToken).toHaveBeenCalledTimes(2);
      expect(tokenManager.getToken).toHaveBeenNthCalledWith(1, '', 'me');
      expect(tokenManager.getToken).toHaveBeenNthCalledWith(2, mockScopes.mfa, 'me');
    });
  });
});
