/**
 * My Organization API service initialization.
 * @module my-organization-api-service
 * @internal
 */

import { MyOrganizationClient } from '@auth0/myorganization-js';
import { buildServiceConfig } from '@core/api/api-utils';
import type { ClientAuthConfig } from '@core/auth/auth-types';

/**
 * Initializes the My Organization API client for organization, SSO, and domain operations.
 *
 * @param config - Auth configuration — either proxy or domain mode
 * @returns Initialized MyOrganizationClient
 */
export function initializeMyOrganizationClient(config: ClientAuthConfig): MyOrganizationClient {
  const MY_ORGANIZATION_PATH = 'my-org';
  const { sdkConfig, fetcherFn } = buildServiceConfig(config, MY_ORGANIZATION_PATH);
  return new MyOrganizationClient({ ...sdkConfig, fetcher: fetcherFn });
}
