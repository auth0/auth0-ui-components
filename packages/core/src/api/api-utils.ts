/**
 * Shared client initialization helpers.
 * @module api-utils
 * @internal
 */

import type { FetcherAuthParams, FetcherSupplier, SpaAuthConfig } from '../auth/auth-types';
import {
  isMfaRequiredError,
  normalizeMfaRequiredError,
} from '../services/mfa-step-up/mfa-step-up-api-utils';
import { mfaStepUpStore } from '../services/mfa-step-up/mfa-step-up-store';

import { ContentType, HeaderName } from './http-constants';
import {
  buildTelemetryHeader,
  type TelemetryComponentGetter,
  type TelemetryConfig,
} from './telemetry';
import { coordinateProxyRequest, createCoordinatedTokenGetter } from './token-coordination';

export const AUTH0_SCOPE_HEADER = HeaderName.Auth0Scope;

/**
 * Runs `call`. If it fails with `mfa_required`, prompts the user to pass MFA and runs `call`
 * again.
 *
 * Concurrent calls that hit `mfa_required` share the same open dialog instead of opening
 * multiple prompts.
 *
 * @param call - Async function to run. It runs again after MFA, so it must be safe to repeat.
 * @returns What `call` returns.
 * @throws {MfaStepUpError} With a `code` (such as `'cancelled'`, `'token_expired'`, or
 *   `'unavailable'`) if the user cancels or MFA cannot be completed.
 * @throws Re-throws any other error from `call`.
 */
export async function withMfaStepUp<T>(call: () => Promise<T>): Promise<T> {
  try {
    return await call();
  } catch (error) {
    if (!isMfaRequiredError(error)) throw error;
    await mfaStepUpStore.request(normalizeMfaRequiredError(error));
    return withMfaStepUp(call);
  }
}

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
function fetcherWithStepUp(fetcher: FetcherSupplier): FetcherSupplier {
  return (url, init, authParams) =>
    withMfaStepUp(async () => throwIfMfaRequired(await fetcher(url, init, authParams)));
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
  disableTokenRequestQueue?: boolean;
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
  return fetcherWithStepUp(async (url, init, authParams) => {
    const headers = new Headers(init?.headers);
    if (init?.body) {
      headers.set(HeaderName.ContentType, ContentType.JSON);
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
    const send = (scope: string[] | undefined) => {
      const requestHeaders = new Headers(headers);
      if (scope?.length) {
        requestHeaders.set(HeaderName.Auth0Scope, scope.join(' '));
      }
      if (fetchFn) {
        const requestAuthParams =
          scope === authParams?.scope ? authParams : { ...authParams, scope };
        return fetchFn(url, { ...init, headers: requestHeaders }, requestAuthParams);
      }
      return fetch(url, { ...init, headers: requestHeaders });
    };
    return config.disableTokenRequestQueue
      ? send(authParams?.scope)
      : coordinateProxyRequest(authParams, init, send);
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
  const { contextInterface, disableTokenRequestQueue } = config;
  const sdkFetcher = contextInterface.createFetcher({
    dpopNonceId,
    ...(!disableTokenRequestQueue &&
      contextInterface.getAccessTokenSilently && {
        getAccessToken: createCoordinatedTokenGetter(contextInterface.getAccessTokenSilently),
      }),
  });
  return fetcherWithStepUp((url, init, authParams) => {
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
