import { vi } from 'vitest';

import type {
  IdpConfig,
  UseConfigIdpResult,
} from '../../../../types/my-organization/config/config-idp-types';

type MockUseIdpConfig = UseConfigIdpResult;

export const createMockUseIdpConfig = (
  overrides?: Partial<MockUseIdpConfig>,
): MockUseIdpConfig => ({
  idpConfig: {
    strategies: {
      okta: { enabled_features: [], provisioning_methods: [] },
      'google-apps': { enabled_features: [], provisioning_methods: [] },
      adfs: { enabled_features: [], provisioning_methods: [] },
      oidc: { enabled_features: [], provisioning_methods: [] },
      pingfederate: { enabled_features: [], provisioning_methods: [] },
      samlp: { enabled_features: [], provisioning_methods: [] },
      waad: { enabled_features: [], provisioning_methods: [] },
    },
    organization: {
      can_set_assign_membership_on_login: true,
      can_set_show_as_button: true,
    },
  } as IdpConfig,
  isLoadingIdpConfig: false,
  isIdpConfigValid: true,
  fetchIdpConfig: vi.fn(async () => undefined),
  isProvisioningEnabled: vi.fn(() => false),
  isProvisioningMethodEnabled: vi.fn(() => false),
  ...overrides,
});
