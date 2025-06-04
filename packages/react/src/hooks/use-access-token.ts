import * as React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useComponentConfig } from './use-config';

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
 * ## Requirements:
 * - Must be used within an Auth0ComponentProvider.
 * - Auth0 domain should be configured via `useAuth0ComponentConfig`.
 * - `getAccessTokenSilently` and `getAccessTokenWithPopup` must be available.
 *
 * ## Features:
 * - Shared in-memory token cache across hook instances, keyed by audience + scope.
 * - Automatically constructs the audience as `https://${domain}/${audiencePath}`.
 * - Falls back to popup flow when silent token acquisition fails due to consent errors.
 * - Handles loading and error states gracefully.
 * - Provides manual `refreshToken()` trigger to bypass cache.
 * - Supports concurrent requests for the same token without duplication.
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
 *
 * @example
 * ```tsx
 * const { token, loading, error, refreshToken } = useAccessToken('read:authenticators', 'api');
 *
 * if (loading) return <p>Loading token...</p>;
 * if (error) return <p>Error: {error.message}</p>;
 * return <p>Token: {token}</p>;
 * ```
 */

export function useAccessToken(scope: string, audiencePath: string): UseAccessTokenResult {
  const { getAccessTokenSilently, getAccessTokenWithPopup } = useAuth0();
  const {
    config: { authDetails },
  } = useComponentConfig();
  const domain = authDetails?.domain;

  const audience = domain ? `${domain}${audiencePath}/` : '';
  const cacheKey = `${audience}|${scope}`;

  const staticCache = React.useRef(new Map<string, string>());
  const pendingPromises = React.useRef(new Map<string, Promise<string>>());

  const [state, setState] = React.useState(() => {
    const cachedToken = staticCache.current.get(cacheKey) ?? null;
    return { token: cachedToken, loading: !cachedToken, error: null as Error | null };
  });

  const fetchToken = React.useCallback(
    async (ignoreCache = false): Promise<void> => {
      if (!scope) {
        setState({ token: null, loading: false, error: new Error('Scope is required') });
        return;
      }
      if (!domain) {
        setState({
          token: null,
          loading: false,
          error: new Error('Auth0 domain is not configured'),
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

      if (pendingPromises.current.has(cacheKey)) {
        try {
          const token = await pendingPromises.current.get(cacheKey)!;
          setState({ token, loading: false, error: null });
        } catch (err) {
          setState({
            token: null,
            loading: false,
            error: err instanceof Error ? err : new Error(String(err)),
          });
        }
        return;
      }

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
            if (!token) throw new Error('Access token is undefined');
            return token;
          }
          throw error;
        }
      })();

      pendingPromises.current.set(cacheKey, tokenPromise);

      try {
        const token = await tokenPromise;
        staticCache.current.set(cacheKey, token);
        setState({ token, loading: false, error: null });
      } catch (err) {
        setState({
          token: null,
          loading: false,
          error: err instanceof Error ? err : new Error(String(err)),
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
      cacheKey,
      getAccessTokenSilently,
      getAccessTokenWithPopup,
    ],
  );

  React.useEffect(() => {
    fetchToken();
  }, [fetchToken]);

  const refreshToken = React.useCallback(() => fetchToken(true), [fetchToken]);

  return React.useMemo(() => ({ ...state, refreshToken }), [state, refreshToken]);
}
