/**
 * Authentication type definitions for Auth0 integration.
 * @module auth-types
 * @internal
 */

import type { MyAccountClient } from '@auth0/myaccount-js';
import type { MyOrganizationClient } from '@auth0/myorganization-js';

import type { I18nServiceInterface } from '../i18n';
import type { MfaApiClient } from '../services/mfa-step-up/mfa-step-up-api-types';

/**
 * Auth parameters for fetcher functions.
 * Used by both MyAccount/MyOrganization SDKs and Auth0 SDK's fetchWithAuth.
 * @internal
 */
export interface FetcherAuthParams {
  scope?: string[];
  audience?: string;
}

/**
 * Custom fetcher function signature expected by Auth0 SDK clients.
 * @internal
 */
export type FetcherSupplier = (
  url: string,
  init?: RequestInit,
  authParams?: FetcherAuthParams,
) => Promise<Response>;

/**
 * Options for creating a fetcher.
 * @internal
 */
export interface CreateFetcherOptions {
  dpopNonceId?: string;
}

/**
 * Fetcher interface returned by createFetcher.
 * @internal
 */
export interface Auth0Fetcher {
  fetchWithAuth: (
    url: string,
    init: RequestInit | undefined,
    authParams: FetcherAuthParams | undefined,
  ) => Promise<Response>;
}

/**
 * Function signature for createFetcher.
 * @internal
 */
export type CreateFetcherFunction = (options: CreateFetcherOptions) => Auth0Fetcher;

/**
 * Response structure from the token endpoint.
 * @internal
 */
export type TokenEndpointResponse = {
  id_token: string;
  access_token: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
};

/**
 * Client configuration for Auth0 SDK.
 * @internal
 */
export interface ClientConfiguration {
  /**
   * The Auth0 domain that was configured
   */
  domain: string;
  /**
   * The Auth0 client ID that was configured
   */
  clientId: string;
}

/**
 * Basic Auth0 context interface for minimal authentication operations.
 * @internal
 */
export interface BasicAuth0ContextInterface {
  getConfiguration: () => Readonly<ClientConfiguration>;
  mfa: MfaApiClient;
  createFetcher: CreateFetcherFunction;
}

/**
 * Auth config for proxy mode — routes requests through an auth proxy URL.
 * @internal
 */
export type ProxyAuthConfig = {
  mode: 'proxy';
  proxyUrl: string;
  domain?: string;
};

/**
 * Auth config for SPA mode — uses a context interface and Auth0 domain directly.
 * @internal
 */
export type SpaAuthConfig = {
  mode: 'spa';
  contextInterface: BasicAuth0ContextInterface;
  domain: string;
};

/**
 * Discriminated union of the two supported auth configurations.
 * @internal
 */
export type ClientAuthConfig = ProxyAuthConfig | SpaAuthConfig;

/**
 * Authentication details for provider configuration.
 * @internal
 */
export interface AuthDetails {
  domain?: string | undefined;
  authProxyUrl?: string | undefined;
  contextInterface?: BasicAuth0ContextInterface | undefined;
  previewMode?: boolean; // For docs - skip API client initialization
}

/**
 * Base interface for CoreClient functionality.
 * @internal
 */
export interface BaseCoreClientInterface {
  auth: AuthDetails;
  i18nService: I18nServiceInterface;
  isProxyMode: () => boolean;
  getDomain: () => string | undefined;
}

/**
 * Full CoreClient interface with API clients.
 * @internal
 */
export interface CoreClientInterface extends BaseCoreClientInterface {
  myAccountApiClient: MyAccountClient | undefined;
  myOrganizationApiClient: MyOrganizationClient | undefined;
  getMyAccountApiClient: () => MyAccountClient;
  getMyOrganizationApiClient: () => MyOrganizationClient;
  getMFAStepUpApiClient: () => MfaApiClient;
}
