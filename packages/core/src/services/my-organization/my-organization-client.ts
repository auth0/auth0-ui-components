/**
 * MyOrganization client initialization.
 * @module my-organization-client
 * @internal
 */

import { MyOrganizationClient } from '@auth0/myorganization-js';

import { createProxyFetcher, createSpaFetcher } from '../../api/api-utils';
import { getClientInfo } from '../../api/telemetry';
import type { ClientAuthConfig } from '../../auth/auth-types';

export const MY_ORGANIZATION_PROXY_PATH = 'my-org';
export const MY_ORGANIZATION_DPOP_NONCE_ID = '__auth0_my_organization_api__';

/**
 * Creates a MyOrganizationClient configured for the given auth mode.
 * @param config - Auth configuration (proxy or SPA mode)
 * @returns Configured MyOrganizationClient instance
 * @internal
 */
export function createMyOrganizationClient(config: ClientAuthConfig) {
  const isProxyMode = config.mode === 'proxy';

  if (isProxyMode) {
    return new MyOrganizationClient({
      domain: config.domain ?? '',
      baseUrl: new URL(MY_ORGANIZATION_PROXY_PATH, config.proxyUrl).href,
      telemetry: true,
      clientInfo: getClientInfo(true),
      fetcher: createProxyFetcher(config.fetcher),
    });
  }

  return new MyOrganizationClient({
    domain: config.domain,
    telemetry: true,
    clientInfo: getClientInfo(false),
    fetcher: createSpaFetcher(config, MY_ORGANIZATION_DPOP_NONCE_ID),
  });
}
