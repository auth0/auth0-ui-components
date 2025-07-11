import { AuthDetailsCore, CoreClientInterface } from './types';
import { I18nService, I18nInitOptions } from './i18n';
import { AuthenticationAPIService } from './services/authentication-api-service';
import TokenManager from './token-manager';

export class CoreClient implements CoreClientInterface {
  public readonly auth: AuthDetailsCore;
  public readonly i18nService: I18nService;
  private readonly tokenManager: TokenManager;
  // API services
  public readonly authentication: AuthenticationAPIService;

  private constructor(auth: AuthDetailsCore, i18nService: I18nService) {
    this.auth = auth;
    this.i18nService = i18nService;
    this.tokenManager = new TokenManager(this);
    this.authentication = new AuthenticationAPIService(this);
  }

  static async create(
    authDetails: AuthDetailsCore,
    i18nOptions?: I18nInitOptions,
  ): Promise<CoreClient> {
    // Initialize i18n service
    const i18nService = await I18nService.create(
      i18nOptions || {
        currentLanguage: 'en-US',
        fallbackLanguage: 'en-US',
      },
    );

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

    return new CoreClient(auth, i18nService);
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
      throw new Error(this.i18nService.translator('common')('errors.domain_not_configured'));
    }
    return domain.endsWith('/') ? domain : `${domain}/`;
  }

  isProxyMode(): boolean {
    return !!this.auth.authProxyUrl;
  }
}
