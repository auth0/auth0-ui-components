/**
 * Organization configuration types.
 * @module config-types
 */

import type {
  GetConfigurationResponseContent,
  IdpStrategy,
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
  isConfigValid: boolean;
  showThirdPartyAccess: boolean;
  isThirdPartyAccessReadOnly: boolean;
  thirdPartyAccessDefaultValue: 'allow' | 'block' | undefined;
}
