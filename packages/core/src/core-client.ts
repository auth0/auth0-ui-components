import { AuthDetailsCore, CoreClientInterface } from './types';
import { createI18n, TFactory, TranslationFunction } from './i18n';

// Store pending promises by a unique key (scope + audience combination)
const pendingTokenRequests = new Map<string, Promise<string>>();

class TokenManager {
  constructor(private coreClient: CoreClient) {}

  async getToken(
    scope: string,
    audiencePath: string,
    ignoreCache: boolean = false,
  ): Promise<string> {
    if (!this.coreClient.auth || !this.coreClient.auth.contextInterface) {
      throw new Error(this.coreClient.t('errors.not_initialized_core_client'));
    }

    const domain = this.coreClient.auth.domain;
    const audience = domain ? `${domain}${audiencePath}/` : '';

    if (!domain) {
      throw new Error(this.coreClient.t('errors.domain_not_configured'));
    }
    if (!scope) {
      throw new Error(this.coreClient.t('errors.scope_required'));
    }

    // Create a unique key for this token request
    const requestKey = `${scope}:${audience}`;

    // If ignoreCache is true, clear any pending request for this key
    if (ignoreCache) {
      pendingTokenRequests.delete(requestKey);
    }

    // Check if there's already a pending request for this token
    const existingRequest = pendingTokenRequests.get(requestKey);

    if (existingRequest) {
      return existingRequest;
    }

    const tokenPromise = this.fetchToken(scope, audience, ignoreCache);
    pendingTokenRequests.set(requestKey, tokenPromise);

    try {
      const token = await tokenPromise;
      return token;
    } finally {
      // Clean up the pending request after completion
      pendingTokenRequests.delete(requestKey);
    }
  }

  private async fetchToken(scope: string, audience: string, ignoreCache: boolean): Promise<string> {
    try {
      const token = await this.coreClient.auth.contextInterface!.getAccessTokenSilently({
        authorizationParams: {
          audience,
          scope,
        },
        ...(ignoreCache ? { cacheMode: 'off' } : {}),
      });

      if (!token) {
        throw new Error(this.coreClient.t('errors.access_token_error'));
      }

      return token;
    } catch (error) {
      const token = await this.coreClient.auth.contextInterface!.getAccessTokenWithPopup({
        authorizationParams: {
          audience,
          scope,
          prompt: 'consent',
        },
      });

      if (!token) {
        throw new Error(this.coreClient.t('errors.popup_closed_or_failed'));
      }

      return token;
    }
  }
}

export class CoreClient implements CoreClientInterface {
  public readonly auth: AuthDetailsCore;
  public readonly t: TranslationFunction;
  private readonly tokenManager: TokenManager;

  private constructor(auth: AuthDetailsCore, translator: TranslationFunction) {
    this.auth = auth;
    this.t = translator;
    this.tokenManager = new TokenManager(this);
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
  ): Promise<string> {
    return this.tokenManager.getToken(scope, audiencePath, ignoreCache);
  }
}
