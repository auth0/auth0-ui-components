import {
  createStringSchema,
  createBooleanSchema,
  createFieldSchema,
  COMMON_FIELD_CONFIGS,
  type FieldOptions,
  type BooleanFieldOptions,
} from '@core/schemas/common';
import type { IdpStrategy } from '@core/services';
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
}

interface OidcOptions {
  type?: FieldOptions;
  client_id?: FieldOptions;
  client_secret?: FieldOptions;
  discovery_url?: FieldOptions;
}

interface PingFederateOptions {
  signatureAlgorithm?: FieldOptions;
  digestAlgorithm?: FieldOptions;
  signSAMLRequest?: BooleanFieldOptions;
  metadataUrl?: FieldOptions;
  cert?: FieldOptions;
  signingCert?: FieldOptions;
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
  domain?: FieldOptions;
  client_id?: FieldOptions;
  client_secret?: FieldOptions;
  icon_url?: FieldOptions;
}

const STRATEGY_BUILDERS = {
  okta: (options: OktaOptions = {}) =>
    z.object({
      domain: createFieldSchema(
        COMMON_FIELD_CONFIGS.domain,
        options.domain,
        'Please enter a valid Okta domain',
      ),
      client_id: createFieldSchema(COMMON_FIELD_CONFIGS.client_id, options.client_id),
      client_secret: createFieldSchema(COMMON_FIELD_CONFIGS.client_secret, options.client_secret),
      icon_url: createFieldSchema(COMMON_FIELD_CONFIGS.icon_url, {
        ...options.icon_url,
        required: false,
      }),
      callback_url: createFieldSchema(COMMON_FIELD_CONFIGS.callback_url, {
        ...options.icon_url,
        required: false,
      }),
    }),

  adfs: (options: AdfsOptions = {}) =>
    z.object({
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
        options.adfs_server,
        'Please enter a valid ADFS server URL',
      ),
      fedMetadataXml: createFieldSchema(
        COMMON_FIELD_CONFIGS.metadata,
        options.fedMetadataXml,
        'Please enter valid Federation Metadata XML',
      ),
    }),

  'google-apps': (options: GoogleAppsOptions = {}) =>
    z.object({
      domain: createFieldSchema(
        COMMON_FIELD_CONFIGS.domain,
        options.domain,
        'Please enter a valid Google Workspace domain',
      ),
      client_id: createFieldSchema(COMMON_FIELD_CONFIGS.client_id, options.client_id),
      client_secret: createFieldSchema(COMMON_FIELD_CONFIGS.client_secret, options.client_secret),
      icon_url: createFieldSchema(COMMON_FIELD_CONFIGS.icon_url, {
        ...options.icon_url,
        required: false,
      }),
      callback_url: createFieldSchema(COMMON_FIELD_CONFIGS.callback_url, {
        ...options.icon_url,
        required: false,
      }),
    }),

  oidc: (options: OidcOptions = {}) =>
    z.object({
      type: createFieldSchema(
        COMMON_FIELD_CONFIGS.algorithm,
        { ...options.type, required: false },
        'Please enter a valid type',
      ),
      client_id: createFieldSchema(COMMON_FIELD_CONFIGS.client_id, options.client_id),
      client_secret: createFieldSchema(COMMON_FIELD_CONFIGS.client_secret, {
        ...options.client_secret,
        required: false,
      }),
      discovery_url: createFieldSchema(
        COMMON_FIELD_CONFIGS.url,
        options.discovery_url,
        'Please enter a valid discovery URL',
      ),
    }),

  'ping-federate': (options: PingFederateOptions = {}) =>
    z.object({
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
      signSAMLRequest: createBooleanSchema({
        required: options.signSAMLRequest?.required ?? false,
        errorMessage:
          options.signSAMLRequest?.errorMessage ?? 'Invalid SAML request signing option',
      }),
      metadataUrl: createFieldSchema(
        COMMON_FIELD_CONFIGS.url,
        { ...options.metadataUrl, required: false },
        'Please enter a valid metadata URL',
      ),
      cert: createFieldSchema(COMMON_FIELD_CONFIGS.certificate, {
        ...options.cert,
        required: false,
      }),
      signingCert: createFieldSchema(
        COMMON_FIELD_CONFIGS.certificate,
        { ...options.signingCert, required: false },
        'Please enter a valid signing certificate',
      ),
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
        required: options.signSAMLRequest?.required ?? false,
        errorMessage:
          options.signSAMLRequest?.errorMessage ?? 'Invalid SAML request signing option',
      }),
      bindingMethod: createFieldSchema(
        COMMON_FIELD_CONFIGS.algorithm,
        { ...options.bindingMethod, required: false },
        'Please enter a valid binding method',
      ),
      metadataUrl: createFieldSchema(
        COMMON_FIELD_CONFIGS.url,
        { ...options.metadataUrl, required: false },
        'Please enter a valid metadata URL',
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

  waad: (options: WaadOptions = {}) =>
    z.object({
      domain: createFieldSchema(
        COMMON_FIELD_CONFIGS.domain,
        options.domain,
        'Please enter a valid Azure AD domain',
      ),
      client_id: createFieldSchema(COMMON_FIELD_CONFIGS.client_id, options.client_id),
      client_secret: createFieldSchema(COMMON_FIELD_CONFIGS.client_secret, options.client_secret),
      icon_url: createFieldSchema(COMMON_FIELD_CONFIGS.icon_url, {
        ...options.icon_url,
        required: false,
      }),
      callback_url: createFieldSchema(COMMON_FIELD_CONFIGS.callback_url, {
        ...options.icon_url,
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
    strategy: z
      .string({
        required_error: strategy.errorMessage || 'Please select a provider strategy',
      })
      .min(1, 'Provider strategy is required'),
  });
};

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

type StrategySchemaMap = {
  okta: ReturnType<typeof STRATEGY_BUILDERS.okta>;
  adfs: ReturnType<typeof STRATEGY_BUILDERS.adfs>;
  'google-apps': ReturnType<(typeof STRATEGY_BUILDERS)['google-apps']>;
  oidc: ReturnType<typeof STRATEGY_BUILDERS.oidc>;
  'ping-federate': ReturnType<(typeof STRATEGY_BUILDERS)['ping-federate']>;
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
  ReturnType<(typeof STRATEGY_BUILDERS)['ping-federate']>
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
