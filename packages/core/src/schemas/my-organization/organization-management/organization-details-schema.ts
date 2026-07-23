/**
 * Organization details schema for form validation.
 * @module organization-details-schema
 * @internal
 */

import { createStringSchema, createLogoSchema } from '@core/schemas/common/common-schemas';
import { z } from 'zod';

import { type OrganizationDetailsSchemas } from './organization-details-schema-types';

/**
 * Regex for valid Auth0 organization names.
 * Allows lowercase alphanumeric characters and hyphens, but not at start/end.
 */
const ORGANIZATION_NAME_REGEX = /^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/;

/**
 * Regex for valid organization display names.
 * Allows alphanumeric, Unicode letters (accents/diacritics), spaces, hyphens,
 * underscores, periods (no consecutive), and apostrophes.
 */
const ORGANIZATION_DISPLAY_NAME_REGEX = /^(?!.*\.\.)[a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF\s\-_.']+$/;

/**
 * Creates a schema for organization detail form validation.
 * @internal
 *
 * @param options - Configuration options for schema validation
 * @returns Zod schema for organization detail validation
 */
export const createOrganizationDetailSchema = (options: OrganizationDetailsSchemas = {}) => {
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
      regex: name.regex ?? ORGANIZATION_NAME_REGEX,
      errorMessage: name.errorMessage,
      minLength: name.minLength,
      maxLength: name.maxLength,
    }),
    display_name: createStringSchema({
      required: displayName.required ?? true,
      regex: displayName.regex ?? ORGANIZATION_DISPLAY_NAME_REGEX,
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
    third_party_client_access: z.enum(['allow', 'block']).optional(),
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
