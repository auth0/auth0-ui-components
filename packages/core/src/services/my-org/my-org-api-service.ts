import type { AuthDetails } from '@core/auth/auth-types';
import type { createTokenManager } from '@core/auth/token-manager';
import { MyOrgClient } from 'auth0-myorg-sdk';

export function initializeMyOrgClient(
  auth: AuthDetails,
  tokenManagerService: ReturnType<typeof createTokenManager>,
): {
  client: MyOrgClient;
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
      client: new MyOrgClient({
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
      return fetch(url, {
        ...init,
        headers: {
          ...init?.headers,
          ...(init?.body && { 'Content-Type': 'application/json' }),
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
    };
    return {
      client: new MyOrgClient({
        domain: auth.domain.trim(),
        fetcher,
      }),
      setLatestScopes,
    };
  }
  throw new Error('Missing domain or proxy URL for MyOrgClient');
}
