/**
 * Constants for IDP management components.
 * @module idp-management-constants
 * @internal
 */

import {
  DIGEST_ALGORITHMS,
  PROTOCOL_BINDINGS,
  SIGNATURE_ALGORITHMS,
  type IdpStrategy,
} from '@auth0/universal-components-core';

import type {
  CopyValueDefinition,
  InstructionsPageItem,
} from '@/types/my-organization/idp-management/sso-guided-setup/sso-guided-setup-types';
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

export const PING_FEDERATE_HELP_LINKS = {
  sign_request: 'domain/pem?cert=connection',
} as const;

export const OKTA_HELP_LINKS = {
  domain: 'https://developer.okta.com/docs/guides/find-your-domain/main/',
  client_id: 'https://developer.okta.com/docs/guides/find-your-app-credentials/main',
  client_secret: 'https://developer.okta.com/docs/guides/find-your-app-credentials/main',
} as const;

export const OIDC_CHANNELS = ['back_channel', 'front_channel'] as const;

export const COPY_VALUE_CONTENT_TYPES: Record<string, CopyValueDefinition> = {
  callback_url_component: { value: 'callbackUrl', messageKey: 'callback_url' },
  sso_url_component: { value: 'samlSsoUrl', messageKey: 'sso_url' },
  service_provider_entity_id_component: {
    value: 'serviceProviderEntityId',
    messageKey: 'service_provider_entity_id',
  },
  adfs_relying_party_ws_federation_passive_protocol_url_component: {
    value: 'adfsWsFederationUrl',
    messageKey: 'adfs_ws_federation_url',
  },
  adfs_relying_party_trust_identifier_component: {
    value: 'adfsRelyingPartyIdentifier',
    messageKey: 'adfs_relying_party_identifier',
  },
  google_apps_authorized_javascript_origins_component: {
    value: 'googleJavascriptOrigin',
    messageKey: 'google_javascript_origin',
  },
  google_apps_authorized_redirect_uri_component: {
    value: 'googleRedirectUri',
    messageKey: 'google_redirect_uri',
  },
  pingfederate_partners_entity_id_component: {
    value: 'pingFederatePartnerEntityId',
    messageKey: 'pingfederate_partner_entity_id',
  },
  pingfederate_endpoint_url_component: {
    value: 'pingFederateEndpointUrl',
    messageKey: 'pingfederate_endpoint_url',
  },
};

export const CONFIGURE_CONNECTION_CONTENT_TYPES = [
  'okta_configure_connection_component',
  'oidc_configure_connection_component',
  'samlp_configure_connection_component',
  'adfs_configure_connection_component',
  'waad_configure_connection_component',
  'google_apps_configure_connection_component',
  'pingfederate_configure_connection_component',
] as const;

export const EMPTY_INSTRUCTION_PAGES: InstructionsPageItem[] = [];

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

/** Connection access fields the advanced configure form holds only when it shows them. */
export const CONNECTION_ACCESS_FIELDS = [
  'use_for_third_party_client_access',
  'cross_app_access_resource_app',
] as const;

export const ATTRIBUTE_MAPPING_CONTENT_TYPE = 'attribute_mapping_list_component';

export const TEST_RESPONSE_PROTOCOL: Record<IdpStrategy, string> = {
  adfs: 'WS-Federation',
  'google-apps': 'OIDC',
  oidc: 'OIDC',
  okta: 'OIDC',
  pingfederate: 'SAML',
  samlp: 'SAML',
  waad: 'OIDC',
};
