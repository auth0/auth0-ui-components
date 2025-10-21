import type {
  ProviderDetailsFormValues,
  ProviderSelectionFormValues,
  ProviderConfigureFormValues,
} from '@core/schemas';

import type { IdpStrategy } from '../idp-types';
import type { CreateIdentityProviderRequestContent } from '../idp-types';

import { STRATEGIES } from './sso-provider-constants';

type CombinedProviderFormValues = ProviderSelectionFormValues &
  ProviderDetailsFormValues & {
    options: ProviderConfigureFormValues;
  };

const STRATEGY_FIELD_MAPPINGS = {
  [STRATEGIES.OKTA]: ['domain', 'client_id', 'client_secret', 'icon_url'],
  [STRATEGIES.ADFS]: ['adfs_server', 'fedMetadataXml'],
  [STRATEGIES.GOOGLE_APPS]: ['domain', 'client_id', 'client_secret', 'icon_url'],
  [STRATEGIES.OIDC]: ['type', 'client_id', 'client_secret', 'discovery_url'],
  [STRATEGIES.PINGFEDERATE]: [
    'signatureAlgorithm',
    'digestAlgorithm',
    'signSAMLRequest',
    'metadataUrl',
    'cert',
    'signingCert',
    'idpInitiated',
    'icon_url',
  ],
  [STRATEGIES.SAMLP]: [
    'signatureAlgorithm',
    'digestAlgorithm',
    'protocolBinding',
    'signSAMLRequest',
    'bindingMethod',
    'metadataUrl',
    'cert',
    'idpInitiated',
    'icon_url',
  ],
  [STRATEGIES.WAAD]: ['domain', 'client_id', 'client_secret', 'icon_url'],
} as const;

/**
 * Filters and validates form options based on strategy-specific API requirements.
 */
const getValidOptionsForStrategy = (
  strategy: IdpStrategy,
  formOptions: Record<string, unknown>,
): Record<string, unknown> => {
  const isValidValue = (value: unknown): boolean =>
    value !== undefined && value !== null && value !== '';

  const validFields = STRATEGY_FIELD_MAPPINGS[strategy] as readonly string[];

  if (!validFields) {
    throw new Error(`Unsupported identity provider strategy: ${strategy}`);
  }

  return Object.fromEntries(
    Object.entries(formOptions).filter(
      ([key, value]) => validFields.includes(key) && isValidValue(value),
    ),
  );
};

export const SsoProviderMappers = {
  /**
   * Transforms form data to API request format for creating SSO providers.
   * Filters out form-specific fields and includes only strategy-valid API fields.
   */
  createToAPI(data: CombinedProviderFormValues): CreateIdentityProviderRequestContent {
    const { strategy, name, display_name, options } = data;

    if (!name || name.trim() === '') {
      throw new Error('Provider name is required');
    }

    return {
      strategy,
      name: name.trim(),
      display_name,
      options: getValidOptionsForStrategy(strategy, options),
    };
  },
};
