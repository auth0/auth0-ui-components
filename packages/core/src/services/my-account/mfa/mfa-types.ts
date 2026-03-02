/**
 * MFA type definitions for multi-factor authentication.
 * @module mfa-types
 * @internal
 */

import type { MyAccount } from '@auth0/myaccount-js';
import type { ArbitraryObject } from '@core/types';

/** @internal */
export type ListFactorsResponseContent = MyAccount.ListFactorsResponseContent;
/** @internal */
export type ListAuthenticationMethodsResponseContent =
  MyAccount.ListAuthenticationMethodsResponseContent;

/**
 * Single authentication method from the SDK response.
 * @internal
 */
export type AuthenticationMethod =
  ListAuthenticationMethodsResponseContent['authentication_methods'][number];

/**
 * Enrolled factor with type property.
 * The SDK's AuthenticationMethod doesn't include `type`, but the actual API response does.
 * @internal
 */
export type EnrolledFactor = AuthenticationMethod & { type: MFAType };

/** @internal */
export type CreateAuthenticationMethodRequestContent =
  MyAccount.CreateAuthenticationMethodRequestContent;
/** @internal */
export type CreateAuthenticationMethodResponseContent =
  MyAccount.CreateAuthenticationMethodResponseContent;
/** @internal */
export type PathAuthenticationMethodId = MyAccount.PathAuthenticationMethodId;
/** @internal */
export type VerifyAuthenticationMethodRequestContent =
  MyAccount.VerifyAuthenticationMethodRequestContent;
/** @internal */
export type VerifyAuthenticationMethodResponseContent =
  MyAccount.VerifyAuthenticationMethodResponseContent;

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

/**
 * Interface for MFA controller.
 * @internal
 */
export interface MFAControllerInterface {
  fetchFactors(onlyActive?: boolean): Promise<ListFactorsResponseContent>;
  enrollFactor(
    factorType: string,
    options?: ArbitraryObject,
  ): Promise<CreateAuthenticationMethodResponseContent>;

  deleteFactor(authenticatorId: string): Promise<void>;

  confirmEnrollment(
    factorType: string,
    authSession: string,
    authenticationMethodId: string,
    options: ConfirmEnrollmentOptions,
  ): Promise<VerifyAuthenticationMethodResponseContent>;
}
