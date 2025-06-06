import * as React from 'react';
import { useComponentConfig } from '@/hooks';
import type { VerifyMfaRecoveryCodeParams, VerifyMfaRecoveryCodeResult } from './types';

/**
 * useVerifyMfaRecoveryCode
 *
 * React hook to verify MFA using a recovery code via Auth0’s `/oauth/token` endpoint.
 *
 * ## Requirements:
 * - In SPA mode (no `authProxyUrl`):
 *   - Requires `authDetails.domain` and `authDetails.clientId` to be configured.
 *
 * - In RWA mode (`authProxyUrl` present):
 *   - Skips validation for domain and clientId.
 *   - Uses the proxy as the API base path.
 *
 * ## Features:
 * - Supports both SPA and RWA environments.
 * - Verifies MFA using a valid `mfa_token` and recovery code.
 * - Exchanges credentials for Auth0 tokens without requiring a client secret.
 * - Returns loading, error, and data states.
 *
 * @returns {VerifyMfaRecoveryCodeResult} Object with:
 * - `loading`: Indicates request progress.
 * - `error`: Any error that occurred during the request.
 * - `data`: The Auth0 token response on successful verification.
 * - `verifyRecoveryCode`: Function to trigger recovery code verification.
 *
 * @example
 * ```tsx
 * const { loading, error, data, verifyRecoveryCode } = useVerifyMfaRecoveryCode();
 *
 * verifyRecoveryCode({
 *   mfaToken: 'mfa_xyz',
 *   recoveryCode: 'ABCD-EFGH',
 * });
 * ```
 */
//TODO
export function useVerifyMfaRecoveryCode(): VerifyMfaRecoveryCodeResult {
  const {
    config: { authDetails, apiBaseUrl, isProxyMode },
  } = useComponentConfig();

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = React.useState<any | null>(null);

  const verifyRecoveryCode = React.useCallback(
    async ({ mfaToken, recoveryCode }: VerifyMfaRecoveryCodeParams) => {
      setLoading(true);
      setError(null);
      setData(null);

      try {
        if (!apiBaseUrl) {
          throw new Error('Auth0 base URL is not configured.');
        }

        if (!isProxyMode) {
          if (!authDetails) {
            throw new Error('Authentication details are not available.');
          }
          if (!authDetails.domain) {
            throw new Error('Auth0 domain is required');
          }
          if (!authDetails.clientId) {
            throw new Error('Auth0 client ID is required');
          }
        }

        const clientId = authDetails?.clientId ?? '';
        const res = await fetch(`${apiBaseUrl}/oauth/token`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            grant_type: 'http://auth0.com/oauth/grant-type/mfa-recovery-code',
            client_id: clientId,
            mfa_token: mfaToken,
            recovery_code: recoveryCode,
          }),
        });

        if (!res.ok) {
          const errorText = await res.text();
          throw new Error(`MFA verification failed: ${res.status} - ${errorText}`);
        }

        const responseData = await res.json();
        setData(responseData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    },
    [authDetails, apiBaseUrl, isProxyMode],
  );

  return { loading, error, data, verifyRecoveryCode };
}
