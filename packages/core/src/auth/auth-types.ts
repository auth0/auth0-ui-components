import type { MyAccountClient } from '@auth0/myaccount-js';
import type { MyOrganizationClient } from '@auth0/myorganization-js';
import type { ArbitraryObject } from '@core/types';

import type { I18nServiceInterface } from '../i18n';

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
  ensureScopes: (requiredScopes: string, audiencePath: string) => Promise<void>;
}

export interface CoreClientInterface extends BaseCoreClientInterface {
  myAccountApiClient: MyAccountClient | undefined;
  myOrganizationApiClient: MyOrganizationClient | undefined;
  getMyAccountApiClient: () => MyAccountClient;
  getMyOrganizationApiClient: () => MyOrganizationClient;
}
