import type { AuthDetails } from './auth-types';
import { AuthUtils } from './auth-utils';

const FALLBACK_ERRORS = new Set(['consent_required', 'login_required']);

function hasErrorProperty(error: unknown): error is { error: string } {
  return typeof error === 'object' && error !== null && 'error' in error;
}

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
 * Creates a token manager for retrieving access tokens.
 */
export function createTokenManager(auth: AuthDetails) {
  if (!auth) throw new Error('TokenManager: auth is not initialized.');

  return {
    /**
     * Retrieves an access token for the specified scope and audience.
     */
    async getToken(
      scope: string,
      audiencePath: string,
      ignoreCache = false,
    ): Promise<string | undefined> {
      if (auth.authProxyUrl) return undefined;
      if (!auth.contextInterface) {
        throw new Error('TokenManager: contextInterface is not initialized.');
      }

      const domain = auth.domain ?? auth.contextInterface.getConfiguration()?.domain;
      if (!domain) throw new Error('TokenManager: Auth0 domain is not configured');

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
