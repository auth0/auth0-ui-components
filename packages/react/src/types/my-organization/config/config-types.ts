/**
 * Organization configuration types.
 * @module config-types
 */

import type {
  GetConfigurationResponseContent,
  IdpStrategy,
} from '@auth0/universal-components-core';

/** Role returned from organization configuration. */
export interface ConfigRole {
  id: string;
  name: string;
  description?: string;
}

/** useConfig hook result. */
export interface UseConfigResult {
  config: GetConfigurationResponseContent | null;
  isLoadingConfig: boolean;
  fetchConfig: () => Promise<void>;
  filteredStrategies: IdpStrategy[];
  shouldAllowDeletion: boolean;
  isConfigValid: boolean;
  allowedRoles: ConfigRole[];
}
