/**
 * My Account API service initialization.
 * @module my-account-api-service
 * @internal
 */

import { MyAccountClient } from '@auth0/myaccount-js';
import { buildServiceConfig } from '@core/api/api-utils';

import type { ClientAuthConfig } from '../../auth/auth-types';

/**
 * Initializes the My Account API client for MFA and user profile operations.
 *
 * @param config - Auth configuration — either proxy or domain mode
 * @returns Initialized MyAccountClient
 */
export function initializeMyAccountClient(config: ClientAuthConfig): MyAccountClient {
  const MY_ACCOUNT_PATH = 'me';
  const { sdkConfig, fetcherFn } = buildServiceConfig(config, MY_ACCOUNT_PATH);
  return new MyAccountClient({ ...sdkConfig, fetcher: fetcherFn });
}
