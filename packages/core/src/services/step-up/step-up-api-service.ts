import { createProxyHttpClient } from '../../api/proxy-http-client';
import type {
  AuthDetails,
  Authenticator,
  ChallengeAuthenticatorParams,
  ChallengeResponse,
  EnrollmentResponse,
  EnrollParams,
  MfaApiClient,
  TokenEndpointResponse,
  VerifyParams,
} from '../../auth/auth-types';

/**
 * Step-Up Authentication API Service
 *
 * Provides MFA operations for both SPA and proxy modes:
 * - SPA mode: Returns Auth0 SDK's MFA client directly
 * - Proxy mode: Creates proxy-based MFA client
 */
export type StepUpApiService = MfaApiClient;

/**
 * Initializes a Step-Up API service instance based on auth configuration.
 *
 * @param auth - Auth details containing proxy URL or context interface.
 * @returns Step-Up API service instance.
 */
export function initializeStepUpApiService(auth: AuthDetails): StepUpApiService {
  if (auth.authProxyUrl) {
    return createProxyMfaClient(auth.authProxyUrl) as StepUpApiService;
  }

  if (!auth.contextInterface) {
    throw new Error('StepUpApiService: contextInterface is not initialized.');
  }

  return auth.contextInterface.mfa;
}

/**
 * Creates an MFA client for proxy mode.
 *
 * @param authProxyUrl - Base URL for the auth proxy.
 * @returns Proxy-based MFA client.
 */
function createProxyMfaClient(authProxyUrl: string): Omit<MfaApiClient, 'getEnrollmentFactors'> {
  const { get, post } = createProxyHttpClient(authProxyUrl);

  return {
    getAuthenticators: async (mfaToken: string) =>
      get<Authenticator[]>('/auth/mfa/authenticators', { mfa_token: mfaToken }),

    enroll: async (params: EnrollParams) => {
      const body: Record<string, unknown> = {
        mfaToken: params.mfaToken,
        authenticatorTypes: [params.factorType],
      };

      if (params.factorType === 'sms' || params.factorType === 'voice') {
        body.phoneNumber = params.phoneNumber;
      } else if (params.factorType === 'email' && 'email' in params && params.email) {
        body.email = params.email;
      }

      return post<EnrollmentResponse>('/auth/mfa/enroll', body);
    },

    challenge: async (params: ChallengeAuthenticatorParams) =>
      post<ChallengeResponse>('/auth/mfa/challenge', {
        mfaToken: params.mfaToken,
        challengeType: params.challengeType,
        authenticatorId: params.authenticatorId,
      }),

    verify: async (params: VerifyParams) => post<TokenEndpointResponse>('/auth/mfa/verify', params),
  };
}
