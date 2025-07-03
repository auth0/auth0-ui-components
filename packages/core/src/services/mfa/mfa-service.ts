import { get, del, isApiError, post } from '../../api';
import type {
  Authenticator,
  EnrollMfaParams,
  EnrollMfaResponse,
  AuthenticatorType,
  MFAType,
} from './mfa-types';

export const factorsMetaKeys = new Set([
  'sms',
  'push-notification',
  'totp',
  'email',
  'duo',
  'webauthn-roaming',
  'webauthn-platform',
  'recovery-code',
]);

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
): Promise<Authenticator[]> {
  const response = await get<Authenticator[]>(`${apiBaseUrl}mfa/authenticators`, {
    accessToken,
  });

  const map = new Map<string, Authenticator>(response.map((f) => [f.id.split('|')[0], f]));

  return Array.from(factorsMetaKeys).reduce<Authenticator[]>((acc, type) => {
    const factor = map.get(type);

    if (onlyActive && !factor?.active) return acc;

    const factorName = (factor?.id?.split('|')[0] ?? type) as MFAType;

    acc.push({
      id: factor?.id ?? '',
      authenticator_type: (factor?.authenticator_type ?? type) as AuthenticatorType,
      oob_channels: factor?.oob_channels ?? [],
      active: factor?.active ?? false,
      factorName,
    });

    return acc;
  }, []);
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
 * @param accessToken - Access token.
 * @returns EnrollMfaResponse from Auth0.
 */
export async function enrollMfaRequest(
  baseUrl: string,
  params: EnrollMfaParams,
  accessToken?: string,
): Promise<EnrollMfaResponse> {
  const url = `${baseUrl}mfa/associate`;
  return await post<EnrollMfaResponse>(url, params, { accessToken });
}

/**
 * Performs the MFA confirmation API call.
 *
 * @param baseUrl - The base API URL (e.g. Auth0 domain or proxy).
 * @param data - Data needed to confirm MFA enrollment (depending on MFA type).
 * @param accessToken - Access token.
 * @returns Response from Auth0.
 */
export async function confirmMfaEnrollmentRequest(
  baseUrl: string,
  data: {
    grant_type: string;
    oob_code?: string;
    otp?: string;
    binding_code?: string;
    client_id?: string;
    client_secret?: string;
  },
  accessToken?: string,
): Promise<unknown> {
  const url = `${baseUrl}oauth/token`;

  return await post<unknown>(url, data, { accessToken });
}
