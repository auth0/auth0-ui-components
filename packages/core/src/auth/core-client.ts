import { initializeMyAccountClient } from '@core/services/my-account/my-account-api-service';
import { initializeMyOrgClient } from '@core/services/my-org/my-org-api-service';

import type { I18nInitOptions } from '../i18n';
import { createI18nService } from '../i18n';

import type { AuthDetails, BaseCoreClientInterface, CoreClientInterface } from './auth-types';
import { createTokenManager } from './token-manager';

function isProxyMode(auth: AuthDetails): boolean {
  return !!auth.authProxyUrl;
}

function initializeAuthDetails(authDetails: AuthDetails): AuthDetails {
  return authDetails;
}

export async function createCoreClient(
  authDetails: AuthDetails,
  i18nOptions?: I18nInitOptions,
): Promise<CoreClientInterface> {
  const i18nService = await createI18nService(
    i18nOptions || { currentLanguage: 'en-US', fallbackLanguage: 'en-US' },
  );
  const auth = initializeAuthDetails(authDetails);

  // Skip API clients for docs sites
  if (authDetails.offlineMode) {
    const baseCoreClient: BaseCoreClientInterface = {
      auth,
      i18nService,
      async getToken() {
        return undefined;
      },
      isProxyMode() {
        return false;
      },
      ensureScopes: async () => {},
    };

    return {
      ...baseCoreClient,
      myAccountApiClient: undefined,
      myOrgApiClient: undefined,
      getMyAccountApiClient() {
        throw new Error('API clients are not available in docs/demo mode (skipApiClients=true)');
      },
      getMyOrgApiClient() {
        throw new Error('API clients are not available in docs/demo mode (skipApiClients=true)');
      },
    };
  }

  const tokenManagerService = createTokenManager(auth);
  const { client: myOrgApiClient, setLatestScopes: setOrgScopes } = initializeMyOrgClient(
    auth,
    tokenManagerService,
  );
  const { client: myAccountApiClient, setLatestScopes: setAccountScopes } =
    initializeMyAccountClient(auth, tokenManagerService);

  const baseCoreClient: BaseCoreClientInterface = {
    auth,
    i18nService,

    async getToken(scope: string, audiencePath: string, ignoreCache = false) {
      return tokenManagerService.getToken(scope, audiencePath, ignoreCache);
    },

    isProxyMode() {
      return isProxyMode(auth);
    },

    ensureScopes: async (requiredScopes: string, audiencePath: string) => {
      if (isProxyMode(auth) && auth.authProxyUrl) {
        if (audiencePath === 'my-org') {
          setOrgScopes(requiredScopes);
        }
        if (audiencePath === 'me') {
          setAccountScopes(requiredScopes);
        }
      } else {
        if (!auth.domain) {
          throw new Error('Authentication domain is missing, cannot initialize SPA service.');
        }
        if (audiencePath === 'my-org') {
          setOrgScopes(requiredScopes);
        }
        if (audiencePath === 'me') {
          setAccountScopes(requiredScopes);
        }

        const token = await tokenManagerService.getToken(requiredScopes, audiencePath, true);
        if (!token) {
          throw new Error(`Failed to retrieve token for audience: ${audiencePath}`);
        }
      }
    },
  };

  return {
    ...baseCoreClient,
    myAccountApiClient,
    myOrgApiClient,
    getMyAccountApiClient() {
      if (!myAccountApiClient) {
        throw new Error(
          'myAccountApiClient is not enabled. Please use it within Auth0ComponentProvider.',
        );
      }
      return myAccountApiClient;
    },
    getMyOrgApiClient() {
      if (!myOrgApiClient) {
        throw new Error(
          'myOrgApiClient is not enabled. Please ensure you are in an Auth0 Organization context.',
        );
      }
      return myOrgApiClient;
    },
  };
}
