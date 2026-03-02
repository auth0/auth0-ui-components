/**
 * SSO provider edit schema type definitions.
 * @module sso-provider-edit-schema-types
 * @internal
 */

import type {
  ProviderDetailsSchema,
  ProviderConfigureSchema,
} from './sso-provider/sso-provider-create-schema-types';

/**
 * Combined schema for SSO provider details editing.
 * @internal
 */
export interface SsoProviderDetailsSchema extends ProviderDetailsSchema, ProviderConfigureSchema {}
