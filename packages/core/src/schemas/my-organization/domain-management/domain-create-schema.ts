/**
 * Domain creation schema for form validation.
 * @module domain-create-schema
 * @internal
 */

import { createDomainSchema } from '@core/schemas/common';
import { z } from 'zod';

import { type DomainCreateSchemas } from './domain-create-schema-types';

/**
 * Helper to merge schema field config with defaults.
 * @param schema - Zod validation schema
 * @param field - Form field name
 * @param defaultError - Default error message
 * @returns The merged field configuration
 * @internal
 */
const mergeFieldConfig = <T extends keyof DomainCreateSchemas>(
  schema: DomainCreateSchemas | undefined,
  field: T,
  defaultError: string,
) => {
  const fieldConfig = schema?.[field];
  return fieldConfig
    ? {
        ...fieldConfig,
        errorMessage: fieldConfig.errorMessage || defaultError,
      }
    : {
        errorMessage: defaultError,
      };
};

/**
 * Creates a schema for domain create form validation
 * @param options - Schema configuration options
 * @param defaultErrorMessage - Default error message for validation failures
 * @returns Zod schema for domain form validation
 */
export const createDomainCreateSchema = (
  options: DomainCreateSchemas = {},
  defaultErrorMessage = 'Please enter a valid domain (e.g., example.com or https://example.com)',
) => {
  const domainConfig = mergeFieldConfig(options, 'domainUrl', defaultErrorMessage);

  return z.object({
    domain_url: createDomainSchema({
      required: true,
      ...domainConfig,
    }),
  });
};

/**
 * Default schema for domain create form validation
 */
export const domainCreateSchema = createDomainCreateSchema();

/**
 * Type for domain create form data
 */
export type InternalDomainCreateFormValues = z.infer<typeof domainCreateSchema>;
