import { createStringSchema, createLogoSchema } from '@core/schemas/common';
import { z } from 'zod';

import { type OrgDetailsSchemas } from './organization-details-schema-types';

/**
 * Creates a schema for organization detail form validation
 * @param options - Configuration options for schema validation
 * @returns Zod schema for organization detail validation
 */
export const createOrganizationDetailSchema = (options: OrgDetailsSchemas = {}) => {
  const {
    name = {},
    displayName = {},
    primaryColor = {},
    logoURL = {},
    backgroundColor = {},
  } = options;

  const regex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  const commonErrorMessage = 'Invalid color format';

  // Set defaults for primary color validation
  const primaryColorRegex = primaryColor.regex || regex;
  const primaryColorErrorMessage = primaryColor.errorMessage || commonErrorMessage;

  // Set defaults for background color validation
  const backgroundColorRegex = backgroundColor.regex || regex;
  const backgroundColorErrorMessage = backgroundColor.errorMessage || commonErrorMessage;

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
        primary: z.string().regex(primaryColorRegex, primaryColorErrorMessage),
        page_background: z.string().regex(backgroundColorRegex, backgroundColorErrorMessage),
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
