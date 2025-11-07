import type { GetConfigurationResponseContent, IdpStrategy } from '@auth0/web-ui-components-core';

export interface UseConfigResult {
  config: GetConfigurationResponseContent | null;
  isLoadingConfig: boolean;
  fetchConfig: () => Promise<void>;
  filteredStrategies: IdpStrategy[];
  shouldAllowDeletion: boolean;
}
