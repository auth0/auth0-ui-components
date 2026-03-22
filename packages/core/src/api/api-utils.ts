/**
 * Shared client initialization helpers.
 * @module api-utils
 * @internal
 */

import type { FetcherSupplier, SpaAuthConfig } from '../auth/auth-types';

import { ContentType, HeaderName } from './http-constants';

export const AUTH0_SCOPE_HEADER = HeaderName.Auth0Scope;

/**
 * Creates a fetcher function for proxy mode that injects scopes via auth0-scope header.
 * The proxy will extract scopes from the header and request the appropriate token.
 * @returns Fetcher function that sets auth0-scope and content-type headers
 * @internal
 */
export function createProxyFetcher(): FetcherSupplier {
  return async (url, init, authParams) => {
    const headers = new Headers(init?.headers);
    headers.set(HeaderName.ContentType, ContentType.JSON);
    if (authParams?.scope?.length) {
      headers.set(HeaderName.Auth0Scope, authParams.scope.join(' '));
    }
    return fetch(url, { ...init, headers });
  };
}

/**
 * Creates a fetcher function for SPA mode using Auth0 SDK's createFetcher.
 * @param config - SPA auth configuration with context interface
 * @param dpopNonceId - Unique identifier for DPoP nonce management
 * @returns Fetcher function that delegates to SDK's fetchWithAuth with JSON content-type
 * @internal
 */
export function createSpaFetcher(config: SpaAuthConfig, dpopNonceId: string): FetcherSupplier {
  const sdkFetcher = config.contextInterface.createFetcher({ dpopNonceId });
  return (url, init, authParams) => {
    const headers = new Headers(init?.headers);
    headers.set(HeaderName.ContentType, ContentType.JSON);
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
