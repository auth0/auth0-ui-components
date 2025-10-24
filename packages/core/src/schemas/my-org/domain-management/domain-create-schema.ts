import { createStringSchema } from '@core/schemas/common';
import { z } from 'zod';

import { type DomainCreateSchemas } from './domain-create-schema-types';

/**
 * Helper to merge schema field config with defaults
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
 */
export const createDomainCreateSchema = (
  options: DomainCreateSchemas = {},
  defaultErrorMessage = 'Invalid domain format',
) => {
  return z.object({
    domain_url: createStringSchema({
      required: true,
      ...mergeFieldConfig(options, 'domainUrl', defaultErrorMessage),
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
