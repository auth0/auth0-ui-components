import * as React from 'react';
import { useComponentConfig } from '@/hooks';
import type { UseMfaListResult, FactorMeta, Authenticator } from './types';
import { fetchMfaFactors } from '@auth0-web-ui-components/core';

/**
 * useMfaList
 *
 * React hook to fetch a list of MFA authenticators from Auth0,
 * enriched with user-friendly metadata such as title and description.
 *
 * ## Requirements:
 * - Must be used within an Auth0ComponentProvider.
 * - In SPA mode:
 *   - Auth0 access token must include the `read:authenticators` scope.
 *   - Auth0 domain must be present in configuration.
 * - In RWA mode (`authProxyUrl` present):
 *   - Access token and domain checks are bypassed.
 *   - All requests are proxied through `authProxyUrl`.
 *
 * ## Features:
 * - Supports both traditional SPAs and resource web apps (RWA).
 * - Fetches authenticators from the Auth0 `/mfa/authenticators` endpoint.
 * - Merges each factor with predefined metadata (title, description).
 * - Allows optional filtering to return only active authenticators.
 * - Handles API errors and loading state gracefully.
 *
 * @param {string} [accessToken] - Auth0 access token containing the `read:authenticators` scope. Ignored in RWA mode.
 * @param {boolean} [onlyActive=false] - Whether to return only active authenticators.
 *
 * @returns {UseMfaListResult & { fetchFactors: () => Promise<void> }} Object containing:
 * - `loading`: Indicates if the request is in progress.
 * - `error`: Any error encountered during the fetch, or `null` if none.
 * - `factors`: An array of authenticators enriched with titles and descriptions.
 * - `fetchFactors`: A method to manually trigger a refresh of the MFA factors.
 *
 * @example
 * ```tsx
 * function AuthenticatorList({ token }: { token: string }) {
 *   const { loading, error, factors, fetchFactors } = useMfaList(token, true);
 *
 *   if (loading) return <p>Loading...</p>;
 *   if (error) return <p>Error: {error.message}</p>;
 *
 *   return (
 *     <>
 *       <button onClick={fetchFactors}>Refresh</button>
 *       <ul>
 *         {factors.map(factor => (
 *           <li key={factor.id}>
 *             <strong>{factor.title}</strong>: {factor.description}
 *           </li>
 *         ))}
 *       </ul>
 *     </>
 *   );
 * }
 * ```
 */
export function useMfaList(
  accessToken?: string,
  onlyActive: boolean = false,
): UseMfaListResult & { fetchFactors: () => Promise<void> } {
  const {
    config: { authDetails, isProxyMode, apiBaseUrl },
  } = useComponentConfig();

  const [factors, setFactors] = React.useState<(Authenticator & FactorMeta)[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);

  const fetchFactors = React.useCallback(async () => {
    if (!apiBaseUrl) {
      setError(new Error('Missing Auth0 API base URL'));
      setLoading(false);
      return;
    }

    if (!isProxyMode) {
      if (!accessToken) {
        setError(new Error('Access token is required.'));
        setLoading(false);
        return;
      }

      if (!authDetails?.domain) {
        setError(new Error('Missing Auth0 domain'));
        setLoading(false);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      const data = await fetchMfaFactors(
        apiBaseUrl,
        isProxyMode ? undefined : accessToken,
        onlyActive,
      );
      setFactors(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setFactors([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken, onlyActive, apiBaseUrl, isProxyMode, authDetails?.domain]);

  React.useEffect(() => {
    fetchFactors();
  }, [fetchFactors]);

  return { loading, error, factors, fetchFactors };
}
