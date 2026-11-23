/**
 * Shared client initialization helpers.
 * @module api-utils
 * @internal
 */

import type { FetcherAuthParams, FetcherSupplier, SpaAuthConfig } from '../auth/auth-types';
import { isMfaRequiredError } from '../services/mfa-step-up/mfa-step-up-api-utils';
import { handleMfaRequiredError } from '../services/mfa-step-up/mfa-step-up-handler';

import { ContentType, HeaderName } from './http-constants';
import {
  buildTelemetryHeader,
  type TelemetryComponentGetter,
  type TelemetryConfig,
} from './telemetry';

export const AUTH0_SCOPE_HEADER = HeaderName.Auth0Scope;

/**
 * `fetch` does not throw on a 403, so a 403 whose body is `mfa_required` is thrown here.
 *
 * @param response - The response of a request.
 * @returns The same response.
 * @throws The `mfa_required` body of a 403 response.
 */
async function throwIfMfaRequired(response: Response): Promise<Response> {
  if (response instanceof Response && response.status === 403) {
    const body = await response
      .clone()
      .json()
      .catch(() => undefined);
    if (isMfaRequiredError(body)) throw Object.assign(new Error('mfa_required'), body);
  }
  return response;
}

/**
 * @param fetcher - Sends a request.
 * @returns A fetcher that has the user pass MFA when the server asks for it, then sends the request again.
 */
function withMfaStepUp(fetcher: FetcherSupplier): FetcherSupplier {
  return (url, init, authParams) =>
    handleMfaRequiredError(async () => throwIfMfaRequired(await fetcher(url, init, authParams)));
}

/**
 * Configuration for proxy mode fetcher with telemetry.
 */
export interface ProxyFetcherConfig {
  customFetcher?: (
    url: string,
    init?: RequestInit,
    authParams?: FetcherAuthParams,
  ) => Promise<Response>;
  telemetry: TelemetryConfig;
  getComponent: TelemetryComponentGetter;
}

/**
 * Creates a fetcher function for proxy mode that injects scopes via auth0-scope header.
 * The proxy will extract scopes from the header and request the appropriate token.
 * Also adds telemetry header with component info from getComponent callback.
 * @param config - Fetcher configuration with optional custom fetcher, telemetry config, and getComponent callback
 * @returns Fetcher function that sets auth0-scope, content-type, and telemetry headers
 * @internal
 */
export function createProxyFetcher(config: ProxyFetcherConfig): FetcherSupplier {
  const fetchFn = config.customFetcher;
  return withMfaStepUp(async (url, init, authParams) => {
    const headers = new Headers(init?.headers);
    if (init?.body) {
      headers.set(HeaderName.ContentType, ContentType.JSON);
    }
    if (authParams?.scope?.length) {
      headers.set(HeaderName.Auth0Scope, authParams.scope.join(' '));
    }
    if (config.telemetry.enabled) {
      headers.set(
        HeaderName.Auth0Client,
        buildTelemetryHeader({
          isProxyMode: true,
          component: config.getComponent(),
          ...config.telemetry,
        }),
      );
    }
    if (fetchFn) {
      return fetchFn(url, { ...init, headers }, authParams);
    }
    return fetch(url, { ...init, headers });
  });
}

/**
 * Creates a fetcher function for SPA mode using Auth0 SDK's createFetcher.
 * Also adds telemetry header with component info from getComponent callback.
 * @param config - SPA auth configuration with context interface
 * @param dpopNonceId - Unique identifier for DPoP nonce management
 * @param telemetry - Telemetry configuration
 * @param getComponent - Callback to get current component name
 * @returns Fetcher function that delegates to SDK's fetchWithAuth with JSON content-type and telemetry
 * @internal
 */
export function createSpaFetcher(
  config: SpaAuthConfig,
  dpopNonceId: string,
  telemetry: TelemetryConfig,
  getComponent: TelemetryComponentGetter,
): FetcherSupplier {
  const sdkFetcher = config.contextInterface.createFetcher({ dpopNonceId });
  return withMfaStepUp((url, init, authParams) => {
    const headers = new Headers(init?.headers);
    if (init?.body) {
      headers.set(HeaderName.ContentType, ContentType.JSON);
    }
    if (telemetry.enabled) {
      headers.set(
        HeaderName.Auth0Client,
        buildTelemetryHeader({
          isProxyMode: false,
          component: getComponent(),
          ...telemetry,
        }),
      );
    }
    return sdkFetcher.fetchWithAuth(
      url,
      { ...init, headers },
      {
        scope: authParams?.scope,
        audience: authParams?.audience,
      },
    );
  });
}
