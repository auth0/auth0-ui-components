/**
 * Telemetry utilities for Auth0 UI Components.
 * @module telemetry
 * @internal
 */

/**
 * Client information for Auth0 telemetry headers.
 */
export interface ClientInfo {
  name: string;
  version: string;
  env?: Record<string, string>;
  [key: string]: unknown;
}

/**
 * The package name used in telemetry.
 */
export const TELEMETRY_NAME = 'auth0-ui-components';

/**
 * The current SDK version. Updated during release.
 */
export const SDK_VERSION = '2.0.0';

/**
 * Generates client information for Auth0 UI Components telemetry.
 * This information is sent via the Auth0-Client header.
 *
 * @param isProxyMode - Whether the client is operating in proxy mode
 * @returns Client info object for telemetry
 * @internal
 */
export function getClientInfo(isProxyMode: boolean): ClientInfo {
  return {
    name: TELEMETRY_NAME,
    version: SDK_VERSION,
    env: {
      is_proxy_mode: String(isProxyMode),
    },
  };
}
