import type { Auth0MyAccount } from '@auth0/myaccount';
import type { SafeAny } from '@core/types';

export type ListFactorsResponseContent = Auth0MyAccount.ListFactorsResponseContent;
export type ListAuthenticationMethodsResponseContent =
  Auth0MyAccount.ListAuthenticationMethodsResponseContent;
export type CreateAuthenticationMethodRequestContent =
  Auth0MyAccount.CreateAuthenticationMethodRequestContent;
export type CreateAuthenticationMethodResponseContent =
  Auth0MyAccount.CreateAuthenticationMethodResponseContent;
export type PathAuthenticationMethodId = Auth0MyAccount.PathAuthenticationMethodId;
export type VerifyAuthenticationMethodRequestContent =
  Auth0MyAccount.VerifyAuthenticationMethodRequestContent;
export type VerifyAuthenticationMethodResponseContent =
  Auth0MyAccount.VerifyAuthenticationMethodResponseContent;

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
