import { ContentType, HeaderName } from '../../api/http-constants';
import type { ClientAuthConfig, TokenEndpointResponse } from '../../auth/auth-types';

import type {
  MfaAuthenticator,
  ChallengeMfaAuthenticatorParams,
  ChallengeResponse,
  EnrollmentResponse,
  EnrollParams,
  MfaApiClient,
  VerifyParams,
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
};

/**
 * Creates a proxy-based MFA API client.
 *
 * @param authProxyUrl - Base URL for the auth proxy.
 * @returns Proxy-based MFA API client.
 */
function createProxyMfaClient(authProxyUrl: string): MfaApiClient {
  const request = async <T>(
    path: string,
    mfaToken: string,
    options: RequestOptions = {},
  ): Promise<T> => {
    const method = options.method ?? (options.body !== undefined ? 'POST' : 'GET');

    const res = await fetch(new URL(path, authProxyUrl).href, {
      method,
      headers: {
        [HeaderName.ContentType]: ContentType.JSON,
        [HeaderName.Authorization]: `Bearer ${mfaToken}`,
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
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
      })) as MfaAuthenticator[];
    },

    enroll: async (params: EnrollParams) => {
      const raw = await request<Record<string, unknown>>('/auth/mfa/associate', params.mfaToken, {
        method: 'POST',
        body: {
          factor_type: params.factorType,
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
      } as EnrollmentResponse;
    },

    challenge: async (params: ChallengeMfaAuthenticatorParams) => {
      const raw = await request<Record<string, unknown>>('/auth/mfa/challenge', params.mfaToken, {
        method: 'POST',
        body: {
          mfa_token: params.mfaToken,
          challenge_type: params.challengeType,
          authenticator_id: params.authenticatorId,
        },
      });

      return {
        ...raw,
        challengeType: raw.challengeType ?? raw.challenge_type,
        oobCode: raw.oobCode ?? raw.oob_code,
      } as ChallengeResponse;
    },

    verify: (params: VerifyParams) =>
      request<TokenEndpointResponse>('/auth/mfa/verify', params.mfaToken, {
        method: 'POST',
        body: {
          mfa_token: params.mfaToken,
          otp: params.otp,
          binding_code: 'bindingCode' in params ? params.bindingCode : undefined,
          oob_code: 'oobCode' in params ? params.oobCode : undefined,
          recovery_code: 'recoveryCode' in params ? params.recoveryCode : undefined,
        },
      }),
  };
}
