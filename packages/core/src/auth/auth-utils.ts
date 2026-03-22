import type { AuthDetails, ClientAuthConfig } from './auth-types';

/**
 * Ensures a URL or path ends with exactly one trailing slash.
 *
 * @param url - The URL or path to normalize
 * @returns URL or path with a single trailing slash
 *
 * @example
 * ensureTrailingSlash('https://example.com') // 'https://example.com/'
 * ensureTrailingSlash('https://example.com/') // 'https://example.com/'
 * ensureTrailingSlash('https://example.com///') // 'https://example.com/'
 */
export function ensureTrailingSlash(url: string): string {
  return url.replace(/\/*$/, '/');
}

/**
 * Normalizes a proxy URL to be an absolute URL with a trailing slash.
 * This ensures new URL(path, proxyUrl) works correctly for path appending.
 *
 * @param proxyUrl - The proxy URL to normalize (must be absolute, relative paths fallback to window.location.origin)
 * @returns Normalized absolute URL with trailing slash
 *
 * @example
 * normalizeProxyUrl('https://example.com/api/proxy') // 'https://example.com/api/proxy/'
 * normalizeProxyUrl('https://example.com/api/proxy/') // 'https://example.com/api/proxy/'
 * normalizeProxyUrl('/api/proxy') // 'https://current-origin.com/api/proxy/'
 */
export function normalizeProxyUrl(proxyUrl: string): string {
  try {
    // Try to parse as absolute URL first
    const absoluteUrl = new URL(proxyUrl).href;
    return ensureTrailingSlash(absoluteUrl);
  } catch {
    // If relative path, resolve against window.location.origin as fallback
    const absoluteUrl = new URL(proxyUrl, window.location.origin).href;
    return ensureTrailingSlash(absoluteUrl);
  }
}

export const AuthUtils = {
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
        proxyUrl: normalizeProxyUrl(auth.authProxyUrl),
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
