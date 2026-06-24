import { vi } from 'vitest';

import { mockProvider } from './sso-provisioning/sso-provisioning-tab.mocks';

import type {
  SsoProviderEditHandlerProps,
  SsoProviderEditLogicProps,
  UseSsoProviderEditServiceReturn,
} from '@/types/my-organization/idp-management/sso-provider/sso-provider-edit-types';

export function createMockSsoProviderEditLogic(
  overrides: Partial<SsoProviderEditLogicProps> = {},
): SsoProviderEditLogicProps {
  return {
    styling: { variables: { common: {}, light: {}, dark: {} }, classes: {} },
    schema: undefined,
    readOnly: false,
    providerId: 'mock-provider-id',
    domains: undefined,
    hideHeader: false,
    provider: mockProvider,
    organization: {
      name: 'Mock Org',
      branding: {
        colors: {
          primary: '',
          page_background: '',
        },
        logo_url: undefined,
      },
    },
    isLoading: false,
    isUpdating: false,
    isDeleting: false,
    isRemoving: false,
    idpConfig: {
      organization: {
        can_set_show_as_button: false,
        can_set_assign_membership_on_login: false,
      },
      strategies: {
        waad: {
          provisioning_methods: [],
          enabled_features: [],
        },
        adfs: {
          provisioning_methods: [],
          enabled_features: [],
        },
        googleapps: {
          provisioning_methods: [],
          enabled_features: [],
        },
        oidc: {
          provisioning_methods: [],
          enabled_features: [],
        },
        samlp: {
          provisioning_methods: [],
          enabled_features: [],
        },
        okta: {
          provisioning_methods: [],
          enabled_features: [],
        },
        pingfederate: {
          provisioning_methods: [],
          enabled_features: [],
        },
      },
    },
    customMessages: {},
    backButton: undefined,
    shouldAllowDeletion: true,
    showProvisioningTab: true,
    isProvisioningUpdating: false,
    isProvisioningDeleting: false,
    isScimTokensLoading: false,
    isScimTokenCreating: false,
    isScimTokenDeleting: false,
    isSsoAttributesSyncing: false,
    isProvisioningAttributesSyncing: false,
    hasSsoAttributeSyncWarning: false,
    hasProvisioningAttributeSyncWarning: false,
    ...overrides,
  };
}

export function createMockSsoProviderEditHandler(
  overrides: Partial<SsoProviderEditHandlerProps> = {},
): SsoProviderEditHandlerProps {
  return {
    updateProvider: () => Promise.resolve(),
    listScimTokens: () => Promise.resolve(null),
    syncSsoAttributes: () => Promise.resolve(),
    onDeleteConfirm: () => Promise.resolve(),
    onRemoveConfirm: () => Promise.resolve(),
    handleToggleProvider: () => Promise.resolve(),
    createProvisioningAction: () => Promise.resolve(),
    deleteProvisioningAction: () => Promise.resolve(),
    createScimTokenAction: (_data) => Promise.resolve(undefined),
    deleteScimTokenAction: () => Promise.resolve(),
    syncProvisioningAttributes: () => Promise.resolve(),
    ...overrides,
  };
}

export function createMockSsoProviderEditServiceReturn(
  overrides: Partial<UseSsoProviderEditServiceReturn> = {},
): UseSsoProviderEditServiceReturn {
  return {
    provider: {
      id: 'test-provider-id',
      name: 'Test Provider',
      is_enabled: true,
      strategy: 'waad',
      options: {},
    },
    organization: {
      id: 'org_1',
      name: 'Org',
      display_name: 'Org',
      branding: {
        colors: {
          primary: '',
          page_background: '',
        },
        logo_url: undefined,
      },
    },
    provisioningConfig: null,
    isLoading: false,
    isUpdating: false,
    isDeleting: false,
    isRemoving: false,
    isProvisioningUpdating: false,
    isProvisioningDeleting: false,
    isProvisioningLoading: false,
    isScimTokensLoading: false,
    isScimTokenCreating: false,
    isScimTokenDeleting: false,
    isSsoAttributesSyncing: false,
    isProvisioningAttributesSyncing: false,
    hasSsoAttributeSyncWarning: false,
    hasProvisioningAttributeSyncWarning: false,
    fetchProvider: vi.fn(async () => null),
    fetchOrganizationDetails: vi.fn(async () => undefined),
    fetchProvisioning: vi.fn(async () => null),
    updateProvider: vi.fn(async () => undefined),
    createProvisioning: vi.fn(async () => undefined),
    deleteProvisioning: vi.fn(async () => undefined),
    listScimTokens: vi.fn(async () => null),
    createScimToken: vi.fn(async () => undefined),
    deleteScimToken: vi.fn(async () => undefined),
    syncSsoAttributes: vi.fn(async () => undefined),
    syncProvisioningAttributes: vi.fn(async () => undefined),
    onDeleteConfirm: vi.fn(async () => undefined),
    onRemoveConfirm: vi.fn(async () => undefined),
    ...overrides,
  };
}
