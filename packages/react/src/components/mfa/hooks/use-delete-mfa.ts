import * as React from 'react';
import { useComponentConfig, useI18n } from '@/hooks';
import type { DeleteMfaResult } from './types';
import { deleteMfaFactor } from '@auth0-web-ui-components/core';

/**
 * useDeleteMfa
 *
 * Custom hook to delete an MFA authenticator by its ID.
 *
 * ## Requirements:
 * - Must be used within an Auth0ComponentProvider.
 * - In SPA mode:
 *   - Auth0 access token with `remove:authenticators` scope
 *   - Auth0 domain information
 * - In RWA mode (when `authProxyUrl` is configured):
 *   - Access token and domain are optional (requests are proxied)
 *
 * ## Features:
 * - Supports both traditional SPAs and resource web apps (RWA).
 * - Manages loading, success, and error states for the delete operation.
 * - Throws detailed errors for insufficient scopes, missing tokens, and API failures.
 *
 * @param accessToken Optional access token to authorize the delete request (required in SPA mode).
 * @returns {Object} - The state and deleteMfa function:
 *   - loading: boolean indicating request progress
 *   - error: Error object if an error occurred
 *   - success: boolean indicating successful deletion
 *   - deleteMfa: function accepting authenticator ID to trigger deletion
 *
 * @example
 * ```tsx
 * import React from 'react';
 * import { useDeleteMfa } from './useDeleteMfa';
 *
 * function DeleteAuthenticatorButton({ id }: { id: string }) {
 *   const { loading, error, success, deleteMfa } = useDeleteMfa(accessToken);
 *
 *   return (
 *     <div>
 *       <button onClick={() => deleteMfa(id)} disabled={loading}>
 *         Delete Authenticator
 *       </button>
 *       {loading && <p>Deleting...</p>}
 *       {error && <p style={{ color: 'red' }}>Error: {error.message}</p>}
 *       {success && <p>Deleted successfully!</p>}
 *     </div>
 *   );
 * }
 * ```
 */
export function useDeleteMfa(accessToken?: string) {
  const {
    config: { authDetails, apiBaseUrl, isProxyMode },
  } = useComponentConfig();
  const t = useI18n('common');

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [success, setSuccess] = React.useState(false);

  const resetState = () => {
    setError(null);
    setSuccess(false);
  };

  const deleteMfa = React.useCallback(
    async (authenticatorId: string): Promise<DeleteMfaResult> => {
      resetState();
      setLoading(true);

      try {
        if (!isProxyMode) {
          if (!accessToken) throw new Error(t('errors.missingAccessToken'));
          if (!authDetails?.domain) throw new Error(t('errors.missingDomain'));
        }

        if (!apiBaseUrl) throw new Error(t('errors.missingBaseURL'));

        await deleteMfaFactor(apiBaseUrl, authenticatorId, isProxyMode ? undefined : accessToken);

        setSuccess(true);
        return { success: true, loading: false, error: undefined };
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        return { success: false, loading: false, error };
      } finally {
        setLoading(false);
      }
    },
    [apiBaseUrl, isProxyMode, accessToken, authDetails?.domain],
  );

  return {
    loading,
    error: error ?? undefined,
    success,
    deleteMfa,
  };
}
