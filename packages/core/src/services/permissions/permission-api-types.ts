/**
 * Permission API type definitions.
 * @module permission-api-types
 * @internal
 */

/**
 * Permission claim from ID token.
 */
export const PERMISSION_CLAIM = 'urn:auth0:my_org_current_user_permissions';

/**
 * Permission API client interface.
 * Abstracts permission fetching for both SPA and Proxy modes.
 */
export interface PermissionApiClient {
  /**
   * Fetches the current user's permissions from the ID token claims.
   * @returns Promise resolving to an array of permission strings.
   */
  getPermissions: () => Promise<string[]>;
}
