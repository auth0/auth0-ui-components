import type { TokenEndpointResponse } from '@core/auth/auth-types';

import type { MFA_REQUIRED_ERROR } from './mfa-step-up-api-constants';

export type MfaRequiredErrorCode = typeof MFA_REQUIRED_ERROR;

export type MfaAuthenticatorType = 'otp' | 'oob' | 'recovery-code';

export interface MfaAuthenticator {
  id: string;
  authenticatorType: MfaAuthenticatorType;
  active: boolean;
  name?: string;
  createdAt?: string;
  lastAuth?: string;
  type?: ChallengeType;
}

export type ChallengeType =
  | 'otp'
  | 'phone'
  | 'recovery-code'
  | 'email'
  | 'push-notification'
  | 'totp';

export type OobChannel = 'sms' | 'voice' | 'auth0' | 'email';

export type MfaFactorType = 'otp' | 'sms' | 'email' | 'push' | 'voice';

export interface EnrollBaseParams {
  mfaToken: string;
}

export interface EnrollOtpParams extends EnrollBaseParams {
  factorType: 'otp';
}

export interface EnrollSmsParams extends EnrollBaseParams {
  factorType: 'sms';
  phoneNumber: string;
}

export interface EnrollVoiceParams extends EnrollBaseParams {
  factorType: 'voice';
  phoneNumber: string;
}

export interface EnrollEmailParams extends EnrollBaseParams {
  factorType: 'email';
  email?: string;
}

export interface EnrollPushParams extends EnrollBaseParams {
  factorType: 'push';
}

export type EnrollParams =
  | EnrollOtpParams
  | EnrollSmsParams
  | EnrollVoiceParams
  | EnrollEmailParams
  | EnrollPushParams;

export interface OtpEnrollmentResponse {
  authenticatorType: 'otp';
  secret: string;
  barcodeUri: string;
  recoveryCodes?: string[];
  id?: string;
}

export interface OobEnrollmentResponse {
  authenticatorType: 'oob';
  oobChannel: OobChannel;
  oobCode?: string;
  bindingMethod?: string;
  recoveryCodes?: string[];
  id?: string;
  barcodeUri?: string;
}

export type EnrollmentResponse = OtpEnrollmentResponse | OobEnrollmentResponse;

export interface ChallengeMfaAuthenticatorParams {
  mfaToken: string;
  challengeType: 'otp' | 'oob';
  authenticatorId?: string;
}

export interface ChallengeResponse {
  challengeType: 'otp' | 'oob';
  oobCode?: string;
  bindingMethod?: string;
}

export interface VerifyParams {
  mfaToken: string;
  otp?: string;
  oobCode?: string;
  bindingCode?: string;
  recoveryCode?: string;
}

export interface EnrollmentFactor {
  type: string;
}

export interface MfaRequirements {
  enroll?: Array<{ type: string }>;
  challenge?: Array<{ type: ChallengeType }>;
}

export interface MfaRequiredError extends Error {
  error: MfaRequiredErrorCode;
  error_description: string;
  mfa_token: string;
  mfa_requirements?: MfaRequirements;
}

export interface MfaApiClient {
  getAuthenticators(mfaToken: string): Promise<MfaAuthenticator[]>;
  enroll(params: EnrollParams): Promise<EnrollmentResponse>;
  challenge(params: ChallengeMfaAuthenticatorParams): Promise<ChallengeResponse>;
  getEnrollmentFactors?(mfaToken: string): Promise<EnrollmentFactor[]>;
  verify(params: VerifyParams): Promise<TokenEndpointResponse>;
}
