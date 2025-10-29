import { MyAccountClient } from '@auth0/myaccount';

import type { AuthDetails } from '../../auth/auth-types';
import type { createTokenManager } from '../../auth/token-manager';

export function initializeMyAccountClient(
  auth: AuthDetails,
  tokenManagerService: ReturnType<typeof createTokenManager>,
): {
  client: MyAccountClient;
  setLatestScopes: (scopes: string) => void;
} {
  let latestScopes = '';

  const setLatestScopes = (scopes: string) => {
    latestScopes = scopes;
  };

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
    return {
      client: new MyAccountClient({
        domain: '',
        baseUrl: myAccountBaseUrl.trim(),
        telemetry: false,
        fetcher,
      }),
      setLatestScopes,
    };
  } else if (auth.domain) {
    const fetcher = async (url: string, init?: RequestInit) => {
      const token = await tokenManagerService.getToken(latestScopes, 'me');
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
      client: new MyAccountClient({
        domain: auth.domain.trim(),
        fetcher,
      }),
      setLatestScopes,
    };
  }
  throw new Error('Missing domain or proxy URL for MyAccountClient');
}
