import { post, isApiError } from '../../api';
import type {
  MfaChallenge,
  ResolveChallengeOptions,
  ResolveChallengeResponse,
  MFAType,
} from './mfa-types';

/**
 * Resolves an MFA challenge by authenticating with an existing factor.
 *
 * @param baseUrl - The base API URL (e.g. Auth0 domain or proxy).
 * @param options - Challenge resolution options including token and code.
 * @param accessToken - Access token for the request.
 * @returns Promise resolving to the challenge resolution response.
 */
export async function resolveMfaChallenge(
  baseUrl: string,
  options: ResolveChallengeOptions,
  accessToken?: string,
): Promise<ResolveChallengeResponse> {
  try {
    const url = `${baseUrl}mfa/challenge`;
    const response = await post<{ access_token: string }>(
      url,
      {
        challenge_token: options.challengeToken,
        authenticator_id: options.authenticatorId,
        otp: options.code,
      },
      { accessToken },
    );

    return {
      success: true,
      accessToken: response.access_token,
    };
  } catch (err) {
    if (isApiError(err)) {
      return {
        success: false,
        error: err.message,
      };
    }
    return {
      success: false,
      error: 'An unexpected error occurred while resolving the MFA challenge.',
    };
  }
}

/**
 * Parses an enrollment error to extract challenge information.
 *
 * @param error - The error from the enrollment attempt.
 * @returns MfaChallenge if the error contains challenge info, null otherwise.
 */
export function extractChallengeFromError(error: unknown): MfaChallenge | null {
  if (!isApiError(error)) {
    return null;
  }

  // Check if this is an MFA challenge error (typically status 401 or 403)
  if (error.status !== 401 && error.status !== 403) {
    return null;
  }

  const data = error.data;
  if (!data || typeof data !== 'object') {
    return null;
  }

  // Check for challenge-specific error codes
  const errorCode = data.error;
  if (errorCode !== 'mfa_required' && errorCode !== 'step_up_authentication_required') {
    return null;
  }

  // Extract challenge information from error data
  const challengeToken = data.challenge_token as string;
  const availableMethods = (data.available_methods as unknown[]) || [];
  const message = data.error_description as string;

  if (!challengeToken) {
    return null;
  }

  return {
    type: errorCode as 'mfa_required' | 'step_up_authentication',
    challengeToken,
    availableMethods: availableMethods
      .filter(
        (method): method is Record<string, unknown> =>
          typeof method === 'object' && method !== null,
      )
      .map((method) => ({
        type: (method.type as MFAType) || 'sms',
        authenticatorId: (method.authenticator_id as string) || '',
        name: (method.name as string) || (method.type as string) || 'Unknown',
        preferred: Boolean(method.preferred),
      })),
    message,
  };
}
