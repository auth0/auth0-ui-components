import type {
  GetConfigurationResponseContent,
  IdpStrategy,
} from '@auth0/universal-components-core';

export interface UseConfigResult {
  config: GetConfigurationResponseContent | null;
  isLoadingConfig: boolean;
  fetchConfig: () => Promise<void>;
  filteredStrategies: IdpStrategy[];
  shouldAllowDeletion: boolean;
  isConfigValid: boolean;
  error: unknown;
  retry: () => Promise<void>;
}
