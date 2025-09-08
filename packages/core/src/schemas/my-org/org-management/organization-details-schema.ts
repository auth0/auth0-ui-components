import { z } from 'zod';
import { createStringSchema, createLogoSchema } from '@core/schemas/common';

/**
 * Comprehensive validation options for organization detail schema
 */
export interface OrganizationDetailSchemaValidation {
  name?: {
    regex?: RegExp;
    errorMessage?: string;
    minLength?: number;
    maxLength?: number;
    required?: boolean;
  };
  displayName?: {
    regex?: RegExp;
    errorMessage?: string;
    minLength?: number;
    maxLength?: number;
    required?: boolean;
  };
  color?: {
    regex?: RegExp;
    errorMessage?: string;
  };
  logoURL?: {
    regex?: RegExp;
    errorMessage?: string;
  };
}

/**
 * Creates a schema for organization detail form validation
 * @param options - Configuration options for schema validation
 * @returns Zod schema for organization detail validation
 */
export const createOrganizationDetailSchema = (
  options: OrganizationDetailSchemaValidation = {},
) => {
  const { name = {}, displayName = {}, color = {}, logoURL = {} } = options;

  // Set defaults for color validation
  const colorRegex = color.regex || /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
  const colorErrorMessage = color.errorMessage || 'Invalid color format';

  return z.object({
    name: createStringSchema({
      required: name.required ?? true,
      regex: name.regex,
      errorMessage: name.errorMessage,
      minLength: name.minLength,
      maxLength: name.maxLength,
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
export type OrganizationDetailFormValues = z.infer<typeof organizationDetailSchema>;
