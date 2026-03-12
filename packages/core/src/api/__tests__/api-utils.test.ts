import { describe, it, expect, vi, beforeEach } from 'vitest';

import { AuthUtils } from '../../auth/auth-utils';
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
    it('returns sdkConfig with empty domain and correct baseUrl', () => {
      const { sdkConfig } = buildServiceConfig(mockProxyConfig, 'my-org');
      expect(sdkConfig.domain).toBe('');
      expect(sdkConfig.baseUrl).toBe(`${mockProxyConfig.proxyUrl}/my-org`);
      expect(sdkConfig.telemetry).toBe(false);
    });

    it.each([
      { scopes: 'read:org', expected: 'read:org' },
      { scopes: '', expected: null },
    ])('sets auth0-scope to $expected when scopes is "$scopes"', async ({ scopes, expected }) => {
      const { authHeaders } = buildServiceConfig(mockProxyConfig, 'my-org');
      const headers = new Headers();
      await authHeaders(headers, scopes);
      expect(headers.get('auth0-scope')).toBe(expected);
    });
  });

  describe('spa mode', () => {
    const contextInterface = createMockContextInterface();
    const config = { mode: 'spa' as const, domain: TEST_DOMAIN, contextInterface };

    beforeEach(() => {
      vi.spyOn(AuthUtils, 'getToken').mockResolvedValue('mock-access-token');
    });

    it('returns sdkConfig with domain and no baseUrl', () => {
      const { sdkConfig } = buildServiceConfig(config, 'me');
      expect(sdkConfig.domain).toBe(TEST_DOMAIN);
      expect(sdkConfig.baseUrl).toBeUndefined();
      expect(sdkConfig.telemetry).toBe(false);
    });

    it('calls AuthUtils.getToken with correct arguments and sets Authorization Bearer header', async () => {
      const { authHeaders } = buildServiceConfig(config, 'my-org');
      const headers = new Headers();
      await authHeaders(headers, 'read:org write:org');
      expect(AuthUtils.getToken).toHaveBeenCalledWith(
        contextInterface,
        TEST_DOMAIN,
        'my-org',
        'read:org write:org',
      );
      expect(headers.get('Authorization')).toBe('Bearer mock-access-token');
    });
  });
});
