import type { ComponentAction, IdpKnownResponse } from '@auth0/universal-components-core';
import { vi } from 'vitest';

import type {
  SsoProviderEditProps,
  UseSsoProviderEditServiceReturn,
} from '@/types/my-organization/idp-management/sso-provider/sso-provider-edit-types';

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
    isEnabling: false,
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
    enableProvider: vi.fn(async () => undefined),
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

export function createMockSsoProviderEditProps(
  overrides?: Partial<SsoProviderEditProps>,
): SsoProviderEditProps {
  return {
    providerId: 'con_test123',
    customMessages: {},
    styling: {
      variables: { common: {}, light: {}, dark: {} },
      classes: {},
    },
    hideHeader: false,
    readOnly: false,
    backButton: undefined,
    sso: undefined,
    provisioning: undefined,
    domains: undefined,
    schema: undefined,
    ...overrides,
  };
}

export function createMockSsoActions() {
  return {
    updateAction: {
      disabled: false,
      onBefore: vi.fn(() => true),
      onAfter: vi.fn(),
    },
    deleteAction: {
      disabled: false,
      onBefore: vi.fn(() => true),
      onAfter: vi.fn(),
    },
    deleteFromOrganizationAction: {
      disabled: false,
      onBefore: vi.fn(() => true),
      onAfter: vi.fn(),
    },
  };
}

export function createMockEnableProviderAction(
  overrides?: Partial<ComponentAction<IdpKnownResponse>>,
): ComponentAction<IdpKnownResponse> {
  return {
    disabled: false,
    onBefore: vi.fn(() => true),
    onAfter: vi.fn(),
    ...overrides,
  };
}

export function createMockBackButton() {
  return {
    onClick: vi.fn(),
  };
}
