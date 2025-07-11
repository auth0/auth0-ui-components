import { I18nServiceInterface } from './i18n';
import { MFAControllerInterface } from './services';

export type SafeAny = any; // eslint-disable-line

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
  // getUser() in auth0-spa-js
  isAuthenticated: boolean;
  isLoading: boolean; // not existing in auth0-spa-js
  error?: Error; // not existing in auth0-spa-js
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
  // getTokenSilently in auth0-spa-js
  getAccessTokenWithPopup: (options?: SafeAny) => Promise<string | undefined>;
  // getTokenWithPopup in auth0-spa-js
  getIdTokenClaims: () => Promise<SafeAny>;
  // react: getIdTokenClaims: (() => Promise<undefined | IdToken>);
  // auth0-spa-js: getIdTokenClaims(): Promise<undefined | IdToken>
  // Vue: idTokenClaims: Ref<undefined | IdToken>;
  // Angular: idTokenClaims$: Observable<undefined | null | IdToken>
  handleRedirectCallback: () => Promise<SafeAny>;
}

export interface AuthDetailsCore {
  domain: string | undefined;
  clientId: string | undefined;
  accessToken: string | undefined;
  scopes: string | undefined;
  authProxyUrl: string | undefined;
  contextInterface: Auth0ContextInterface | undefined;
}

export interface CoreClientInterface {
  auth: AuthDetailsCore;
  i18nService: I18nServiceInterface;
  authentication: AuthenticationAPIServiceInterface;
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
