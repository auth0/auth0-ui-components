import { createFieldSchema, COMMON_FIELD_CONFIGS } from '@core/schemas/common';
import { z } from 'zod';

import type {
  ProvisioningDetailsSchema,
  SsoProvisioningSchema,
} from './sso-provisioning-edit-schema-types';

/**
 * Creates a schema for Provisioning Details form validation
 */
export const createProvisioningDetailsSchema = (options: ProvisioningDetailsSchema = {}) => {
  const { userIdAttribute = {}, scimEndpointUrl = {} } = options;

  return z.object({
    userIdAttribute: createFieldSchema(
      COMMON_FIELD_CONFIGS.userIdAttribute,
      {
        ...userIdAttribute,
        required: userIdAttribute.required ?? true,
      },
      userIdAttribute.errorMessage || 'User ID attribute is required',
    ),
    scimEndpointUrl: createFieldSchema(
      COMMON_FIELD_CONFIGS.url,
      {
        ...scimEndpointUrl,
        required: scimEndpointUrl.required ?? false,
      },
      scimEndpointUrl.errorMessage || 'Must be a valid URL',
    ).optional(),
  });
};

/**
 * Creates a complete schema for SSO provisioning form validation
 */
export const createSsoProvisioningSchema = (options: SsoProvisioningSchema = {}) => {
  return createProvisioningDetailsSchema(options);
};

// Default schema instances
export const provisioningDetailsSchema = createProvisioningDetailsSchema();
export const ssoProvisioningSchema = createSsoProvisioningSchema();

// Type exports
export type ProvisioningDetailsFormValues = z.infer<typeof provisioningDetailsSchema>;
export type SsoProvisioningFormValues = z.infer<typeof ssoProvisioningSchema>;
