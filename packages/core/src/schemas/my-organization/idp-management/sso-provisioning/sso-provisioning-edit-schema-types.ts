import type { FieldOptions } from '@core/schemas/common';

/**
 * Schema configuration for Provisioning Details
 */
export interface ProvisioningDetailsSchema {
  userIdAttribute?: FieldOptions;
  scimEndpointUrl?: FieldOptions;
}

export interface SsoProvisioningSchema extends ProvisioningDetailsSchema {}
