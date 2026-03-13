/**
 * MFA type definitions for multi-factor authentication.
 * @module mfa-types
 * @internal
 */

import type { MyAccount } from '@auth0/myaccount-js';

/**
 * Single authentication method from the SDK response.
 * @internal
 */
export type AuthenticationMethod =
  MyAccount.ListAuthenticationMethodsResponseContent['authentication_methods'][number];

/**
 * Enrolled factor with type property.
 * The SDK's AuthenticationMethod doesn't include `type`, but the actual API response does.
 * @internal
 */
export type EnrolledFactor = AuthenticationMethod & { type: MFAType };

/**
 * Normalized authenticator representation.
 * @internal
 */
export interface Authenticator {
  id: string;
  type: MFAType;
  enrolled: boolean;
  email?: string;
  name?: string;
  confirmed?: boolean;
  created_at: string | null;
}

/**
 * Represents the type of an MFA authenticator.
 * @internal
 */
export type MFAType =
  | 'phone'
  | 'push-notification'
  | 'totp'
  | 'email'
  | 'webauthn-roaming'
  | 'webauthn-platform'
  | 'recovery-code';

/**
 * Options for enrolling in MFA factors.
 * @internal
 */
export interface EnrollOptions {
  phone_number?: string;
  email?: string;
}

/**
 * Options for confirming MFA enrollment.
 * @internal
 */
export interface ConfirmEnrollmentOptions {
  userOtpCode?: string;
}
