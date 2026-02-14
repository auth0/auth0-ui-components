import { vi } from 'vitest';

import type { SsoProvisioningDetailsProps } from '@/types/my-organization/idp-management/sso-provisioning/sso-provisioning-tab-types';

export const mockProps = {
  provider: {
    id: 'test-id',
    name: 'Test Provider',
    display_name: 'Test Provider Display',
    options: {},
    strategy: 'oidc',
  },
  provisioning: {
    enabled: false,
    profile_merge_strategy: 'default',
    action: 'create_and_update',
  },
  isSaving: false,
  isLoading: false,
  isScimTokensLoading: false,
  isScimTokenCreating: false,
  isScimTokenDeleting: false,
  onListScimTokens: vi.fn(),
  onCreateScimToken: vi.fn(),
  onDeleteScimToken: vi.fn(),
  onSave: vi.fn(),
  onChange: vi.fn(),
} as unknown as SsoProvisioningDetailsProps;
