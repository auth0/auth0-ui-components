import type {
  ProviderDetailsFormValues,
  ProviderSelectionFormValues,
  ProviderConfigureFormValues,
} from '@core/schemas';

import { STRATEGIES } from './sso-provider-constants';
import type { IdpStrategy } from './sso-provider-types';
import type {
  CreateIdentityProviderRequestContent,
  UpdateIdentityProviderRequestContent,
} from './sso-provider-types';

type CombinedProviderFormValues = ProviderSelectionFormValues &
  ProviderDetailsFormValues & {
    options: ProviderConfigureFormValues;
  };

type UpdateProviderFormValues = Partial<ProviderDetailsFormValues> & {
  strategy?: IdpStrategy;
  options?: Partial<ProviderConfigureFormValues>;
  is_enabled?: boolean;
  show_as_button?: boolean;
  assign_membership_on_login?: boolean;
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
    } as CreateIdentityProviderRequestContent;
  },

  /**
   * Transforms form data to API request format for updating SSO providers.
   * Only includes fields that have been modified and are valid for the strategy.
   */
  updateToAPI(data: UpdateProviderFormValues): UpdateIdentityProviderRequestContent {
    const {
      strategy,
      display_name,
      is_enabled,
      show_as_button,
      assign_membership_on_login,
      ...configOptions
    } = data;

    const updateRequest: UpdateIdentityProviderRequestContent = {};

    // Only include defined values for core fields
    if (display_name !== undefined) {
      updateRequest.display_name = display_name;
    }
    if (is_enabled !== undefined) {
      updateRequest.is_enabled = is_enabled;
    }
    if (show_as_button !== undefined) {
      updateRequest.show_as_button = show_as_button;
    }
    if (assign_membership_on_login !== undefined) {
      updateRequest.assign_membership_on_login = assign_membership_on_login;
    }

    // Add filtered options if strategy exists and config options are provided
    if (strategy && Object.keys(configOptions).length > 0) {
      const validOptions = getValidOptionsForStrategy(strategy, configOptions);
      if (Object.keys(validOptions).length > 0) {
        updateRequest.options = validOptions;
      }
    }

    return updateRequest;
  },
};
