import { initializeMyAccountClient } from '@core/services/my-account/my-account-api-service';
import { initializeMyOrganizationClient } from '@core/services/my-organization/my-organization-api-service';
import { initializeStepUpApiService } from '@core/services/step-up';

import type { I18nInitOptions } from '../i18n';
import { createI18nService } from '../i18n';

import type { AuthDetails, CoreClientInterface } from './auth-types';
import { createTokenManager } from './token-manager';

export async function createCoreClient(
  authDetails: AuthDetails,
  i18nOptions?: I18nInitOptions,
): Promise<CoreClientInterface> {
  const i18nService = await createI18nService(
    i18nOptions || { currentLanguage: 'en-US', fallbackLanguage: 'en-US' },
  );

  const tokenManagerService = createTokenManager(authDetails);

  const myOrganizationApiClient = initializeMyOrganizationClient(authDetails, tokenManagerService);

  const myAccountApiClient = initializeMyAccountClient(authDetails, tokenManagerService);

  const stepUpApiService = initializeStepUpApiService(authDetails);

  return {
    auth: authDetails,
    i18nService,
    myAccountApiClient,
    myOrganizationApiClient,
    stepUpApiService,

    getToken: (scope, aud, ignoreCache) => tokenManagerService.getToken(scope, aud, ignoreCache),
    isProxyMode: () => !!authDetails.authProxyUrl,

    getDomain: () => authDetails.domain ?? authDetails.contextInterface?.getConfiguration()?.domain,

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

    getStepUpApiService: () => {
      if (!stepUpApiService)
        throw new Error(
          'stepUpApiService is not enabled. Please use it within Auth0ComponentProvider.',
        );
      return stepUpApiService;
    },
  };
}
