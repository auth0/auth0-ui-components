/**
 * SSO provisioning data mappers for API transformations.
 * @module sso-provisioning-mappers
 * @internal
 */
import type { ProvisioningCreateTokenFormValues } from '@core/schemas/my-organization/idp-management/sso-provisioning/sso-provisioning-token-create-schema';
import type { ProvisioningCreateTokenFormRules } from '@core/schemas/my-organization/idp-management/sso-provisioning/sso-provisioning-token-create-schema-types';

import { ALL_SCIM_TOKEN_SCOPES } from './sso-provisioning-constants';
import type {
  CreateIdpProvisioningScimTokenRequestContent,
  IdpScimTokenConfig,
} from './sso-provisioning-types';

export const SsoProvisioningMappers = {
  /**
   * Resolves create-token form rules from the Connection Profile config.
   * @param config - `provisioning.scim.tokens` for the provider strategy
   * @returns Form rules
   */
  getCreateTokenFormRules(config?: IdpScimTokenConfig | null): ProvisioningCreateTokenFormRules {
    return {
      defaultExpiry: config?.default_expiry ?? null,
      maxAllowedExpiry: config?.max_allowed_expiry ?? null,
      allowedScopes: config?.scopes?.length ? [...config.scopes] : ALL_SCIM_TOKEN_SCOPES,
    };
  },

  /**
   * Builds initial form values: profile default lifetime, all permitted scopes checked.
   * @param rules - Form rules
   * @returns Default form values
   */
  getCreateTokenFormDefaults(
    rules: ProvisioningCreateTokenFormRules,
  ): ProvisioningCreateTokenFormValues {
    return {
      noExpiration: false,
      tokenLifetime: rules.defaultExpiry !== null ? String(rules.defaultExpiry) : '',
      scopes: [...rules.allowedScopes],
    };
  },

  /**
   * Maps form values to the create-token request.
   * `scopes` is not sent: the SDK request has no scopes field yet.
   * "No expiration" omits `token_lifetime`.
   * @param values - Form values
   * @returns API request payload for token creation
   */
  createScimTokenToAPI(
    values: ProvisioningCreateTokenFormValues,
  ): CreateIdpProvisioningScimTokenRequestContent {
    if (values.noExpiration) return {};
    return { token_lifetime: Number(values.tokenLifetime.trim()) };
  },
};
