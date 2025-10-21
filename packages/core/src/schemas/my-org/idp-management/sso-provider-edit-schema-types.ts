import type {
  ProviderDetailsSchema,
  ProviderConfigureSchema,
} from './sso-provider-create-schema-types';

export interface SsoProviderDetailsSchema extends ProviderDetailsSchema, ProviderConfigureSchema {}
