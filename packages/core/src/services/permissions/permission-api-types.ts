/**
 * Permission API type definitions.
 * @module permission-api-types
 * @internal
 */

/**
 * Permission API client interface.
 */
export interface PermissionApiClient {
  getPermissions: () => Promise<string[]>;
}
