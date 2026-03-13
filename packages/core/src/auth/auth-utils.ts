import type { AuthDetails, BasicAuth0ContextInterface, ClientAuthConfig } from './auth-types';

export const AuthUtils = {
  /**
   * Converts a domain string to a properly formatted URL with HTTPS protocol and trailing slash.
   * @param domain - The domain string to convert.
   * @returns A properly formatted URL with HTTPS protocol and trailing slash.
   */
  toURL(domain: string): string {
    const domainWithSlash = domain.endsWith('/') ? domain : `${domain}/`;
    if (domainWithSlash.startsWith('http://') || domainWithSlash.startsWith('https://')) {
      return domainWithSlash;
    }
    return `https://${domainWithSlash}`;
  },

  /**
   * Builds an audience URL from a domain and audience path.
   * @param domain - The Auth0 tenant domain.
   * @param audiencePath - The API audience path segment.
   * @returns The constructed audience URL string.
   */
  buildAudience(domain: string, audiencePath: string): string {
    return `${AuthUtils.toURL(domain)}${audiencePath}/`;
  },

  /**
   * Retrieves an access token silently for the given domain and audience path.
   * @param contextInterface - The Auth0 context interface.
   * @param domain - The Auth0 tenant domain.
   * @param audiencePath - The API audience path segment.
   * @param scope - The required scopes.
   * @param cacheMode - Optional cache mode override.
   * @returns The access token string.
   */
  async getToken(
    contextInterface: BasicAuth0ContextInterface,
    domain: string,
    audiencePath: string,
    scope: string,
    cacheMode?: 'on' | 'off' | 'cache-only',
  ): Promise<string> {
    const audience = AuthUtils.buildAudience(domain, audiencePath);
    const tokenResponse = await contextInterface.getAccessTokenSilently({
      authorizationParams: { audience, scope },
      detailedResponse: true,
      ...(cacheMode && { cacheMode }),
    });
    return tokenResponse.access_token;
  },

  /**
   * Resolves the appropriate ClientAuthConfig based on provided AuthDetails.
   * @internal
   *
   * @param auth - Authentication configuration details
   * @returns The resolved ClientAuthConfig for proxy or SPA mode
   */
  resolveAuthConfig(auth: AuthDetails): ClientAuthConfig {
    if (auth.authProxyUrl) {
      return {
        mode: 'proxy',
        proxyUrl: auth.authProxyUrl.replace(/\/$/, ''),
        ...(auth.domain && { domain: auth.domain.trim() }),
      };
    }

    const { contextInterface } = auth;

    if (!contextInterface) {
      throw new Error(
        'Initialization failed: Auth0 context not found. Ensure the component is rendered within Auth0ComponentProvider.',
      );
    }

    const domain = auth.domain ?? contextInterface.getConfiguration()?.domain;

    if (!domain) {
      throw new Error(
        'Initialization failed: Auth0 domain is not configured. Provide a domain to Auth0ComponentProvider.',
      );
    }

    return {
      mode: 'spa',
      contextInterface,
      domain: domain.trim(),
    };
  },
};
