/**
 * Shared client initialization helpers.
 * @module api-utils
 * @internal
 */

import type { FetcherAuthParams, FetcherSupplier, SpaAuthConfig } from '../auth/auth-types';

import { ContentType, HeaderName } from './http-constants';
import { buildTelemetryHeader, type TelemetryConfig } from './telemetry';

export const AUTH0_SCOPE_HEADER = HeaderName.Auth0Scope;
export const AUTH0_CLIENT_HEADER = 'Auth0-Client';

/**
 * Configuration for proxy mode fetcher with telemetry.
 */
export interface ProxyFetcherConfig {
  customFetcher?: (
    url: string,
    init?: RequestInit,
    authParams?: FetcherAuthParams,
  ) => Promise<Response>;
  telemetry: TelemetryConfig;
}

/**
 * Creates a fetcher function for proxy mode that injects scopes via auth0-scope header.
 * The proxy will extract scopes from the header and request the appropriate token.
 * Also adds telemetry header with component info derived from the URL.
 * @param config - Fetcher configuration with optional custom fetcher and telemetry config
 * @returns Fetcher function that sets auth0-scope, content-type, and telemetry headers
 * @internal
 */
export function createProxyFetcher(config: ProxyFetcherConfig): FetcherSupplier {
  const fetchFn = config.customFetcher ?? fetch;
  return async (url, init, authParams) => {
    const headers = new Headers(init?.headers);
    headers.set(HeaderName.ContentType, ContentType.JSON);
    if (authParams?.scope?.length) {
      headers.set(HeaderName.Auth0Scope, authParams.scope.join(' '));
    }
    headers.set(
      AUTH0_CLIENT_HEADER,
      buildTelemetryHeader(url, { isProxyMode: true, ...config.telemetry }),
    );
    if (fetchFn) {
      return fetchFn(url, { ...init, headers }, authParams);
    }
    return fetch(url, { ...init, headers });
  };
}

/**
 * Creates a fetcher function for SPA mode using Auth0 SDK's createFetcher.
 * Also adds telemetry header with component info derived from the URL.
 * @param config - SPA auth configuration with context interface
 * @param dpopNonceId - Unique identifier for DPoP nonce management
 * @param telemetry - Telemetry configuration
 * @returns Fetcher function that delegates to SDK's fetchWithAuth with JSON content-type and telemetry
 * @internal
 */
export function createSpaFetcher(
  config: SpaAuthConfig,
  dpopNonceId: string,
  telemetry: TelemetryConfig,
): FetcherSupplier {
  const sdkFetcher = config.contextInterface.createFetcher({ dpopNonceId });
  return (url, init, authParams) => {
    const headers = new Headers(init?.headers);
    headers.set(HeaderName.ContentType, ContentType.JSON);
    headers.set(
      AUTH0_CLIENT_HEADER,
      buildTelemetryHeader(url, { isProxyMode: false, ...telemetry }),
    );
    return sdkFetcher.fetchWithAuth(
      url,
      { ...init, headers },
      {
        scope: authParams?.scope,
        audience: authParams?.audience,
      },
    );
  };
}
