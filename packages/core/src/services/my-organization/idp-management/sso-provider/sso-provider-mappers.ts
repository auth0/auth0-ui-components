/**
 * SSO provider data mappers for API transformations.
 * @module sso-provider-mappers
 * @internal
 */
import type {
  ProviderDetailsFormValues,
  ProviderSelectionFormValues,
  ProviderConfigureFormValues,
} from '@core/schemas/my-organization/idp-management/sso-provider/sso-provider-create-schema';

import { DISCOVERY_URL_SUFFIX, STRATEGIES } from './sso-provider-constants';
import type {
  IdpStrategy,
  CrossAppAccessResourceApp,
  CreateIdentityProviderRequestContent,
  UpdateIdentityProviderRequestContent,
} from './sso-provider-types';

type CombinedProviderFormValues = ProviderSelectionFormValues &
  ProviderDetailsFormValues & {
    show_as_button?: boolean;
    assign_membership_on_login?: boolean;
    use_for_third_party_client_access?: boolean;
    cross_app_access_resource_app?: CrossAppAccessResourceApp;
    options: ProviderConfigureFormValues;
  };

type UpdateProviderFormValues = Partial<ProviderDetailsFormValues> & {
  strategy?: IdpStrategy;
  options?: Partial<ProviderConfigureFormValues>;
  is_enabled?: boolean;
  show_as_button?: boolean;
  assign_membership_on_login?: boolean;
  use_for_third_party_client_access?: boolean;
  cross_app_access_resource_app?: CrossAppAccessResourceApp;
};

const STRATEGY_FIELD_MAPPINGS = {
  [STRATEGIES.OKTA]: ['domain', 'client_id', 'client_secret', 'icon_url'],
  [STRATEGIES.ADFS]: ['adfs_server', 'fedMetadataXml'],
  [STRATEGIES.GOOGLE_APPS]: ['domain', 'client_id', 'client_secret', 'icon_url'],
  [STRATEGIES.OIDC]: ['type', 'client_id', 'client_secret', 'discovery_url'],
  [STRATEGIES.PINGFEDERATE]: [
    'pingFederateBaseUrl',
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
    'discovery_url',
  ],
  [STRATEGIES.WAAD]: ['tenant_domain', 'client_id', 'client_secret', 'icon_url'],
} as const;

/**
 * Normalizes a discovery URL by appending the OpenID configuration suffix if not present.
 * @param url - The discovery URL to normalize
 * @returns The normalized discovery URL
 */
function normalizeDiscoveryUrl(url: string): string {
  if (!url) return url;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url;
  }
  if (parsed.pathname.includes('/.well-known/')) return url;
  parsed.pathname = parsed.pathname.replace(/\/?$/, '') + DISCOVERY_URL_SUFFIX;
  return parsed.toString();
}

/**
 * Filters and validates form options based on strategy-specific API requirements.
 * @param strategy - Authentication strategy
 * @param formOptions - Form configuration options
 * @returns Filtered options valid for the strategy
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

  const result = Object.fromEntries(
    Object.entries(formOptions).filter(
      ([key, value]) => validFields.includes(key) && isValidValue(value),
    ),
  );

  if (typeof result?.discovery_url === 'string' && result?.discovery_url) {
    result.discovery_url = normalizeDiscoveryUrl(result.discovery_url);
  }

  return result;
};

export const SsoProviderMappers = {
  /**
   * Transforms form data to API request format for creating SSO providers.
   * Filters out form-specific fields and includes only strategy-valid API fields.
   * @param data - The data object to process
   * @returns API request payload for provider creation
   */
  createToAPI(data: CombinedProviderFormValues): CreateIdentityProviderRequestContent {
    const {
      strategy,
      name,
      display_name,
      show_as_button,
      assign_membership_on_login,
      use_for_third_party_client_access,
      cross_app_access_resource_app,
      options,
    } = data;

    if (!name || name.trim() === '') {
      throw new Error('Provider name is required');
    }

    return {
      strategy,
      name: name.trim(),
      display_name,
      show_as_button,
      assign_membership_on_login,
      use_for_third_party_client_access,
      cross_app_access_resource_app,
      options: getValidOptionsForStrategy(strategy, options),
    } as CreateIdentityProviderRequestContent;
  },

  /**
   * Transforms form data to API request format for updating SSO providers.
   * Only includes fields that have been modified and are valid for the strategy.
   * @param data - The data object to process
   * @returns API request payload for provider update
   */
  updateToAPI(data: UpdateProviderFormValues): UpdateIdentityProviderRequestContent {
    const {
      strategy,
      display_name,
      is_enabled,
      show_as_button,
      assign_membership_on_login,
      use_for_third_party_client_access,
      cross_app_access_resource_app,
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
    if (use_for_third_party_client_access !== undefined) {
      updateRequest.use_for_third_party_client_access = use_for_third_party_client_access;
    }
    if (cross_app_access_resource_app !== undefined) {
      updateRequest.cross_app_access_resource_app = cross_app_access_resource_app;
    }

    // Add filtered options if strategy exists and config options are provided
    if (strategy && Object.keys(configOptions).length > 0) {
      const validOptions = getValidOptionsForStrategy(strategy, configOptions);
      if (Object.keys(validOptions).length > 0) {
        updateRequest.options = validOptions as UpdateIdentityProviderRequestContent['options'];
      }
    }

    return updateRequest;
  },
};
