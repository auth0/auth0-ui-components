import type { AuthDetailsCore, Auth0ContextInterface } from './auth-types';
import { toURL } from './auth-utils';

/**
 * Store for pending token requests to prevent duplicate requests for the same token.
 * Maps request keys (scope + audience combination) to pending promises.
 */
const pendingTokenRequests = new Map<string, Promise<string>>();

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
    const domainURL = toURL(domain);
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
   * Validates that the core client is properly initialized with required authentication context.
   *
   * @param auth - The authentication details to validate
   * @throws {Error} When the core client is not initialized or missing context interface
   */
  isCoreClientInitialized(auth: AuthDetailsCore): void {
    if (!auth || !auth.contextInterface) {
      throw new Error('TokenUtils: CoreClient is not initialized.');
    }
  },

  /**
   * Validates the parameters required for a token request.
   *
   * @param auth - The authentication details containing domain configuration
   * @param scope - The OAuth scope being requested
   * @throws {Error} When domain is not configured or scope is missing
   */
  validateTokenRequest(auth: AuthDetailsCore, scope: string): void {
    if (!auth.domain) {
      throw new Error('TokenUtils: Auth0 domain is not configured');
    }
    if (!scope) {
      throw new Error('TokenUtils: Scope is required');
    }
  },

  /**
   * Determines if the client is running in proxy mode.
   * In proxy mode, access tokens are not sent to avoid security issues.
   *
   * @param auth - The authentication details to check
   * @returns True if running in proxy mode, false otherwise
   */
  isProxyMode(auth: AuthDetailsCore): boolean {
    return !!auth.authProxyUrl;
  },

  /**
   * Fetches an access token silently, with fallback to popup authentication if silent fails.
   *
   * @param contextInterface - The Auth0 context interface for token operations
   * @param scope - The OAuth scope for the token request
   * @param audience - The target audience URL
   * @param ignoreCache - Whether to bypass token cache and request fresh token
   * @returns Promise resolving to the access token
   * @throws {Error} When both silent and popup token retrieval fail
   */
  async fetchToken(
    contextInterface: Auth0ContextInterface,
    scope: string,
    audience: string,
    ignoreCache: boolean,
  ): Promise<string> {
    try {
      const token = await contextInterface.getAccessTokenSilently({
        authorizationParams: {
          audience,
          scope,
        },
        ...(ignoreCache ? { cacheMode: 'off' } : {}),
      });

      if (!token) {
        throw new Error('getAccessTokenSilently: Access token is not defined');
      }

      return token;
    } catch (error) {
      const token = await contextInterface.getAccessTokenWithPopup({
        authorizationParams: {
          audience,
          scope,
          prompt: 'consent',
        },
      });

      if (!token) {
        throw new Error('getAccessTokenWithPopup: Access token is not defined');
      }

      return token;
    }
  },
};

/**
 * Creates a token manager service that handles access token retrieval with caching and deduplication.
 *
 * The token manager provides intelligent caching to prevent duplicate requests for the same token
 * and supports both silent and popup-based authentication flows.
 *
 * @param auth - The authentication details containing domain, client configuration, and context interface
 * @returns A token manager service interface
 *
 * @example
 * ```typescript
 * const tokenManager = createTokenManager(authDetails);
 *
 * // Get token for MFA operations
 * const token = await tokenManager.getToken('read:authenticators', 'mfa');
 *
 * // Force fresh token (ignore cache)
 * const freshToken = await tokenManager.getToken('read:users', 'management', true);
 * ```
 */
export function createTokenManager(auth: AuthDetailsCore) {
  return {
    /**
     * Retrieves an access token for the specified scope and audience with intelligent caching and deduplication.
     *
     * In proxy mode, this method returns undefined as tokens should not be sent to proxy endpoints.
     * For non-proxy mode, it attempts silent token retrieval first, falling back to popup if necessary.
     *
     * @param scope - The OAuth scope required for the token (e.g., 'read:authenticators enroll')
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
      // Ensure core client is initialized before getting a token

      if (TokenUtils.isProxyMode(auth)) {
        return Promise.resolve(undefined);
      }

      TokenUtils.isCoreClientInitialized(auth);

      // Validate request
      TokenUtils.validateTokenRequest(auth, scope);

      // Build audience and request key
      const audience = TokenUtils.buildAudience(auth.domain!, audiencePath);
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
