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
 * Initializes a Step-Up API service instance based on auth configuration
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
 * Creates an MFA client for proxy mode
 */
function createProxyMfaClient(authProxyUrl: string): Omit<MfaApiClient, 'getEnrollmentFactors'> {
  const baseUrl = authProxyUrl.replace(/\/$/, '');

  const handleResponse = async <T>(response: Response): Promise<T> => {
    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw Object.assign(new Error(errorBody.error_description || `HTTP ${response.status}`), {
        status: response.status,
        body: errorBody,
        ...errorBody,
      });
    }
    return response.json();
  };

  return {
    getAuthenticators: async (mfaToken: string) => {
      const response = await fetch(`${baseUrl}/auth/mfa/authenticators?mfa_token=${mfaToken}`);
      return handleResponse<Authenticator[]>(response);
    },

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

      const response = await fetch(`${baseUrl}/auth/mfa/enroll`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      return handleResponse<EnrollmentResponse>(response);
    },

    challenge: async (params: ChallengeAuthenticatorParams) => {
      const response = await fetch(`${baseUrl}/auth/mfa/challenge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mfaToken: params.mfaToken,
          challengeType: params.challengeType,
          authenticatorId: params.authenticatorId,
        }),
      });
      return handleResponse<ChallengeResponse>(response);
    },

    verify: async (params: VerifyParams) => {
      const response = await fetch(`${baseUrl}/auth/mfa/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      return handleResponse<TokenEndpointResponse>(response);
    },
  };
}
