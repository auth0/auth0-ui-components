/**
 * Domain creation schema type definitions.
 * @module domain-create-schema-types
 * @internal
 */

/**
 * Schema configuration for domain creation form.
 * @internal
 */
export interface DomainCreateSchemas {
  domainUrl?: {
    regex?: RegExp;
    errorMessage?: string;
  };
}
