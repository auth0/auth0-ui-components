export const AuthUtils = {
  /**
   * Converts a domain string to a properly formatted URL with HTTPS protocol and trailing slash.
   *
   * This utility function ensures that domain strings are consistently formatted as valid URLs.
   * It handles domains that may or may not include protocol or trailing slashes.
   *
   * @param domain - The domain string to convert (e.g., 'example.auth0.com' or 'https://example.auth0.com/')
   * @returns A properly formatted URL with HTTPS protocol and trailing slash
   *
   * @example
   * ```typescript
   * toURL('example.auth0.com') // Returns: 'https://example.auth0.com/'
   * toURL('https://example.auth0.com') // Returns: 'https://example.auth0.com/'
   * toURL('http://localhost:3000') // Returns: 'http://localhost:3000/'
   * ```
   */
  toURL(domain: string): string {
    const domainWithSlash = domain.endsWith('/') ? domain : `${domain}/`;
    if (domainWithSlash.startsWith('http://') || domainWithSlash.startsWith('https://')) {
      return domainWithSlash;
    }
    return `https://${domainWithSlash}`;
  },

  /**
   * Merges multiple scope strings into a single deduplicated string.
   *
   * @param scopes - Scope strings to merge (can be undefined)
   * @returns A single space-separated string of unique scopes
   *
   * @example
   * ```typescript
   * mergeScopes('openid profile', 'email profile') // Returns: 'openid profile email'
   * ```
   */
  mergeScopes(...scopes: (string | undefined)[]): string {
    return [...new Set(scopes.join(' ').split(/\s+/).filter(Boolean))].join(' ');
  },
};
