import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { SpaAuthConfig } from '../../auth/auth-types';
import {
  createMockContextInterface,
  TEST_DOMAIN,
} from '../../internals/__mocks__/shared/api-service.mocks';
import { AUTH0_SCOPE_HEADER, createProxyFetcher, createSpaFetcher } from '../api-utils';
import { ContentType, HeaderName } from '../http-constants';
import type { TelemetryConfig } from '../telemetry';

import { stubFetch } from './__mocks__/api-utils.mocks';

const defaultTelemetry: TelemetryConfig = {
  css: 'unknown',
  distribution: 'npm',
  framework: 'react',
  enabled: true,
};

const mockGetComponent = () => 'test-component';

describe('api-utils', () => {
  describe('createProxyFetcher', () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('sets content-type header to application/json', async () => {
      const mockFetch = stubFetch();
      const fetcher = createProxyFetcher({
        telemetry: defaultTelemetry,
        getComponent: mockGetComponent,
      });

      await fetcher('https://example.com/api', { method: 'POST' }, undefined);

      const [, requestInit] = mockFetch.mock.calls[0]!;
      expect((requestInit?.headers as Headers).get(HeaderName.ContentType)).toBe(ContentType.JSON);
    });

    it('sets auth0-scope header when scope array is provided', async () => {
      const mockFetch = stubFetch();
      const fetcher = createProxyFetcher({
        telemetry: defaultTelemetry,
        getComponent: mockGetComponent,
      });

      await fetcher(
        'https://example.com/api',
        { method: 'POST' },
        { scope: ['read:users', 'write:users'] },
      );

      const [url, requestInit] = mockFetch.mock.calls[0]!;
      expect(url).toBe('https://example.com/api');
      expect((requestInit?.headers as Headers).get(AUTH0_SCOPE_HEADER)).toBe(
        'read:users write:users',
      );
    });

    it('does not set auth0-scope header when scope array is empty', async () => {
      const mockFetch = stubFetch();
      const fetcher = createProxyFetcher({
        telemetry: defaultTelemetry,
        getComponent: mockGetComponent,
      });

      await fetcher('https://example.com/api', { method: 'GET' }, { scope: [] });

      const [, requestInit] = mockFetch.mock.calls[0]!;
      expect((requestInit?.headers as Headers).get(AUTH0_SCOPE_HEADER)).toBeNull();
    });

    it('does not set auth0-scope header when authParams is undefined', async () => {
      const mockFetch = stubFetch();
      const fetcher = createProxyFetcher({
        telemetry: defaultTelemetry,
        getComponent: mockGetComponent,
      });

      await fetcher('https://example.com/api', { method: 'GET' }, undefined);

      const [, requestInit] = mockFetch.mock.calls[0]!;
      expect((requestInit?.headers as Headers).get(AUTH0_SCOPE_HEADER)).toBeNull();
    });

    it('preserves existing headers from init', async () => {
      const mockFetch = stubFetch();
      const fetcher = createProxyFetcher({
        telemetry: defaultTelemetry,
        getComponent: mockGetComponent,
      });
      const customHeaders = new Headers({ 'X-Custom': 'value' });

      await fetcher(
        'https://example.com/api',
        { method: 'POST', headers: customHeaders },
        { scope: ['read:users'] },
      );

      const [, requestInit] = mockFetch.mock.calls[0]!;
      const headers = requestInit?.headers as Headers;
      expect(headers.get('X-Custom')).toBe('value');
      expect(headers.get(AUTH0_SCOPE_HEADER)).toBe('read:users');
    });

    it('preserves other init options', async () => {
      const mockFetch = stubFetch();
      const fetcher = createProxyFetcher({
        telemetry: defaultTelemetry,
        getComponent: mockGetComponent,
      });
      const body = JSON.stringify({ data: 'test' });

      await fetcher(
        'https://example.com/api',
        { method: 'PUT', body, credentials: 'include' },
        undefined,
      );

      const [, requestInit] = mockFetch.mock.calls[0]!;
      expect(requestInit?.method).toBe('PUT');
      expect(requestInit?.body).toBe(body);
      expect(requestInit?.credentials).toBe('include');
    });

    it('sets Auth0-Client telemetry header with proxy mode', async () => {
      const mockFetch = stubFetch();
      const fetcher = createProxyFetcher({
        telemetry: { css: 'tailwind', distribution: 'npm', framework: 'react', enabled: true },
        getComponent: () => 'user-mfa-management',
      });

      await fetcher('https://example.com/me/authentication-methods', { method: 'GET' }, undefined);

      const [, requestInit] = mockFetch.mock.calls[0]!;
      const header = (requestInit?.headers as Headers).get(HeaderName.Auth0Client);
      expect(header).toBeTruthy();

      const decoded = JSON.parse(atob(header!));
      expect(decoded.is_proxy_mode).toBe(true);
      expect(decoded.component).toBe('user-mfa-management');
      expect(decoded.name).toBe('universal-components');
      expect(decoded.css).toBe('tailwind');
      expect(decoded.distribution).toBe('npm');
      expect(decoded.framework).toBe('react');
    });

    it('uses component from getComponent callback', async () => {
      const mockFetch = stubFetch();
      const fetcher = createProxyFetcher({
        telemetry: { css: 'scoped', distribution: 'shadcn', framework: 'react', enabled: true },
        getComponent: () => 'organization-sso-configuration',
      });

      await fetcher('https://example.com/my-org/identity-providers', { method: 'GET' }, undefined);

      const [, requestInit] = mockFetch.mock.calls[0]!;
      const header = (requestInit?.headers as Headers).get(HeaderName.Auth0Client);
      const decoded = JSON.parse(atob(header!));
      expect(decoded.component).toBe('organization-sso-configuration');
      expect(decoded.css).toBe('scoped');
      expect(decoded.distribution).toBe('shadcn');
    });

    it('uses custom fetcher when provided', async () => {
      const customFetcher = vi.fn().mockResolvedValue(new Response());
      const fetcher = createProxyFetcher({
        customFetcher,
        telemetry: defaultTelemetry,
        getComponent: mockGetComponent,
      });

      await fetcher('https://example.com/api', { method: 'GET' }, undefined);

      expect(customFetcher).toHaveBeenCalledWith(
        'https://example.com/api',
        expect.objectContaining({ method: 'GET' }),
        undefined,
      );
    });

    it('does not set Auth0-Client header when telemetry is disabled', async () => {
      const mockFetch = stubFetch();
      const fetcher = createProxyFetcher({
        telemetry: { ...defaultTelemetry, enabled: false },
        getComponent: mockGetComponent,
      });

      await fetcher('https://example.com/api', { method: 'GET' }, undefined);

      const [, requestInit] = mockFetch.mock.calls[0]!;
      expect((requestInit?.headers as Headers).get(HeaderName.Auth0Client)).toBeNull();
    });
  });

  describe('createSpaFetcher', () => {
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

    it('calls createFetcher with correct dpopNonceId', () => {
      const config = createSpaConfig();
      const dpopNonceId = '__test_dpop_nonce__';

      createSpaFetcher(config, dpopNonceId, defaultTelemetry, mockGetComponent);

      expect(mockCreateFetcher).toHaveBeenCalledWith({ dpopNonceId });
    });

    it('sets Content-Type header to application/json', async () => {
      const config = createSpaConfig();
      const fetcher = createSpaFetcher(
        config,
        '__test_nonce__',
        defaultTelemetry,
        mockGetComponent,
      );

      await fetcher('https://example.com/api', { method: 'POST' }, undefined);

      const [, requestInit] = mockFetchWithAuth.mock.calls[0]!;
      expect((requestInit?.headers as Headers).get(HeaderName.ContentType)).toBe(ContentType.JSON);
    });

    it('preserves existing headers from init when adding Content-Type', async () => {
      const config = createSpaConfig();
      const fetcher = createSpaFetcher(
        config,
        '__test_nonce__',
        defaultTelemetry,
        mockGetComponent,
      );
      const customHeaders = new Headers({ 'X-Custom': 'value' });

      await fetcher(
        'https://example.com/api',
        { method: 'POST', headers: customHeaders },
        undefined,
      );

      const [, requestInit] = mockFetchWithAuth.mock.calls[0]!;
      const headers = requestInit?.headers as Headers;
      expect(headers.get('X-Custom')).toBe('value');
      expect(headers.get(HeaderName.ContentType)).toBe(ContentType.JSON);
    });

    it('preserves other init options when adding Content-Type header', async () => {
      const config = createSpaConfig();
      const fetcher = createSpaFetcher(
        config,
        '__test_nonce__',
        defaultTelemetry,
        mockGetComponent,
      );
      const body = JSON.stringify({ data: 'test' });

      await fetcher(
        'https://example.com/api',
        { method: 'PUT', body, credentials: 'include' },
        undefined,
      );

      const [, requestInit] = mockFetchWithAuth.mock.calls[0]!;
      expect(requestInit?.method).toBe('PUT');
      expect(requestInit?.body).toBe(body);
      expect(requestInit?.credentials).toBe('include');
      expect((requestInit?.headers as Headers).get(HeaderName.ContentType)).toBe(ContentType.JSON);
    });

    it('delegates to SDK fetchWithAuth with scope and audience', async () => {
      const config = createSpaConfig();
      const fetcher = createSpaFetcher(
        config,
        '__test_nonce__',
        defaultTelemetry,
        mockGetComponent,
      );

      await fetcher(
        'https://example.com/api',
        { method: 'POST', body: '{}' },
        { scope: ['read:org', 'write:org'], audience: 'https://tenant.auth0.com/api/' },
      );

      expect(mockFetchWithAuth).toHaveBeenCalledWith(
        'https://example.com/api',
        expect.objectContaining({ method: 'POST', body: '{}' }),
        { scope: ['read:org', 'write:org'], audience: 'https://tenant.auth0.com/api/' },
      );
    });

    it('handles undefined authParams', async () => {
      const config = createSpaConfig();
      const fetcher = createSpaFetcher(
        config,
        '__test_nonce__',
        defaultTelemetry,
        mockGetComponent,
      );

      await fetcher('https://example.com/api', { method: 'GET' }, undefined);

      expect(mockFetchWithAuth).toHaveBeenCalledWith(
        'https://example.com/api',
        expect.objectContaining({ method: 'GET' }),
        { scope: undefined, audience: undefined },
      );
    });

    it('handles empty scope array', async () => {
      const config = createSpaConfig();
      const fetcher = createSpaFetcher(
        config,
        '__test_nonce__',
        defaultTelemetry,
        mockGetComponent,
      );

      await fetcher('https://example.com/api', { method: 'GET' }, { scope: [] });

      expect(mockFetchWithAuth).toHaveBeenCalledWith(
        'https://example.com/api',
        expect.objectContaining({ method: 'GET' }),
        { scope: [], audience: undefined },
      );
    });

    it('handles undefined init parameter', async () => {
      const config = createSpaConfig();
      const fetcher = createSpaFetcher(
        config,
        '__test_nonce__',
        defaultTelemetry,
        mockGetComponent,
      );

      await fetcher('https://example.com/api', undefined, { scope: ['read:users'] });

      expect(mockFetchWithAuth).toHaveBeenCalledWith(
        'https://example.com/api',
        expect.objectContaining({ headers: expect.any(Headers) }),
        {
          scope: ['read:users'],
          audience: undefined,
        },
      );
    });

    it('sets Auth0-Client telemetry header with SPA mode', async () => {
      const config = createSpaConfig();
      const fetcher = createSpaFetcher(
        config,
        '__test_nonce__',
        { css: 'tailwind', distribution: 'npm', framework: 'react', enabled: true },
        () => 'user-mfa-management',
      );

      await fetcher('https://example.com/me/authentication-methods', { method: 'GET' }, undefined);

      const [, requestInit] = mockFetchWithAuth.mock.calls[0]!;
      const header = (requestInit?.headers as Headers).get(HeaderName.Auth0Client);
      expect(header).toBeTruthy();

      const decoded = JSON.parse(atob(header!));
      expect(decoded.is_proxy_mode).toBe(false);
      expect(decoded.component).toBe('user-mfa-management');
      expect(decoded.name).toBe('universal-components');
      expect(decoded.css).toBe('tailwind');
      expect(decoded.distribution).toBe('npm');
      expect(decoded.framework).toBe('react');
    });

    it('uses component from getComponent callback', async () => {
      const config = createSpaConfig();
      const fetcher = createSpaFetcher(
        config,
        '__test_nonce__',
        { css: 'scoped', distribution: 'shadcn', framework: 'react', enabled: true },
        () => 'organization-domain-management',
      );

      await fetcher('https://example.com/my-org/domains', { method: 'GET' }, undefined);

      const [, requestInit] = mockFetchWithAuth.mock.calls[0]!;
      const header = (requestInit?.headers as Headers).get(HeaderName.Auth0Client);
      const decoded = JSON.parse(atob(header!));
      expect(decoded.component).toBe('organization-domain-management');
      expect(decoded.css).toBe('scoped');
      expect(decoded.distribution).toBe('shadcn');
    });

    it('does not set Auth0-Client header when telemetry is disabled', async () => {
      const config = createSpaConfig();
      const fetcher = createSpaFetcher(
        config,
        '__test_nonce__',
        { ...defaultTelemetry, enabled: false },
        mockGetComponent,
      );

      await fetcher('https://example.com/api', { method: 'GET' }, undefined);

      const [, requestInit] = mockFetchWithAuth.mock.calls[0]!;
      expect((requestInit?.headers as Headers).get(HeaderName.Auth0Client)).toBeNull();
    });
  });
});
