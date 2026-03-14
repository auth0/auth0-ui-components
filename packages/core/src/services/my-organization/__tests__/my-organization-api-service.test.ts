import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import {
  createMockFetch,
  getConfigFromMockCalls,
  getFetcherFromMockCalls,
  getHeadersFromFetchCall,
} from '../../../internals/__mocks__/shared/sdk-client.mocks';
import { initializeMyOrganizationClient } from '../my-organization-api-service';

import {
  createMockSpaConfig,
  mockProxyConfig,
  mockRequestInits,
} from './__mocks__/my-organization-api-service.mocks';

const TEST_URL = 'https://api.example.com/test';

// Hoist mock to avoid vi.mock hoisting issues
const mockMyOrganizationClient = vi.hoisted(() =>
  vi.fn().mockImplementation(() => ({
    organization: {},
    organizationDetails: {},
  })),
);

vi.mock('@auth0/myorganization-js', () => ({
  MyOrganizationClient: mockMyOrganizationClient,
}));

describe('initializeMyOrganizationClient', () => {
  let mockFetch: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockMyOrganizationClient.mockImplementation(() => ({
      organization: {},
      organizationDetails: {},
    }));
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

    describe('custom fetcher behavior in proxy mode', () => {
      it('should create fetcher that calls fetch', async () => {
        initializeMyOrganizationClient(mockProxyConfig);

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);
        await fetcher!(TEST_URL, mockRequestInits.get);

        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      it('should add Content-Type header when body is present', async () => {
        initializeMyOrganizationClient(mockProxyConfig);

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);
        await fetcher!(TEST_URL, mockRequestInits.post);

        const headers = getHeadersFromFetchCall(mockFetch) as Headers;
        expect(headers.get('Content-Type')).toBe('application/json');
      });

      it('should preserve existing headers', async () => {
        initializeMyOrganizationClient(mockProxyConfig);

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);
        await fetcher!(TEST_URL, mockRequestInits.postWithHeaders);

        const headers = getHeadersFromFetchCall(mockFetch) as Headers;
        expect(headers.get('X-Custom-Header')).toBe('custom-value');
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
    });

    describe('custom fetcher behavior in SPA mode', () => {
      it('should add Content-Type header when body is present', async () => {
        const auth = createMockSpaConfig();
        initializeMyOrganizationClient(auth);

        const fetcher = getFetcherFromMockCalls(mockMyOrganizationClient);
        await fetcher!(TEST_URL, mockRequestInits.post);

        const mockFetchWithAuth = vi.mocked(auth.contextInterface.createFetcher).mock.results[0]!
          .value.fetchWithAuth;
        const [, actualInit] = mockFetchWithAuth.mock.calls[0]!;
        expect((actualInit!.headers as Headers).get('Content-Type')).toBe('application/json');
      });
    });
  });

  describe('edge cases', () => {
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

      const mockFetchWithAuth = vi.mocked(auth.contextInterface.createFetcher).mock.results[0]!
        .value.fetchWithAuth;
      const [, actualInit] = mockFetchWithAuth.mock.calls[0]!;
      expect((actualInit!.headers as Headers).get('X-Custom')).toBe('value');
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

    it('should handle PATCH requests with body', async () => {
      const auth = createMockSpaConfig();
      initializeMyOrganizationClient(auth);

      const fetcher = mockMyOrganizationClient.mock.calls[0]![0].fetcher;
      await fetcher!(TEST_URL, mockRequestInits.patch);

      const mockFetchWithAuth = vi.mocked(auth.contextInterface.createFetcher).mock.results[0]!
        .value.fetchWithAuth;
      const [, actualInit] = mockFetchWithAuth.mock.calls[0]!;
      expect((actualInit!.headers as Headers).get('Content-Type')).toBe('application/json');
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
    it('should return object with organization and organizationDetails', () => {
      const result = initializeMyOrganizationClient(mockProxyConfig);

      expect(result).toHaveProperty('organization');
      expect(result).toHaveProperty('organizationDetails');
    });

    it('should return new top-level instances on each call', () => {
      const result1 = initializeMyOrganizationClient(mockProxyConfig);
      const result2 = initializeMyOrganizationClient(mockProxyConfig);

      expect(result1).not.toBe(result2);
      expect(mockMyOrganizationClient).toHaveBeenCalledTimes(2);
    });

    it('should have consistent return structure for proxy mode', () => {
      const result = initializeMyOrganizationClient(mockProxyConfig);

      expect(result).toHaveProperty('organization');
      expect(result).toHaveProperty('organizationDetails');
    });

    it('should have consistent return structure for SPA mode', () => {
      const result = initializeMyOrganizationClient(createMockSpaConfig());

      expect(result).toHaveProperty('organization');
      expect(result).toHaveProperty('organizationDetails');
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete proxy mode workflow', async () => {
      initializeMyOrganizationClient(mockProxyConfig);

      const fetcher = mockMyOrganizationClient.mock.calls[0]![0].fetcher;
      await fetcher!(TEST_URL, mockRequestInits.post);

      expect(mockFetch).toHaveBeenCalled();
      expect((mockFetch.mock.calls[0]![1]!.headers as Headers).get('Content-Type')).toBe(
        'application/json',
      );
    });

    it('should handle complete SPA mode workflow', async () => {
      const auth = createMockSpaConfig();
      initializeMyOrganizationClient(auth);

      const fetcher = mockMyOrganizationClient.mock.calls[0]![0].fetcher;
      await fetcher!(TEST_URL, mockRequestInits.post);

      const mockFetchWithAuth = vi.mocked(auth.contextInterface.createFetcher).mock.results[0]!
        .value.fetchWithAuth;
      expect(mockFetchWithAuth).toHaveBeenCalled();
    });

    it('should support multiple clients with different configurations', () => {
      const proxyService = initializeMyOrganizationClient(mockProxyConfig);
      const spaService = initializeMyOrganizationClient(createMockSpaConfig());

      expect(proxyService).toHaveProperty('organization');
      expect(spaService).toHaveProperty('organization');
      expect(mockMyOrganizationClient).toHaveBeenCalledTimes(2);
    });
  });
});
