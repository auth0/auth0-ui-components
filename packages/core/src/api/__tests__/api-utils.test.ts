import { describe, it, expect, vi, beforeEach, afterEach, type Mock } from 'vitest';

import {
  TEST_DOMAIN,
  createMockContextInterface,
  mockProxyConfig,
} from '../../internals/__mocks__/shared/api-service.mocks';
import { buildBaseHeaders, buildServiceConfig } from '../api-utils';

describe('buildBaseHeaders', () => {
  it('returns empty Headers when called with no arguments', () => {
    const headers = buildBaseHeaders();
    expect(headers.has('Content-Type')).toBe(false);
  });

  it('does not set Content-Type when init has no body', () => {
    const headers = buildBaseHeaders({ method: 'GET' });
    expect(headers.has('Content-Type')).toBe(false);
  });

  it('sets Content-Type to application/json when init has a body', () => {
    const headers = buildBaseHeaders({ body: JSON.stringify({ key: 'value' }) });
    expect(headers.get('Content-Type')).toBe('application/json');
  });

  it('does not override Content-Type when caller already set one', () => {
    const headers = buildBaseHeaders({
      body: JSON.stringify({}),
      headers: { 'Content-Type': 'text/plain' },
    });
    expect(headers.get('Content-Type')).toBe('text/plain');
  });

  it('preserves existing headers from init', () => {
    const headers = buildBaseHeaders({
      headers: { 'X-Custom': 'value' },
    });
    expect(headers.get('X-Custom')).toBe('value');
  });

  it('preserves existing headers and adds Content-Type when body is present', () => {
    const headers = buildBaseHeaders({
      body: '{}',
      headers: { 'X-Request-Id': 'abc123' },
    });
    expect(headers.get('Content-Type')).toBe('application/json');
    expect(headers.get('X-Request-Id')).toBe('abc123');
  });
});

describe('buildServiceConfig', () => {
  describe('proxy mode', () => {
    const mockFetch = vi.fn();

    beforeEach(() => {
      mockFetch.mockResolvedValue(new Response());
      vi.stubGlobal('fetch', mockFetch);
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('returns sdkConfig with empty domain and correct baseUrl', () => {
      const { sdkConfig } = buildServiceConfig(mockProxyConfig, 'my-org');
      expect(sdkConfig.domain).toBe('');
      expect(sdkConfig.baseUrl).toBe(`${mockProxyConfig.proxyUrl}/my-org`);
      expect(sdkConfig.telemetry).toBe(false);
    });

    it.each([
      { scope: ['read:org'], expected: 'read:org' },
      { scope: [], expected: null },
    ])('sets auth0-scope to $expected when scope is $scope', async ({ scope, expected }) => {
      const { fetcherFn } = buildServiceConfig(mockProxyConfig, 'my-org');
      await fetcherFn('https://example.com', undefined, { scope });
      const [, fetchInit] = mockFetch.mock.calls[0] as [string, RequestInit];
      expect((fetchInit.headers as Headers).get('auth0-scope')).toBe(expected);
    });
  });

  describe('spa mode', () => {
    let contextInterface: ReturnType<typeof createMockContextInterface>;
    let mockFetchWithAuth: Mock;

    beforeEach(() => {
      contextInterface = createMockContextInterface();
      mockFetchWithAuth = vi.fn().mockResolvedValue(new Response());
      (contextInterface.createFetcher as Mock).mockReturnValue({
        fetchWithAuth: mockFetchWithAuth,
      });
    });

    it('returns sdkConfig with domain and no baseUrl', () => {
      const config = { mode: 'spa' as const, domain: TEST_DOMAIN, contextInterface };
      const { sdkConfig } = buildServiceConfig(config, 'me');
      expect(sdkConfig.domain).toBe(TEST_DOMAIN);
      expect(sdkConfig.baseUrl).toBeUndefined();
      expect(sdkConfig.telemetry).toBe(false);
    });

    it('calls fetchWithAuth with url, init, and authParams', async () => {
      const config = { mode: 'spa' as const, domain: TEST_DOMAIN, contextInterface };
      const { fetcherFn } = buildServiceConfig(config, 'me');
      const authParams = { scope: ['read:me'], audience: `https://${TEST_DOMAIN}/me/` };
      await fetcherFn('https://example.com/path', { method: 'POST', body: '{}' }, authParams);
      expect(mockFetchWithAuth).toHaveBeenCalledWith(
        'https://example.com/path',
        expect.objectContaining({ method: 'POST', headers: expect.any(Headers) }),
        authParams,
      );
    });
  });
});
