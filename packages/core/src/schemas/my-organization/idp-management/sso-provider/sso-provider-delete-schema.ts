import { z } from 'zod';

import type { SsoProviderDeleteSchema } from './sso-provider-delete-schema-types';

/**
 * Creates a schema for delete SSO provider confirmation
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
 */
export const deleteProviderSchema = (expectedProviderName: string) =>
  createDeleteProviderSchema(expectedProviderName);

/**
 * Type definitions
 */
export type DeleteProviderFormValues = z.infer<ReturnType<typeof deleteProviderSchema>>;
