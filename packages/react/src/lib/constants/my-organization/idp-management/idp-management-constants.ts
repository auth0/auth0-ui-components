/**
 * Constants for IDP management components.
 * @module idp-management-constants
 * @internal
 */

import {
  DIGEST_ALGORITHMS,
  PROTOCOL_BINDINGS,
  SIGNATURE_ALGORITHMS,
} from '@auth0/universal-components-core';

import type { SamlSelectFieldConfig } from '@/types/my-organization/idp-management/sso-provider/sso-provider-shared-types';

export const SSO_PROVIDER_EDIT_TAB_GRID_COLUMNS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
};

export const ALLOWED_CERT_EXTENSIONS = ['.pem', '.cer', '.crt'] as const;

const SAML_SIGNATURE_ALGORITHM_OPTIONS = SIGNATURE_ALGORITHMS.map((value) => ({
  value,
  label: value.toUpperCase(),
}));

const SAML_DIGEST_ALGORITHM_OPTIONS = DIGEST_ALGORITHMS.map((value) => ({
  value,
  label: value.toUpperCase(),
}));

const SAML_BINDING_METHOD_OPTIONS = PROTOCOL_BINDINGS.map((value) => ({
  value,
  label: value.split(':').pop() ?? value,
}));

export const SAML_SIGNATURE_ALGORITHM_FIELD = {
  name: 'signatureAlgorithm',
  messageKey: 'sign_request_algorithm',
  options: SAML_SIGNATURE_ALGORITHM_OPTIONS,
} satisfies SamlSelectFieldConfig;

export const SAML_DIGEST_ALGORITHM_FIELD = {
  name: 'digestAlgorithm',
  messageKey: 'sign_request_algorithm_digest',
  options: SAML_DIGEST_ALGORITHM_OPTIONS,
} satisfies SamlSelectFieldConfig;

export const SAML_BINDING_METHOD_FIELD = {
  name: 'bindingMethod',
  messageKey: 'request_protocol_binding',
  options: SAML_BINDING_METHOD_OPTIONS,
} satisfies SamlSelectFieldConfig;

export const SAML_CONNECTION_SOURCES = ['meta_data_url', 'meta_data_file'] as const;

export const SAML_CONNECTION_SOURCE_TAB_LABEL_KEYS = {
  meta_data_url: 'fields.common.connection_method.automatic',
  meta_data_file: 'fields.common.connection_method.manual',
} as const;

export const CONFIGURE_ORG_DOMAINS_DOCS_URL =
  'https://auth0.com/docs/get-started/universal-components/web/components/configure-org-domains';

/** Lifecycle states of an identity provider test. */
export const SSO_PROVIDER_TEST_STATE = {
  IDLE: 'idle',
  STARTING: 'starting',
  POLLING: 'polling',
  SUCCESS: 'success',
  ERROR: 'error',
  TIMEOUT: 'timeout',
} as const;

export const SSO_PROVIDER_TEST_ERROR_REASON = {
  PROVIDER: 'provider',
  EXPIRED: 'expired',
  FORBIDDEN: 'forbidden',
} as const;

/** Size of the popup window that runs an identity provider test. */
export const SSO_PROVIDER_TEST_POPUP_WIDTH = 500;
export const SSO_PROVIDER_TEST_POPUP_HEIGHT = 700;

/** Poll errors that end the test: missing scope (403), or a test that expired or never existed (404). */
export const SSO_PROVIDER_TEST_FORBIDDEN_STATUS = 403;
export const SSO_PROVIDER_TEST_NOT_FOUND_STATUS = 404;
export const SSO_PROVIDER_TEST_FATAL_POLL_STATUSES: ReadonlySet<number> = new Set([
  SSO_PROVIDER_TEST_FORBIDDEN_STATUS,
  SSO_PROVIDER_TEST_NOT_FOUND_STATUS,
]);

/** Polling cadence and caps for an identity provider test. */
export const SSO_PROVIDER_TEST_POLL_INTERVAL_MS = 5_000;
export const SSO_PROVIDER_TEST_MAX_POLL_ATTEMPTS = 120;
export const SSO_PROVIDER_TEST_MAX_POLL_DURATION_MS = 600_000;
