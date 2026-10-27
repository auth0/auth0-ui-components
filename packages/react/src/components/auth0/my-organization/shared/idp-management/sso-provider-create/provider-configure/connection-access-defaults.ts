/**
 * Default form values for connection-level access fields.
 * @module connection-access-defaults
 * @internal
 */

import { STRATEGIES, type IdpStrategy } from '@auth0/universal-components-core';

import type {
  ConnectionAccessDefaults,
  ConnectionAccessInitialData,
  CrossAppAccessStatus,
} from '@/types/my-organization/idp-management/sso-provider/sso-provider-create-types';

/** Strategies that support Cross App Access. */
export const CROSS_APP_ACCESS_STRATEGIES: readonly IdpStrategy[] = [
  STRATEGIES.OIDC,
  STRATEGIES.OKTA,
  STRATEGIES.SAMLP,
];

/**
 * Checks whether a strategy supports Cross App Access.
 * @param strategy - The SSO provider strategy.
 * @returns `true` if the strategy supports Cross App Access.
 */
export function isCrossAppAccessStrategy(strategy: IdpStrategy): boolean {
  return CROSS_APP_ACCESS_STRATEGIES.includes(strategy);
}

/**
 * Builds default values for the third-party access and Cross App Access fields.
 * Cross App Access is only included for strategies that support it.
 * @param strategy - The SSO provider strategy.
 * @param initialData - Existing provider values, if editing.
 * @param crossAppAccessDefaultValue - Tenant default for Cross App Access.
 * @returns Default values to spread into the form's `defaultValues`.
 */
export function getConnectionAccessDefaults(
  strategy: IdpStrategy,
  initialData?: ConnectionAccessInitialData,
  crossAppAccessDefaultValue?: CrossAppAccessStatus,
): ConnectionAccessDefaults {
  const defaults: ConnectionAccessDefaults = {
    use_for_third_party_client_access: initialData?.use_for_third_party_client_access ?? false,
  };

  if (isCrossAppAccessStrategy(strategy)) {
    const tenantDefault = crossAppAccessDefaultValue && { status: crossAppAccessDefaultValue };
    defaults.cross_app_access_resource_app =
      initialData?.cross_app_access_resource_app ?? tenantDefault;
  }

  return defaults;
}
