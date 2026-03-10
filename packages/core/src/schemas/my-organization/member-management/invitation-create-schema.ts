/**
 * Invitation creation schema for form validation.
 * @module invitation-create-schema
 * @internal
 */

import { z } from 'zod';

import { type InvitationCreateSchemas } from './invitation-create-schema-types';

/** Default email regex pattern. */
const DEFAULT_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Default maximum number of email addresses allowed. */
const DEFAULT_MAX_EMAILS = 10;

/**
 * Helper to merge schema field config with defaults.
 * @param schema - Schema configuration
 * @param field - Form field name
 * @param defaultError - Default error message
 * @returns The merged field configuration
 * @internal
 */
const mergeFieldConfig = (
  schema: InvitationCreateSchemas | undefined,
  field: 'email',
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
 * Creates a schema for invitation create form validation.
 * @param options - Schema configuration options (consumers can override)
 * @param defaultEmailError - Default error message for invalid email
 * @returns Object containing Zod email schema, email regex, and maxEmails
 */
export const createInvitationCreateSchema = (
  options: InvitationCreateSchemas = {},
  defaultEmailError = 'Please enter a valid email address',
) => {
  const emailConfig = mergeFieldConfig(options, 'email', defaultEmailError);

  const emailRegex = emailConfig.regex ?? DEFAULT_EMAIL_REGEX;
  const emailErrorMessage = emailConfig.errorMessage ?? defaultEmailError;
  const maxEmails = options.maxEmails ?? DEFAULT_MAX_EMAILS;

  const emailSchema = z.string().min(1, emailErrorMessage).regex(emailRegex, emailErrorMessage);

  return {
    emailSchema,
    emailRegex,
    emailErrorMessage,
    maxEmails,
  };
};

/**
 * Default invitation create schema configuration.
 */
export const invitationCreateSchemaDefaults = createInvitationCreateSchema();

/**
 * Type for a validated email value.
 */
export type InternalInvitationEmailValue = z.infer<
  typeof invitationCreateSchemaDefaults.emailSchema
>;
