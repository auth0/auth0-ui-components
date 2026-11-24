import { ContentType, HeaderName } from '../../api/http-constants';
import type { ClientAuthConfig } from '../../auth/auth-types';

import type {
  AssociateFields,
  EnrollmentResponse,
  EnrollParams,
  MfaApiClient,
  MfaAuthenticator,
  MfaVerifyResult,
} from './mfa-step-up-api-types';

export const createMfaApiError = (status: number, data: unknown) =>
  Object.assign(new Error(`MFA API Request Failed (${status})`), { status, data });

/**
 * Initializes an MFA API service based on auth configuration.
 *
 * @param auth - Auth details containing proxy URL or context interface.
 * @returns MFA API service instance.
 */
export function initializeMfaStepUpClient(auth: ClientAuthConfig): MfaApiClient {
  return auth.mode === 'proxy' ? createProxyMfaClient(auth.proxyUrl) : auth.contextInterface.mfa;
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  credentials?: RequestCredentials;
};

const ENROLL_FIELDS: Record<EnrollParams['factorType'], AssociateFields> = {
  otp: { authenticator_types: ['otp'] },
  sms: { authenticator_types: ['oob'], oob_channels: ['sms'] },
  voice: { authenticator_types: ['oob'], oob_channels: ['voice'] },
  email: { authenticator_types: ['oob'], oob_channels: ['email'] },
  push: { authenticator_types: ['oob'], oob_channels: ['auth0'] },
};

/**
 * Creates a proxy-based MFA API client.
 *
 * @param authProxyUrl - Base URL for the auth proxy.
 * @param customFetch - The `fetch` to send requests with. Defaults to the global one.
 * @returns Proxy-based MFA API client.
 */
export function createProxyMfaClient(
  authProxyUrl: string,
  customFetch: typeof fetch = (...args) => fetch(...args),
): MfaApiClient {
  const request = async <T>(
    path: string,
    mfaToken: string,
    options: RequestOptions = {},
  ): Promise<T> => {
    const method = options.method ?? (options.body !== undefined ? 'POST' : 'GET');

    const res = await customFetch(new URL(path, authProxyUrl).href, {
      method,
      headers: {
        [HeaderName.ContentType]: ContentType.JSON,
        [HeaderName.Authorization]: `Bearer ${mfaToken}`,
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      credentials: options.credentials,
    });

    if (!res.ok) throw createMfaApiError(res.status, await res.json().catch(() => null));
    return res.json() as Promise<T>;
  };

  return {
    getAuthenticators: async (mfaToken) => {
      const raw = await request<Record<string, unknown>[]>('/auth/mfa/authenticators', mfaToken);
      return raw.map((item) => ({
        ...item,
        authenticatorType: item.authenticatorType ?? item.authenticator_type,
        createdAt: item.createdAt ?? item.created_at,
        lastAuth: item.lastAuth ?? item.last_auth,
      })) as MfaAuthenticator[];
    },

    enroll: async (params: EnrollParams) => {
      const raw = await request<Record<string, unknown>>('/auth/mfa/associate', params.mfaToken, {
        method: 'POST',
        body: {
          ...ENROLL_FIELDS[params.factorType],
          phone_number: 'phoneNumber' in params ? params.phoneNumber : undefined,
          email: 'email' in params ? params.email : undefined,
        },
      });
      return {
        ...raw,
        authenticatorType: raw.authenticatorType ?? raw.authenticator_type,
        oobCode: raw.oobCode ?? raw.oob_code,
        oobChannel: raw.oobChannel ?? raw.oob_channel,
        barcodeUri: raw.barcodeUri ?? raw.barcode_uri,
        bindingMethod: raw.bindingMethod ?? raw.binding_method,
        recoveryCodes: raw.recoveryCodes ?? raw.recovery_codes,
      } as EnrollmentResponse;
    },

    challenge: async ({ mfaToken, challengeType, authenticatorId }) => {
      const raw = await request<Record<string, unknown>>('/auth/mfa/challenge', mfaToken, {
        method: 'POST',
        body: {
          mfa_token: mfaToken,
          challenge_type: challengeType,
          authenticator_id: authenticatorId,
        },
      });
      return {
        challengeType,
        oobCode: (raw.oobCode ?? raw.oob_code) as string | undefined,
        bindingMethod: (raw.bindingMethod ?? raw.binding_method) as string | undefined,
      };
    },

    verify: ({ mfaToken, otp, oobCode, bindingCode, recoveryCode }) =>
      request<MfaVerifyResult>('/auth/mfa/verify', mfaToken, {
        method: 'POST',
        credentials: 'include',
        body: {
          mfa_token: mfaToken,
          otp,
          oob_code: oobCode,
          binding_code: bindingCode,
          recovery_code: recoveryCode,
        },
      }),
  };
}
