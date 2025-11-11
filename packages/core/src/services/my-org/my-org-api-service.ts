import { MyOrganizationClient } from '@auth0/myorganization-js';
import type { AuthDetails } from '@core/auth/auth-types';
import type { createTokenManager } from '@core/auth/token-manager';

export function initializeMyOrgClient(
  auth: AuthDetails,
  tokenManagerService: ReturnType<typeof createTokenManager>,
): {
  client: MyOrganizationClient;
  setLatestScopes: (scopes: string) => void;
} {
  let latestScopes = '';

  const setLatestScopes = (scopes: string) => {
    latestScopes = scopes;
  };

  if (auth.authProxyUrl) {
    const myOrgProxyPath = 'my-org';
    const myOrgProxyBaseUrl = `${auth.authProxyUrl.replace(/\/$/, '')}/${myOrgProxyPath}`;
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
    return {
      client: new MyOrganizationClient({
        domain: '',
        baseUrl: myOrgProxyBaseUrl.trim(),
        telemetry: false,
        fetcher,
      }),
      setLatestScopes,
    };
  } else if (auth.domain) {
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
    return {
      client: new MyOrganizationClient({
        domain: auth.domain.trim(),
        fetcher,
      }),
      setLatestScopes,
    };
  }
  throw new Error('Missing domain or proxy URL for MyOrgClient');
}
