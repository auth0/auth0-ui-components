import { MyAccountClient } from '@auth0/myaccount-js';

import type { AuthDetails, CustomFetch } from '../../auth/auth-types';
import type { createTokenManager } from '../../auth/token-manager';

export function initializeMyAccountClient(
  auth: AuthDetails,
  tokenManagerService: ReturnType<typeof createTokenManager>,
  customFetch?: CustomFetch,
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
    const fetcher = customFetch
      ? customFetch
      : async (url: string, init?: RequestInit) => {
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
    const fetcher = customFetch
      ? customFetch
      : async (url: string, init?: RequestInit) => {
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
