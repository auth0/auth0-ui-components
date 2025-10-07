import { createStringSchema } from '@core/schemas/common';
import { z } from 'zod';

import type {
  ProviderSelectionSchema,
  ProviderDetailsSchema,
  SsoProviderSchema,
} from './create-sso-provider-schema-types';

/**
 * Creates a schema for Step 1: Provider Selection
 */
export const createProviderSelectionSchema = (options: ProviderSelectionSchema = {}) => {
  const { strategy = {} } = options;

  return z.object({
    strategy: z
      .string({
        required_error: strategy.errorMessage || 'Please select a provider strategy',
      })
      .min(1, 'Provider strategy is required'),
  });
};

/**
 * Default schema for provider selection validation
 */
export const providerSelectionSchema = createProviderSelectionSchema();

/**
 * Creates a schema for Step 2: Provider Details
 */
export const createProviderDetailsSchema = (options: ProviderDetailsSchema = {}) => {
  const { name = {}, displayName = {} } = options;

  return z.object({
    name: createStringSchema({
      required: name.required ?? true,
      regex: name.regex,
      errorMessage: name.errorMessage || 'Please enter a valid provider name',
      minLength: name.minLength || 1,
      maxLength: name.maxLength || 100,
    }),
    display_name: createStringSchema({
      required: displayName.required ?? true,
      regex: displayName.regex,
      errorMessage: displayName.errorMessage || 'Please enter a valid display name',
      minLength: displayName.minLength || 1,
      maxLength: displayName.maxLength || 100,
    }),
  });
};

/**
 * Default schema for provider details validation
 */
export const providerDetailsSchema = createProviderDetailsSchema();

/**
 * Creates a complete schema for SSO provider form validation
 */
export const createSsoProviderSchema = (options: SsoProviderSchema = {}) => {
  const { name = {}, displayName = {}, strategy = {} } = options;

  return z.object({
    name: createStringSchema({
      required: name.required ?? true,
      regex: name.regex,
      errorMessage: name.errorMessage || 'Please enter a valid provider name',
      minLength: name.minLength || 1,
      maxLength: name.maxLength || 100,
    }),
    display_name: createStringSchema({
      required: displayName.required ?? true,
      regex: displayName.regex,
      errorMessage: displayName.errorMessage || 'Please enter a valid display name',
      minLength: displayName.minLength || 1,
      maxLength: displayName.maxLength || 100,
    }),
    strategy: z
      .string({
        required_error: strategy.errorMessage || 'Please select a provider strategy',
      })
      .min(1, 'Provider strategy is required'),
  });
};

/**
 * Default schema for complete SSO provider validation
 */
export const ssoProviderSchema = createSsoProviderSchema();

/**
 * Type definitions
 */
export type ProviderSelectionFormValues = z.infer<typeof providerSelectionSchema>;
export type ProviderDetailsFormValues = z.infer<typeof providerDetailsSchema>;
export type SsoProviderFormValues = z.infer<typeof ssoProviderSchema>;
