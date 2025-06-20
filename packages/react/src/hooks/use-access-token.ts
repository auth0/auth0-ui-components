import * as React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useComponentConfig } from './use-config';
import { useI18n } from './use-i18n';

/**
 * Describes the object returned by the `useAccessToken` hook.
 * @interface UseAccessTokenResult
 */
interface UseAccessTokenResult {
  /**
   * Fetches an Auth0 access token, handling caching, deduplication, and popup fallbacks.
   * @param {boolean} [ignoreCache=false] - If true, forces a new token request, bypassing the SDK's cache.
   * @returns {Promise<string>} A promise that resolves with the access token.
   * @throws An error if the token cannot be obtained. This must be handled with a `try...catch` block.
   */
  getToken: (ignoreCache?: boolean) => Promise<string>;
  /**
   * A static error object present only if the Auth0 domain is not configured.
   * Does not report runtime errors from `getToken`.
   */
  error: Error | null;
}

/**
 * A React hook to get Auth0 access tokens.
 *
 * This hook simplifies token retrieval by providing request deduplication (preventing
 * multiple requests for the same token) and automatically handling the popup fallback
 * if user consent is required. It relies on the Auth0 SDK's internal cache,
 * which respects token expiration.
 *
 * @param {string} scope - The space-separated OAuth scopes required for the token (e.g., "read:users").
 * @param {string} audiencePath - The path segment of the API audience (e.g., "api/v2"), which is appended to the domain.
 * @returns {UseAccessTokenResult} An object containing the `getToken` function and a potential configuration error.
 *
 * @example
 * ```tsx
 * function UserProfile() {
 * const { getToken, error } = useAccessToken('read:current_user', 'api/v2');
 *
 * const fetchProfile = async () => {
 * try {
 * const token = await getToken();
 * const response = await fetch('[https://my-api.com/profile](https://my-api.com/profile)', {
 * headers: { Authorization: `Bearer ${token}` },
 * });
 * // ... handle response
 * } catch (err) {
 * console.error("Failed to fetch profile:", err);
 * // Handle error, e.g., show a notification to the user
 * }
 * };
 *
 * return <button onClick={fetchProfile}>Load Profile</button>;
 * }
 * ```
 */
export function useAccessToken(scope: string, audiencePath: string): UseAccessTokenResult {
  const { getAccessTokenSilently, getAccessTokenWithPopup } = useAuth0();
  const {
    config: { authDetails },
  } = useComponentConfig();
  const t = useI18n('common');
  const domain = authDetails?.domain;

  if (authDetails?.scopes?.includes(scope) && authDetails.accessToken) {
    return {
      getToken: async () => authDetails.accessToken as string,
      error: null,
    };
  }

  const pendingPromiseRef = React.useRef<Promise<string> | null>(null);
  const audience = domain ? `${domain}${audiencePath}/` : '';

  const getToken = React.useCallback(
    async (ignoreCache = false): Promise<string> => {
      if (!domain) {
        throw new Error(t('errors.domain_not_configured'));
      }
      if (!scope) {
        throw new Error(t('errors.scope_required'));
      }

      if (pendingPromiseRef.current) {
        return pendingPromiseRef.current;
      }

      const fetchToken = async (): Promise<string> => {
        try {
          const token = await getAccessTokenSilently({
            authorizationParams: {
              audience,
              scope,
            },
            ...(ignoreCache ? { cacheMode: 'off' } : {}),
          });

          if (!token) throw new Error(t('errors.access_token_error'));

          return token;
        } catch (error) {
          const token = await getAccessTokenWithPopup({
            authorizationParams: {
              audience,
              scope,
              prompt: 'consent',
            },
          });

          if (!token) throw new Error(t('errors.popup_closed_or_failed'));

          return token;
        }
      };

      try {
        pendingPromiseRef.current = fetchToken();
        const token = await pendingPromiseRef.current;
        return token;
      } finally {
        pendingPromiseRef.current = null;
      }
    },
    [domain, scope, audience, getAccessTokenSilently, getAccessTokenWithPopup, t],
  );

  return {
    getToken,
    error: !domain ? new Error(t('errors.domain_not_configured')) : null,
  };
}
