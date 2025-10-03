import type { I18nInitOptions } from '../i18n';
import { createI18nService } from '../i18n';
import { createAuthenticationAPIService } from '../services/authentication-api-service';
import { createMyOrgAPIService } from '../services/my-org-api-service';

import type {
  ServicesConfig,
  AuthDetailsCore,
  BaseCoreClientInterface,
  CoreClientInterface,
} from './auth-types';
import { AuthUtils } from './auth-utils';
import { createTokenManager } from './token-manager';

/**
 * Pure utility functions for core business logic.
 */
const CoreUtils = {
  /**
   * Gets the base URL for API calls, supporting both direct Auth0 domain and proxy mode.
   *
   * @param auth - The authentication details containing domain or proxy URL configuration
   * @returns The base API URL with trailing slash
   * @throws {Error} When Auth0 domain is not configured and no proxy URL is provided
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
    return AuthUtils.toURL(domain);
  },

  /**
   * Determines if the client is running in proxy mode by checking for authProxyUrl.
   *
   * @param auth - The authentication details to check
   * @returns True if running in proxy mode, false otherwise
   */
  isProxyMode(auth: AuthDetailsCore): boolean {
    return !!auth.authProxyUrl;
  },

  /**
   * Initializes authentication details by attempting to get an access token if a context interface is available and is not proxy mode.
   *
   * @param authDetails - The initial authentication details
   * @returns Promise resolving to updated auth details with access token (if available)
   */
  async initializeAuthDetails(authDetails: AuthDetailsCore): Promise<AuthDetailsCore> {
    if (CoreUtils.isProxyMode(authDetails)) {
      return authDetails;
    }
    if (authDetails.contextInterface) {
      try {
        const tokenRes = await authDetails.contextInterface.getAccessTokenSilently({
          cacheMode: 'off',
          detailedResponse: true,
        });
        return {
          ...authDetails,
          accessToken: tokenRes.access_token,
        };
      } catch (err) {
        return {
          ...authDetails,
          accessToken: undefined,
        };
      }
    }
    return authDetails;
  },
};

/**
 * Creates a core client instance that serves as the foundation for authentication and other main operations.
 *
 * This factory function initializes all core services including i18n, token management,
 * and other API services. It handles both direct Auth0 integration and proxy mode.
 *
 * @param authDetails - Authentication configuration including domain, client ID, and optional proxy settings
 * @param i18nOptions - Optional internationalization configuration for language support
 * @returns Promise resolving to a fully initialized core client interface
 *
 * @example
 * ```typescript
 * // Direct Auth0 integration
 * const coreClient = await createCoreClient({
 *   domain: 'your-domain.auth0.com',
 *   clientId: 'your-client-id',
 *   contextInterface: auth0Client
 * });
 *
 * // Proxy mode
 * const coreClient = await createCoreClient({
 *   authProxyUrl: 'https://your-proxy.com/api',
 *   clientId: 'your-client-id'
 * });
 * ```
 */
export async function createCoreClient(
  authDetails: AuthDetailsCore,
  servicesConfig: ServicesConfig,
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

  // Return the complete object with functional core
  const baseCoreClient: BaseCoreClientInterface = {
    auth,
    servicesConfig,
    i18nService,

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

  // Initialize Authentication API service
  const authenticationApiService = createAuthenticationAPIService(baseCoreClient);

  // Initialize MyOrg API service if it's enabled
  const myOrgApiService = servicesConfig.myOrg.enabled
    ? await createMyOrgAPIService(baseCoreClient)
    : undefined;

  const coreClient: CoreClientInterface = {
    ...baseCoreClient,
    authenticationApiService,
    myOrgApiService,
    getAuthenticationApiService: () => authenticationApiService,
    getMyOrgApiService: () => {
      if (!myOrgApiService) {
        throw new Error(
          'myOrgApiService is not enabled. Please use it within Auth0ComponentProvider and make sure the user is in the context of an Auth0 Organization.',
        );
      }
      return myOrgApiService;
    },
  };

  return coreClient;
}
