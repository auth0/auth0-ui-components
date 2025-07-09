import { CoreClientInterface, MFAControllerInterface } from '../../types';
import {
  fetchMfaFactors,
  enrollMfaRequest,
  deleteMfaFactor,
  confirmMfaEnrollmentRequest,
} from './mfa-service';
import { resolveMfaChallenge, extractChallengeFromError } from './mfa-challenge-service';
import { buildEnrollParams, buildConfirmParams } from './mfa-utils';
import type {
  Authenticator,
  EnrollMfaResponse,
  EnhancedEnrollMfaResponse,
  MFAType,
  EnrollOptions,
  ConfirmEnrollmentOptions,
  ResolveChallengeOptions,
  ResolveChallengeResponse,
} from './mfa-types';

/**
 * Controller that handles MFA-related API operations.
 */
export class MFAController implements MFAControllerInterface {
  private readonly coreClient: CoreClientInterface;

  constructor(coreClient: CoreClientInterface) {
    this.coreClient = coreClient;
  }

  /**
   * Gets the access token for MFA operations.
   */
  private async getToken(ignoreCache: boolean = false): Promise<string | undefined> {
    return this.coreClient.getToken(
      'read:authenticators remove:authenticators enroll',
      'mfa',
      ignoreCache,
    );
  }

  /**
   * Fetches the list of MFA authenticators for the current user.
   * @param onlyActive - If true, returns only factors that are actively enrolled
   * @param ignoreCache - Whether to ignore the token cache
   * @returns A promise that resolves with the list of authenticators
   */
  async fetchFactors(
    onlyActive: boolean = false,
    ignoreCache: boolean = false,
  ): Promise<Authenticator[]> {
    const baseUrl = this.coreClient.getApiBaseUrl();
    const accessToken = await this.getToken(ignoreCache);

    return fetchMfaFactors(baseUrl, accessToken, onlyActive);
  }

  /**
   * Initiates the enrollment process for a new MFA factor.
   * @param factorName - The type of factor to enroll (e.g., 'sms', 'totp')
   * @param options - Factor-specific data required for enrollment
   * @param ignoreCache - Whether to ignore the token cache
   * @returns A promise that resolves with the enrollment response
   */
  async enrollFactor(
    factorName: MFAType,
    options: EnrollOptions = {},
    ignoreCache: boolean = false,
  ): Promise<EnrollMfaResponse> {
    const baseUrl = this.coreClient.getApiBaseUrl();
    const accessToken = await this.getToken(ignoreCache);

    const params = buildEnrollParams(factorName, options);
    return enrollMfaRequest(baseUrl, params, accessToken);
  }

  /**
   * Enhanced enrollment method that handles MFA challenges.
   * If a challenge is required, it extracts the challenge information and returns it.
   * @param factorName - The type of factor to enroll
   * @param options - Factor-specific data required for enrollment
   * @param ignoreCache - Whether to ignore the token cache
   * @returns A promise that resolves with either successful enrollment or challenge requirements
   */
  async enrollFactorWithChallenge(
    factorName: MFAType,
    options: EnrollOptions = {},
    ignoreCache: boolean = false,
  ): Promise<EnhancedEnrollMfaResponse> {
    try {
      const result = await this.enrollFactor(factorName, options, ignoreCache);
      return result;
    } catch (error) {
      const challenge = extractChallengeFromError(error);
      if (challenge) {
        return { challenge };
      }
      throw error;
    }
  }

  /**
   * Resolves an MFA challenge to obtain elevated permissions.
   * @param options - Challenge resolution options
   * @param ignoreCache - Whether to ignore the token cache
   * @returns A promise that resolves with the challenge resolution result
   */
  async resolveChallenge(
    options: ResolveChallengeOptions,
    ignoreCache: boolean = false,
  ): Promise<ResolveChallengeResponse> {
    const baseUrl = this.coreClient.getApiBaseUrl();
    const accessToken = await this.getToken(ignoreCache);

    return resolveMfaChallenge(baseUrl, options, accessToken);
  }

  /**
   * Deletes a previously enrolled MFA factor.
   * @param authenticatorId - The unique ID of the authenticator to delete
   * @param ignoreCache - Whether to ignore the token cache
   * @returns A promise that resolves when the deletion is successful
   */
  async deleteFactor(authenticatorId: string, ignoreCache: boolean = false): Promise<void> {
    const baseUrl = this.coreClient.getApiBaseUrl();
    const accessToken = await this.getToken(ignoreCache);

    return deleteMfaFactor(baseUrl, authenticatorId, accessToken);
  }

  /**
   * Confirms an MFA enrollment, typically by verifying a code provided by the user.
   * @param factorName - The type of factor being confirmed
   * @param options - The verification data, such as oobCode and userOtpCode
   * @param ignoreCache - Whether to ignore the token cache
   * @returns A promise that resolves with the confirmation response from the server
   */
  async confirmEnrollment(
    factorName: MFAType,
    options: ConfirmEnrollmentOptions,
    ignoreCache: boolean = false,
  ): Promise<unknown> {
    const baseUrl = this.coreClient.getApiBaseUrl();
    const accessToken = await this.getToken(ignoreCache);

    const isProxyMode = this.coreClient.isProxyMode();
    const clientId = isProxyMode ? undefined : this.coreClient.auth.clientId;

    const params = buildConfirmParams(factorName, options, clientId);
    return confirmMfaEnrollmentRequest(baseUrl, params, accessToken);
  }
}
