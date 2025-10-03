import { createStringSchema, createLogoSchema } from '@core/schemas/common';
import { z } from 'zod';

import { type OrgDetailsSchemas } from './organization-details-schema-types';

/**
 * Creates a schema for organization detail form validation
 * @param options - Configuration options for schema validation
 * @returns Zod schema for organization detail validation
 */
export const createOrganizationDetailSchema = (options: OrgDetailsSchemas = {}) => {
  const { name = {}, displayName = {}, color = {}, logoURL = {} } = options;

  // Set defaults for color validation
  const colorRegex = color.regex || /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  const colorErrorMessage = color.errorMessage || 'Invalid color format';

  return z.object({
    name: createStringSchema({
      required: true,
      errorMessage: name.errorMessage,
    }),
    display_name: createStringSchema({
      required: displayName.required ?? true,
      regex: displayName.regex,
      errorMessage: displayName.errorMessage,
      minLength: displayName.minLength,
      maxLength: displayName.maxLength,
    }),
    branding: z.object({
      logo_url: createLogoSchema({
        required: false,
        regex: logoURL.regex,
        errorMessage: logoURL.errorMessage,
      }),
      colors: z.object({
        primary: z.string().regex(colorRegex, colorErrorMessage),
        page_background: z.string().regex(colorRegex, colorErrorMessage),
      }),
    }),
  });
};

/**
 * Default schema for organization detail form validation
 */
export const organizationDetailSchema = createOrganizationDetailSchema();

/**
 * Type for organization detail form data
 */
export type InternalOrganizationDetailsFormValues = z.infer<typeof organizationDetailSchema>;
