import { initializeMyAccountClient } from '@core/services/my-account/my-account-api-service';
import { initializeMyOrganizationClient } from '@core/services/my-organization/my-organization-api-service';

import type { I18nInitOptions } from '../i18n';
import { createI18nService } from '../i18n';

import type {
  AuthDetails,
  BaseCoreClientInterface,
  CoreClientInterface,
  CustomFetch,
} from './auth-types';
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
  customFetch?: CustomFetch,
): Promise<CoreClientInterface> {
  const i18nService = await createI18nService(
    i18nOptions || { currentLanguage: 'en-US', fallbackLanguage: 'en-US' },
  );
  const auth = initializeAuthDetails(authDetails);

  const tokenManagerService = createTokenManager(auth);
  const { client: myOrganizationApiClient, setLatestScopes: setOrgScopes } =
    initializeMyOrganizationClient(auth, tokenManagerService, customFetch);
  const { client: myAccountApiClient, setLatestScopes: setAccountScopes } =
    initializeMyAccountClient(auth, tokenManagerService, customFetch);

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
    myOrganizationApiClient,
    getMyAccountApiClient() {
      if (!myAccountApiClient) {
        throw new Error(
          'myAccountApiClient is not enabled. Please use it within Auth0ComponentProvider.',
        );
      }
      return myAccountApiClient;
    },
    getMyOrganizationApiClient() {
      if (!myOrganizationApiClient) {
        throw new Error(
          'myOrganizationApiClient is not enabled. Please ensure you are in an Auth0 Organization context.',
        );
      }
      return myOrganizationApiClient;
    },
  };
}
