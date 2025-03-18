import { useCallback } from 'react';
import { useComponentConfig } from './use-config';
import { useI18n } from './use-i18n';
import { useAccessToken } from './use-access-token';
import {
  fetchMfaFactors,
  enrollMfaRequest,
  deleteMfaFactor,
  confirmMfaEnrollmentRequest,
} from '@auth0-web-ui-components/core';
import type { MFAType, EnrollMfaParams, EnrollMfaResponse } from '@auth0-web-ui-components/core';
import type { EnrollOptions } from '@/types';

/**
 * Custom React hook to manage Multi-Factor Authentication (MFA) operations.
 *
 * This hook provides methods to:
 * - Fetch enrolled MFA factors for the authenticated user.
 * - Enroll the user in new MFA factors such as SMS, TOTP, Email, and Push Notification.
 * - Delete enrolled MFA factors.
 * - Confirm MFA enrollment using an out-of-band (OOB) code and user OTP input.
 *
 * The hook handles:
 * - Access token retrieval with required MFA scopes (unless in proxy mode).
 * - Validation of necessary configuration and inputs before making API requests.
 * - Support for both proxy and RWA environments.
 *
 * @returns {object} An object with the following methods:
 *  - `fetchFactors(onlyActive?: boolean): Promise<{ error: Error | null; response: Authenticator[] | null }>`
 *    Fetches MFA authenticators enrolled by the user. If `onlyActive` is true, returns only active factors.
 *
 *  - `enrollMfa(factorName: MFAType, options?: EnrollOptions): Promise<{ error: Error | null; response: EnrollMfaResponse | null }>`
 *    Enrolls the user in a specified MFA factor. Requires factor-specific options like phone number or email for SMS/Email.
 *
 *  - `deleteMfa(authenticatorId: string): Promise<{ error: Error | null; success: boolean }>`
 *    Deletes an enrolled MFA factor by ID.
 *
 *  - `confirmEnrollment(factorName: MFAType, options: { oobCode: string; userOtpCode?: string; userEmailOtpCode?: string }): Promise<{ error: Error | null; response: unknown | null }>`
 *    Confirms an MFA enrollment by verifying OTP codes sent via OOB methods (SMS, Email, TOTP, Push).
 */
export function useMFA() {
  const {
    config: { authDetails, apiBaseUrl, isProxyMode },
  } = useComponentConfig();
  const t = useI18n('common');

  // Scopes needed for MFA management when not in proxy mode
  const mfaScopes = ['read:authenticators', 'remove:authenticators', 'enroll'];

  // Retrieve access token with MFA scopes unless in proxy mode
  const { token: fetchedToken } = isProxyMode
    ? { token: undefined }
    : useAccessToken(mfaScopes.join(' '), 'mfa');

  const accessToken = isProxyMode ? undefined : fetchedToken;

  /**
   * Validates that all required config values and tokens are available before API calls.
   * Throws a translated error if validation fails.
   *
   * @throws {Error} When required values like API base URL, access token, or domain are missing.
   */
  function validatePrerequisites(): void {
    if (!apiBaseUrl) throw new Error(t('errors.missing_base_url')!);
    if (!isProxyMode && !accessToken) throw new Error(t('errors.missing_access_token')!);
    if (!isProxyMode && !authDetails?.domain) throw new Error(t('errors.missing_domain')!);
  }

  /**
   * Constructs enrollment parameters for a specific MFA factor.
   *
   * @param {MFAType} factorName - The MFA factor to enroll (e.g., 'sms', 'totp', 'email', 'push-notification').
   * @param {EnrollOptions} [options] - Additional data needed for enrollment like phone number or email.
   * @returns {EnrollMfaParams} Parameters formatted for the enroll MFA API request.
   *
   * @throws {Error} If required fields are missing for the chosen factor (e.g., phone number for SMS).
   */
  const buildEnrollParams = (factorName: MFAType, options: EnrollOptions = {}): EnrollMfaParams => {
    switch (factorName) {
      case 'sms':
        return {
          authenticator_types: ['oob'],
          oob_channels: ['sms'],
          phone_number: options.phone_number,
        };
      case 'totp':
        return { authenticator_types: ['otp'] };
      case 'push-notification':
        return { authenticator_types: ['oob'], oob_channels: ['auth0'] };
      case 'email':
        return {
          authenticator_types: ['oob'],
          oob_channels: ['email'],
          email: options.email,
        };
      default:
        throw new Error(`Unsupported MFA type: ${factorName}`);
    }
  };

  /**
   * Fetches the list of MFA authenticators for the current user.
   *
   * @param {boolean} [onlyActive=false] - If true, only returns active/enrolled factors.
   * @returns {Promise<Authenticator[]>}
   * Returns the list of authenticators if successful.
   * @throws {Error} If an error occurs while fetching MFA factors.
   */
  const fetchFactors = useCallback(
    async (onlyActive = false) => {
      if (!isProxyMode) validatePrerequisites();
      return fetchMfaFactors(apiBaseUrl!, accessToken ?? undefined, onlyActive);
    },
    [apiBaseUrl, accessToken, isProxyMode],
  );

  /**
   * Enrolls the user in a specified MFA (Multi-Factor Authentication) factor.
   *
   * This function prepares and sends an enrollment request for a given MFA factor
   * (e.g. `sms`, `email`, `totp`) using the provided options such as phone number or email.
   *
   * Prerequisites (like API base URL and access token) must be valid beforehand,
   * or this function will throw an error.
   *
   * @param {MFAType} factorName - The MFA factor to enroll in (e.g. 'sms', 'email').
   * @param {EnrollOptions} [options={}] - Optional enrollment data such as phone number or email address.
   *                                       These are required for some factors (e.g., `sms`, `email`).
   * @returns {Promise<EnrollMfaResponse>} Resolves with the server's enrollment response on success.
   * @throws {Error} Throws if prerequisites are invalid, or if the API request fails.
   */
  const enrollMfa = useCallback(
    async (factorName: MFAType, options: EnrollOptions = {}): Promise<EnrollMfaResponse> => {
      if (!isProxyMode) validatePrerequisites();
      const params = buildEnrollParams(factorName, options);
      const response = await enrollMfaRequest(apiBaseUrl!, params, accessToken ?? undefined);
      return response;
    },
    [apiBaseUrl, accessToken],
  );

  /**
   * Deletes an enrolled MFA factor by its authenticator ID.
   *
   * @param {string} authenticatorId - The ID of the authenticator to delete.
   * @returns {Promise<void>}
   * Throws an error if deletion fails.
   */
  const deleteMfa = useCallback(
    async (authenticatorId: string): Promise<void> => {
      if (!isProxyMode) validatePrerequisites();
      await deleteMfaFactor(apiBaseUrl!, authenticatorId, accessToken ?? undefined);
    },
    [apiBaseUrl, accessToken],
  );

  /**
   * Confirms MFA enrollment by verifying an out-of-band code and user OTP code.
   *
   * @param {MFAType} factorName - The MFA factor type ('sms', 'email', 'totp', 'push-notification').
   * @param {object} options - Options including:
   *   - `oobCode` (string): The out-of-band code sent to the user.
   *   - `userOtpCode` (string, optional): The OTP entered by the user for SMS, TOTP, or push notification.
   *   - `userEmailOtpCode` (string, optional): The OTP entered by the user for email.
   * @returns {Promise<unknown | null>}
   * Returns either an error or the API confirmation response.
   */
  const confirmEnrollment = useCallback(
    async (
      factorName: MFAType,
      options: { oobCode?: string; userOtpCode?: string; userEmailOtpCode?: string },
    ): Promise<unknown | null> => {
      // Validate prerequisites
      if (!isProxyMode) validatePrerequisites();
      const baseData: {
        grant_type: string;
        oob_code?: string;
        otp?: string;
        binding_code?: string;
        client_id?: string | undefined;
        mfa_token?: string | undefined;
      } = {
        grant_type:
          factorName === 'totp'
            ? 'http://auth0.com/oauth/grant-type/mfa-otp'
            : 'http://auth0.com/oauth/grant-type/mfa-oob',
        oob_code: options?.oobCode,
        client_id: !isProxyMode ? authDetails?.clientId : undefined,
        mfa_token: accessToken ?? undefined,
      };

      // Add OTP or binding code depending on the factor type
      if (factorName === 'totp') {
        baseData.otp = options.userOtpCode;
      } else if (['sms', 'email', 'push-notification'].includes(factorName)) {
        baseData.binding_code =
          factorName === 'sms'
            ? options.userOtpCode
            : factorName === 'email'
              ? options.userEmailOtpCode
              : options.userOtpCode;
      }

      const confirmResponse = await confirmMfaEnrollmentRequest(
        apiBaseUrl!,
        baseData,
        accessToken ?? undefined,
      );
      return confirmResponse;
    },
    [apiBaseUrl, accessToken, isProxyMode, t],
  );

  return {
    fetchFactors,
    enrollMfa,
    deleteMfa,
    confirmEnrollment,
  };
}
