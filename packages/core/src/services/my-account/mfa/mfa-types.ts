import type { MyAccount } from '@auth0/myaccount-js';
import type { SafeAny } from '@core/types';

export type ListFactorsResponseContent = MyAccount.ListFactorsResponseContent;
export type ListAuthenticationMethodsResponseContent =
  MyAccount.ListAuthenticationMethodsResponseContent;
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
  fetchFactors(onlyActive?: boolean): Promise<unknown>;
  enrollFactor(
    factorType: string,
    options?: SafeAny,
  ): Promise<CreateAuthenticationMethodResponseContent>;
  deleteFactor(authenticatorId: string): Promise<void>;
  confirmEnrollment(
    factorType: string,
    authSession: string,
    authenticationMethodId: string,
    options: ConfirmEnrollmentOptions,
  ): Promise<VerifyAuthenticationMethodResponseContent>;
}
