/**
 * SSO provider deletion schema for form validation.
 * @module sso-provider-delete-schema
 * @internal
 */

import { z } from 'zod';

import type { SsoProviderDeleteSchema } from './sso-provider-delete-schema-types';

/**
 * Creates a schema for delete SSO provider confirmation.
 * @param expectedProviderName - Expected name for validation
 * @param options - Configuration options
 * @returns Zod schema for delete confirmation
 * @internal
 */
export const createDeleteProviderSchema = (
  expectedProviderName: string,
  options: SsoProviderDeleteSchema = {},
) => {
  const { providerName = {} } = options;

  return z.object({
    providerName: z
      .string({
        required_error: providerName.errorMessage || 'Provider name is required',
      })
      .refine((value) => value === (providerName.exactMatch || expectedProviderName), {
        message: `Please enter "${providerName.exactMatch || expectedProviderName}" to confirm deletion`,
      }),
  });
};

/**
 * Default schema for delete provider validation
 * @param expectedProviderName - Expected name for validation
 * @returns Zod schema for delete validation
 */
export const deleteProviderSchema = (expectedProviderName: string) =>
  createDeleteProviderSchema(expectedProviderName);

/**
 * Type definitions
 */
export type DeleteProviderFormValues = z.infer<ReturnType<typeof deleteProviderSchema>>;
