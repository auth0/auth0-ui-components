import type { MyAccount } from '@auth0/myaccount-js';
import type { ArbitraryObject } from '@core/types';

export type ListFactorsResponseContent = MyAccount.ListFactorsResponseContent;
export type ListAuthenticationMethodsResponseContent =
  MyAccount.ListAuthenticationMethodsResponseContent;

/**
 * Single authentication method from the SDK response.
 */
export type AuthenticationMethod =
  ListAuthenticationMethodsResponseContent['authentication_methods'][number];

/**
 * Enrolled factor with type property.
 * The SDK's AuthenticationMethod doesn't include `type`, but the actual API response does.
 */
export type EnrolledFactor = AuthenticationMethod & { type: MFAType };

export type CreateAuthenticationMethodRequestContent =
  MyAccount.CreateAuthenticationMethodRequestContent;
export type CreateAuthenticationMethodResponseContent =
  MyAccount.CreateAuthenticationMethodResponseContent;
export type PathAuthenticationMethodId = MyAccount.PathAuthenticationMethodId;
export type VerifyAuthenticationMethodRequestContent =
  MyAccount.VerifyAuthenticationMethodRequestContent;
export type VerifyAuthenticationMethodResponseContent =
  MyAccount.VerifyAuthenticationMethodResponseContent;

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
 */
export interface EnrollOptions {
  phone_number?: string;
  email?: string;
}

/**
 * Options for confirming MFA enrollment.
 */
export interface ConfirmEnrollmentOptions {
  userOtpCode?: string;
}

/**
 * Interface for MFA controller.
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
