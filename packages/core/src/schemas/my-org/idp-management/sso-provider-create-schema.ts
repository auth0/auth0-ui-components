import {
  createBooleanSchema,
  createFieldSchema,
  COMMON_FIELD_CONFIGS,
  type FieldOptions,
  type BooleanFieldOptions,
} from '@core/schemas/common';
import type { IdpStrategy } from '@core/services';
import { AVAILABLE_STRATEGY_LIST } from '@core/services';
import { z } from 'zod';

import type {
  ProviderConfigureSchema,
  ProviderSelectionSchema,
  ProviderDetailsSchema,
  SsoProviderSchema,
} from './sso-provider-create-schema-types';

interface OktaOptions {
  domain?: FieldOptions;
  client_id?: FieldOptions;
  client_secret?: FieldOptions;
  icon_url?: FieldOptions;
  callback_url?: FieldOptions;
}

interface AdfsOptions {
  meta_data_source?: FieldOptions;
  meta_data_location_url?: FieldOptions;
  adfs_server?: FieldOptions;
  fedMetadataXml?: FieldOptions;
}

interface GoogleAppsOptions {
  domain?: FieldOptions;
  client_id?: FieldOptions;
  client_secret?: FieldOptions;
  icon_url?: FieldOptions;
  callback_url?: FieldOptions;
}

interface OidcOptions {
  type?: FieldOptions;
  client_id?: FieldOptions;
  client_secret?: FieldOptions;
  discovery_url?: FieldOptions;
}

interface PingFederateOptions {
  pingFederateBaseUrl?: FieldOptions;
  signatureAlgorithm?: FieldOptions;
  digestAlgorithm?: FieldOptions;
  signSAMLRequest?: BooleanFieldOptions;
  signingCert?: FieldOptions;
  cert?: FieldOptions;
  icon_url?: FieldOptions;
  idpInitiated?: FieldOptions;
}

interface SamlpOptions {
  signatureAlgorithm?: FieldOptions;
  digestAlgorithm?: FieldOptions;
  protocolBinding?: FieldOptions;
  signSAMLRequest?: BooleanFieldOptions;
  bindingMethod?: FieldOptions;
  metadataUrl?: FieldOptions;
  single_sign_on_login_url?: FieldOptions;
  cert?: FieldOptions;
  icon_url?: FieldOptions;
  idpInitiated?: FieldOptions;
}

interface WaadOptions {
  tenant_domain?: FieldOptions;
  client_id?: FieldOptions;
  client_secret?: FieldOptions;
  icon_url?: FieldOptions;
  callback_url?: FieldOptions;
}

const STRATEGY_BUILDERS = {
  okta: (options: OktaOptions = {}) =>
    z.object({
      domain: createFieldSchema(
        COMMON_FIELD_CONFIGS.domain,
        { ...options.domain, required: true },
        'Please enter a valid Okta domain',
      ),
      client_id: createFieldSchema(COMMON_FIELD_CONFIGS.client_id, {
        ...options.client_id,
        required: true,
      }),
      client_secret: createFieldSchema(COMMON_FIELD_CONFIGS.client_secret, {
        ...options.client_secret,
        required: true,
      }),
      icon_url: createFieldSchema(COMMON_FIELD_CONFIGS.icon_url, {
        ...options.icon_url,
        required: false,
      }),
      callback_url: createFieldSchema(COMMON_FIELD_CONFIGS.callback_url, {
        ...options.callback_url,
        required: false,
      }),
    }),

  adfs: (options: AdfsOptions = {}) =>
    z
      .object({
        meta_data_source: z
          .string({
            required_error: 'Please enter a metadata source',
          })
          .min(1, 'Metadata source is required'),
        meta_data_location_url: createFieldSchema(
          COMMON_FIELD_CONFIGS.url,
          options.meta_data_location_url,
          'Please enter a valid metadata location URL',
        ),
        adfs_server: createFieldSchema(
          COMMON_FIELD_CONFIGS.url,
          { ...options.adfs_server, required: false },
          'Please enter a valid ADFS server URL',
        ),
        fedMetadataXml: createFieldSchema(
          COMMON_FIELD_CONFIGS.metadata,
          { ...options.fedMetadataXml, required: false },
          'Please enter valid Federation Metadata XML',
        ),
      })
      .refine((data) => data.adfs_server || data.fedMetadataXml, {
        message: 'Either ADFS server URL or Federation Metadata XML is required',
        path: ['adfs_server'],
      }),

  'google-apps': (options: GoogleAppsOptions = {}) =>
    z.object({
      domain: createFieldSchema(
        COMMON_FIELD_CONFIGS.domain,
        { ...options.domain, required: true },
        'Please enter a valid Google Workspace domain',
      ),
      client_id: createFieldSchema(COMMON_FIELD_CONFIGS.client_id, {
        ...options.client_id,
        required: true,
      }),
      client_secret: createFieldSchema(COMMON_FIELD_CONFIGS.client_secret, {
        ...options.client_secret,
        required: true,
      }),
      icon_url: createFieldSchema(COMMON_FIELD_CONFIGS.icon_url, {
        ...options.icon_url,
        required: false,
      }),
      callback_url: createFieldSchema(COMMON_FIELD_CONFIGS.callback_url, {
        ...options.callback_url,
        required: false,
      }),
    }),

  oidc: (options: OidcOptions = {}) =>
    z.object({
      type: createFieldSchema(
        COMMON_FIELD_CONFIGS.algorithm,
        { ...options.type, required: true },
        'Please enter a valid type',
      ),
      client_id: createFieldSchema(COMMON_FIELD_CONFIGS.client_id, {
        ...options.client_id,
        required: true,
      }),
      client_secret: createFieldSchema(COMMON_FIELD_CONFIGS.client_secret, {
        ...options.client_secret,
        required: true,
      }),
      discovery_url: createFieldSchema(
        COMMON_FIELD_CONFIGS.url,
        { ...options.discovery_url, required: true },
        'Please enter a valid discovery URL',
      ),
    }),

  pingfederate: (options: PingFederateOptions = {}) =>
    z.object({
      pingFederateBaseUrl: createFieldSchema(
        COMMON_FIELD_CONFIGS.url,
        { ...options.pingFederateBaseUrl, required: true },
        'Please enter a valid PingFederate base URL',
      ),
      signatureAlgorithm: createFieldSchema(
        COMMON_FIELD_CONFIGS.algorithm,
        { ...options.signatureAlgorithm, required: true },
        'Please enter a valid signature algorithm',
      ),
      digestAlgorithm: createFieldSchema(
        COMMON_FIELD_CONFIGS.algorithm,
        { ...options.digestAlgorithm, required: true },
        'Please enter a valid digest algorithm',
      ),
      signSAMLRequest: createBooleanSchema({
        required: true,
        errorMessage:
          options.signSAMLRequest?.errorMessage ?? 'SAML request signing option is required',
      }),
      signingCert: createFieldSchema(
        COMMON_FIELD_CONFIGS.certificate,
        { ...options.signingCert, required: true },
        'Please enter a valid signing certificate',
      ),
      cert: createFieldSchema(COMMON_FIELD_CONFIGS.certificate, {
        ...options.cert,
        required: false,
      }),
      idpInitiated: z
        .object({
          enabled: z.boolean().optional(),
          client_id: z.string().optional(),
          client_protocol: z.string().optional(),
          client_authorizequery: z.string().optional(),
        })
        .optional(),
      icon_url: createFieldSchema(COMMON_FIELD_CONFIGS.icon_url, {
        ...options.icon_url,
        required: false,
      }),
    }),

  samlp: (options: SamlpOptions = {}) =>
    z.object({
      meta_data_source: z
        .string({
          required_error: 'Please enter a metadata source',
        })
        .min(1, 'Metadata source is required'),
      single_sign_on_login_url: createFieldSchema(
        COMMON_FIELD_CONFIGS.url,
        { ...options.single_sign_on_login_url, required: false },
        'Please enter a valid URL',
      ),
      signatureAlgorithm: createFieldSchema(
        COMMON_FIELD_CONFIGS.algorithm,
        { ...options.signatureAlgorithm, required: false },
        'Please enter a valid signature algorithm',
      ),
      digestAlgorithm: createFieldSchema(
        COMMON_FIELD_CONFIGS.algorithm,
        { ...options.digestAlgorithm, required: false },
        'Please enter a valid digest algorithm',
      ),
      protocolBinding: createFieldSchema(
        COMMON_FIELD_CONFIGS.algorithm,
        { ...options.protocolBinding, required: false },
        'Please enter a valid protocol binding',
      ),
      signSAMLRequest: createBooleanSchema({
        required: true,
        errorMessage:
          options.signSAMLRequest?.errorMessage ?? 'SAML request signing option is required',
      }),
      bindingMethod: createFieldSchema(
        COMMON_FIELD_CONFIGS.algorithm,
        { ...options.bindingMethod, required: false },
        'Please enter a valid binding method',
      ),
      metadataUrl: createFieldSchema(
        COMMON_FIELD_CONFIGS.url,
        { ...options.metadataUrl, required: true },
        'Please enter a valid metadata URL',
      ),
      cert: createFieldSchema(COMMON_FIELD_CONFIGS.certificate, {
        ...options.cert,
        required: true,
      }),
      idpInitiated: z
        .object({
          enabled: z.boolean().optional(),
          client_id: z.string().optional(),
          client_protocol: z.string().optional(),
          client_authorizequery: z.string().optional(),
        })
        .optional(),
      icon_url: createFieldSchema(COMMON_FIELD_CONFIGS.icon_url, {
        ...options.icon_url,
        required: false,
      }),
    }),

  waad: (options: WaadOptions = {}) =>
    z.object({
      tenant_domain: createFieldSchema(
        COMMON_FIELD_CONFIGS.domain,
        { ...options.tenant_domain, required: true },
        'Please enter a valid Azure AD tenant domain',
      ),
      client_id: createFieldSchema(COMMON_FIELD_CONFIGS.client_id, {
        ...options.client_id,
        required: true,
      }),
      client_secret: createFieldSchema(COMMON_FIELD_CONFIGS.client_secret, {
        ...options.client_secret,
        required: true,
      }),
      icon_url: createFieldSchema(COMMON_FIELD_CONFIGS.icon_url, {
        ...options.icon_url,
        required: false,
      }),
      callback_url: createFieldSchema(COMMON_FIELD_CONFIGS.callback_url, {
        ...options.callback_url,
        required: false,
      }),
    }),
} as const;

/**
 * Creates a schema for Step 1: Provider Selection
 */

export const createProviderSelectionSchema = (options: ProviderSelectionSchema = {}) => {
  const { strategy = {} } = options;
  return z.object({
    strategy: z.enum(AVAILABLE_STRATEGY_LIST as [IdpStrategy, ...IdpStrategy[]], {
      required_error: strategy.errorMessage || 'Please select a provider strategy',
      invalid_type_error: strategy.errorMessage || 'Please select a valid provider strategy',
    }),
  });
};

/**
 * Creates a schema for Step 2: Provider Details
 */
export const createProviderDetailsSchema = (options: ProviderDetailsSchema = {}) => {
  const { name = {}, displayName = {} } = options;

  return z.object({
    name: z
      .string({
        required_error: name.errorMessage || 'Please enter a valid provider name',
      })
      .min(1, 'Provider name is required')
      .regex(
        name.regex || /^[a-zA-Z0-9](-[a-zA-Z0-9]|[a-zA-Z0-9])*$/,
        "The name of the connection. Must start and end with an alphanumeric character and can only contain alphanumeric characters and '-'. Max length 128",
      ),
    display_name: z
      .string({
        required_error: displayName.errorMessage || 'Please enter a valid display name',
      })
      .min(1, 'Display name is required')
      .regex(
        displayName.regex || /.*/,
        displayName.errorMessage || 'Please enter a valid display name',
      ),
  });
};

type StrategySchemaMap = {
  okta: ReturnType<typeof STRATEGY_BUILDERS.okta>;
  adfs: ReturnType<typeof STRATEGY_BUILDERS.adfs>;
  'google-apps': ReturnType<(typeof STRATEGY_BUILDERS)['google-apps']>;
  oidc: ReturnType<typeof STRATEGY_BUILDERS.oidc>;
  pingfederate: ReturnType<(typeof STRATEGY_BUILDERS)['pingfederate']>;
  samlp: ReturnType<typeof STRATEGY_BUILDERS.samlp>;
  waad: ReturnType<typeof STRATEGY_BUILDERS.waad>;
};

/**
 * Creates a dynamic schema for Step 3: Provider Configuration based on strategy
 */
export function createProviderConfigureSchema<T extends IdpStrategy>(
  strategy: T,
  options: ProviderConfigureSchema = {},
): StrategySchemaMap[T] {
  const strategyOptions = options[strategy] || {};
  const builder = STRATEGY_BUILDERS[strategy];

  if (!builder) {
    throw new Error(`Unsupported strategy: ${strategy}`);
  }

  return builder(strategyOptions as Parameters<typeof builder>[0]) as StrategySchemaMap[T];
}

/**
 * Creates a complete schema for SSO provider form validation
 */
/**
 * Creates a complete schema for SSO provider form validation that combines all three steps
 */
export const createSsoProviderSchema = (options: SsoProviderSchema = {}) => {
  const selectionSchema = createProviderSelectionSchema(options);
  const detailsSchema = createProviderDetailsSchema(options);
  return selectionSchema.merge(detailsSchema);
};

export const providerSelectionSchema = createProviderSelectionSchema();
export const providerDetailsSchema = createProviderDetailsSchema();
export const ssoProviderSchema = createSsoProviderSchema();
export const providerConfigureSchema = createProviderDetailsSchema();

export type ProviderSelectionFormValues = z.infer<typeof providerSelectionSchema>;
export type ProviderDetailsFormValues = z.infer<typeof providerDetailsSchema>;
export type SsoProviderFormValues = z.infer<typeof ssoProviderSchema>;

export type OktaConfigureFormValues = z.infer<ReturnType<typeof STRATEGY_BUILDERS.okta>>;
export type AdfsConfigureFormValues = z.infer<ReturnType<typeof STRATEGY_BUILDERS.adfs>>;
export type GoogleAppsConfigureFormValues = z.infer<
  ReturnType<(typeof STRATEGY_BUILDERS)['google-apps']>
>;
export type OidcConfigureFormValues = z.infer<ReturnType<typeof STRATEGY_BUILDERS.oidc>>;
export type PingFederateConfigureFormValues = z.infer<
  ReturnType<(typeof STRATEGY_BUILDERS)['pingfederate']>
>;
export type SamlpConfigureFormValues = z.infer<ReturnType<typeof STRATEGY_BUILDERS.samlp>>;
export type WaadConfigureFormValues = z.infer<ReturnType<typeof STRATEGY_BUILDERS.waad>>;

export type ProviderConfigureFormValues =
  | OktaConfigureFormValues
  | AdfsConfigureFormValues
  | GoogleAppsConfigureFormValues
  | OidcConfigureFormValues
  | PingFederateConfigureFormValues
  | SamlpConfigureFormValues
  | WaadConfigureFormValues;
