import type { AuthDetails, BasicAuth0ContextInterface } from './auth-types';
import { AuthUtils } from './auth-utils';

/**
 * Store for pending token requests to prevent duplicate requests for the same token.
 * Maps request keys (scope + audience combination) to pending promises.
 */
const pendingTokenRequests = new Map<string, Promise<string>>();

const FALLBACK_ERRORS = new Set(['consent_required', 'login_required', 'mfa_required']);

/**
 * Pure utility functions for token management operations.
 * These functions handle token requests, validation, and caching logic.
 */
const TokenUtils = {
  /**
   * Builds a complete audience URL by combining the Auth0 domain with the audience path.
   *
   * @param domain - The Auth0 domain
   * @param audiencePath - The API audience path (e.g., 'mfa', 'users')
   * @returns The complete audience URL with trailing slash or empty string if domain is not defined
   */
  buildAudience(domain: string, audiencePath: string): string {
    const domainURL = AuthUtils.toURL(domain);
    return domainURL ? `${domainURL}${audiencePath}/` : '';
  },

  /**
   * Creates a unique key for token requests to enable deduplication and caching.
   *
   * @param scope - The OAuth scope for the token request
   * @param audience - The target audience URL
   * @returns A unique string key combining scope and audience
   */
  createRequestKey(scope: string, audience: string): string {
    return `${scope}:${audience}`;
  },

  /**
   * Validates that the core client is properly initialized with auth data.
   *
   * @param auth - The authentication details to validate
   * @throws {Error} When the core client is not initialized
   */
  isCoreClientAuthInitialized(auth: AuthDetails): void {
    if (!auth) {
      throw new Error('TokenUtils: auth in CoreClient is not initialized.');
    }
  },

  /**
   * Validates that the core client is properly initialized with auth data and required authentication context.
   *
   * @param auth - The authentication details to validate
   * @throws {Error} When the core client is not initialized or missing context interface
   */
  isCoreClientContextInterfaceInitialized(auth: AuthDetails): void {
    if (!auth || !auth.contextInterface) {
      throw new Error('TokenUtils: contextInterface in CoreClient is not initialized.');
    }
  },

  /**
   * Validates that a domain is configured.
   *
   * @param domain - The Auth0 domain to validate
   * @throws {Error} When domain is not configured
   */
  validateDomain(domain: string | undefined): void {
    if (!domain) {
      throw new Error('TokenUtils: Auth0 domain is not configured');
    }
  },

  /**
   * Determines if the client is running in proxy mode.
   * In proxy mode, access tokens are not sent to avoid security issues.
   *
   * @param auth - The authentication details to check
   * @returns True if running in proxy mode, false otherwise
   */
  isProxyMode(auth: AuthDetails): boolean {
    return !!auth.authProxyUrl;
  },

  /**
   * Fetches an access token silently.
   *
   * @param contextInterface - The Auth0 context interface for token operations
   * @param scope - The OAuth scope for the token request
   * @param audience - The target audience URL
   * @param ignoreCache - Whether to bypass token cache and request fresh token
   * @returns Promise resolving to the access token
   * @throws {Error} When silent retrieval fail
   */
  async fetchToken(
    contextInterface: BasicAuth0ContextInterface,
    scope: string,
    audience: string,
    ignoreCache: boolean,
  ): Promise<string> {
    try {
      const tokenResponse = await contextInterface.getAccessTokenSilently({
        authorizationParams: {
          audience,
          scope,
        },
        detailedResponse: true,
        ...(ignoreCache ? { cacheMode: 'off' } : {}),
      });

      const token = tokenResponse.access_token;
      return token;
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'error' in error &&
        FALLBACK_ERRORS.has((error as { error: string }).error)
      ) {
        const errorType = (error as { error: string }).error;
        const prompt = errorType === 'login_required' ? 'login' : 'consent';

        const token = await contextInterface.getAccessTokenWithPopup({
          authorizationParams: {
            audience,
            scope,
            prompt,
          },
        });

        if (!token) {
          throw new Error('getAccessTokenWithPopup: Access token is not defined');
        }
        return token;
      }
      throw new Error('getAccessToken: failed', { cause: error });
    }
  },
};

/**
 * Creates a token manager service that handles access token retrieval with caching and deduplication.
 *
 * The token manager provides intelligent caching to prevent duplicate requests for the same token
 * and supportssilent authentication flows.
 *
 * @param auth - The authentication details containing domain, client configuration, and context interface
 * @returns A token manager service interface
 *
 * @example
 * ```typescript
 * const tokenManager = createTokenManager(authDetails);
 *
 * // Get token for MFA operations
 * const token = await tokenManager.getToken('read:me:authentication_methods', 'mfa');
 *
 * // Force fresh token (ignore cache)
 * const freshToken = await tokenManager.getToken('read:users', 'management', true);
 * ```
 */
export function createTokenManager(auth: AuthDetails) {
  return {
    /**
     * Retrieves an access token for the specified scope and audience with intelligent caching and deduplication.
     *
     * In proxy mode, this method returns undefined as tokens should not be sent to proxy endpoints.
     * For non-proxy mode, it attempts silent token retrieval.
     *
     * @param scope - The OAuth scope required for the token (e.g., 'read:me:authentication_methods')
     * @param audiencePath - The API audience path (e.g., 'mfa', 'users')
     * @param ignoreCache - Whether to bypass cache and request a fresh token
     * @returns Promise resolving to access token string, or undefined in proxy mode
     * @throws {Error} When core client is not initialized, parameters are invalid, or token retrieval fails
     */
    async getToken(
      scope: string,
      audiencePath: string,
      ignoreCache: boolean = false,
    ): Promise<string | undefined> {
      // Ensure core client auth is initialized
      TokenUtils.isCoreClientAuthInitialized(auth);

      if (TokenUtils.isProxyMode(auth)) {
        return Promise.resolve(undefined);
      }

      // Ensure core client "contextInterface" is initialized before getting a token
      TokenUtils.isCoreClientContextInterfaceInitialized(auth);

      const domain = auth.domain ?? auth.contextInterface!.getConfiguration()?.domain;
      TokenUtils.validateDomain(domain);

      // Build audience and request key
      const audience = TokenUtils.buildAudience(domain!, audiencePath);
      const requestKey = TokenUtils.createRequestKey(scope, audience);

      // If ignoreCache is true, clear any pending request for this key
      if (ignoreCache) {
        pendingTokenRequests.delete(requestKey);
      }

      // Check if there's already a pending request for this token
      const existingRequest = pendingTokenRequests.get(requestKey);
      if (existingRequest) {
        return existingRequest;
      }

      // Create new token request
      const tokenPromise = TokenUtils.fetchToken(
        auth.contextInterface!,
        scope,
        audience,
        ignoreCache,
      );

      pendingTokenRequests.set(requestKey, tokenPromise);

      try {
        const token = await tokenPromise;
        return token;
      } finally {
        // Clean up the pending request after completion
        pendingTokenRequests.delete(requestKey);
      }
    },
  };
}
