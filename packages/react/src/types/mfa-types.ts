import type {
  EnrollMfaResponse,
  AuthenticatorType,
  OobChannel,
  EnrollOptions,
  ConfirmEnrollmentOptions,
} from '@auth0-web-ui-components/core';

/**
 * Represents the type of an MFA authenticator.
 *
 * Common values include:
 * - 'sms' — Phone Message: Users receive a phone message with a verification code.
 * - 'push-notification' — Push Notification using Auth0 Guardian: Provides push notifications for authentication.
 * - 'otp' — One-time Password: Uses apps like Google Authenticator for OTP codes.
 * - 'email' — Email: Sends a verification code via email.
 * - 'duo' — Duo Security: Uses Duo Security for MFA.
 * - 'webauthn-roaming' — WebAuthn with FIDO Security Keys: Supports external security keys (e.g., FIDO2).
 * - 'webauthn-platform' — WebAuthn with FIDO Device Biometrics: Uses device biometrics compliant with WebAuthn.
 * - 'recovery-code' — Recovery Code: Uses unique recovery codes to regain access.
 *
 * This type can also be extended with custom string values for other authenticators.
 */
export type MFAType =
  | 'sms'
  | 'push-notification'
  | 'totp'
  | 'email'
  | 'duo'
  | 'webauthn-roaming'
  | 'webauthn-platform'
  | 'recovery-code';

/**
 * Represents an MFA authenticator linked to a user.
 */
export interface MFAFactor {
  id: string;
  authenticator_type: AuthenticatorType;
  oob_channels?: OobChannel[];
  name?: string;
  active: boolean;
}

/**
 * Error object for MFA operations.
 * Extends the standard Error with optional code and additional details.
 */
export interface MFAError {
  message: string;
  code?: string;
}

export interface ManageMfaProps {
  localization?: Partial<MFALocaleContent>;
  hideHeader?: boolean;
  showActiveOnly?: boolean;
  disableEnroll?: boolean;
  disableDelete?: boolean;
  readOnly?: boolean;
  factorConfig?: {
    [key in MFAType]?: {
      visible?: boolean;
      enabled?: boolean;
    };
  };
  onEnroll?: () => void;
  onDelete?: () => void;
  onFetch?: () => void;
  onErrorAction?: (error: Error, action: 'enroll' | 'delete' | 'confirm') => void;
  onBeforeAction?: (
    action: 'enroll' | 'delete' | 'confirm',
    factorType: MFAType,
  ) => boolean | Promise<boolean>;
}

export interface MFAFactorContent {
  title: string;
  description: string;
}

export interface MFALocaleContent {
  title: string;
  description: string;
  no_active_mfa: string;
  sms?: MFAFactorContent;
  'push-notification'?: MFAFactorContent;
  totp?: MFAFactorContent;
  email?: MFAFactorContent;
  duo?: MFAFactorContent;
  'webauthn-roaming'?: MFAFactorContent;
  'webauthn-platform'?: MFAFactorContent;
  'recovery-code'?: MFAFactorContent;
}

/**
 * A map of language codes (e.g., 'en', 'fr') to their respective localized content.
 */
export type MFALocalizationMap = Record<string, MFALocaleContent>;

/**
 * Represents an MFA authenticator linked to a user.
 * @property {string} id - Unique identifier of the authenticator.
 * @property {string} authenticator_type - Type of the authenticator.
 * @property {string[]} [oob_channels] - Optional out-of-band channels supported.
 * @property {string} [name] - Optional name of the authenticator.
 * @property {boolean} active - Whether the authenticator is active.
 */
export interface Authenticator {
  id: string;
  authenticator_type: AuthenticatorType;
  oob_channels?: OobChannel[];
  name?: string;
  active: boolean;
  factorName?: string;
}

/**
 * Result returned by the `useMfaList` hook.
 * @property {boolean} loading - Indicates if the fetch request is in progress.
 * @property {Error | null} error - Error encountered during fetching, or null.
 * @property {Authenticator[]} factors - List of authenticators enriched with metadata.
 */
export interface UseMfaListResult {
  loading: boolean;
  error: Error | null;
  factors: (Authenticator & { factorName: string })[];
}

/**
 * Result returned by the `useDeleteMfa` hook.
 * @property {boolean} loading - Indicates if the delete operation is in progress.
 * @property {Error} [error] - Error encountered during deletion, if any.
 * @property {boolean} success - Indicates if the deletion was successful.
 */
export interface DeleteMfaResult {
  loading: boolean;
  error?: Error;
  success: boolean;
}

/**
 * Result object returned by the `useEnrollMfa` hook.
 *
 * @interface UseEnrollMfaResult
 * @property {boolean} loading - Indicates if the enrollment request is in progress.
 * @property {Error | null} error - Any error that occurred during the enrollment process.
 * @property {EnrollMfaResponse | null} response - The response from the MFA enrollment API.
 * @property {Function} enrollMfa - Function to trigger MFA enrollment with `factorName` and optional `options`.
 *    @returns {Promise<{ error: Error | null, response: EnrollMfaResponse | null }>} - Result of the enrollment request.
 */
export interface UseEnrollMfaResult {
  loading: boolean;
  error: Error | null;
  response: EnrollMfaResponse | null;
  enrollMfa: (
    factorName: MFAType,
    options?: { phone_number?: string; email?: string },
  ) => Promise<{ error: Error | null; response: EnrollMfaResponse | null }>;
}

/**
 * Result object returned by the `useConfirmEnrollment` hook.
 *
 * @property {boolean} loading - True if the confirmation request is in progress.
 * @property {Error | null} error - Any error encountered during the confirmation process.
 * @property {unknown | null} response - The response from the confirmation API request.
 * @property {(factorName: string, options: { oobCode: string, userOtpCode?: string, userEmailOtpCode?: string }) => Promise<{ error: Error | null, response: unknown | null }>} confirmEnrollment - Function to trigger MFA enrollment confirmation with the required parameters.
 */
export interface ConfirmEnrollmentResult {
  loading: boolean;
  error: Error | null;
  response: unknown | null;
  confirmEnrollment: (
    factorName: string,
    options: {
      oobCode?: string;
      userOtpCode?: string;
      userEmailOtpCode?: string;
    },
  ) => Promise<{ error: Error | null; response: unknown | null }>;
}

/**
 * Result returned by the `useMFA` hook.
 * Provides methods to fetch, enroll, and delete MFA authenticators.
 */
export type UseMFAResult = {
  /**
   * Fetch the list of MFA authenticators.
   * @param onlyActive - Whether to return only active authenticators.
   * @returns A promise resolving to either an error or an array of authenticators.
   */
  fetchFactors: (onlyActive?: boolean) => Promise<{
    error: Error | null;
    response: Authenticator[] | null;
  }>;

  /**
   * Enroll a new MFA factor (e.g., SMS, TOTP, Email).
   * @param factorName - The type of MFA to enroll.
   * @param options - Optional options like phone number or email.
   * @returns A promise resolving to either an error or the enrollment response.
   */
  enrollMfa: (
    factorName: MFAType,
    options?: EnrollOptions,
  ) => Promise<{
    error: Error | null;
    response: EnrollMfaResponse | null;
  }>;

  /**
   * Delete an enrolled MFA authenticator by its ID.
   * @param authenticatorId - The ID of the authenticator to delete.
   * @returns A promise resolving to either an error or a success flag.
   */
  deleteMfa: (authenticatorId: string) => Promise<{ error: Error | null; success: boolean }>;

  /**
   * Confirm MFA enrollment with OOB code and user OTP code.
   * @param factorName The MFA factor type.
   * @param options The confirmation codes required to verify enrollment.
   */
  confirmEnrollment: (
    factorName: MFAType,
    options: ConfirmEnrollmentOptions,
  ) => Promise<ConfirmEnrollmentResult>;
};
