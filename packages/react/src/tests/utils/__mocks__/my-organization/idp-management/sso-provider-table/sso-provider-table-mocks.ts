import { vi } from 'vitest';

import type { SsoProviderTableViewProps } from '@/types/my-organization/idp-management/sso-provider/sso-provider-table-types';

export function createMockSsoProviderTableViewProps(
  overrides: Partial<SsoProviderTableViewProps> = {},
): SsoProviderTableViewProps {
  return {
    providers: [],
    isLoading: false,
    styling: { variables: { common: {}, light: {}, dark: {} }, classes: {} },
    customMessages: {},
    readOnly: false,
    shouldHideCreate: false,
    isViewLoading: false,
    selectedIdp: null,
    shouldAllowDeletion: false,
    showDeleteModal: false,
    showRemoveModal: false,
    isUpdating: false,
    isUpdatingId: null,
    isDeleting: false,
    isRemoving: false,
    error: null as unknown,
    retry: vi.fn(),
    fetchProviders: vi.fn(),
    getOrganizationName: vi.fn(),
    onDeleteConfirm: vi.fn(),
    onRemoveConfirm: vi.fn(),
    onEnableProvider: vi.fn(),
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
    ...overrides,
  } as SsoProviderTableViewProps;
}
