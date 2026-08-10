/**
 * Custom message type definitions for the MFA factors list.
 * @module user-mfa-factors-list-types
 * @internal
 */

export interface UserMfaFactorListItemMessages {
  title?: string;
  description?: string;
  button_text?: string;
}

interface UserMfaFactorErrorMessages {
  too_many_entities?: string;
  unsupported_challenge_type?: string;
  invalid_request?: string;
  invalid_code?: string;
  invalid_grant?: string;
  bad_gateway?: string;
  authorization_pending?: string;
  invalid_phone_number?: string;
  access_denied?: string;
  expired_token?: string;
}

export interface UserMfaErrorMessages {
  'push-notification'?: UserMfaFactorErrorMessages;
  totp?: UserMfaFactorErrorMessages;
  phone?: UserMfaFactorErrorMessages;
  email?: UserMfaFactorErrorMessages;
}
