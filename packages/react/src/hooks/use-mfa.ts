import { useCallback, useMemo } from 'react';
import { useComponentConfig } from './use-config';
import { useAccessToken } from './use-access-token';
import {
  fetchMfaFactors,
  enrollMfaRequest,
  deleteMfaFactor,
  confirmMfaEnrollmentRequest,
  createTranslator,
} from '@auth0-web-ui-components/core';
import type {
  MFAType,
  EnrollMfaParams,
  EnrollMfaResponse,
  Authenticator,
  ConfirmMfaEnrollmentParams,
} from '@auth0-web-ui-components/core';
import type { EnrollOptions } from '@/types';
import {
  FACTOR_TYPE_EMAIL,
  FACTOR_TYPE_PUSH_NOTIFICATION,
  FACTOR_TYPE_SMS,
  FACTOR_TYPE_TOPT,
} from '@/lib/constants';

/**
 * Describes the methods returned by the `useMFA` hook for managing multi-factor authentication.
 * @interface UseMfaResult
 */
export interface UseMfaResult {
  /**
   * Fetches the list of MFA authenticators for the current user.
   * @param {boolean} [onlyActive=false] - If true, returns only factors that are actively enrolled.
   * @returns {Promise<Authenticator[]>} A promise that resolves with the list of authenticators.
   * @throws An error if the API request fails or prerequisites (e.g., `apiBaseUrl`) are missing.
   */
  fetchFactors: (onlyActive?: boolean) => Promise<Authenticator[]>;
  /**
   * Initiates the enrollment process for a new MFA factor.
   * @param {MFAType} factorName - The type of factor to enroll (e.g., 'sms', 'totp').
   * @param {EnrollOptions} [options={}] - Factor-specific data required for enrollment (e.g., `phone_number` for SMS).
   * @returns {Promise<EnrollMfaResponse>} A promise that resolves with the enrollment response, which may contain data like an `oob_code` or QR code URI.
   * @throws An error if the API request fails or required options are missing.
   */
  enrollMfa: (factorName: MFAType, options?: EnrollOptions) => Promise<EnrollMfaResponse>;
  /**
   * Deletes a previously enrolled MFA factor.
   * @param {string} authenticatorId - The unique ID of the authenticator to delete.
   * @returns {Promise<void>} A promise that resolves when the deletion is successful.
   * @throws An error if the API request fails.
   */
  deleteMfa: (authenticatorId: string) => Promise<void>;
  /**
   * Confirms an MFA enrollment, typically by verifying a code provided by the user.
   * @param {MFAType} factorName - The type of factor being confirmed.
   * @param {object} options - The verification data, such as `oobCode` and `userOtpCode`.
   * @returns {Promise<unknown>} A promise that resolves with the confirmation response from the server.
   * @throws An error if the API request fails or prerequisites are missing.
   */
  confirmEnrollment: (
    factorName: MFAType,
    options: { oobCode?: string; userOtpCode?: string; userEmailOtpCode?: string },
  ) => Promise<unknown>;
}

/**
 * A custom React hook for managing all Multi-Factor Authentication (MFA) operations.
 *
 * This hook abstracts the complexity of fetching, enrolling, confirming, and deleting MFA factors.
 * It handles access token management automatically and provides a clean, promise-based API
 * for interacting with the MFA endpoints in either a proxy or non-proxy environment.
 *
 * @returns {UseMfaResult} An object containing the functions to manage MFA factors.
 */
export function useMFA(): UseMfaResult {
  const { authDetails, apiBaseUrl, isProxyMode } = useComponentConfig();
  const t = useMemo(() => createTranslator('common'), []);
  const mfaScopes = ['read:authenticators', 'remove:authenticators', 'enroll'];

  const { getToken: getMfaToken } = useAccessToken(mfaScopes.join(' '), 'mfa');

  /**
   * A higher-order function that handles token fetching and prerequisite validation
   * before executing a given API task.
   * @param task - The async function to execute, which receives the optional access token.
   * @private
   */
  const withMfaToken = useCallback(
    async <T>(task: (token?: string) => Promise<T>): Promise<T> => {
      if (!apiBaseUrl) throw new Error(t('errors.missing_base_url')!);

      const token = isProxyMode ? undefined : await getMfaToken();
      if (!isProxyMode && !token) throw new Error(t('errors.missing_access_token')!);

      return task(token);
    },
    [apiBaseUrl, isProxyMode, getMfaToken, t],
  );

  /**
   * Builds the parameters for an MFA enrollment request.
   * @private
   */
  const buildEnrollParams = (factorName: MFAType, options: EnrollOptions = {}): EnrollMfaParams => {
    switch (factorName) {
      case FACTOR_TYPE_SMS:
        if (!options.phone_number) throw new Error(t('errors.phone_number_required'));
        return {
          authenticator_types: ['oob'],
          oob_channels: ['sms'],
          phone_number: options.phone_number,
        };
      case FACTOR_TYPE_EMAIL:
        if (!options.email) throw new Error(t('errors.email_required'));
        return { authenticator_types: ['oob'], oob_channels: ['email'], email: options.email };
      case FACTOR_TYPE_TOPT:
        return { authenticator_types: ['otp'] };
      case FACTOR_TYPE_PUSH_NOTIFICATION:
        return { authenticator_types: ['oob'], oob_channels: ['auth0'] };
      default:
        throw new Error(t('errors.email_required', { factorName }));
    }
  };

  /**
   * Builds the parameters for an MFA confirmation request.
   * @private
   */
  const buildConfirmParams = (
    factorName: MFAType,
    options: { oobCode?: string; userOtpCode?: string; userEmailOtpCode?: string },
    token?: string,
  ): ConfirmMfaEnrollmentParams => {
    const baseParams: ConfirmMfaEnrollmentParams = {
      grant_type:
        factorName === FACTOR_TYPE_TOPT
          ? 'http://auth0.com/oauth/grant-type/mfa-otp'
          : 'http://auth0.com/oauth/grant-type/mfa-oob',
      oob_code: options.oobCode,
      client_id: !isProxyMode ? authDetails?.clientId : undefined,
      mfa_token: token,
    };

    if (factorName === FACTOR_TYPE_TOPT) {
      baseParams.otp = options.userOtpCode;
    } else if (
      [FACTOR_TYPE_SMS, FACTOR_TYPE_EMAIL, FACTOR_TYPE_PUSH_NOTIFICATION].includes(factorName)
    ) {
      baseParams.binding_code =
        factorName === FACTOR_TYPE_SMS
          ? options.userOtpCode
          : factorName === FACTOR_TYPE_EMAIL
            ? options.userEmailOtpCode
            : options.userOtpCode;
    }
    return baseParams;
  };

  const fetchFactors = useCallback(
    (onlyActive = false) =>
      withMfaToken((token) => fetchMfaFactors(apiBaseUrl!, token, onlyActive)),
    [withMfaToken, apiBaseUrl],
  );

  const enrollMfa = useCallback(
    (factorName: MFAType, options: EnrollOptions = {}) =>
      withMfaToken((token) => {
        const params = buildEnrollParams(factorName, options);
        return enrollMfaRequest(apiBaseUrl!, params, token);
      }),
    [withMfaToken, apiBaseUrl],
  );

  const deleteMfa = useCallback(
    (authenticatorId: string) =>
      withMfaToken((token) => deleteMfaFactor(apiBaseUrl!, authenticatorId, token)),
    [withMfaToken, apiBaseUrl],
  );

  const confirmEnrollment = useCallback(
    (
      factorName: MFAType,
      options: { oobCode?: string; userOtpCode?: string; userEmailOtpCode?: string },
    ) =>
      withMfaToken((token) => {
        if (!isProxyMode && !authDetails?.domain) throw new Error(t('errors.missing_domain')!);
        const params = buildConfirmParams(factorName, options, token);
        return confirmMfaEnrollmentRequest(apiBaseUrl!, params, token);
      }),
    [withMfaToken, apiBaseUrl, isProxyMode, authDetails, t],
  );

  return {
    fetchFactors,
    enrollMfa,
    deleteMfa,
    confirmEnrollment,
  };
}
