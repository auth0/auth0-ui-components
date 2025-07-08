import { AuthDetailsCore, CoreClientInterface } from './types';
import { createI18n, TFactory, TranslationFunction } from './i18n';
import { AuthenticationAPIService } from './services/authentication-api-service';
import TokenManager from './token-manager';

export class CoreClient implements CoreClientInterface {
  public readonly auth: AuthDetailsCore;
  public readonly t: TranslationFunction;
  private readonly tokenManager: TokenManager;
  // API services
  public readonly authentication: AuthenticationAPIService;

  private constructor(auth: AuthDetailsCore, translator: TranslationFunction) {
    this.auth = auth;
    this.t = translator;
    this.tokenManager = new TokenManager(this);
    this.authentication = new AuthenticationAPIService(this);
  }

  static async create(
    authDetails: AuthDetailsCore,
    translatorFactory?: TFactory,
  ): Promise<CoreClient> {
    // Initialize translator
    let t: TranslationFunction;
    if (translatorFactory) {
      t = translatorFactory('common'); // TODO: Check if 'common' is the right namespace
    } else {
      // Fallback: create a basic translator if none provided
      const i18n = await createI18n({
        currentLanguage: 'en-US',
        fallbackLanguage: 'en-US',
      });
      t = i18n.t('common');
    }

    // Initialize auth details
    let auth = authDetails;
    if (authDetails.contextInterface) {
      try {
        const tokenRes = await authDetails.contextInterface.getAccessTokenSilently({
          cacheMode: 'off',
          detailedResponse: true,
        });
        const claims = await authDetails.contextInterface.getIdTokenClaims();
        auth = {
          ...authDetails,
          accessToken: tokenRes.access_token,
          domain: claims?.iss,
          clientId: claims?.aud,
          scopes: tokenRes.scope,
        };
      } catch (err) {
        auth = {
          ...authDetails,
          accessToken: undefined,
          domain: undefined,
          clientId: undefined,
          scopes: undefined,
        };
      }
    }

    return new CoreClient(auth, t);
  }

  async getToken(
    scope: string,
    audiencePath: string,
    ignoreCache: boolean = false,
  ): Promise<string | undefined> {
    return this.tokenManager.getToken(scope, audiencePath, ignoreCache);
  }

  getApiBaseUrl(): string {
    // Use authProxyUrl if provided (proxy mode)
    if (this.isProxyMode()) {
      return this.auth.authProxyUrl!.endsWith('/')
        ? this.auth.authProxyUrl!
        : `${this.auth.authProxyUrl!}/`;
    }

    const domain = this.auth.domain;
    if (!domain) {
      throw new Error(this.t('errors.domain_not_configured'));
    }
    return domain.endsWith('/') ? domain : `${domain}/`;
  }

  isProxyMode(): boolean {
    return !!this.auth.authProxyUrl;
  }
}
