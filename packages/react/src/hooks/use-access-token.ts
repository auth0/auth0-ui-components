import * as React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useComponentConfig } from './use-config';
import { useI18n } from './use-i18n';

interface UseAccessTokenResult {
  token: string | null;
  loading: boolean;
  error: Error | null;
  refreshToken: () => Promise<void>;
}

/**
 * useAccessToken
 *
 * React hook to retrieve Auth0 access tokens with shared in-memory caching.
 *
 * @param {string} scope - Space-separated scopes to request.
 * @param {string} audiencePath - Path segment appended to `https://${domain}/` to form the audience.
 *
 * @returns {{
 *   token: string | null;
 *   loading: boolean;
 *   error: Error | null;
 *   refreshToken: () => Promise<void>;
 * }} Token state and refresh utility.
 */
export function useAccessToken(scope: string, audiencePath: string): UseAccessTokenResult {
  const { getAccessTokenSilently, getAccessTokenWithPopup } = useAuth0();
  const {
    config: { authDetails },
  } = useComponentConfig();
  const t = useI18n('common');
  const domain = authDetails?.domain;

  // Constructing audience URL
  const audience = domain ? `${domain}${audiencePath}/` : '';
  const cacheKey = `${audience}|${scope}`;

  // Using refs to avoid re-creating the cache and promises on each render
  const staticCache = React.useRef(new Map<string, string>());
  const pendingPromises = React.useRef(new Map<string, Promise<string>>());

  // State setup, including cached token and loading/error state
  const [state, setState] = React.useState(() => {
    const cachedToken = staticCache.current.get(cacheKey) ?? null;
    return { token: cachedToken, loading: !cachedToken, error: null as Error | null };
  });

  // Function to fetch token, with cache and error handling
  const fetchToken = React.useCallback(
    async (ignoreCache = false): Promise<void> => {
      if (!scope) {
        setState({
          token: null,
          loading: false,
          error: new Error(t('errors.scope_required')),
        });
        return;
      }

      if (!domain) {
        setState({
          token: null,
          loading: false,
          error: new Error(t('errors.domain_not_configured')),
        });
        return;
      }

      if (!ignoreCache) {
        const cached = staticCache.current.get(cacheKey);
        if (cached) {
          setState({ token: cached, loading: false, error: null });
          return;
        }
      }

      // If there's already a pending request for the same token, wait for it
      if (pendingPromises.current.has(cacheKey)) {
        try {
          const token = await pendingPromises.current.get(cacheKey)!;
          setState({ token, loading: false, error: null });
        } catch (err) {
          setState({
            token: null,
            loading: false,
            error: new Error(err instanceof Error ? err.message : String(err)),
          });
        }
        return;
      }

      // Otherwise, initiate a new token fetch
      setState((prev) => (prev.loading ? prev : { ...prev, loading: true, error: null }));

      const tokenPromise = (async (): Promise<string> => {
        try {
          const token = await getAccessTokenSilently({
            authorizationParams: {
              audience,
              scope,
              redirect_uri: typeof window !== 'undefined' ? window.location.origin : '',
            },
            ...(ignoreCache ? { ignoreCache: true } : {}),
          });
          return token!;
        } catch (err) {
          const error = err instanceof Error ? err : new Error(String(err));
          if (error.message?.includes('Consent required')) {
            const token = await getAccessTokenWithPopup({
              authorizationParams: {
                audience,
                scope,
                redirect_uri: typeof window !== 'undefined' ? window.location.origin : '',
              },
            });
            if (!token) throw new Error(t('errors.access_token_error'));
            return token;
          }
          throw error;
        }
      })();

      // Store the promise in case of concurrent requests
      pendingPromises.current.set(cacheKey, tokenPromise);

      try {
        const token = await tokenPromise;
        staticCache.current.set(cacheKey, token);
        setState({ token, loading: false, error: null });
      } catch (err) {
        setState({
          token: null,
          loading: false,
          error: new Error(err instanceof Error ? err.message : String(err)),
        });
      } finally {
        pendingPromises.current.delete(cacheKey);
      }
    },
    [
      scope,
      audiencePath,
      domain,
      audience,
      getAccessTokenSilently,
      getAccessTokenWithPopup,
      cacheKey,
      t,
    ],
  );

  // Fetch token on mount or when relevant dependencies change
  React.useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  // Refresh token by bypassing cache
  const refreshToken = React.useCallback(() => fetchToken(true), [fetchToken]);

  // Return token state and refresh function
  return { ...state, refreshToken };
}
