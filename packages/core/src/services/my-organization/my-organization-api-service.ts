/**
 * My Organization API service initialization.
 * @module my-organization-api-service
 * @internal
 */

import { MyOrganizationClient } from '@auth0/myorganization-js';
import type { AuthDetails } from '@core/auth/auth-types';
import type { createSpaTokenRetriever } from '@core/auth/spa-token-retriever';

export interface MyOrganizationClientWithScopes extends MyOrganizationClient {
  withScopes: (scopes: string) => MyOrganizationClientWithScopes;
}

/**
 * Initializes the My Organization API client.
 * @param auth - Authentication configuration details.
 * @param tokenManagerService - Token retriever for obtaining access tokens.
 * @returns Initialized My Organization client with scope management.
 */
export function initializeMyOrganizationClient(
  auth: AuthDetails,
  tokenManagerService: ReturnType<typeof createSpaTokenRetriever>,
): MyOrganizationClientWithScopes {
  let latestScopes = '';

  if (auth.authProxyUrl) {
    const myOrganizationProxyPath = 'my-org';
    const myOrganizationProxyBaseUrl = `${auth.authProxyUrl.replace(/\/$/, '')}/${myOrganizationProxyPath}`;
    const fetcher = async (url: string, init?: RequestInit) => {
      return fetch(url, {
        ...init,
        headers: {
          ...init?.headers,
          ...(init?.body && { 'Content-Type': 'application/json' }),
          ...(latestScopes && { 'auth0-scope': latestScopes }),
        },
      });
    };
    const client = new MyOrganizationClient({
      domain: '',
      baseUrl: myOrganizationProxyBaseUrl.trim(),
      telemetry: false,
      fetcher,
    }) as MyOrganizationClientWithScopes;

    client.withScopes = (scopes: string) => {
      latestScopes = scopes;
      return client;
    };

    return client;
  }

  const domain = auth.domain ?? auth.contextInterface?.getConfiguration()?.domain;
  if (domain) {
    const fetcher = async (url: string, init?: RequestInit) => {
      const token = await tokenManagerService.getToken(latestScopes, 'my-org');

      const headers = new Headers(init?.headers);
      if (init?.body && !headers.has('Content-Type')) {
        headers.set('Content-Type', 'application/json');
      }
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }

      return fetch(url, {
        ...init,
        headers,
      });
    };

    const client = new MyOrganizationClient({
      domain: domain.trim(),
      fetcher,
    }) as MyOrganizationClientWithScopes;

    client.withScopes = (scopes: string) => {
      latestScopes = scopes;
      return client;
    };

    return client;
  }
  throw new Error('Missing domain or proxy URL for MyOrganizationClient');
}
