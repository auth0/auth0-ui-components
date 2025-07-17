import { AuthDetailsCore, CoreClientInterface } from './auth-types';
import { createI18nService, I18nInitOptions } from '../i18n';
import { createAuthenticationAPIService } from '../services/authentication-api-service';
import { createTokenManager } from './token-manager';
import { toURL } from './auth-utils';

// Pure utility functions for core business logic
export const CoreUtils = {
  /**
   * Get the base URL for API calls
   */
  getApiBaseUrl(auth: AuthDetailsCore): string {
    // Use authProxyUrl if provided (proxy mode)
    if (auth.authProxyUrl) {
      return auth.authProxyUrl.endsWith('/') ? auth.authProxyUrl : `${auth.authProxyUrl}/`;
    }

    const domain = auth.domain;
    if (!domain) {
      throw new Error('getApiBaseUrl: Auth0 domain is not configured');
    }
    return toURL(domain);
  },

  /**
   * Check if running in proxy mode
   */
  isProxyMode(auth: AuthDetailsCore): boolean {
    return !!auth.authProxyUrl;
  },

  /**
   * Initialize auth details from context interface
   */
  async initializeAuthDetails(authDetails: AuthDetailsCore): Promise<AuthDetailsCore> {
    // Set default values if not provided
    let auth = {
      accessToken: authDetails.accessToken ?? undefined,
      domain: authDetails.domain ?? undefined,
      clientId: authDetails.clientId ?? undefined,
      scopes: authDetails.scopes ?? undefined,
      authProxyUrl: authDetails.authProxyUrl ?? undefined,
      contextInterface: authDetails.contextInterface ?? undefined,
    };
    if (!CoreUtils.isProxyMode(auth) && authDetails.contextInterface) {
      try {
        const tokenRes = await authDetails.contextInterface.getAccessTokenSilently({
          cacheMode: 'off',
          detailedResponse: true,
        });
        auth = {
          ...auth,
          accessToken: tokenRes.access_token,
        };
      } catch (err) {
        auth = {
          accessToken: undefined,
          domain: undefined,
          clientId: undefined,
          scopes: undefined,
          authProxyUrl: auth.authProxyUrl,
          contextInterface: undefined,
        };
      }
    }
    return auth;
  },
};

// Main functional factory for creating core client
export async function createCoreClient(
  authDetails: AuthDetailsCore,
  i18nOptions?: I18nInitOptions,
): Promise<CoreClientInterface> {
  // Initialize i18n service
  const i18nService = await createI18nService(
    i18nOptions || {
      currentLanguage: 'en-US',
      fallbackLanguage: 'en-US',
    },
  );

  // Initialize auth details
  const auth = await CoreUtils.initializeAuthDetails(authDetails);

  // Initialize token manager service
  const tokenManagerService = createTokenManager(auth);

  // Create a placeholder object for circular dependencies
  const coreClient = {} as CoreClientInterface;

  // Initialize authentication service
  const authenticationApiService = createAuthenticationAPIService(coreClient);

  // Return the complete object with functional core
  const client: CoreClientInterface = {
    auth,
    i18nService,
    authenticationApiService,

    async getToken(scope: string, audiencePath: string, ignoreCache = false) {
      return tokenManagerService.getToken(scope, audiencePath, ignoreCache);
    },

    getApiBaseUrl(): string {
      return CoreUtils.getApiBaseUrl(auth);
    },

    isProxyMode(): boolean {
      return CoreUtils.isProxyMode(auth);
    },
  };

  // Update the placeholder reference for circular dependencies
  Object.assign(coreClient, client);

  return client;
}
