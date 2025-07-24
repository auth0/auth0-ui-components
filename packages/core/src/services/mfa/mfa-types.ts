import { SafeAny } from '@core/types';

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
  oob_channel?: OobChannel[];
  name?: string;
  active: boolean;
  factorName?: MFAType;
}

/**
 * Represents the type of an MFA authenticator.
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

export type AuthenticatorType = 'otp' | 'oob';
export type OobChannel = 'auth0' | 'sms' | 'voice' | 'email';

/**
 * Parameters required to enroll a new MFA (Multi-Factor Authentication) authenticator via the `/mfa/associate` endpoint.
 */
export interface EnrollMfaParams {
  authenticator_types: AuthenticatorType[];
  oob_channels?: OobChannel[];
  phone_number?: string;
  email?: string;
}

/**
 * Response from the `/mfa/associate` endpoint after enrolling an MFA authenticator.
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

/**
 * Parameters required to confirm an MFA enrollment, typically sent to an OAuth token endpoint
 * to verify the user's possession of the factor.
 * @property {'http://auth0.com/oauth/grant-type/mfa-otp' | 'http://auth0.com/oauth/grant-type/mfa-oob'} grant_type - The grant type specifying the MFA method.
 * @property {string} [client_id] - The application's client ID.
 * @property {string} [mfa_token] - The access token with MFA scopes, obtained after login.
 * @property {string} [oob_code] - The out-of-band code received from the enrollment initiation step.
 * @property {string} [binding_code] - The code entered by the user to bind an OOB factor (e.g., the code from an SMS or email).
 * @property {string} [otp] - The time-based one-time password from an authenticator app (for TOTP).
 */
export interface ConfirmMfaEnrollmentParams {
  grant_type:
    | 'http://auth0.com/oauth/grant-type/mfa-otp'
    | 'http://auth0.com/oauth/grant-type/mfa-oob';
  client_id?: string;
  mfa_token?: string;
  oob_code?: string;
  binding_code?: string;
  otp?: string;
  client_secret?: string;
}

/**
 * Options for enrolling in MFA factors.
 */
export interface EnrollOptions {
  phone_number?: string;
  email?: string;
}

/**
 * Options for confirming MFA enrollment.
 */
export interface ConfirmEnrollmentOptions {
  oobCode?: string;
  userOtpCode?: string;
}

/**
 * Interface for MFA controller.
 */
export interface MFAControllerInterface {
  fetchFactors(onlyActive?: boolean, ignoreCache?: boolean): Promise<Authenticator[]>;
  enrollFactor(
    factorName: string,
    options?: SafeAny,
    ignoreCache?: boolean,
  ): Promise<EnrollMfaResponse>;
  deleteFactor(authenticatorId: string, ignoreCache?: boolean): Promise<void>;
  confirmEnrollment(factorName: string, options: SafeAny, ignoreCache?: boolean): Promise<unknown>;
}

/**
 * Interface for MFA messages that can be used in the UI.
 */
export interface MFAMessages {
  title?: string;
  description?: string;
  no_active_mfa?: string;
  enroll?: string;
  delete?: string;
  enrolled?: string;
  enroll_factor?: string;
  remove_factor?: string;
  delete_mfa_title?: string;
  delete_mfa_content?: string;
  cancel?: string;
  deleting?: string;
  enrollment?: string;
  confirmation?: string;
  sms?: MFAFactorContent;
  'push-notification'?: MFAFactorContent;
  totp?: MFAFactorContent;
  email?: MFAFactorContent;
  duo?: MFAFactorContent;
  'webauthn-roaming'?: MFAFactorContent;
  'webauthn-platform'?: MFAFactorContent;
  'recovery-code'?: MFAFactorContent;
  errors?: {
    factors_loading_error?: string;
    delete_factor?: string;
    failed?: string;
    [key: string]: string | undefined;
  };
  [key: string]: unknown;
}

export interface MFAFactorContent {
  title: string;
  description: string;
}
