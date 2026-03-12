/**
 * Core client factory for creating the main service client.
 * @module core-client
 * @internal
 */

import { initializeMfaStepUpClient } from '@core/services/mfa-step-up/mfa-step-up-api-service';
import { initializeMyAccountClient } from '@core/services/my-account/my-account-api-service';
import { initializeMyOrganizationClient } from '@core/services/my-organization/my-organization-api-service';

import type { I18nInitOptions } from '../i18n';
import { createI18nService } from '../i18n';

import type { AuthDetails, CoreClientInterface } from './auth-types';
import { AuthUtils } from './auth-utils';

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
    return {
      auth: {},
      i18nService,
      isProxyMode() {
        return false;
      },
      myAccountApiClient: undefined,
      myOrganizationApiClient: undefined,
      getMyAccountApiClient: function () {
        throw new Error('Function not implemented.');
      },
      getMyOrganizationApiClient: function () {
        throw new Error('Function not implemented.');
      },
      getMFAStepUpApiClient: function () {
        throw new Error('Function not implemented.');
      },
      getDomain: function (): string | undefined {
        return undefined;
      },
    };
  }

  const authConfig = AuthUtils.resolveAuthConfig(authDetails);

  const myOrganizationApiClient = initializeMyOrganizationClient(authConfig);
  const myAccountApiClient = initializeMyAccountClient(authConfig);

  const mfaApiClient = initializeMfaStepUpClient(authConfig);

  return {
    auth: authDetails,
    i18nService,
    myAccountApiClient,
    myOrganizationApiClient,

    isProxyMode: () => authConfig.mode === 'proxy',

    getDomain: () => authConfig.domain,

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

    getMFAStepUpApiClient: () => mfaApiClient,
  };
}
