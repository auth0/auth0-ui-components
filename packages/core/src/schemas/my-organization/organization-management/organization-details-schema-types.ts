/**
 * Organization details schema type definitions.
 * @module organization-details-schema-types
 * @internal
 */

/**
 * Schemas that can be used to override default schemas.
 * @internal
 */
export interface OrganizationDetailsSchemas {
  name?: {
    errorMessage?: string;
  };
  displayName?: {
    regex?: RegExp;
    errorMessage?: string;
    minLength?: number;
    maxLength?: number;
    required?: boolean;
  };
  primaryColor?: {
    regex?: RegExp;
    errorMessage?: string;
  };
  backgroundColor?: {
    regex?: RegExp;
    errorMessage?: string;
  };
  logoURL?: {
    regex?: RegExp;
    errorMessage?: string;
  };
}
