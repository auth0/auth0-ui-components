import * as React from 'react';
import { useComponentConfig } from '@/hooks';
import type { UseEnrollMfaResult } from './types';
import { EnrollMfaParams, EnrollMfaResponse } from '@auth0-web-ui-components/core';

/**
 * useEnrollMfa
 *
 * React hook to enroll (associate) a new MFA authenticator using Auth0’s `/mfa/associate` endpoint.
 *
 * ## Requirements:
 * - In SPA mode (no `authProxyUrl`):
 *   - Auth0 domain must be configured.
 *   - Access token with `enroll` scope, unless an `mfa_token` is provided.
 *
 * - In RWA mode (`authProxyUrl` is configured):
 *   - Auth0 domain and access token checks are skipped.
 *   - `mfa_token` is required and sent via the proxy.
 *
 * ## Features:
 * - Handles both SPA and RWA configuration.
 * - Accepts either `accessToken` (with enroll scope) or `mfa_token` for enrollment.
 * - Returns detailed error messages for misconfiguration or network issues.
 * - Returns loading state, error, and response data.
 *
 * @param accessToken Optional access token to enroll an authenticator (required in SPA mode).
 * @returns {UseEnrollMfaResult} Object with:
 * - `loading`: Indicates if the request is in progress.
 * - `error`: Any error during the enrollment process.
 * - `response`: Successful enrollment response from Auth0.
 * - `enrollMfa`: Function to trigger enrollment with parameters and optional `mfa_token`.
 *
 * @example
 * ```tsx
 * const { loading, error, response, enrollMfa } = useEnrollMfa();
 *
 * // Enroll OTP authenticator
 * enrollMfa({ client_id: 'YOUR_CLIENT_ID', authenticator_types: ['otp'] });
 *
 * // Enroll OOB authenticator with SMS channel
 * enrollMfa({
 *   client_id: 'YOUR_CLIENT_ID',
 *   authenticator_types: ['oob'],
 *   oob_channels: ['sms'],
 *   phone_number: '+1234567890',
 * });
 * ```
 */
//TODO
export function useEnrollMfa(accessToken?: string): UseEnrollMfaResult {
  const {
    config: { authDetails, isProxyMode, apiBaseUrl },
  } = useComponentConfig();

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<Error | null>(null);
  const [response, setResponse] = React.useState<EnrollMfaResponse | null>(null);

  const enrollMfa = React.useCallback(
    async (params: EnrollMfaParams, mfaToken?: string) => {
      setLoading(true);
      setError(null);
      setResponse(null);

      try {
        if (!apiBaseUrl) {
          throw new Error('Auth0 base URL is not configured.');
        }

        if (!isProxyMode) {
          if (!authDetails) {
            throw new Error('Authentication details are not available.');
          }

          if (!accessToken) {
            throw new Error('Access token with "enroll" scope is required.');
          }
        }

        const token = mfaToken || accessToken;
        if (!token) {
          throw new Error('No token provided for enrollment.');
        }

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          ...(isProxyMode ? {} : { Authorization: `Bearer ${token}` }),
        };

        const res = await fetch(`${apiBaseUrl}mfa/associate`, {
          method: 'POST',
          headers,
          body: JSON.stringify(params),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Failed to enroll MFA: ${res.status} - ${text}`);
        }

        const data: EnrollMfaResponse = await res.json();
        setResponse(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
      } finally {
        setLoading(false);
      }
    },
    [authDetails, isProxyMode],
  );

  return { loading, error, response, enrollMfa };
}
