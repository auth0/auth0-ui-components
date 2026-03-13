/**
 * Shared utilities for API service fetchers.
 * @module api-utils
 * @internal
 */

import type { ClientAuthConfig } from '../auth/auth-types';
import { AuthUtils } from '../auth/auth-utils';

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
 * Builds the SDK client config and auth header function for a service, resolved once at init time.
 * Proxy mode routes via baseUrl and injects an `auth0-scope` header.
 * SPA mode uses the domain directly and fetches a Bearer token.
 *
 * @param config - Auth configuration.
 * @param path - Service path used as proxy URL suffix and audience (e.g. 'me', 'my-org').
 * @returns SDK client config (without fetcher) and auth header function.
 */
export function buildServiceConfig(
  config: ClientAuthConfig,
  path: string,
): {
  sdkConfig: { domain: string; baseUrl?: string; telemetry: false };
  authHeaders: (headers: Headers, scopes: string) => Promise<void>;
} {
  if (config.mode === 'proxy') {
    return {
      sdkConfig: { domain: '', baseUrl: `${config.proxyUrl}/${path}`, telemetry: false },
      authHeaders: async (headers, scopes) => {
        if (scopes) headers.set('auth0-scope', scopes);
      },
    };
  }

  return {
    sdkConfig: { domain: config.domain, telemetry: false },
    authHeaders: async (headers, scopes) => {
      const token = await AuthUtils.getToken(config.contextInterface, config.domain, path, scopes);
      headers.set('Authorization', `Bearer ${token}`);
    },
  };
}
