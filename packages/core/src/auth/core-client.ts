import { MyAccountClient } from '@auth0/myaccount-js';
import { MyOrganizationClient } from '@auth0/myorganization-js';

import type { I18nInitOptions } from '../i18n';
import { createI18nService } from '../i18n';

import type { AuthDetails, CoreClientInterface, BoundClientOptions } from './auth-types';
import { AuthUtils } from './auth-utils';
import { createTokenManager } from './token-manager';

const AUDIENCE = {
  ORG: 'my-org',
  ME: 'me',
} as const;

const DEFAULT_SCOPES = 'openid profile email offline_access';

async function handleAuthStepUp(
  response: Response,
  baseScope: string | undefined,
  currentScope: string,
): Promise<Response> {
  if (response.status !== 403 || typeof window === 'undefined') return response;

  try {
    const data = await response.clone().json();

    const isScopeError =
      data.error === 'insufficient_scope' ||
      data.title === 'Insufficient Scope' ||
      (typeof data.type === 'string' && data.type.includes('A0E-403-0002'));

    if (isScopeError) {
      const finalScope = AuthUtils.mergeScopes(baseScope || DEFAULT_SCOPES, currentScope);

      const safeReturnTo = window.location.pathname + window.location.search;
      const params = new URLSearchParams({ scope: finalScope, returnTo: safeReturnTo });

      // Redirect and halt execution
      window.location.assign(`/auth/login?${params}`);
      return new Promise(() => {});
    }
  } catch {
    /* Ignore non-JSON errors */
  }

  return response;
}

function createBoundClient<T>({
  auth,
  tokenManager,
  audience,
  clientBuilder,
}: BoundClientOptions<T>) {
  let latestScopes = '';
  const isProxy = Boolean(auth.authProxyUrl);

  const fetcher = async (url: string, init?: RequestInit) => {
    const headers = new Headers(init?.headers);
    if (init?.body && !headers.has('Content-Type')) headers.set('Content-Type', 'application/json');

    if (isProxy) {
      if (latestScopes) headers.set('auth0-scope', latestScopes);
    } else {
      const token = await tokenManager.getToken(latestScopes, audience);
      if (token) headers.set('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(url, {
      ...init,
      headers,
      ...(isProxy && { credentials: 'include' }),
    });

    return isProxy ? handleAuthStepUp(response, auth.scope, latestScopes) : response;
  };

  const baseUrl = isProxy ? `${auth.authProxyUrl?.replace(/\/$/, '')}/${audience}` : undefined;

  const client = clientBuilder({
    domain: isProxy ? '' : (auth.domain || '').trim(),
    baseUrl,
    telemetry: false,
    fetcher,
  });

  return {
    client,
    setLatestScopes: (newScopes: string) => {
      latestScopes = AuthUtils.mergeScopes(latestScopes, newScopes);
    },
  };
}

export async function createCoreClient(
  authDetails: AuthDetails,
  i18nOptions?: I18nInitOptions,
): Promise<CoreClientInterface> {
  const i18nService = await createI18nService(
    i18nOptions || { currentLanguage: 'en-US', fallbackLanguage: 'en-US' },
  );

  const tokenManager = createTokenManager(authDetails);
  const isProxy = !!authDetails.authProxyUrl;

  const orgClientBinding = createBoundClient({
    auth: authDetails,
    tokenManager,
    audience: AUDIENCE.ORG,
    clientBuilder: (config) => new MyOrganizationClient(config),
  });

  const accountClientBinding = createBoundClient({
    auth: authDetails,
    tokenManager,
    audience: AUDIENCE.ME,
    clientBuilder: (config) => new MyAccountClient(config),
  });

  const scopeSetters = {
    [AUDIENCE.ORG]: orgClientBinding.setLatestScopes,
    [AUDIENCE.ME]: accountClientBinding.setLatestScopes,
  };

  return {
    auth: authDetails,
    i18nService,
    myAccountApiClient: accountClientBinding.client,
    myOrgApiClient: orgClientBinding.client,
    isProxyMode: () => isProxy,
    async getToken(scope, audiencePath, ignoreCache = false) {
      return tokenManager.getToken(scope, audiencePath, ignoreCache);
    },
    ensureScopes: async (requiredScopes, audiencePath) => {
      const setScopes = scopeSetters[audiencePath as keyof typeof scopeSetters];
      if (setScopes) {
        setScopes(requiredScopes);
      }

      if (!isProxy) {
        if (!authDetails.domain) {
          throw new Error('Authentication domain is missing, cannot initialize SPA service.');
        }

        const token = await tokenManager.getToken(requiredScopes, audiencePath, true);
        if (!token) {
          throw new Error(`Failed to retrieve token for audience: ${audiencePath}`);
        }
      }
    },
    getMyAccountApiClient: () => accountClientBinding.client,
    getMyOrgApiClient: () => orgClientBinding.client,
  };
}
