import { renderHook, act } from '@testing-library/react';
import { createElement } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useSsoProviderTable } from '../use-sso-provider-table';

import { PermissionContext } from '@/providers/permission-provider';
import { createMockSsoProviderTableServiceReturn } from '@/tests/utils/__mocks__/my-organization/idp-management/sso-provider-table/sso-provider-table-mocks';
import { ALL_MY_ORG_PERMISSIONS } from '@/tests/utils/__mocks__/permissions/permission.mocks';
import type { UseSsoProviderTableOptions } from '@/types/my-organization/idp-management/sso-provider/sso-provider-table-types';

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

  const renderWithGranted = (permissions: string[], options: UseSsoProviderTableOptions) =>
    renderHook(() => useSsoProviderTable(options), {
      wrapper: ({ children }: React.PropsWithChildren) =>
        createElement(
          PermissionContext.Provider,
          { value: { permissions, isLoading: false } },
          children,
        ),
    });

  const render = (options: UseSsoProviderTableOptions = defaultOptions) =>
    renderWithGranted(ALL_MY_ORG_PERMISSIONS, options);

  it('should return correct initial state', () => {
    const { result } = render();

    expect(result.current.shouldAllowDeletion).toBe(true);
    expect(result.current.isViewLoading).toBe(false);
    expect(result.current.shouldHideCreate).toBe(false);
    expect(result.current.showDeleteModal).toBe(false);
    expect(result.current.showRemoveModal).toBe(false);
    expect(result.current.selectedIdp).toBeNull();
  });

  it('should call createAction.onAfter on handleCreate', () => {
    const { result } = render();

    act(() => {
      result.current.handleCreate();
    });
    expect(mockCreateAction.onAfter).toHaveBeenCalled();
  });

  it('should call editAction.onAfter on handleEdit', () => {
    const { result } = render();

    act(() => {
      result.current.handleEdit(idp);
    });
    expect(mockEditAction.onAfter).toHaveBeenCalledWith(idp);
  });

  it('should set selectedIdp and showDeleteModal on handleDelete', () => {
    const { result } = render();

    act(() => {
      result.current.handleDelete(idp);
    });
    expect(result.current.selectedIdp).toEqual(idp);
    expect(result.current.showDeleteModal).toBe(true);
  });

  it('should set selectedIdp and showRemoveModal on handleDeleteFromOrganization', () => {
    const { result } = render();

    act(() => {
      result.current.handleDeleteFromOrganization(idp);
    });
    expect(result.current.selectedIdp).toEqual(idp);
    expect(result.current.showRemoveModal).toBe(true);
  });

  it('should call onEnableProvider when update:my_org:identity_providers is granted', async () => {
    const mockOnEnableProvider = vi.fn();
    const { useSsoProviderTableService } = await import(
      '@/hooks/my-organization/shared/services/use-sso-provider-table-service'
    );
    vi.mocked(useSsoProviderTableService).mockReturnValue(
      createMockSsoProviderTableServiceReturn({ onEnableProvider: mockOnEnableProvider }),
    );

    const { result } = render();

    await act(async () => {
      await result.current.handleToggleEnabled(idp, true);
    });
    expect(mockOnEnableProvider).toHaveBeenCalledWith(idp, true);
  });

  it('should not call onEnableProvider when readOnly is set', async () => {
    const mockOnEnableProvider = vi.fn();
    const { useSsoProviderTableService } = await import(
      '@/hooks/my-organization/shared/services/use-sso-provider-table-service'
    );
    vi.mocked(useSsoProviderTableService).mockReturnValue(
      createMockSsoProviderTableServiceReturn({ onEnableProvider: mockOnEnableProvider }),
    );

    const { result } = render({ ...defaultOptions, readOnly: true });

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

    const { result } = render();

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

    const { result } = render();

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

  describe('permission guards', () => {
    const VIEWER = ['read:my_org:identity_providers'];

    it('should refuse to start creation without create:my_org:identity_providers', () => {
      const { result } = renderWithGranted(VIEWER, defaultOptions);

      act(() => {
        result.current.handleCreate();
      });

      expect(mockCreateAction.onAfter).not.toHaveBeenCalled();
    });

    it('should refuse to open the delete modal without delete:my_org:identity_providers', () => {
      const { result } = renderWithGranted(VIEWER, defaultOptions);

      act(() => {
        result.current.handleDelete(idp);
      });

      expect(result.current.showDeleteModal).toBe(false);
    });

    it('should refuse to open the remove modal without update:my_org:identity_providers_detach', () => {
      const { result } = renderWithGranted(VIEWER, defaultOptions);

      act(() => {
        result.current.handleDeleteFromOrganization(idp);
      });

      expect(result.current.showRemoveModal).toBe(false);
    });

    it('should refuse the delete submit without delete:my_org:identity_providers', async () => {
      const mockOnDeleteConfirm = vi.fn();
      const { useSsoProviderTableService } = await import(
        '@/hooks/my-organization/shared/services/use-sso-provider-table-service'
      );
      vi.mocked(useSsoProviderTableService).mockReturnValue(
        createMockSsoProviderTableServiceReturn({ onDeleteConfirm: mockOnDeleteConfirm }),
      );

      const { result } = renderWithGranted(VIEWER, defaultOptions);

      await act(async () => {
        await result.current.handleDeleteConfirm(idp);
      });

      expect(mockOnDeleteConfirm).not.toHaveBeenCalled();
    });

    it('should refuse the remove submit without update:my_org:identity_providers_detach', async () => {
      const mockOnRemoveConfirm = vi.fn();
      const { useSsoProviderTableService } = await import(
        '@/hooks/my-organization/shared/services/use-sso-provider-table-service'
      );
      vi.mocked(useSsoProviderTableService).mockReturnValue(
        createMockSsoProviderTableServiceReturn({ onRemoveConfirm: mockOnRemoveConfirm }),
      );

      const { result } = renderWithGranted(VIEWER, defaultOptions);

      await act(async () => {
        await result.current.handleRemoveConfirm(idp);
      });

      expect(mockOnRemoveConfirm).not.toHaveBeenCalled();
    });

    it('should refuse every action when readOnly is set, even with the scopes granted', () => {
      const { result } = render({ ...defaultOptions, readOnly: true });

      act(() => {
        result.current.handleCreate();
      });
      act(() => {
        result.current.handleDelete(idp);
      });

      expect(mockCreateAction.onAfter).not.toHaveBeenCalled();
      expect(result.current.showDeleteModal).toBe(false);
    });
  });
});
