import { vi } from 'vitest';

import type {
  SsoProviderTableHandlerProps,
  SsoProviderTableLogicProps,
} from '@/types/my-organization/idp-management/sso-provider/sso-provider-table-types';

export function createMockSsoProviderTableLogic(
  overrides: Partial<SsoProviderTableLogicProps> = {},
): SsoProviderTableLogicProps {
  return {
    data: [],
    isLoading: false,
    styling: { variables: { common: {}, light: {}, dark: {} }, classes: {} },
    customMessages: {},
    hideHeader: false,
    readOnly: false,
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
    ...overrides,
  };
}

export function createMockSsoProviderTableHandler(
  overrides: Partial<SsoProviderTableHandlerProps> = {},
): SsoProviderTableHandlerProps {
  return {
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
  };
}
