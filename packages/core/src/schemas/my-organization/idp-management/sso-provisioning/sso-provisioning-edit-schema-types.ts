/**
 * SSO provisioning edit schema type definitions.
 * @module sso-provisioning-edit-schema-types
 * @internal
 */

import type { FieldOptions } from '@core/schemas/common';

/**
 * Schema configuration for Provisioning Details.
 * @internal
 */
export interface ProvisioningDetailsSchema {
  userIdAttribute?: FieldOptions;
  scimEndpointUrl?: FieldOptions;
}

/**
 * Combined schema for SSO provisioning editing.
 * @internal
 */
export interface SsoProvisioningSchema extends ProvisioningDetailsSchema {}
