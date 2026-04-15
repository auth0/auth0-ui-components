/**
 * Invitation creation schema type definitions.
 * @module invitation-create-schema-types
 * @internal
 */

/**
 * Schema configuration for a single email field.
 * @internal
 */
export interface EmailFieldConfig {
  regex?: RegExp;
  errorMessage?: string;
}

/**
 * Schema configuration for invitation creation form.
 * Consumers can override validation rules for each field.
 * @internal
 */
export interface InvitationCreateSchemas {
  email?: EmailFieldConfig;
  maxEmails?: number;
}
