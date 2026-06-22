/**
 * MyOrganization client initialization.
 * @module my-organization-client
 * @internal
 */

import { MyOrganizationClient } from '@auth0/myorganization-js';

import { createProxyFetcher, createSpaFetcher } from '../../api/api-utils';
import type { TelemetryConfig } from '../../api/telemetry';
import type { ClientAuthConfig } from '../../auth/auth-types';

export const MY_ORGANIZATION_PROXY_PATH = 'my-org';
export const MY_ORGANIZATION_DPOP_NONCE_ID = '__auth0_my_organization_api__';

/**
 * Creates a MyOrganizationClient configured for the given auth mode.
 * @param config - Auth configuration (proxy or SPA mode)
 * @param telemetry - Telemetry configuration (css, distribution, framework)
 * @param activeComponent - Ref holding the current component name for telemetry
 * @returns Configured MyOrganizationClient instance
 * @internal
 */
export function createMyOrganizationClient(
  config: ClientAuthConfig,
  telemetry: TelemetryConfig,
  activeComponent: { current: string },
) {
  const isProxyMode = config.mode === 'proxy';

  if (isProxyMode) {
    return new MyOrganizationClient({
      domain: config.domain ?? '',
      baseUrl: new URL(MY_ORGANIZATION_PROXY_PATH, config.proxyUrl).href,
      telemetry: false,
      fetcher: createProxyFetcher({
        customFetcher: config.fetcher,
        telemetry,
        activeComponent,
      }),
    });
  }

  return new MyOrganizationClient({
    domain: config.domain,
    telemetry: false,
    fetcher: createSpaFetcher(config, MY_ORGANIZATION_DPOP_NONCE_ID, telemetry, activeComponent),
  });
}
