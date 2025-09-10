import type { CoreClientInterface } from '../../../auth/auth-types';

import {
  fetchMfaFactors,
  enrollMfaRequest,
  deleteMfaFactor,
  confirmMfaEnrollmentRequest,
} from './mfa-service';
import type {
  Authenticator,
  EnrollMfaResponse,
  MFAType,
  EnrollOptions,
  ConfirmEnrollmentOptions,
  MFAControllerInterface,
} from './mfa-types';
import { buildEnrollParams, buildConfirmParams } from './mfa-utils';

/**
 * Pure functional utilities for Multi-Factor Authentication (MFA) API operations.
 */
const MFAUtils = {
  /**
   * Retrieves an access token with appropriate MFA scopes for performing MFA operations.
   *
   * @param coreClient - The core client interface for token operations
   * @param ignoreCache - Whether to bypass token cache and request fresh token
   * @returns Promise resolving to access token or undefined in proxy mode
   */
  async getToken(
    coreClient: CoreClientInterface,
    ignoreCache: boolean = false,
  ): Promise<string | undefined> {
    return coreClient.getToken(
      'read:authenticators remove:authenticators enroll',
      'mfa',
      ignoreCache,
    );
  },

  /**
   * Fetches all MFA factors (authenticators) for the authenticated user.
   *
   * @param coreClient - The core client interface for API operations
   * @param onlyActive - Whether to return only active factors or all factors
   * @param ignoreCache - Whether to bypass token cache for fresh authentication
   * @returns Promise resolving to factors grouped by type
   */
  async fetchFactors(
    coreClient: CoreClientInterface,
    onlyActive: boolean = false,
    ignoreCache: boolean = false,
  ): Promise<Record<MFAType, Authenticator[]>> {
    const baseUrl = coreClient.getApiBaseUrl();
    const accessToken = await MFAUtils.getToken(coreClient, ignoreCache);
    return fetchMfaFactors(baseUrl, accessToken, onlyActive);
  },

  /**
   * Initiates enrollment of a new MFA factor for the user.
   *
   * @param coreClient - The core client interface for API operations
   * @param factorName - The type of MFA factor to enroll (e.g., 'otp', 'sms')
   * @param options - Optional enrollment parameters specific to the factor type
   * @param ignoreCache - Whether to bypass token cache for fresh authentication
   * @returns Promise resolving to enrollment response with QR codes or setup instructions
   */
  async enrollFactor(
    coreClient: CoreClientInterface,
    factorName: MFAType,
    options: EnrollOptions = {},
    ignoreCache: boolean = false,
  ): Promise<EnrollMfaResponse> {
    const baseUrl = coreClient.getApiBaseUrl();
    const accessToken = await MFAUtils.getToken(coreClient, ignoreCache);
    const params = buildEnrollParams(factorName, options);
    return enrollMfaRequest(baseUrl, params, accessToken);
  },

  /**
   * Deletes an existing MFA factor from the user's account.
   *
   * @param coreClient - The core client interface for API operations
   * @param authenticatorId - The unique identifier of the authenticator to delete
   * @param ignoreCache - Whether to bypass token cache for fresh authentication
   * @returns Promise that resolves when the factor is successfully deleted
   */
  async deleteFactor(
    coreClient: CoreClientInterface,
    authenticatorId: string,
    ignoreCache: boolean = false,
  ): Promise<void> {
    const baseUrl = coreClient.getApiBaseUrl();
    const accessToken = await MFAUtils.getToken(coreClient, ignoreCache);
    return deleteMfaFactor(baseUrl, authenticatorId, accessToken);
  },

  /**
   * Confirms enrollment of an MFA factor by providing verification code or proof.
   *
   * @param coreClient - The core client interface for API operations
   * @param factorName - The type of MFA factor being confirmed
   * @param options - Confirmation parameters including verification codes
   * @param ignoreCache - Whether to bypass token cache for fresh authentication
   * @returns Promise resolving to confirmation result
   */
  async confirmEnrollment(
    coreClient: CoreClientInterface,
    factorName: MFAType,
    options: ConfirmEnrollmentOptions,
    ignoreCache: boolean = false,
  ): Promise<unknown> {
    const baseUrl = coreClient.getApiBaseUrl();
    const accessToken = await MFAUtils.getToken(coreClient, ignoreCache);
    const isProxyMode = coreClient.isProxyMode();
    const clientId = isProxyMode ? undefined : coreClient.auth.clientId;
    const params = buildConfirmParams(factorName, options, clientId, accessToken);
    return confirmMfaEnrollmentRequest(baseUrl, params, accessToken);
  },
};

/**
 * Creates an MFA controller interface that provides comprehensive Multi-Factor Authentication management.
 *
 * @param coreClient - The core client interface that provides authentication context and API access
 * @returns An MFA controller interface with all MFA management capabilities
 */
export function createMFAController(coreClient: CoreClientInterface): MFAControllerInterface {
  return {
    /**
     * Fetches MFA factors (authenticators) associated with the authenticated user.
     *
     * @param onlyActive - If true, returns only active/confirmed factors. If false, returns all factors including pending ones
     * @param ignoreCache - If true, bypasses token cache and requests fresh authentication
     * @returns Promise resolving to array of authenticator objects with details like ID, type, and status
     */
    async fetchFactors(
      onlyActive: boolean = false,
      ignoreCache: boolean = false,
    ): Promise<Record<MFAType, Authenticator[]>> {
      return MFAUtils.fetchFactors(coreClient, onlyActive, ignoreCache);
    },

    /**
     * Initiates enrollment of a new MFA factor for the user.
     *
     * @param factorName - The type of MFA factor to enroll ('otp' for TOTP, 'sms', etc.)
     * @param options - Factor-specific enrollment options (phone number for SMS, etc.)
     * @param ignoreCache - If true, bypasses token cache and requests fresh authentication
     * @returns Promise resolving to enrollment response containing QR codes, secrets, or setup instructions
     */
    async enrollFactor(
      factorName: MFAType,
      options: EnrollOptions = {},
      ignoreCache: boolean = false,
    ): Promise<EnrollMfaResponse> {
      return MFAUtils.enrollFactor(coreClient, factorName, options, ignoreCache);
    },

    /**
     * Permanently removes an MFA factor from the user's account.
     *
     * @param authenticatorId - The unique identifier of the authenticator to delete
     * @param ignoreCache - If true, bypasses token cache and requests fresh authentication
     * @returns Promise that resolves when the factor is successfully removed
     */
    async deleteFactor(authenticatorId: string, ignoreCache: boolean = false): Promise<void> {
      return MFAUtils.deleteFactor(coreClient, authenticatorId, ignoreCache);
    },

    /**
     * Confirms and activates an MFA factor enrollment by providing verification proof.
     *
     * @param factorName - The type of MFA factor being confirmed
     * @param options - Confirmation options including OTP codes, authenticator ID, etc.
     * @param ignoreCache - If true, bypasses token cache and requests fresh authentication
     * @returns Promise resolving to confirmation result indicating success/failure
     */
    async confirmEnrollment(
      factorName: MFAType,
      options: ConfirmEnrollmentOptions,
      ignoreCache: boolean = false,
    ): Promise<unknown> {
      return MFAUtils.confirmEnrollment(coreClient, factorName, options, ignoreCache);
    },
  };
}
