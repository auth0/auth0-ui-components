import { vi } from 'vitest';

import type { SsoProviderTableViewProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-table-types';

export function createMockSsoProviderTableViewProps(
  overrides: Partial<SsoProviderTableViewProps> = {},
): SsoProviderTableViewProps {
  return {
    providers: [],
    styling: { variables: { common: {}, light: {}, dark: {} }, classes: {} },
    customMessages: {},
    readOnly: false,
    hideHeader: false,
    isLoading: false,
    shouldHideCreate: false,
    isViewLoading: false,
    selectedIdp: null,
    shouldAllowDeletion: false,
    showDeleteModal: false,
    showRemoveModal: false,
    organization: null,
    isUpdating: false,
    isUpdatingId: '',
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
    fetchProviders: vi.fn(async () => undefined),
    fetchOrganizationDetails: vi.fn(async () => null),
    ...overrides,
  };
}
