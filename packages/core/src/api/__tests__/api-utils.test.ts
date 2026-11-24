import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { SpaAuthConfig } from '../../auth/auth-types';
import {
  createMockContextInterface,
  TEST_DOMAIN,
} from '../../internals/__mocks__/shared/api-service.mocks';
import { mfaStepUpStore } from '../../services/mfa-step-up/mfa-step-up-store';
import {
  AUTH0_SCOPE_HEADER,
  createProxyFetcher,
  createSpaFetcher,
  withMfaStepUp,
} from '../api-utils';
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
  describe('passing MFA when a request needs it', () => {
    const mfaRequired = () =>
      Response.json({ error: 'mfa_required', mfa_token: 'tok' }, { status: 403 });
    let stopAnswering: (() => void) | undefined;

    afterEach(() => {
      stopAnswering?.();
      vi.unstubAllGlobals();
    });

    const answerStepUp = (act: 'complete' | 'cancel') => {
      stopAnswering = mfaStepUpStore.subscribe(() => {
        const request = mfaStepUpStore.getSnapshot();
        if (request) queueMicrotask(() => request[act]());
      });
    };

    it('sends the request again once the user passed MFA (proxy)', async () => {
      const ok = Response.json({ ok: true });
      const mockFetch = vi.fn().mockResolvedValueOnce(mfaRequired()).mockResolvedValueOnce(ok);
      vi.stubGlobal('fetch', mockFetch);
      answerStepUp('complete');
      const fetcher = createProxyFetcher({
        telemetry: defaultTelemetry,
        getComponent: mockGetComponent,
      });

      await expect(fetcher('https://example.com/api', { method: 'GET' })).resolves.toBe(ok);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('does not send the request again when the user cancels (proxy)', async () => {
      const mockFetch = vi.fn().mockResolvedValue(mfaRequired());
      vi.stubGlobal('fetch', mockFetch);
      answerStepUp('cancel');
      const fetcher = createProxyFetcher({
        telemetry: defaultTelemetry,
        getComponent: mockGetComponent,
      });

      await expect(fetcher('https://example.com/api')).rejects.toMatchObject({ code: 'cancelled' });
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    it('returns another 403 untouched (proxy)', async () => {
      const forbidden = Response.json({ error: 'forbidden' }, { status: 403 });
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(forbidden));
      const fetcher = createProxyFetcher({
        telemetry: defaultTelemetry,
        getComponent: mockGetComponent,
      });

      await expect(fetcher('https://example.com/api')).resolves.toBe(forbidden);
    });

    it('sends the request again when the SDK throws mfa_required (SPA)', async () => {
      const contextInterface = createMockContextInterface();
      const fetchWithAuth = vi
        .fn()
        .mockRejectedValueOnce({ error: 'mfa_required', mfa_token: 'tok' })
        .mockResolvedValueOnce('ok');
      contextInterface.createFetcher = vi.fn(() => ({ fetchWithAuth })) as never;
      answerStepUp('complete');
      const fetcher = createSpaFetcher(
        { contextInterface } as unknown as SpaAuthConfig,
        'nonce',
        defaultTelemetry,
        mockGetComponent,
      );

      await expect(fetcher('https://example.com/api')).resolves.toBe('ok');
      expect(fetchWithAuth).toHaveBeenCalledTimes(2);
    });
  });

  describe('createProxyFetcher', () => {
    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('sets content-type header to application/json when body is present', async () => {
      const mockFetch = stubFetch();
      const fetcher = createProxyFetcher({
        telemetry: defaultTelemetry,
        getComponent: mockGetComponent,
      });

      await fetcher('https://example.com/api', { method: 'POST', body: '{}' }, undefined);

      const [, requestInit] = mockFetch.mock.calls[0]!;
      expect((requestInit?.headers as Headers).get(HeaderName.ContentType)).toBe(ContentType.JSON);
    });

    it('does not set content-type header when there is no body', async () => {
      const mockFetch = stubFetch();
      const fetcher = createProxyFetcher({
        telemetry: defaultTelemetry,
        getComponent: mockGetComponent,
      });

      await fetcher('https://example.com/api', { method: 'GET' }, undefined);

      const [, requestInit] = mockFetch.mock.calls[0]!;
      expect((requestInit?.headers as Headers).get(HeaderName.ContentType)).toBeNull();
    });

    it('does not set content-type header for DELETE without body', async () => {
      const mockFetch = stubFetch();
      const fetcher = createProxyFetcher({
        telemetry: defaultTelemetry,
        getComponent: mockGetComponent,
      });

      await fetcher('https://example.com/api/resource/1', { method: 'DELETE' }, undefined);

      const [, requestInit] = mockFetch.mock.calls[0]!;
      expect((requestInit?.headers as Headers).get(HeaderName.ContentType)).toBeNull();
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

    it('sets Content-Type header to application/json when body is present', async () => {
      const config = createSpaConfig();
      const fetcher = createSpaFetcher(
        config,
        '__test_nonce__',
        defaultTelemetry,
        mockGetComponent,
      );

      await fetcher('https://example.com/api', { method: 'POST', body: '{}' }, undefined);

      const [, requestInit] = mockFetchWithAuth.mock.calls[0]!;
      expect((requestInit?.headers as Headers).get(HeaderName.ContentType)).toBe(ContentType.JSON);
    });

    it('does not set Content-Type header when there is no body', async () => {
      const config = createSpaConfig();
      const fetcher = createSpaFetcher(
        config,
        '__test_nonce__',
        defaultTelemetry,
        mockGetComponent,
      );

      await fetcher('https://example.com/api', { method: 'GET' }, undefined);

      const [, requestInit] = mockFetchWithAuth.mock.calls[0]!;
      expect((requestInit?.headers as Headers).get(HeaderName.ContentType)).toBeNull();
    });

    it('does not set Content-Type header for DELETE without body', async () => {
      const config = createSpaConfig();
      const fetcher = createSpaFetcher(
        config,
        '__test_nonce__',
        defaultTelemetry,
        mockGetComponent,
      );

      await fetcher('https://example.com/api/resource/1', { method: 'DELETE' }, undefined);

      const [, requestInit] = mockFetchWithAuth.mock.calls[0]!;
      expect((requestInit?.headers as Headers).get(HeaderName.ContentType)).toBeNull();
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
        { method: 'POST', headers: customHeaders, body: '{}' },
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

const mfaRequired = { error: 'mfa_required', mfa_token: 'tok' };

// Plays the dialog: answers every step-up that opens.
const answerWith = (act: 'complete' | 'cancel') =>
  mfaStepUpStore.subscribe(() => {
    const request = mfaStepUpStore.getSnapshot();
    if (request) queueMicrotask(() => request[act]());
  });

describe('withMfaStepUp', () => {
  let stopAnswering: (() => void) | undefined;
  afterEach(() => stopAnswering?.());

  it('returns what the call returns, without opening anything', async () => {
    const call = vi.fn(async () => 'fine');

    await expect(withMfaStepUp(call)).resolves.toBe('fine');
    expect(call).toHaveBeenCalledTimes(1);
    expect(mfaStepUpStore.getSnapshot()).toBeUndefined();
  });

  it.each([
    ['a plain error', new Error('network')],
    ['an axios error that is not MFA', { response: { data: { error: 'forbidden' } } }],
  ])('rethrows %s', async (_name, error) => {
    await expect(
      withMfaStepUp(async () => {
        throw error;
      }),
    ).rejects.toBe(error);
  });

  it.each([
    ['a thrown error', mfaRequired],
    ['an axios error', { response: { status: 403, data: mfaRequired } }],
  ])('after %s: asks for MFA, then runs the call again', async (_name, error) => {
    stopAnswering = answerWith('complete');
    const call = vi.fn().mockRejectedValueOnce(error).mockResolvedValueOnce('done');

    await expect(withMfaStepUp(call)).resolves.toBe('done');
  });

  it('gives the dialog the error that opened it', async () => {
    const seen: unknown[] = [];
    stopAnswering = mfaStepUpStore.subscribe(() => {
      const request = mfaStepUpStore.getSnapshot();
      if (request) {
        seen.push(request.error);
        queueMicrotask(request.complete);
      }
    });

    await withMfaStepUp(vi.fn().mockRejectedValueOnce(mfaRequired).mockResolvedValue('x'));

    expect(seen[0]).toMatchObject({ error: 'mfa_required', mfa_token: 'tok' });
  });

  it('fails with a cancelled error, and does not run the call again, when the user cancels', async () => {
    stopAnswering = answerWith('cancel');
    const call = vi.fn().mockRejectedValue(mfaRequired);

    await expect(withMfaStepUp(call)).rejects.toMatchObject({ code: 'cancelled' });
    expect(call).toHaveBeenCalledTimes(1);
  });

  it('shares one dialog between calls that fail together, and runs each again', async () => {
    let opened = 0;
    stopAnswering = mfaStepUpStore.subscribe(() => {
      const request = mfaStepUpStore.getSnapshot();
      if (request) {
        opened += 1;
        setTimeout(request.complete, 5);
      }
    });
    const make = () => vi.fn().mockRejectedValueOnce(mfaRequired).mockResolvedValue('ok');
    const [a, b] = [make(), make()];

    const results = await Promise.all([withMfaStepUp(a), withMfaStepUp(b)]);

    expect(results).toEqual(['ok', 'ok']);
    expect(opened).toBe(1);
  });

  it('asks again each time the server wants MFA again, until the call succeeds', async () => {
    stopAnswering = answerWith('complete');
    const call = vi
      .fn()
      .mockRejectedValueOnce(mfaRequired)
      .mockRejectedValueOnce(mfaRequired)
      .mockResolvedValue('ok');

    await expect(withMfaStepUp(call)).resolves.toBe('ok');
    expect(call).toHaveBeenCalledTimes(3);
  });
});
