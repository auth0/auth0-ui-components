import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useSsoProviderTable } from '../use-sso-provider-table';

import { createMockSsoProviderTableServiceReturn } from '@/tests/utils/__mocks__/my-organization/idp-management/sso-provider-table/sso-provider-table-mocks';

vi.mock('@/hooks/shared/use-translator', () => ({
  useTranslator: () => ({ t: (key: string) => key }),
}));

vi.mock('@/hooks/shared/use-error-handler', () => ({
  useErrorHandler: () => vi.fn(),
}));

vi.mock('@/components/auth0/shared/toast', () => ({
  showToast: vi.fn(),
}));

vi.mock('@/hooks/my-organization/shared/services/use-sso-provider-table-service', () => ({
  useSsoProviderTableService: vi.fn(() => ({
    providers: [],
    organization: null,
    isLoading: false,
    providersError: null,
    organizationError: null,
    isDeleting: false,
    isRemoving: false,
    isUpdating: false,
    isUpdatingId: null,
    fetchProviders: vi.fn(),
    fetchOrganizationDetails: vi.fn(),
    onDeleteConfirm: vi.fn(),
    onRemoveConfirm: vi.fn(),
    onEnableProvider: vi.fn(),
  })),
  ssoProviderQueryKeys: {
    all: ['sso-providers'] as const,
    list: () => ['sso-providers', 'list'] as const,
    organization: ['organization', 'details'] as const,
  },
}));

vi.mock('@/hooks/my-organization/shared/services/use-config-service', () => ({
  useConfig: () => ({
    isLoadingConfig: false,
    shouldAllowDeletion: true,
    isConfigValid: true,
  }),
}));
vi.mock('@/hooks/my-organization/shared/services/use-idp-config-service', () => ({
  useIdpConfig: () => ({
    isLoadingIdpConfig: false,
    isIdpConfigValid: true,
    showCrossAppAccess: vi.fn(() => false),
    isCrossAppAccessReadOnly: vi.fn(() => false),
    getCrossAppAccessDefaultValue: vi.fn(() => undefined),
  }),
}));

describe('useSsoProviderTable', () => {
  const mockCreateAction = { onAfter: vi.fn() };
  const mockEditAction = { onAfter: vi.fn() };
  const mockDeleteAction = { onBefore: vi.fn(() => true) };
  const mockDeleteFromOrgAction = { onBefore: vi.fn(() => true) };

  const idp = { id: 'idp1', name: 'Test IDP', options: {}, strategy: 'waad' as const };

  const defaultOptions = {
    readOnly: false,
    createAction: mockCreateAction,
    editAction: mockEditAction,
    deleteAction: mockDeleteAction,
    deleteFromOrganizationAction: mockDeleteFromOrgAction,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return correct initial state', () => {
    const { result } = renderHook(() => useSsoProviderTable(defaultOptions));

    expect(result.current.shouldAllowDeletion).toBe(true);
    expect(result.current.isViewLoading).toBe(false);
    expect(result.current.shouldHideCreate).toBe(false);
    expect(result.current.showDeleteModal).toBe(false);
    expect(result.current.showRemoveModal).toBe(false);
    expect(result.current.selectedIdp).toBeNull();
  });

  it('should call createAction.onAfter on handleCreate', () => {
    const { result } = renderHook(() => useSsoProviderTable(defaultOptions));

    act(() => {
      result.current.handleCreate();
    });
    expect(mockCreateAction.onAfter).toHaveBeenCalled();
  });

  it('should call editAction.onAfter on handleEdit', () => {
    const { result } = renderHook(() => useSsoProviderTable(defaultOptions));

    act(() => {
      result.current.handleEdit(idp);
    });
    expect(mockEditAction.onAfter).toHaveBeenCalledWith(idp);
  });

  it('should set selectedIdp and showDeleteModal on handleDelete', () => {
    const { result } = renderHook(() => useSsoProviderTable(defaultOptions));

    act(() => {
      result.current.handleDelete(idp);
    });
    expect(result.current.selectedIdp).toEqual(idp);
    expect(result.current.showDeleteModal).toBe(true);
  });

  it('should set selectedIdp and showRemoveModal on handleDeleteFromOrganization', () => {
    const { result } = renderHook(() => useSsoProviderTable(defaultOptions));

    act(() => {
      result.current.handleDeleteFromOrganization(idp);
    });
    expect(result.current.selectedIdp).toEqual(idp);
    expect(result.current.showRemoveModal).toBe(true);
  });

  it('should call onEnableProvider if not readOnly', async () => {
    const mockOnEnableProvider = vi.fn();
    const { useSsoProviderTableService } = await import(
      '@/hooks/my-organization/shared/services/use-sso-provider-table-service'
    );
    vi.mocked(useSsoProviderTableService).mockReturnValue(
      createMockSsoProviderTableServiceReturn({ onEnableProvider: mockOnEnableProvider }),
    );

    const { result } = renderHook(() => useSsoProviderTable(defaultOptions));

    await act(async () => {
      await result.current.handleToggleEnabled(idp, true);
    });
    expect(mockOnEnableProvider).toHaveBeenCalledWith(idp, true);
  });

  it('should not call onEnableProvider if readOnly', async () => {
    const mockOnEnableProvider = vi.fn();
    const { useSsoProviderTableService } = await import(
      '@/hooks/my-organization/shared/services/use-sso-provider-table-service'
    );
    vi.mocked(useSsoProviderTableService).mockReturnValue(
      createMockSsoProviderTableServiceReturn({ onEnableProvider: mockOnEnableProvider }),
    );

    const { result } = renderHook(() => useSsoProviderTable({ ...defaultOptions, readOnly: true }));

    await act(async () => {
      await result.current.handleToggleEnabled(idp, false);
    });
    expect(mockOnEnableProvider).not.toHaveBeenCalled();
  });

  it('should call onDeleteConfirm and close modal on handleDeleteConfirm', async () => {
    const mockOnDeleteConfirm = vi.fn();
    const { useSsoProviderTableService } = await import(
      '@/hooks/my-organization/shared/services/use-sso-provider-table-service'
    );
    vi.mocked(useSsoProviderTableService).mockReturnValue(
      createMockSsoProviderTableServiceReturn({ onDeleteConfirm: mockOnDeleteConfirm }),
    );

    const { result } = renderHook(() => useSsoProviderTable(defaultOptions));

    act(() => {
      result.current.setShowDeleteModal(true);
      result.current.setSelectedIdp(idp);
    });
    await act(async () => {
      await result.current.handleDeleteConfirm(idp);
    });
    expect(mockOnDeleteConfirm).toHaveBeenCalledWith(idp);
    expect(result.current.showDeleteModal).toBe(false);
    expect(result.current.selectedIdp).toBeNull();
  });

  it('should call onRemoveConfirm and close modal on handleRemoveConfirm', async () => {
    const mockOnRemoveConfirm = vi.fn();
    const { useSsoProviderTableService } = await import(
      '@/hooks/my-organization/shared/services/use-sso-provider-table-service'
    );
    vi.mocked(useSsoProviderTableService).mockReturnValue(
      createMockSsoProviderTableServiceReturn({ onRemoveConfirm: mockOnRemoveConfirm }),
    );

    const { result } = renderHook(() => useSsoProviderTable(defaultOptions));

    act(() => {
      result.current.setShowRemoveModal(true);
      result.current.setSelectedIdp(idp);
    });
    await act(async () => {
      await result.current.handleRemoveConfirm(idp);
    });
    expect(mockOnRemoveConfirm).toHaveBeenCalledWith(idp);
    expect(result.current.showRemoveModal).toBe(false);
    expect(result.current.selectedIdp).toBeNull();
  });
});
