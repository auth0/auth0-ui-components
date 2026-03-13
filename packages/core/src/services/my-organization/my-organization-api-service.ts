/**
 * My Organization API service initialization.
 * @module my-organization-api-service
 * @internal
 */

import { MyOrganizationClient } from '@auth0/myorganization-js';
import { buildBaseHeaders, buildServiceConfig } from '@core/api/api-utils';
import type { ClientAuthConfig } from '@core/auth/auth-types';

export type MyOrganizationApiClient = {
  withScopes(scopes: string): MyOrganizationApiClient;
  readonly organization: MyOrganizationClient['organization'];
  readonly organizationDetails: MyOrganizationClient['organizationDetails'];
};

/**
 * Initializes the My Organization API client for organization, SSO, and domain operations.
 * @internal
 *
 * @param config - Auth configuration — either proxy or domain mode
 * @returns My Organization API client with withScopes chaining
 */
export function initializeMyOrganizationClient(config: ClientAuthConfig): MyOrganizationApiClient {
  const { sdkConfig, authHeaders } = buildServiceConfig(config, 'my-org');

  const createInstance = (scopes = ''): MyOrganizationApiClient => {
    const rawClient = new MyOrganizationClient({
      ...sdkConfig,
      fetcher: async (url: string, init?: RequestInit) => {
        const headers = buildBaseHeaders(init);
        await authHeaders(headers, scopes);
        return fetch(url, { ...init, headers });
      },
    });

    return {
      withScopes: (newScopes: string): MyOrganizationApiClient => createInstance(newScopes),
      get organization() {
        return rawClient.organization;
      },
      get organizationDetails() {
        return rawClient.organizationDetails;
      },
    };
  };

  return createInstance();
}
