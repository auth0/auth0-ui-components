/**
 * My Account API service initialization.
 * @module my-account-api-service
 * @internal
 */

import { MyAccountClient } from '@auth0/myaccount-js';

import type { AuthDetails } from '../../auth/auth-types';
import type { createSpaTokenRetriever } from '../../auth/spa-token-retriever';

export interface MyAccountClientWithScopes extends MyAccountClient {
  withScopes: (scopes: string) => MyAccountClientWithScopes;
}

/**
 * Initializes the My Account API client.
 * @param auth - Authentication configuration details.
 * @param tokenManagerService - Token retriever for obtaining access tokens.
 * @returns Initialized My Account client with scope management.
 */
export function initializeMyAccountClient(
  auth: AuthDetails,
  tokenManagerService: ReturnType<typeof createSpaTokenRetriever>,
): MyAccountClientWithScopes {
  let latestScopes = '';

  if (auth.authProxyUrl) {
    const myAccountProxyPath = 'me';
    const myAccountBaseUrl = `${auth.authProxyUrl.replace(/\/$/, '')}/${myAccountProxyPath}`;
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
    const client = new MyAccountClient({
      domain: '',
      baseUrl: myAccountBaseUrl.trim(),
      telemetry: false,
      fetcher,
    }) as MyAccountClientWithScopes;

    client.withScopes = (scopes: string) => {
      latestScopes = scopes;
      return client;
    };

    return client;
  }

  const domain = auth.domain ?? auth.contextInterface?.getConfiguration()?.domain;
  if (domain) {
    const fetcher = async (url: string, init?: RequestInit) => {
      const token = await tokenManagerService.getToken(latestScopes, 'me');

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

    const client = new MyAccountClient({
      domain: domain.trim(),
      fetcher,
    }) as MyAccountClientWithScopes;

    client.withScopes = (scopes: string) => {
      latestScopes = scopes;
      return client;
    };

    return client;
  }
  throw new Error('Missing domain or proxy URL for MyAccountClient');
}
