/**
 * SSO provisioning SCIM token create schema type definitions.
 * @module sso-provisioning-token-create-schema-types
 * @internal
 */

import type { IdpScimTokenScope } from '@core/services/my-organization/idp-management/sso-provisioning/sso-provisioning-types';

/**
 * Form rules resolved from the Connection Profile SCIM token config.
 * @internal
 */
export interface ProvisioningCreateTokenFormRules {
  defaultExpiry: number | null;
  maxAllowedExpiry: number | null;
  allowedScopes: IdpScimTokenScope[];
}

/**
 * Schema configuration for the create-token form (translated validation messages).
 * @internal
 */
export interface ProvisioningCreateTokenSchema {
  required: string;
  integer: string;
  min: string;
  max: string;
  scopesRequired: string;
}
