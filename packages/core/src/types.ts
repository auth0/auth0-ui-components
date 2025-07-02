import { TranslationFunction, TFactory } from './i18n';

// TODO: check this
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
  /**
   * When `off`, ignores the cache and always sends a
   * request to Auth0.
   * When `cache-only`, only reads from the cache and never sends a request to Auth0.
   * Defaults to `on`, where it both reads from the cache and sends a request to Auth0 as needed.
   */
  cacheMode?: 'on' | 'off' | 'cache-only';

  /**
   * Parameters that will be sent back to Auth0 as part of a request.
   */
  authorizationParams?: {
    /**
     * There's no actual redirect when getting a token silently,
     * but, according to the spec, a `redirect_uri` param is required.
     * Auth0 uses this parameter to validate that the current `origin`
     * matches the `redirect_uri` `origin` when sending the response.
     * It must be whitelisted in the "Allowed Web Origins" in your
     * Auth0 Application's settings.
     */
    redirect_uri?: string;

    /**
     * The scope that was used in the authentication request
     */
    scope?: string;

    /**
     * The audience that was used in the authentication request
     */
    audience?: string;

    /**
     * If you need to send custom parameters to the Authorization Server,
     * make sure to use the original parameter name.
     */
    [key: string]: SafeAny;
  };

  /** A maximum number of seconds to wait before declaring the background /authorize call as failed for timeout
   * Defaults to 60s.
   */
  timeoutInSeconds?: number;

  /**
   * If true, the full response from the /oauth/token endpoint (or the cache, if the cache was used) is returned
   * (minus `refresh_token` if one was issued). Otherwise, just the access token is returned.
   *
   * The default is `false`.
   */
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
  contextInterface: Auth0ContextInterface | undefined;
}

export interface CoreClientInterface {
  auth: AuthDetailsCore;
  getToken: (scope: string, audiencePath: string, ignoreCache: boolean) => Promise<string>;
}

export interface CoreClientFactoryInterface {
  auth: AuthDetailsCore | undefined;
  t: TranslationFunction | undefined;
  create: (
    authDetails: AuthDetailsCore,
    translatorFactory?: TFactory,
  ) => Promise<CoreClientInterface>;
  initialize: () => Promise<CoreClientInterface>;
  getToken: (scope: string, audiencePath: string, ignoreCache: boolean) => Promise<string>;
}
