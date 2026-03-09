import type { AuthDetails } from './auth-types';
import { AuthUtils } from './auth-utils';

/**
 * Builds the audience URL from a domain and audience path.
 * @param domain - The Auth0 tenant domain.
 * @param audiencePath - The API audience path segment.
 * @returns The constructed audience URL string.
 */
function buildAudience(domain: string, audiencePath: string): string {
  try {
    const url = new URL(AuthUtils.toURL(domain) || '');
    url.pathname = `${url.pathname.replace(/\/$/, '')}/${audiencePath.replace(/^\//, '')}/`;
    return url.toString();
  } catch {
    return '';
  }
}

/**
 * Creates a SPA token retriever for retrieving access tokens.
 * @param auth - Authentication configuration details.
 * @returns Token retriever with a getToken method.
 */
export function createSpaTokenRetriever(auth: AuthDetails) {
  if (!auth) throw new Error('SpaTokenRetriever: auth is not initialized.');

  return {
    /**
     * Retrieves an access token for the specified scope and audience.
     * @param scope - The OAuth scope to request.
     * @param audiencePath - The API audience path segment.
     * @param ignoreCache - Whether to bypass the token cache.
     * @returns The access token, or undefined if using proxy mode.
     */
    async getToken(
      scope: string,
      audiencePath: string,
      ignoreCache = false,
    ): Promise<string | undefined> {
      if (!auth.contextInterface) {
        throw new Error('SpaTokenRetriever: contextInterface is not initialized.');
      }

      const domain = auth.domain ?? auth.contextInterface.getConfiguration()?.domain;
      if (!domain) throw new Error('SpaTokenRetriever: Auth0 domain is not configured');

      const audience = buildAudience(domain, audiencePath);

      const tokenResponse = await auth.contextInterface.getAccessTokenSilently({
        authorizationParams: { audience, scope },
        detailedResponse: true,
        ...(ignoreCache && { cacheMode: 'off' }),
      });
      return tokenResponse.access_token;
    },
  };
}
