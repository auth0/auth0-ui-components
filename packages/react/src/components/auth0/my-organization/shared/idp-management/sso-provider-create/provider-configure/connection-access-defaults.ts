/**
 * Default form values for connection-level access fields.
 * @module connection-access-defaults
 * @internal
 */

import type {
  ConnectionAccessDefaults,
  ConnectionAccessInitialData,
  CrossAppAccessStatus,
  FormMode,
} from '@/types/my-organization/idp-management/sso-provider/sso-provider-create-types';

/** Defaults where the third-party access flag may be absent (edit mode, value omitted by API). */
type ConnectionAccessDefaultValues = Omit<
  ConnectionAccessDefaults,
  'use_for_third_party_client_access'
> & {
  use_for_third_party_client_access?: boolean;
};

/**
 * Builds default values for the third-party access and Cross App Access fields.
 * Cross App Access is only included when the API reports it for the strategy.
 * @param initialData - Existing provider values, if editing.
 * @param crossAppAccessDefaultValue - Tenant default for Cross App Access.
 * @param mode - Form mode. In edit mode an omitted third-party access value stays `undefined` so it is not submitted as `false`.
 * @param showCrossAppAccess - Whether Cross App Access applies to the strategy, per the API config.
 * @returns Default values to spread into the form's `defaultValues`.
 */
export function getConnectionAccessDefaults(
  initialData?: ConnectionAccessInitialData,
  crossAppAccessDefaultValue?: CrossAppAccessStatus,
  mode: FormMode = 'create',
  showCrossAppAccess = false,
): ConnectionAccessDefaultValues {
  const defaults: ConnectionAccessDefaultValues = {
    use_for_third_party_client_access:
      mode === 'edit'
        ? initialData?.use_for_third_party_client_access
        : (initialData?.use_for_third_party_client_access ?? false),
  };

  if (showCrossAppAccess) {
    const tenantDefault = crossAppAccessDefaultValue && { status: crossAppAccessDefaultValue };
    defaults.cross_app_access_resource_app =
      initialData?.cross_app_access_resource_app ?? tenantDefault;
  }

  return defaults;
}
