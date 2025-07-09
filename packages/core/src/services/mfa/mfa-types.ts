/**
 * Represents an MFA authenticator linked to a user.
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
  userEmailOtpCode?: string;
}

/**
 * Represents a challenge that must be resolved before MFA enrollment can proceed.
 */
export interface MfaChallenge {
  /** The type of challenge required */
  type: 'mfa_required' | 'step_up_authentication';
  /** The challenge token that must be used to resolve the challenge */
  challengeToken: string;
  /** Available methods to resolve the challenge */
  availableMethods: MfaChallengeMethod[];
  /** Optional message from the server */
  message?: string;
}

/**
 * Available methods to resolve an MFA challenge.
 */
export interface MfaChallengeMethod {
  /** The type of challenge method */
  type: MFAType;
  /** The ID of the authenticator to use for this method */
  authenticatorId: string;
  /** Display name for the method */
  name: string;
  /** Whether this method is preferred */
  preferred?: boolean;
}

/**
 * Options for resolving an MFA challenge.
 */
export interface ResolveChallengeOptions {
  /** The challenge token received from the enrollment attempt */
  challengeToken: string;
  /** The authenticator ID to use for the challenge */
  authenticatorId: string;
  /** The code/password provided by the user */
  code: string;
}

/**
 * Response from resolving an MFA challenge.
 */
export interface ResolveChallengeResponse {
  /** Whether the challenge was resolved successfully */
  success: boolean;
  /** New access token with elevated permissions */
  accessToken?: string;
  /** Optional error message if resolution failed */
  error?: string;
}

/**
 * Enhanced enrollment response that may include a challenge.
 */
export interface EnhancedEnrollMfaResponse extends EnrollMfaResponse {
  /** Challenge that must be resolved before enrollment can proceed */
  challenge?: MfaChallenge;
}

/**
 * State of the MFA enrollment process.
 */
export type MfaEnrollmentState =
  | 'idle'
  | 'enrolling'
  | 'challenge_required'
  | 'resolving_challenge'
  | 'enrolled'
  | 'error';
