/**
 * Permission API service for fetching user permissions.
 * @module permission-api-service
 * @internal
 */
import type { ClientAuthConfig, SpaAuthConfig } from '../../auth/auth-types';

import type { PermissionApiClient } from './permission-api-types';
import { PERMISSION_CLAIM } from './permission-api-types';

/**
 * Initializes a Permission API client based on auth configuration.
 * @param auth - Auth config (SPA or Proxy mode).
 * @returns Permission API client instance.
 * @internal
 */
export function initializePermissionClient(auth: ClientAuthConfig): PermissionApiClient {
  return auth.mode === 'proxy'
    ? createProxyPermissionClient(auth.proxyUrl)
    : createSpaPermissionClient(auth.contextInterface);
}

/**
 * Creates a proxy-based permission client.
 * Fetches permissions from /auth/profile endpoint.
 * @param authProxyUrl - Base URL for the auth proxy.
 * @returns Proxy-based Permission client.
 */
function createProxyPermissionClient(authProxyUrl: string): PermissionApiClient {
  return {
    getPermissions: async (): Promise<string[]> => {
      try {
        const res = await fetch(`${authProxyUrl}/auth/profile`, {
          credentials: 'include',
        });

        if (!res.ok) {
          console.warn('Failed to fetch user profile for permissions');
          return [];
        }

        const profile = await res.json();
        const permissions = profile[PERMISSION_CLAIM];

        return Array.isArray(permissions) ? permissions : [];
      } catch (error) {
        console.warn('Error fetching user permissions:', error);
        return [];
      }
    },
  };
}

/**
 * Creates a SPA-based permission client.
 * Uses getIdTokenClaims from @auth0/auth0-react.
 * @param contextInterface - Auth0 context interface from SPA SDK.
 * @returns SPA-based Permission client.
 */
function createSpaPermissionClient(
  contextInterface: SpaAuthConfig['contextInterface'],
): PermissionApiClient {
  return {
    getPermissions: async (): Promise<string[]> => {
      if (!contextInterface.getIdTokenClaims) {
        console.warn(
          'getIdTokenClaims not available. ' +
            'Ensure Auth0Provider from @auth0/auth0-react wraps your app.',
        );
        return [];
      }

      try {
        const claims = await contextInterface.getIdTokenClaims();

        if (!claims) {
          console.warn('No ID token claims available');
          return [];
        }

        const permissions = claims[PERMISSION_CLAIM];
        return Array.isArray(permissions) ? permissions : [];
      } catch (error) {
        console.warn('Error fetching permissions:', error);
        return [];
      }
    },
  };
}
