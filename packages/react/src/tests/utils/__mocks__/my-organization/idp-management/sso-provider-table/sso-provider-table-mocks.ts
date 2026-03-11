import { vi } from 'vitest';

import type { SsoProviderTableViewProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-table-types';

export function createMockSsoProviderTableView(
  overrides: Partial<SsoProviderTableViewProps> = {},
): SsoProviderTableViewProps {
  return {
    providers: [],
    organization: null,
    isLoading: false,
    isDeleting: false,
    isRemoving: false,
    isUpdating: false,
    isUpdatingId: null,
    isViewLoading: false,
    shouldAllowDeletion: false,
    shouldHideCreate: false,
    showDeleteModal: false,
    showRemoveModal: false,
    selectedIdp: null,
    fetchProviders: vi.fn(),
    fetchOrganizationDetails: vi.fn(),
    setShowDeleteModal: vi.fn(),
    setShowRemoveModal: vi.fn(),
    setSelectedIdp: vi.fn(),
    handleCreate: vi.fn(),
    handleEdit: vi.fn(),
    handleDelete: vi.fn(),
    handleDeleteFromOrganization: vi.fn(),
    handleToggleEnabled: vi.fn(),
    handleDeleteConfirm: vi.fn(),
    handleRemoveConfirm: vi.fn(),
    styling: { variables: { common: {}, light: {}, dark: {} }, classes: {} },
    customMessages: {},
    readOnly: false,
    createAction: { disabled: false, onAfter: vi.fn() },
    editAction: { disabled: false, onAfter: vi.fn() },
    ...overrides,
  };
}
