/**
 * Core client factory for creating the main service client.
 * @module core-client
 * @internal
 */

import { initializeMyAccountClient } from '@core/services/my-account/my-account-api-service';
import { initializeMyOrganizationClient } from '@core/services/my-organization/my-organization-api-service';

import type { I18nInitOptions } from '../i18n';
import { createI18nService } from '../i18n';

import type { AuthDetails, CoreClientInterface } from './auth-types';
import { createTokenManager } from './token-manager';

/**
 * Creates and initializes the core client with all necessary services.
 * @internal
 *
 * @param authDetails - Authentication configuration details
 * @param i18nOptions - Internationalization options
 * @returns Promise resolving to the initialized CoreClient
 */
export async function createCoreClient(
  authDetails: AuthDetails,
  i18nOptions?: I18nInitOptions,
): Promise<CoreClientInterface> {
  const i18nService = await createI18nService(
    i18nOptions || { currentLanguage: 'en-US', fallbackLanguage: 'en-US' },
  );

  // Skip API clients for docs sites
  if (authDetails.previewMode) {
    const baseCoreClient: CoreClientInterface = {
      auth: {},
      i18nService,
      async getToken() {
        return undefined;
      },
      isProxyMode() {
        return false;
      },
      ensureScopes: async () => {},
      myAccountApiClient: undefined,
      myOrganizationApiClient: undefined,
      getMyAccountApiClient: function () {
        throw new Error('Function not implemented.');
      },
      getMyOrganizationApiClient: function () {
        throw new Error('Function not implemented.');
      },
      getDomain: function (): string | undefined {
        return undefined;
      },
    };

    return {
      ...baseCoreClient,
    };
  }

  const tokenManagerService = createTokenManager(authDetails);

  const { client: myOrganizationApiClient, setLatestScopes: setOrgScopes } =
    initializeMyOrganizationClient(authDetails, tokenManagerService);

  const { client: myAccountApiClient, setLatestScopes: setAccountScopes } =
    initializeMyAccountClient(authDetails, tokenManagerService);

  return {
    auth: authDetails,
    i18nService,
    myAccountApiClient,
    myOrganizationApiClient,

    getToken: (scope, aud, ignoreCache) => tokenManagerService.getToken(scope, aud, ignoreCache),
    isProxyMode: () => !!authDetails.authProxyUrl,

    getDomain: () => authDetails.domain ?? authDetails.contextInterface?.getConfiguration()?.domain,

    ensureScopes: async (requiredScopes: string, audiencePath: string) => {
      const isProxyMode = !!authDetails.authProxyUrl;

      if (!isProxyMode) {
        const domain =
          authDetails.domain ?? authDetails.contextInterface?.getConfiguration()?.domain;

        if (!domain) {
          throw new Error('Authentication domain is missing, cannot initialize SPA service.');
        }
      }

      if (audiencePath === 'my-org') setOrgScopes(requiredScopes);
      if (audiencePath === 'me') setAccountScopes(requiredScopes);

      if (isProxyMode) {
        return;
      }

      const token = await tokenManagerService.getToken(requiredScopes, audiencePath, true);
      if (!token) {
        throw new Error(`Failed to retrieve token for audience: ${audiencePath}`);
      }
    },

    getMyAccountApiClient: () => {
      if (!myAccountApiClient)
        throw new Error(
          'myAccountApiClient is not enabled. Please use it within Auth0ComponentProvider.',
        );
      return myAccountApiClient;
    },

    getMyOrganizationApiClient: () => {
      if (!myOrganizationApiClient)
        throw new Error(
          'myOrganizationApiClient is not enabled. Please ensure you are in an Auth0 Organization context.',
        );
      return myOrganizationApiClient;
    },
  };
}
