import { get, del, isApiError } from '../api';
import type { Authenticator, FactorMeta, MFAType } from './types';

export const factorsMeta: Record<string, FactorMeta> = {
  sms: {
    title: 'Phone Message',
    description: 'Users will receive a phone message with a verification code',
  },
  'push-notification': {
    title: 'Push Notification using Auth0 Guardian',
    description: 'Provide a push notification using Auth0 Guardian.',
  },
  otp: {
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
): Promise<(Authenticator & FactorMeta)[]> {
  const response = await get<Authenticator[]>(`${apiBaseUrl}mfa/authenticators`, { accessToken });
  const map = new Map<MFAType, Authenticator>(response.map((f) => [f.authenticator_type, f]));

  return (Object.entries(factorsMeta) as [MFAType, FactorMeta][]).reduce(
    (acc, [type, meta]) => {
      const f = map.get(type);
      const active = f?.active ?? false;

      if (!onlyActive || active) {
        acc.push({
          id: f?.id ?? '',
          authenticator_type: type,
          oob_channels: f?.oob_channels ?? [],
          name: f?.name,
          active,
          ...meta,
        });
      }

      return acc;
    },
    [] as (Authenticator & FactorMeta)[],
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
    await del(`${baseUrl}/mfa/authenticators/${id}`, {
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
