/**
 * Organization configuration types.
 * @module config-types
 */

import type {
  GetConfigurationResponseContent,
  IdpStrategy,
  OrganizationDiscoveryConfig,
} from '@auth0/universal-components-core';

/** useConfig hook result. */
export interface UseConfigResult {
  config: GetConfigurationResponseContent | null;
  isLoadingConfig: boolean;
  fetchConfig: () => Promise<void>;
  filteredStrategies: IdpStrategy[];
  shouldAllowDeletion: boolean;
  /** How organization deletion is restricted; `undefined` until the configuration has loaded. */
  organizationDeletionBehavior: GetConfigurationResponseContent['organization_deletion_behavior'];
  shouldAllowOrganizationDeletion: boolean;
  isConfigValid: boolean;
  showThirdPartyAccess: boolean;
  isThirdPartyAccessReadOnly: boolean;
  thirdPartyAccessDefaultValue: 'allow' | 'block' | undefined;
  discoveryPolicy: OrganizationDiscoveryConfig | null;
  showDiscovery: boolean;
  /** The policy allows a single value, so the setting can't be changed. */
  isDiscoveryReadOnly: boolean;
  /** The only allowed value when locked, else the policy default. */
  discoveryDefaultValue: boolean;
}
