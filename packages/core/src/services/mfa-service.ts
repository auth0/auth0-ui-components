import { get, del, isApiError, post } from '../api';
import type {
  Authenticator,
  FactorMeta,
  EnrollMfaParams,
  EnrollMfaResponse,
  AuthenticatorType,
} from './types';

export const factorsMeta: Record<string, FactorMeta> = {
  sms: {
    title: 'Phone Message',
    description: 'Users will receive a phone message with a verification code',
  },
  'push-notification': {
    title: 'Push Notification using Auth0 Guardian',
    description: 'Provide a push notification using Auth0 Guardian.',
  },
  totp: {
    title: 'One-time Password',
    description: 'Provide a one-time password using Google Authenticator or similar.',
  },
  email: {
    title: 'Email',
    description: 'Users will receive an email message containing a verification code.',
  },
  duo: {
    title: 'Duo Security',
    description: 'Use your DUO account for Multi-factor Authentication.',
  },
  'webauthn-roaming': {
    title: 'WebAuthn with FIDO Security Keys',
    description: 'Use WebAuthn-compliant security keys (e.g., FIDO2) as a second factor.',
  },
  'webauthn-platform': {
    title: 'WebAuthn with FIDO Device Biometrics',
    description: 'Use WebAuthn-compliant device biometrics as a second factor.',
  },
  'recovery-code': {
    title: 'Recovery Code',
    description: 'Use a unique recovery code to regain account access.',
  },
};

/**
 * fetchMfaFactors
 *
 * Fetch MFA authenticators from Auth0 API and enrich them with metadata.
 *
 * @param apiBaseUrl Base URL for Auth0 API (e.g., https://domain or proxy URL)
 * @param accessToken Optional access token for authorization (ignored if proxy URL used)
 * @param onlyActive Whether to filter only active authenticators
 *
 * @returns Promise resolving to enriched authenticators array
 */
export async function fetchMfaFactors(
  apiBaseUrl: string,
  accessToken?: string,
  onlyActive = false,
): Promise<(Authenticator & FactorMeta & { factorName: string })[]> {
  const response = await get<Authenticator[]>(`${apiBaseUrl}mfa/authenticators`, { accessToken });
  const map = new Map<AuthenticatorType, Authenticator>(
    response.map((f) => [f.authenticator_type, f]),
  );

  return (Object.entries(factorsMeta) as [AuthenticatorType, FactorMeta][]).reduce(
    (acc, [type, meta]) => {
      const factor = map.get(type);

      // If onlyActive=true, skip if not active
      const isActive = factor?.active ?? false;
      if (onlyActive && !isActive) {
        return acc;
      }

      // factorName from factor id or fallback
      const factorName = factor?.id?.split('|')[0] ?? type;

      acc.push({
        id: factor?.id ?? '', // empty string if dummy
        authenticator_type: factor?.authenticator_type ?? type, // from API or fallback
        oob_channels: factor?.oob_channels ?? [], // from API or empty
        active: isActive,
        ...meta,
        factorName, // extra prop
      });

      return acc;
    },
    [] as (Authenticator & FactorMeta & { factorName: string })[],
  );
}

/**
 * Deletes an MFA authenticator by ID.
 *
 * @param baseUrl - The base URL for the Auth0 API or proxy.
 * @param id - The authenticator ID to delete.
 * @param accessToken - Optional token (used in SPA mode).
 */
export async function deleteMfaFactor(
  baseUrl: string,
  id: string,
  accessToken?: string,
): Promise<void> {
  try {
    await del(`${baseUrl}mfa/authenticators/${id}`, {
      accessToken,
    });
  } catch (err) {
    if (isApiError(err)) {
      switch (err.status) {
        case 401:
          throw new Error('Unauthorized: Invalid access token.');
        case 404:
          throw new Error('Authenticator not found.');
        default:
          throw new Error(`Delete failed: ${err.message}`);
      }
    }
    throw new Error('Unexpected error occurred while deleting MFA factor.');
  }
}

/**
 * Performs the MFA enrollment API call.
 *
 * @param baseUrl - The base API URL (e.g. Auth0 domain or proxy).
 * @param params - Enrollment parameters.
 * @param token - Access token or mfa_token.
 * @returns EnrollMfaResponse from Auth0.
 */
export async function enrollMfaRequest(
  baseUrl: string,
  params: EnrollMfaParams,
  token: string,
): Promise<EnrollMfaResponse> {
  const url = `${baseUrl}mfa/associate`;
  return await post<EnrollMfaResponse>(url, params, { accessToken: token });
}
