import { AuthDetailsCore, CoreClientFactoryInterface, CoreClientInterface } from './types';
import { createI18n, TFactory } from './i18n';

// Store pending promises by a unique key (scope + audience combination)
const pendingTokenRequests = new Map<string, Promise<string>>();

const CoreClientFactory: CoreClientFactoryInterface = {
  auth: undefined,
  t: undefined,

  async create(
    authDetails: AuthDetailsCore,
    translatorFactory?: TFactory,
  ): Promise<CoreClientInterface> {
    this.auth = authDetails;

    // Use provided translator factory or create a fallback one
    if (translatorFactory) {
      this.t = translatorFactory('common'); // TODO: Check if 'common' is the right namespace
    } else {
      // Fallback: create a basic translator if none provided
      const i18n = await createI18n({
        currentLanguage: 'en-US',
        fallbackLanguage: 'en-US',
      });
      this.t = i18n.t('common');
    }

    await this.initialize();

    return {
      auth: this.auth,
      getToken: this.getToken.bind(this),
    };
  },
  async initialize(): Promise<CoreClientInterface> {
    if (!this.auth) {
      throw new Error('CoreClient not initialized. Call create() first.');
    }
    if (!this.auth.contextInterface) {
      throw new Error('ContextInterface has no value.');
    }
    try {
      const tokenRes = await this.auth.contextInterface.getAccessTokenSilently({
        cacheMode: 'off',
        detailedResponse: true,
      });
      const claims = await this.auth.contextInterface.getIdTokenClaims();
      this.auth = {
        ...this.auth,
        accessToken: tokenRes.access_token,
        domain: claims?.iss,
        clientId: claims?.aud,
        scopes: tokenRes.scope,
      };
    } catch (err) {
      this.auth = {
        ...this.auth,
        accessToken: undefined,
        domain: undefined,
        clientId: undefined,
        scopes: undefined,
      };
    }

    return {
      auth: this.auth,
      getToken: this.getToken.bind(this),
    };
  },
  async getToken(
    scope: string,
    audiencePath: string,
    ignoreCache: boolean = false,
  ): Promise<string> {
    if (!this.t) {
      throw new Error('Core client not initialized. Call create() first.');
    }
    const t = this.t;

    if (!this.auth || !this.auth.contextInterface) {
      throw new Error(t('errors.not_initialized_core_client'));
    }

    const domain = this.auth.domain;
    const audience = domain ? `${domain}${audiencePath}/` : '';

    if (!domain) {
      throw new Error(t('errors.domain_not_configured'));
    }
    if (!scope) {
      throw new Error(t('errors.scope_required'));
    }

    // Create a unique key for this token request
    const requestKey = `${scope}:${audience}`;

    // TODO: Check if this is needed
    // If ignoreCache is true, clear any pending request for this key
    if (ignoreCache) {
      pendingTokenRequests.delete(requestKey);
    }

    // Check if there's already a pending request for this token
    const existingRequest = pendingTokenRequests.get(requestKey);

    if (existingRequest) {
      return existingRequest;
    }

    const fetchToken = async (): Promise<string> => {
      try {
        const token = await this.auth!.contextInterface!.getAccessTokenSilently({
          authorizationParams: {
            audience,
            scope,
          },
          ...(ignoreCache ? { cacheMode: 'off' } : {}),
        });

        if (!token) {
          throw new Error(t('errors.access_token_error'));
        }

        return token;
      } catch (error) {
        const token = await this.auth!.contextInterface!.getAccessTokenWithPopup({
          authorizationParams: {
            audience,
            scope,
            prompt: 'consent',
          },
        });

        if (!token) {
          throw new Error(t('errors.popup_closed_or_failed'));
        }

        return token;
      }
    };

    // Store the promise in the map for deduplication
    const tokenPromise = fetchToken();
    pendingTokenRequests.set(requestKey, tokenPromise);

    try {
      const token = await tokenPromise;
      return token;
    } finally {
      // Clean up the pending request after completion
      pendingTokenRequests.delete(requestKey);
    }
  },
};

export { CoreClientFactory };
