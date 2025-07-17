import { I18nServiceInterface } from '../i18n';
import { MFAControllerInterface } from '../services';
import { SafeAny } from '@core/types';

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
  [key: string]: SafeAny;
}

export interface GetTokenSilentlyOptions {
  cacheMode?: 'on' | 'off' | 'cache-only';
  authorizationParams?: {
    redirect_uri?: string;
    scope?: string;
    audience?: string;
    [key: string]: SafeAny;
  };
  timeoutInSeconds?: number;
  detailedResponse?: boolean;
}

/**
 * TODO: Not all frameworks share the same interface. We should have adapters to a common interface.
 */
export interface Auth0ContextInterface<TUser = User> {
  user?: TUser;
  // auth0-spa-js: getUser()
  isAuthenticated: boolean;
  isLoading: boolean; // auth0-spa-js: do not exists
  error?: Error; // auth0-spa-js: do not exists
  loginWithRedirect: (options?: SafeAny) => Promise<void>;
  loginWithPopup: (options?: SafeAny) => Promise<void>;
  logout: (options?: SafeAny) => Promise<void>;
  getAccessTokenSilently: {
    (
      options: GetTokenSilentlyOptions & { detailedResponse: true },
    ): Promise<GetTokenSilentlyVerboseResponse>;
    (options?: GetTokenSilentlyOptions): Promise<string>;
    (options: GetTokenSilentlyOptions): Promise<GetTokenSilentlyVerboseResponse | string>;
  };
  // auth0-spa-js: getTokenSilently
  getAccessTokenWithPopup: (options?: SafeAny) => Promise<string | undefined>;
  // auth0-spa-js: getTokenWithPopup
  getIdTokenClaims: () => Promise<SafeAny>;
  // auth0-spa-js: getIdTokenClaims(): Promise<undefined | IdToken>
  // react: getIdTokenClaims: (() => Promise<undefined | IdToken>);
  // vue: idTokenClaims: Ref<undefined | IdToken>;
  // angular: idTokenClaims$: Observable<undefined | null | IdToken>
  handleRedirectCallback: () => Promise<SafeAny>;
}

export interface AuthDetailsCore {
  domain?: string | undefined;
  clientId?: string | undefined;
  accessToken?: string | undefined;
  scopes?: string | undefined;
  authProxyUrl?: string | undefined;
  contextInterface?: Auth0ContextInterface | undefined;
}

export interface CoreClientInterface {
  auth: AuthDetailsCore;
  i18nService: I18nServiceInterface;
  authenticationApiService: AuthenticationAPIServiceInterface;
  getToken: (
    scope: string,
    audiencePath: string,
    ignoreCache?: boolean,
  ) => Promise<string | undefined>;
  getApiBaseUrl: () => string;
  isProxyMode: () => boolean;
}

export interface AuthenticationAPIServiceInterface {
  mfa: MFAControllerInterface;
}
