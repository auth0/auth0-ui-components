/**
 * Shared utilities for API service fetchers.
 * @module api-utils
 * @internal
 */

import type { ClientAuthConfig } from '../auth/auth-types';

import type { ServiceFetcher } from './api-types';

/**
 * Builds a Headers object from an existing RequestInit, adding Content-Type
 * for requests with a body unless the caller already set one.
 *
 * @param init - Optional RequestInit to derive existing headers from.
 * @returns Headers with Content-Type set if applicable.
 */
export function buildBaseHeaders(init?: RequestInit): Headers {
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  return headers;
}

/**
 * Builds the SDK client config and fetcher for a service.
 *
 * @param config - Resolved auth configuration (proxy or SPA).
 * @param path - Service path — used as the proxy URL suffix and audience path (e.g. `'me'`, `'my-org'`).
 * @returns SDK client config and a fetcher function ready to be passed to the SDK constructor.
 */
export function buildServiceConfig(
  config: ClientAuthConfig,
  path: string,
): {
  sdkConfig: { domain: string; baseUrl?: string; telemetry: false };
  fetcherFn: ServiceFetcher;
} {
  if (config.mode === 'proxy') {
    return {
      sdkConfig: { domain: '', baseUrl: `${config.proxyUrl}/${path}`, telemetry: false },
      fetcherFn: async (url, init, authParams) => {
        const headers = buildBaseHeaders(init);
        const scopes = authParams?.scope?.join(' ');
        if (scopes) headers.set('auth0-scope', scopes);
        return fetch(url, { ...init, headers });
      },
    };
  }

  const sdkFetcher = config.contextInterface.createFetcher({ dpopNonceId: path });

  return {
    sdkConfig: { domain: config.domain, telemetry: false },
    fetcherFn: (url, init, authParams) => {
      const headers = buildBaseHeaders(init);
      return sdkFetcher.fetchWithAuth(url, { ...init, headers }, authParams);
    },
  };
}
