import type { AuthDetails } from './auth-types';
import { AuthUtils } from './auth-utils';

const FALLBACK_ERRORS = new Set(['consent_required', 'login_required']);

/**
 * Checks if an error has an error property.
 * @param error - The error to check.
 * @returns True if the error has an error property.
 */
function hasErrorProperty(error: unknown): error is { error: string } {
  return typeof error === 'object' && error !== null && 'error' in error;
}

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
      if (auth.authProxyUrl) return undefined;
      if (!auth.contextInterface) {
        throw new Error('SpaTokenRetriever: contextInterface is not initialized.');
      }

      const domain = auth.domain ?? auth.contextInterface.getConfiguration()?.domain;
      if (!domain) throw new Error('SpaTokenRetriever: Auth0 domain is not configured');

      const audience = buildAudience(domain, audiencePath);

      try {
        const tokenResponse = await auth.contextInterface.getAccessTokenSilently({
          authorizationParams: { audience, scope },
          detailedResponse: true,
          ...(ignoreCache && { cacheMode: 'off' }),
        });
        return tokenResponse.access_token;
      } catch (error) {
        if (hasErrorProperty(error) && FALLBACK_ERRORS.has(error.error)) {
          const prompt = error.error === 'login_required' ? 'login' : 'consent';
          const token = await auth.contextInterface.getAccessTokenWithPopup({
            authorizationParams: { audience, scope, prompt },
          });
          if (!token) throw error;
          return token;
        }

        throw error;
      }
    },
  };
}
