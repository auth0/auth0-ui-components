import { vi } from 'vitest';

import type { UseConfigResult } from '@/types/my-organization/config/config-types';

type MockUseConfig = UseConfigResult;

export const createMockUseConfig = (overrides?: Partial<MockUseConfig>): MockUseConfig => ({
  isLoadingConfig: false,
  shouldAllowDeletion: true,
  organizationDeletionBehavior: 'allow_if_empty',
  shouldAllowOrganizationDeletion: true,
  isConfigValid: true,
  config: {
    connection_deletion_behavior: 'allow',
    allowed_strategies: [],
  },
  fetchConfig: vi.fn(async () => undefined),
  filteredStrategies: [],
  showThirdPartyAccess: false,
  isThirdPartyAccessReadOnly: false,
  thirdPartyAccessDefaultValue: undefined,
  discoveryPolicy: null,
  showDiscovery: false,
  isDiscoveryReadOnly: true,
  discoveryDefaultValue: false,
  ...overrides,
});
