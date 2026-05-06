/**
 * MyAccount client initialization.
 * @module my-account-client
 * @internal
 */

import { MyAccountClient } from '@auth0/myaccount-js';

import { createProxyFetcher, createSpaFetcher } from '../../api/api-utils';
import { getClientInfo } from '../../api/telemetry';
import type { ClientAuthConfig } from '../../auth/auth-types';

export const MY_ACCOUNT_PROXY_PATH = 'me';
export const MY_ACCOUNT_DPOP_NONCE_ID = '__auth0_my_account_api__';

/**
 * Creates a MyAccountClient configured for the given auth mode.
 * @param config - Auth configuration (proxy or SPA mode)
 * @returns Configured MyAccountClient instance
 * @internal
 */
export function createMyAccountClient(config: ClientAuthConfig) {
  const isProxyMode = config.mode === 'proxy';

  if (isProxyMode) {
    return new MyAccountClient({
      domain: config.domain ?? '',
      baseUrl: new URL(MY_ACCOUNT_PROXY_PATH, config.proxyUrl).href,
      telemetry: true,
      clientInfo: getClientInfo(true),
      fetcher: createProxyFetcher(config.fetcher),
    });
  }

  return new MyAccountClient({
    domain: config.domain,
    telemetry: true,
    clientInfo: getClientInfo(false),
    fetcher: createSpaFetcher(config, MY_ACCOUNT_DPOP_NONCE_ID),
  });
}
