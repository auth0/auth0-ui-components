import { mockProvider } from './sso-provisioning/sso-provisioning-tab.mocks';

import type { SsoProviderEditViewProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-edit-types';

export function createMockSsoProviderEditView(
  overrides: Partial<SsoProviderEditViewProps> = {},
): SsoProviderEditViewProps {
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
        'google-apps': {
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
    isLoadingConfig: false,
    isLoadingIdpConfig: false,
    showProvisioningTab: true,
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
    provisioningConfig: null,
    sso: undefined,
    provisioning: undefined,
    updateProvider: () => Promise.resolve(),
    listScimTokens: () => Promise.resolve(null),
    syncSsoAttributes: () => Promise.resolve(),
    onDeleteConfirm: () => Promise.resolve(),
    onRemoveConfirm: () => Promise.resolve(),
    handleToggleProvider: () => Promise.resolve(),
    createProvisioning: () => Promise.resolve(),
    deleteProvisioning: () => Promise.resolve(),
    createScimToken: (_data) => Promise.resolve(undefined),
    deleteScimToken: () => Promise.resolve(),
    syncProvisioningAttributes: () => Promise.resolve(),
    fetchProvider: () => Promise.resolve(null),
    fetchOrganizationDetails: () => Promise.resolve(),
    fetchProvisioning: () => Promise.resolve(null),
    ...overrides,
  };
}
