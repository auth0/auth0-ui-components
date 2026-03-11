/**
 * Authentication type definitions for Auth0 integration.
 * @module auth-types
 * @internal
 */

import type { ArbitraryObject } from '@core/types';

import type { I18nServiceInterface } from '../i18n';
import type { MfaApiClient } from '../services/mfa-step-up/mfa-step-up-api-types';
import type { MyAccountApiClient } from '../services/my-account/my-account-api-service';
import type { MyOrganizationApiClient } from '../services/my-organization/my-organization-api-service';

/**
 * Response structure from the token endpoint.
 * @internal
 */
export type TokenEndpointResponse = {
  id_token: string;
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
};

/**
 * Verbose response from silent token retrieval.
 * @internal
 */
export type GetTokenSilentlyVerboseResponse = Omit<TokenEndpointResponse, 'refresh_token'>;

/**
 * User profile information from Auth0.
 * @internal
 */
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

/**
 * Options for silent token retrieval.
 * @internal
 */
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

/**
 * Auth0 context interface for authentication operations.
 * @internal
 */
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

/**
 * Client configuration for Auth0 SDK.
 * @internal
 */
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
 * Basic Auth0 context interface for minimal authentication operations.
 * @internal
 */
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

/**
 * Auth config for proxy mode — routes requests through an auth proxy URL.
 * @internal
 */
export type ProxyAuthConfig = {
  mode: 'proxy';
  proxyUrl: string;
  domain?: string;
};

/**
 * Auth config for SPA mode — uses a context interface and Auth0 domain directly.
 * @internal
 */
export type SpaAuthConfig = {
  mode: 'spa';
  contextInterface: BasicAuth0ContextInterface;
  domain: string;
};

/**
 * Discriminated union of the two supported auth configurations.
 * @internal
 */
export type ClientAuthConfig = ProxyAuthConfig | SpaAuthConfig;

/**
 * Authentication details for provider configuration.
 * @internal
 */
export interface AuthDetails {
  domain?: string | undefined;
  authProxyUrl?: string | undefined;
  contextInterface?: BasicAuth0ContextInterface | undefined;
  previewMode?: boolean; // For docs - skip API client initialization
}

/**
 * Base interface for CoreClient functionality.
 * @internal
 */
export interface BaseCoreClientInterface {
  auth: AuthDetails;
  i18nService: I18nServiceInterface;
  isProxyMode: () => boolean;
  getDomain: () => string | undefined;
}

/**
 * Full CoreClient interface with API clients.
 * @internal
 */
export interface CoreClientInterface extends BaseCoreClientInterface {
  myAccountApiClient: MyAccountApiClient | undefined;
  myOrganizationApiClient: MyOrganizationApiClient | undefined;
  getMyAccountApiClient: () => MyAccountApiClient;
  getMyOrganizationApiClient: () => MyOrganizationApiClient;
  getMFAStepUpApiClient: () => MfaApiClient;
}
