import { get, del, isApiError, post } from '../../../api';

import { FACTOR_TYPE_PUSH_NOTIFICATION, FACTOR_TYPE_OTP } from './mfa-constants';
import type {
  Authenticator,
  EnrollMfaParams,
  EnrollMfaResponse,
  AuthenticatorType,
  MFAType,
} from './mfa-types';

export const factorsMetaKeys = new Set(['otp', 'push-notification', 'sms', 'email']);

/**
 * fetchMfaFactors
 *
 * Fetch MFA authenticators from the Auth0 API and group them by factor type.
 *
 * @param baseUrl - The base API URL (e.g., Auth0 domain or proxy).
 * @param accessToken - Optional access token for authorization.
 * @param onlyActive - Whether to filter for only active authenticators.
 *
 * @returns Promise resolving to factors grouped by type.
 */
export async function fetchMfaFactors(
  baseUrl: string,
  accessToken?: string,
  onlyActive = false,
): Promise<Record<MFAType, Authenticator[]>> {
  const response = await get<Authenticator[]>(`${baseUrl}mfa/authenticators`, {
    accessToken,
  });

  // Initialize result with empty arrays
  const result = Object.fromEntries(
    Array.from(factorsMetaKeys).map((type) => [type, [] as Authenticator[]]),
  ) as Record<MFAType, Authenticator[]>;

  // Track which factor types have any factors (active or inactive)
  const factorTypesWithFactors = new Set<string>();

  for (const factor of response) {
    const normalizedFactor = mapToAuthenticator(factor);
    const { factorName, active } = normalizedFactor;

    if (factorName && factorsMetaKeys.has(factorName)) {
      factorTypesWithFactors.add(factorName);

      if (!onlyActive || active) {
        result[factorName].push(normalizedFactor);
      }
    }
  }

  // Add placeholders only for factor types with no factors at all (not even inactive ones)
  if (!onlyActive) {
    for (const type of factorsMetaKeys) {
      if (!factorTypesWithFactors.has(type)) {
        result[type as MFAType].push(createPlaceholderFactor(type));
      }
    }
  }

  return result;
}

const FACTOR_TYPE_MAP = {
  push: FACTOR_TYPE_PUSH_NOTIFICATION,
  totp: FACTOR_TYPE_OTP,
} as const;

function normalizeFactorType(apiType: string): string {
  return FACTOR_TYPE_MAP[apiType as keyof typeof FACTOR_TYPE_MAP] || apiType;
}

/**
 * Helper function to map a raw API factor object to a normalized Authenticator.
 */
function mapToAuthenticator(factor: Authenticator): Authenticator {
  const apiType = factor.id.split('|')[0];
  const normalizedType = normalizeFactorType(apiType);

  return {
    ...factor,
    oob_channel: factor.oob_channel ?? [],
    factorName: normalizedType as MFAType,
  };
}

/**
 * Helper function to create a placeholder Authenticator object.
 */
function createPlaceholderFactor(type: string): Authenticator {
  return {
    id: '',
    authenticator_type: type as AuthenticatorType,
    oob_channel: [],
    active: false,
    factorName: type as MFAType,
    name: undefined,
  };
}

/**
 * Deletes an MFA authenticator by ID.
 *
 * @param baseUrl - The base API URL (e.g. Auth0 domain or proxy).
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
