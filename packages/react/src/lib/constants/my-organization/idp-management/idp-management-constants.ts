/**
 * Constants for IDP management components.
 * @module idp-management-constants
 * @internal
 */

export const SSO_PROVIDER_EDIT_TAB_GRID_COLUMNS: Record<number, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
  3: 'grid-cols-3',
};

export const ALLOWED_CERT_EXTENSIONS = ['.pem', '.cer', '.crt'] as const;

export const CONFIGURE_ORG_DOMAINS_DOCS_URL =
  'https://auth0.com/docs/get-started/universal-components/web/components/configure-org-domains';

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
