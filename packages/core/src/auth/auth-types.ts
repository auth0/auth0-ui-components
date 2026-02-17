import type { ArbitraryObject } from '@core/types';

import type { I18nServiceInterface } from '../i18n';
import type { MyAccountClientWithScopes } from '../services/my-account/my-account-api-service';
import type { MyOrganizationClientWithScopes } from '../services/my-organization/my-organization-api-service';
import type { StepUpApiService } from '../services/step-up/step-up-api-service';

export type TokenEndpointResponse = {
  id_token: string;
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
};

export type GetTokenSilentlyVerboseResponse = Omit<TokenEndpointResponse, 'refresh_token'>;

export interface User {
  name?: string;
  given_name?: string;
  family_name?: string;
  middle_name?: string;
  nickname?: string;
  preferred_username?: string;
  profile?: string;
  picture?: string;
  website?: string;
  email?: string;
  email_verified?: boolean;
  gender?: string;
  birthdate?: string;
  zoneinfo?: string;
  locale?: string;
  phone_number?: string;
  phone_number_verified?: boolean;
  address?: string;
  updated_at?: string;
  sub?: string;
  [key: string]: unknown;
}

export interface GetTokenSilentlyOptions {
  cacheMode?: 'on' | 'off' | 'cache-only';
  authorizationParams?: {
    redirect_uri?: string;
    scope?: string;
    audience?: string;
    [key: string]: unknown;
  };
  timeoutInSeconds?: number;
  detailedResponse?: boolean;
}

export interface Auth0ContextInterface<TUser = User> {
  user?: TUser;
  // auth0-spa-js: getUser()
  isAuthenticated: boolean;
  isLoading: boolean; // auth0-spa-js: do not exists
  error?: Error; // auth0-spa-js: do not exists
  loginWithRedirect: (options?: unknown) => Promise<void>;
  loginWithPopup: (options?: unknown) => Promise<void>;
  logout: (options?: unknown) => Promise<void>;
  getAccessTokenSilently: {
    (
      options: GetTokenSilentlyOptions & { detailedResponse: true },
    ): Promise<GetTokenSilentlyVerboseResponse>;
    (options?: GetTokenSilentlyOptions): Promise<string>;
    (options: GetTokenSilentlyOptions): Promise<GetTokenSilentlyVerboseResponse | string>;
  };
  // auth0-spa-js: getTokenSilently
  getAccessTokenWithPopup: (options?: unknown) => Promise<string | undefined>;
  // auth0-spa-js: getTokenWithPopup
  getIdTokenClaims: () => Promise<ArbitraryObject>;
  // auth0-spa-js: getIdTokenClaims(): Promise<undefined | IdToken>
  // react: getIdTokenClaims: (() => Promise<undefined | IdToken>);
  // vue: idTokenClaims: Ref<undefined | IdToken>;
  // angular: idTokenClaims$: Observable<undefined | null | IdToken>
  handleRedirectCallback: () => Promise<ArbitraryObject>;
}

export interface ClientConfiguration {
  /**
   * The Auth0 domain that was configured
   */
  domain: string;
  /**
   * The Auth0 client ID that was configured
   */
  clientId: string;
}

/**
 * Supported authenticator types.
 * Note: Email authenticators use 'oob' type with oobChannel: 'email'
 */
export type AuthenticatorType = 'otp' | 'oob' | 'recovery-code';

/**
 * Represents an MFA authenticator enrolled by a user
 */
export interface Authenticator {
  id: string;
  authenticatorType: AuthenticatorType;
  active: boolean;
  name?: string;
  createdAt?: string;
  lastAuth?: string;
  type?: string;
}

/**
 * Types of MFA challenges
 */
export type ChallengeType =
  | 'otp'
  | 'phone'
  | 'recovery-code'
  | 'email'
  | 'push-notification'
  | 'totp';

/**
 * Out-of-band delivery channels.
 * Includes 'email' which is also delivered out-of-band.
 */
export type OobChannel = 'sms' | 'voice' | 'auth0' | 'email';

/**
 * Supported MFA factors for enrollment
 */
export type MfaFactorType = 'otp' | 'sms' | 'email' | 'push' | 'voice';

/**
 * Base parameters for all enrollment types
 */
export interface EnrollBaseParams {
  mfaToken: string;
}

/**
 * OTP (Time-based One-Time Password) enrollment parameters
 */
export interface EnrollOtpParams extends EnrollBaseParams {
  factorType: 'otp';
}

/**
 * SMS enrollment parameters
 */
export interface EnrollSmsParams extends EnrollBaseParams {
  factorType: 'sms';
  phoneNumber: string;
}

/**
 * Voice enrollment parameters
 */
export interface EnrollVoiceParams extends EnrollBaseParams {
  factorType: 'voice';
  phoneNumber: string;
}

/**
 * Email enrollment parameters
 */
export interface EnrollEmailParams extends EnrollBaseParams {
  factorType: 'email';
  email?: string;
}

/**
 * Push notification enrollment parameters
 */
export interface EnrollPushParams extends EnrollBaseParams {
  factorType: 'push';
}

/**
 * Union type for all enrollment parameter types
 */
export type EnrollParams =
  | EnrollOtpParams
  | EnrollSmsParams
  | EnrollVoiceParams
  | EnrollEmailParams
  | EnrollPushParams;

/**
 * Response when enrolling an OTP authenticator
 */
export interface OtpEnrollmentResponse {
  authenticatorType: 'otp';
  secret: string;
  barcodeUri: string;
  recoveryCodes?: string[];
  id?: string;
}

/**
 * Response when enrolling an OOB authenticator
 */
export interface OobEnrollmentResponse {
  authenticatorType: 'oob';
  oobChannel: OobChannel;
  oobCode?: string;
  bindingMethod?: string;
  recoveryCodes?: string[];
  id?: string;
  barcodeUri?: string;
}

/**
 * Union type for all enrollment response types
 */
export type EnrollmentResponse = OtpEnrollmentResponse | OobEnrollmentResponse;

/**
 * Parameters for initiating an MFA challenge
 */
export interface ChallengeAuthenticatorParams {
  mfaToken: string;
  challengeType: 'otp' | 'oob';
  authenticatorId?: string;
}

/**
 * Response from initiating an MFA challenge
 */
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

/**
 * Enrollment factor returned by getEnrollmentFactors
 */
export interface EnrollmentFactor {
  type: string;
}

/**
 * MFA API Client interface
 */
export interface MfaApiClient {
  getAuthenticators(mfaToken: string): Promise<Authenticator[]>;
  enroll(params: EnrollParams): Promise<EnrollmentResponse>;
  challenge(params: ChallengeAuthenticatorParams): Promise<ChallengeResponse>;
  getEnrollmentFactors(mfaToken: string): Promise<EnrollmentFactor[]>;
  verify(params: VerifyParams): Promise<TokenEndpointResponse>;
}

export interface BasicAuth0ContextInterface<TUser = User> {
  user?: TUser;
  isAuthenticated: boolean;
  getAccessTokenSilently: {
    (
      options: GetTokenSilentlyOptions & { detailedResponse: true },
    ): Promise<GetTokenSilentlyVerboseResponse>;
    (options?: GetTokenSilentlyOptions): Promise<string>;
    (options: GetTokenSilentlyOptions): Promise<GetTokenSilentlyVerboseResponse | string>;
  };
  getAccessTokenWithPopup: (options?: unknown) => Promise<string | undefined>;
  loginWithRedirect: (options?: unknown) => Promise<void>;
  getConfiguration: () => Readonly<ClientConfiguration>;
  mfa: MfaApiClient;
}

export interface AuthDetails {
  domain?: string | undefined;
  authProxyUrl?: string | undefined;
  contextInterface?: BasicAuth0ContextInterface | undefined;
}

export interface BaseCoreClientInterface {
  auth: AuthDetails;
  i18nService: I18nServiceInterface;
  getToken: (
    scope: string,
    audiencePath: string,
    ignoreCache?: boolean,
  ) => Promise<string | undefined>;
  isProxyMode: () => boolean;
  getDomain: () => string | undefined;
}

export interface CoreClientInterface extends BaseCoreClientInterface {
  myAccountApiClient: MyAccountClientWithScopes | undefined;
  myOrganizationApiClient: MyOrganizationClientWithScopes | undefined;
  stepUpApiService: StepUpApiService | undefined;
  getMyAccountApiClient: () => MyAccountClientWithScopes;
  getMyOrganizationApiClient: () => MyOrganizationClientWithScopes;
  getStepUpApiService: () => StepUpApiService;
}
