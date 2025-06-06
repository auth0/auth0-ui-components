import { AuthenticatorType, OobChannel } from '@auth0-web-ui-components/core';

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
  displayName?: string;
  description?: string;
  status?: string;
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
  localization?: MFALocalizationMap;
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
  onErrorAction?: (error: Error, action: 'enroll' | 'delete') => void;
  onBeforeAction?: (action: 'enroll' | 'delete', factorType: MFAType) => boolean | Promise<boolean>;
}

/**
 * Represents the localized content for a single language.
 */
export interface MFALocaleContent {
  title: string;
  description: string;
}

/**
 * A map of language codes (e.g., 'en', 'fr') to their respective localized content.
 */
export type MFALocalizationMap = Record<string, MFALocaleContent>;
