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
  factorName?: MFAType;
}

export type MFAType =
  | 'sms'
  | 'push-notification'
  | 'totp'
  | 'email'
  | 'duo'
  | 'webauthn-roaming'
  | 'webauthn-platform'
  | 'recovery-code';

export type AuthenticatorType = 'otp' | 'oob';
export type OobChannel = 'auth0' | 'sms' | 'voice' | 'email';

/**
 * Parameters required to enroll a new MFA (Multi-Factor Authentication) authenticator via the `/mfa/associate` endpoint.
 *
 * - `authenticator_types`: Array of authenticator types to enroll; must include 'otp' or 'oob'.
 * - `oob_channels`: Required if `authenticator_types` includes 'oob'; specifies out-of-band channels such as 'auth0', 'sms', 'voice', or 'email'.
 * - `phone_number`: Required if `oob_channels` includes 'sms' or 'voice'; phone number in international format for SMS or voice verification.
 * - `email`: Required if `oob_channels` includes 'email'; email address for email verification.
 */
export interface EnrollMfaParams {
  authenticator_types: AuthenticatorType[];
  oob_channels?: OobChannel[];
  phone_number?: string;
  email?: string;
}

/**
 * Response from the `/mfa/associate` endpoint after enrolling an MFA authenticator.
 *
 * - `oob_code`: The code used for out-of-band authentication (if applicable).
 * - `binding_method`: Indicates the binding method used for the authenticator.
 * - `authenticator_type`: The type of authenticator added (e.g., 'otp', 'oob').
 * - `oob_channels`: The out-of-band channels used (e.g., 'sms', 'voice').
 * - `recovery_codes`: Array of recovery codes generated for the user.
 */
export interface EnrollMfaResponse {
  oob_code?: string;
  binding_method?: string;
  authenticator_type?: string;
  oob_channels?: string;
  recovery_codes?: string[];
  barcode_uri?: string;
  secret?: string;
}
