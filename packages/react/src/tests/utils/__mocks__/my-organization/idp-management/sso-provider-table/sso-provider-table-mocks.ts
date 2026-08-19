import { vi } from 'vitest';

import { ALL_IDP_PERMISSIONS } from '@/tests/utils/__mocks__/permissions/permission.mocks';
import type {
  SsoProviderTableViewProps,
  UseSsoProviderTableServiceReturn,
} from '@/types/my-organization/idp-management/sso-provider/sso-provider-table-types';

export function createMockSsoProviderTableServiceReturn(
  overrides: Partial<UseSsoProviderTableServiceReturn> = {},
): UseSsoProviderTableServiceReturn {
  return {
    providers: [],
    organization: null,
    isLoading: false,
    isRefetchingProviders: false,
    isProvidersStale: false,
    providersUpdatedAt: 0,
    providersError: null,
    organizationError: null,
    refetchProviders: vi.fn(),
    isDeleting: false,
    isRemoving: false,
    isUpdating: false,
    isUpdatingId: null,
    fetchProviders: vi.fn(),
    fetchOrganizationDetails: vi.fn(),
    onDeleteConfirm: vi.fn(),
    onRemoveConfirm: vi.fn(),
    onEnableProvider: vi.fn(),
    ...overrides,
  };
}

export function createMockSsoProviderTableViewProps(
  overrides: Partial<SsoProviderTableViewProps> = {},
): SsoProviderTableViewProps {
  return {
    providers: [],
    styling: { variables: { common: {}, light: {}, dark: {} }, classes: {} },
    customMessages: {},
    permissions: ALL_IDP_PERMISSIONS,
    hideHeader: false,
    isLoading: false,
    shouldHideCreate: false,
    isViewLoading: false,
    isRefetchingProviders: false,
    isProvidersStale: false,
    providersUpdatedAt: 0,
    selectedIdp: null,
    shouldAllowDeletion: false,
    showDeleteModal: false,
    showRemoveModal: false,
    organization: null,
    isUpdating: false,
    isUpdatingId: null,
    isDeleting: false,
    isRemoving: false,
    createAction: {
      disabled: false,
      onAfter: vi.fn(),
      onBefore: vi.fn(),
    },
    editAction: {
      disabled: false,
      onAfter: vi.fn(),
      onBefore: vi.fn(),
    },
    handleCreate: vi.fn(),
    handleEdit: vi.fn(),
    handleDelete: vi.fn(),
    handleDeleteFromOrganization: vi.fn(),
    handleToggleEnabled: vi.fn(),
    handleDeleteConfirm: vi.fn(),
    handleRemoveConfirm: vi.fn(),
    setShowDeleteModal: vi.fn(),
    setShowRemoveModal: vi.fn(),
    setSelectedIdp: vi.fn(),
    refetchProviders: vi.fn(),
    fetchProviders: vi.fn(async () => undefined),
    fetchOrganizationDetails: vi.fn(async () => null),
    ...overrides,
  };
}
