/**
 * Custom message type definitions for the delete factor confirmation dialog.
 * @module user-mfa-delete-types
 * @internal
 */

export interface UserMfaDeleteMessages {
  title?: string;
  consent?: {
    phone?: string;
    email?: string;
    totp?: string;
    'push-notification'?: string;
    'recovery-code'?: string;
  };
}
