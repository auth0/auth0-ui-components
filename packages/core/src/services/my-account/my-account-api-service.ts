/**
 * My Account API service initialization.
 * @module my-account-api-service
 * @internal
 */

import { MyAccountClient } from '@auth0/myaccount-js';
import { buildBaseHeaders, buildServiceConfig } from '@core/api/api-utils';

import type { ClientAuthConfig } from '../../auth/auth-types';

export type MyAccountApiClient = {
  withScopes(scopes: string): MyAccountApiClient;
  readonly factors: MyAccountClient['factors'];
  readonly authenticationMethods: MyAccountClient['authenticationMethods'];
};

/**
 * Initializes the My Account API client for MFA and user profile operations.
 * @internal
 *
 * @param config - Auth configuration — either proxy or domain mode
 * @returns My Account API client with withScopes chaining
 */
export function initializeMyAccountClient(config: ClientAuthConfig): MyAccountApiClient {
  const { sdkConfig, authHeaders } = buildServiceConfig(config, 'me');

  const createInstance = (scopes = ''): MyAccountApiClient => {
    const rawClient = new MyAccountClient({
      ...sdkConfig,
      fetcher: async (url: string, init?: RequestInit) => {
        const headers = buildBaseHeaders(init);
        await authHeaders(headers, scopes);
        return fetch(url, { ...init, headers });
      },
    });

    return {
      withScopes: (newScopes: string): MyAccountApiClient => createInstance(newScopes),
      get factors() {
        return rawClient.factors;
      },
      get authenticationMethods() {
        return rawClient.authenticationMethods;
      },
    };
  };

  return createInstance();
}
