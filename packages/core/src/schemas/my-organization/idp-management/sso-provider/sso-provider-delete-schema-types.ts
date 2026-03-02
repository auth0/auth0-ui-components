/**
 * SSO provider deletion schema type definitions.
 * @module sso-provider-delete-schema-types
 * @internal
 */

/**
 * Schema configuration for SSO provider deletion confirmation.
 * @internal
 */
export interface SsoProviderDeleteSchema {
  providerName?: {
    required?: boolean;
    errorMessage?: string;
    exactMatch?: string;
  };
}
