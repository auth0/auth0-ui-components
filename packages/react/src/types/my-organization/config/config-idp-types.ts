/**
 * IDP configuration types.
 * @module config-idp-types
 */

import type { IdpStrategy, ProvisioningMethod } from '@auth0/universal-components-core';

export type ProvisioningFeatures = 'provisioning' | 'logout';

/** IDP strategy configuration. */
export interface IdpStrategyConfig {
  provisioning_methods: ProvisioningMethod[];
  enabled_features: ProvisioningFeatures[];
}

/** IDP configuration response. */
export interface IdpConfig {
  organization: {
    can_set_show_as_button: boolean;
    can_set_assign_membership_on_login: boolean;
  };
  strategies: Record<IdpStrategy, IdpStrategyConfig>;
}

/** useIdpConfig hook result. */
export interface UseConfigIdpResult {
  idpConfig: IdpConfig | null;
  isLoadingIdpConfig: boolean;
  fetchIdpConfig: () => Promise<void>;
  isProvisioningEnabled: (strategy: IdpStrategy | undefined) => boolean;
  isProvisioningMethodEnabled: (strategy: IdpStrategy | undefined) => boolean;
  isIdpConfigValid: boolean;
  error: unknown;
  retry: () => Promise<void>;
}
