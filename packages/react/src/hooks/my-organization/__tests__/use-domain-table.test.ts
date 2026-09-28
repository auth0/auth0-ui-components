import { renderHook, act } from '@testing-library/react';
import { createElement } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useDomainTable } from '../use-domain-table';

import { useDomainTableService } from '@/hooks/my-organization/shared/services/use-domain-table-service';
import { PermissionContext } from '@/providers/permission-provider';
import { createMockDomainTableServiceReturn } from '@/tests/utils/__mocks__/my-organization/domain-management/domain.mocks';
import { ALL_MY_ORG_PERMISSIONS } from '@/tests/utils/__mocks__/permissions/permission.mocks';
import { mockToast } from '@/tests/utils/test-setup';
import type { UseDomainTableOptions } from '@/types/my-organization/domain-management/domain-table-types';

const mockHandleError = vi.fn();

vi.mock('@/hooks/shared/use-translator', () => ({
  useTranslator: () => ({ t: (key: string) => key }),
}));

vi.mock('@/hooks/shared/use-error-handler', () => ({
  useErrorHandler: () => mockHandleError,
}));

mockToast();

vi.mock('@/hooks/my-organization/shared/services/use-domain-table-service', () => ({
  useDomainTableService: vi.fn(),
}));

const mockUseDomainTableService = vi.mocked(useDomainTableService);

describe('useDomainTable', () => {
  const mockDomain = {
    id: 'domain_abc123',
    org_id: 'org_123',
    domain: 'test.com',
    status: 'pending' as const,
    verification_txt: 'txt',
    verification_host: 'host',
  };

  const verifiedDomain = { ...mockDomain, status: 'verified' as const };

  const mockProvider = {
    id: 'con_abc123',
    name: 'TestIDP',
    display_name: 'Test IDP',
    options: {},
    strategy: 'waad' as const,
  };

  const defaultOptions = {
    createAction: { onBefore: vi.fn(() => true), onAfter: vi.fn() },
    deleteAction: { onBefore: vi.fn(() => true), onAfter: vi.fn() },
    verifyAction: { onBefore: vi.fn(() => true), onAfter: vi.fn() },
    associateToProviderAction: { onBefore: vi.fn(() => true), onAfter: vi.fn() },
    deleteFromProviderAction: { onBefore: vi.fn(() => true), onAfter: vi.fn() },
    customMessages: {},
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseDomainTableService.mockReturnValue(createMockDomainTableServiceReturn());
  });

  const renderWithGranted = (permissions: string[], options: UseDomainTableOptions) => {
    const wrapper = ({ children }: React.PropsWithChildren) =>
      createElement(
        PermissionContext.Provider,
        { value: { permissions, isLoading: false } },
        children,
      );

    return renderHook(() => useDomainTable(options), { wrapper });
  };

  const render = (options: UseDomainTableOptions = defaultOptions) =>
    renderWithGranted(ALL_MY_ORG_PERMISSIONS, options);

  const renderWithPermissions = (
    permissions: string[],
    options: UseDomainTableOptions = defaultOptions,
  ) => renderWithGranted(permissions, options);

  it('should return correct initial state', () => {
    const { result } = render();

    expect(result.current.showCreateModal).toBe(false);
    expect(result.current.showConfigureModal).toBe(false);
    expect(result.current.showVerifyModal).toBe(false);
    expect(result.current.showDeleteModal).toBe(false);
    expect(result.current.verifyError).toBeUndefined();
    expect(result.current.selectedDomain).toBeNull();
    expect(result.current.domains).toEqual([]);
    expect(result.current.providers).toEqual([]);
  });

  it('should show create modal on handleCreateClick', () => {
    const { result } = render();

    act(() => {
      result.current.handleCreateClick();
    });

    expect(result.current.showCreateModal).toBe(true);
  });

  it('should create domain, show toast, and open verify modal on handleCreate', async () => {
    const mockOnCreateDomain = vi.fn().mockResolvedValue(mockDomain);
    mockUseDomainTableService.mockReturnValue(
      createMockDomainTableServiceReturn({ onCreateDomain: mockOnCreateDomain }),
    );

    const { result } = render();

    await act(async () => {
      await result.current.handleCreate('test.com');
    });

    expect(mockOnCreateDomain).toHaveBeenCalledWith({ domain: 'test.com' });
    expect(result.current.selectedDomain).toEqual(mockDomain);
    expect(result.current.showCreateModal).toBe(false);
    expect(result.current.showVerifyModal).toBe(true);
  });

  it('should handle create error on handleCreate', async () => {
    const error = new Error('Create failed');
    const mockOnCreateDomain = vi.fn().mockRejectedValue(error);
    mockUseDomainTableService.mockReturnValue(
      createMockDomainTableServiceReturn({ onCreateDomain: mockOnCreateDomain }),
    );

    const { result } = render();

    await act(async () => {
      await result.current.handleCreate('test.com');
    });

    expect(mockHandleError).toHaveBeenCalledWith(error, {
      fallbackMessage: 'domain_table.notifications.domain_create.error',
    });
  });

  it('should verify domain and close verify modal on handleVerify success', async () => {
    const mockOnVerifyDomain = vi.fn().mockResolvedValue(true);
    mockUseDomainTableService.mockReturnValue(
      createMockDomainTableServiceReturn({ onVerifyDomain: mockOnVerifyDomain }),
    );

    const { result } = render();

    await act(async () => {
      await result.current.handleVerify(mockDomain);
    });

    expect(mockOnVerifyDomain).toHaveBeenCalledWith(mockDomain);
    expect(result.current.showVerifyModal).toBe(false);
  });

  it('should set verify error on handleVerify failure', async () => {
    const mockOnVerifyDomain = vi.fn().mockResolvedValue(false);
    mockUseDomainTableService.mockReturnValue(
      createMockDomainTableServiceReturn({ onVerifyDomain: mockOnVerifyDomain }),
    );

    const { result } = render();

    await act(async () => {
      await result.current.handleVerify(mockDomain);
    });

    expect(result.current.verifyError).toBe('domain_verify.modal.errors.verification_failed');
  });

  it('should handle verify error on handleVerify', async () => {
    const error = new Error('Verify failed');
    const mockOnVerifyDomain = vi.fn().mockRejectedValue(error);
    mockUseDomainTableService.mockReturnValue(
      createMockDomainTableServiceReturn({ onVerifyDomain: mockOnVerifyDomain }),
    );

    const { result } = render();

    await act(async () => {
      await result.current.handleVerify(mockDomain);
    });

    expect(mockHandleError).toHaveBeenCalledWith(error, {
      fallbackMessage: 'domain_table.notifications.domain_verify.error',
    });
  });

  it('should delete domain and close modals on handleDelete', async () => {
    const mockOnDeleteDomain = vi.fn().mockResolvedValue(undefined);
    mockUseDomainTableService.mockReturnValue(
      createMockDomainTableServiceReturn({ onDeleteDomain: mockOnDeleteDomain }),
    );

    const { result } = render();

    await act(async () => {
      await result.current.handleDelete(mockDomain);
    });

    expect(mockOnDeleteDomain).toHaveBeenCalledWith(mockDomain);
    expect(result.current.showDeleteModal).toBe(false);
    expect(result.current.showVerifyModal).toBe(false);
  });

  it('should handle delete error on handleDelete', async () => {
    const error = new Error('Delete failed');
    const mockOnDeleteDomain = vi.fn().mockRejectedValue(error);
    mockUseDomainTableService.mockReturnValue(
      createMockDomainTableServiceReturn({ onDeleteDomain: mockOnDeleteDomain }),
    );

    const { result } = render();

    await act(async () => {
      await result.current.handleDelete(mockDomain);
    });

    expect(mockHandleError).toHaveBeenCalledWith(error, {
      fallbackMessage: 'domain_table.notifications.domain_delete.error',
    });
  });

  it('should associate domain to provider on handleToggleSwitch with true', async () => {
    const mockOnAssociateToProvider = vi.fn().mockResolvedValue(undefined);
    mockUseDomainTableService.mockReturnValue(
      createMockDomainTableServiceReturn({ onAssociateToProvider: mockOnAssociateToProvider }),
    );

    const { result } = render();

    await act(async () => {
      await result.current.handleToggleSwitch(mockDomain, mockProvider, true);
    });

    expect(mockOnAssociateToProvider).toHaveBeenCalledWith(mockDomain, mockProvider);
  });

  it('should delete domain from provider on handleToggleSwitch with false', async () => {
    const mockOnDeleteFromProvider = vi.fn().mockResolvedValue(undefined);
    mockUseDomainTableService.mockReturnValue(
      createMockDomainTableServiceReturn({ onDeleteFromProvider: mockOnDeleteFromProvider }),
    );

    const { result } = render();

    await act(async () => {
      await result.current.handleToggleSwitch(mockDomain, mockProvider, false);
    });

    expect(mockOnDeleteFromProvider).toHaveBeenCalledWith(mockDomain, mockProvider);
  });

  it('should handle associate to provider error on handleToggleSwitch', async () => {
    const error = new Error('Associate failed');
    const mockOnAssociateToProvider = vi.fn().mockRejectedValue(error);
    mockUseDomainTableService.mockReturnValue(
      createMockDomainTableServiceReturn({ onAssociateToProvider: mockOnAssociateToProvider }),
    );

    const { result } = render();

    await act(async () => {
      await result.current.handleToggleSwitch(mockDomain, mockProvider, true);
    });

    expect(mockHandleError).toHaveBeenCalledWith(error, {
      fallbackMessage: 'domain_table.notifications.domain_associate_provider.error',
    });
  });

  it('should handle delete from provider error on handleToggleSwitch', async () => {
    const error = new Error('Delete from provider failed');
    const mockOnDeleteFromProvider = vi.fn().mockRejectedValue(error);
    mockUseDomainTableService.mockReturnValue(
      createMockDomainTableServiceReturn({ onDeleteFromProvider: mockOnDeleteFromProvider }),
    );

    const { result } = render();

    await act(async () => {
      await result.current.handleToggleSwitch(mockDomain, mockProvider, false);
    });

    expect(mockHandleError).toHaveBeenCalledWith(error, {
      fallbackMessage: 'domain_table.notifications.domain_delete_provider.error',
    });
  });

  it('should close verify modal and clear error on handleCloseVerifyModal', async () => {
    const mockOnVerifyDomain = vi.fn().mockResolvedValue(false);
    mockUseDomainTableService.mockReturnValue(
      createMockDomainTableServiceReturn({ onVerifyDomain: mockOnVerifyDomain }),
    );

    const { result } = render();

    await act(async () => {
      await result.current.handleVerify(mockDomain);
    });
    expect(result.current.verifyError).toBeDefined();

    act(() => {
      result.current.handleCloseVerifyModal();
    });

    expect(result.current.showVerifyModal).toBe(false);
    expect(result.current.verifyError).toBeUndefined();
  });

  it('should show verify modal for unverified domain on handleConfigureClick', async () => {
    const { result } = render();

    await act(async () => {
      await result.current.handleConfigureClick(mockDomain);
    });

    expect(result.current.selectedDomain).toEqual(mockDomain);
    expect(result.current.showVerifyModal).toBe(true);
  });

  it('should fetch providers and show configure modal for verified domain on handleConfigureClick', async () => {
    const mockFetchProviders = vi.fn().mockResolvedValue(undefined);
    mockUseDomainTableService.mockReturnValue(
      createMockDomainTableServiceReturn({ fetchProviders: mockFetchProviders }),
    );

    const { result } = render();

    await act(async () => {
      await result.current.handleConfigureClick(verifiedDomain);
    });

    expect(result.current.selectedDomain).toEqual(verifiedDomain);
    expect(mockFetchProviders).toHaveBeenCalledWith(verifiedDomain);
    expect(result.current.showConfigureModal).toBe(true);
  });

  it('should handle fetchProviders error on handleConfigureClick', async () => {
    const error = new Error('Fetch providers failed');
    const mockFetchProviders = vi.fn().mockRejectedValue(error);
    mockUseDomainTableService.mockReturnValue(
      createMockDomainTableServiceReturn({ fetchProviders: mockFetchProviders }),
    );

    const { result } = render();

    await act(async () => {
      await result.current.handleConfigureClick(verifiedDomain);
    });

    expect(mockHandleError).toHaveBeenCalledWith(error, {
      fallbackMessage: 'domain_table.notifications.fetch_providers_error',
    });
  });

  it('should verify, fetch providers, and show configure modal on handleVerifyClick success', async () => {
    const mockOnVerifyDomain = vi.fn().mockResolvedValue(true);
    const mockFetchProviders = vi.fn().mockResolvedValue(undefined);
    mockUseDomainTableService.mockReturnValue(
      createMockDomainTableServiceReturn({
        onVerifyDomain: mockOnVerifyDomain,
        fetchProviders: mockFetchProviders,
      }),
    );

    const { result } = render();

    await act(async () => {
      await result.current.handleVerifyClick(mockDomain);
    });

    expect(result.current.selectedDomain).toEqual(mockDomain);
    expect(mockOnVerifyDomain).toHaveBeenCalledWith(mockDomain);
    expect(mockFetchProviders).toHaveBeenCalledWith(mockDomain);
    expect(result.current.showConfigureModal).toBe(true);
  });

  it('should show error toast on handleVerifyClick failure', async () => {
    const mockOnVerifyDomain = vi.fn().mockResolvedValue(false);
    mockUseDomainTableService.mockReturnValue(
      createMockDomainTableServiceReturn({ onVerifyDomain: mockOnVerifyDomain }),
    );

    const { result } = render();

    await act(async () => {
      await result.current.handleVerifyClick(mockDomain);
    });

    expect(result.current.selectedDomain).toEqual(mockDomain);
  });

  it('should handle error on handleVerifyClick', async () => {
    const error = new Error('Verify click failed');
    const mockOnVerifyDomain = vi.fn().mockRejectedValue(error);
    mockUseDomainTableService.mockReturnValue(
      createMockDomainTableServiceReturn({ onVerifyDomain: mockOnVerifyDomain }),
    );

    const { result } = render();

    await act(async () => {
      await result.current.handleVerifyClick(mockDomain);
    });

    expect(mockHandleError).toHaveBeenCalledWith(error, {
      fallbackMessage: 'domain_table.notifications.domain_verify.error',
    });
  });

  it('should set selected domain, close verify modal, and show delete modal on handleDeleteClick', () => {
    const { result } = render();

    act(() => {
      result.current.setShowVerifyModal(true);
    });

    act(() => {
      result.current.handleDeleteClick(mockDomain);
    });

    expect(result.current.selectedDomain).toEqual(mockDomain);
    expect(result.current.showVerifyModal).toBe(false);
    expect(result.current.showDeleteModal).toBe(true);
  });

  describe('pagination', () => {
    it('should return correct initial pagination state', () => {
      const { result } = render();

      expect(result.current.pagination).toEqual({
        pageSize: 10,
        currentPage: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    });

    it('should navigate to next page when handleNextPage is called with nextToken', () => {
      mockUseDomainTableService.mockReturnValue(
        createMockDomainTableServiceReturn({ nextToken: 'next-token-123' }),
      );

      const { result } = render();

      act(() => {
        result.current.handleNextPage();
      });

      expect(result.current.pagination.currentPage).toBe(2);
      expect(result.current.pagination.hasPreviousPage).toBe(true);
    });

    it('should not navigate to next page when nextToken is null', () => {
      mockUseDomainTableService.mockReturnValue(
        createMockDomainTableServiceReturn({ nextToken: null }),
      );

      const { result } = render();

      act(() => {
        result.current.handleNextPage();
      });

      expect(result.current.pagination.currentPage).toBe(1);
      expect(result.current.pagination.hasPreviousPage).toBe(false);
    });

    it('should navigate to previous page when handlePreviousPage is called', () => {
      mockUseDomainTableService.mockReturnValue(
        createMockDomainTableServiceReturn({ nextToken: 'next-token-123' }),
      );

      const { result } = render();

      act(() => {
        result.current.handleNextPage();
      });

      expect(result.current.pagination.currentPage).toBe(2);

      act(() => {
        result.current.handlePreviousPage();
      });

      expect(result.current.pagination.currentPage).toBe(1);
      expect(result.current.pagination.hasPreviousPage).toBe(false);
    });

    it('should reset pagination when page size changes', () => {
      mockUseDomainTableService.mockReturnValue(
        createMockDomainTableServiceReturn({ nextToken: 'next-token-123' }),
      );

      const { result } = render();

      act(() => {
        result.current.handleNextPage();
      });

      expect(result.current.pagination.currentPage).toBe(2);

      act(() => {
        result.current.handlePageSizeChange(25);
      });

      expect(result.current.pagination.pageSize).toBe(25);
      expect(result.current.pagination.currentPage).toBe(1);
      expect(result.current.pagination.hasPreviousPage).toBe(false);
    });

    it('should update hasNextPage based on nextToken from service', () => {
      mockUseDomainTableService.mockReturnValue(
        createMockDomainTableServiceReturn({ nextToken: 'some-token' }),
      );

      const { result } = render();

      expect(result.current.pagination.hasNextPage).toBe(true);
    });
  });

  describe('permission guards', () => {
    it('should refuse to open the create modal without create:my_org:domains', () => {
      const { result } = renderWithPermissions(['read:my_org:domains']);

      act(() => {
        result.current.handleCreateClick();
      });

      expect(result.current.showCreateModal).toBe(false);
    });

    it('should open the create modal when create:my_org:domains is granted', () => {
      const { result } = renderWithPermissions(['create:my_org:domains']);

      act(() => {
        result.current.handleCreateClick();
      });

      expect(result.current.showCreateModal).toBe(true);
    });

    it('should refuse to open the delete modal without delete:my_org:domains', () => {
      const { result } = renderWithPermissions(['read:my_org:domains']);

      act(() => {
        result.current.handleDeleteClick(mockDomain);
      });

      expect(result.current.showDeleteModal).toBe(false);
    });

    it('should open the delete modal when delete:my_org:domains is granted', () => {
      const { result } = renderWithPermissions(['delete:my_org:domains']);

      act(() => {
        result.current.handleDeleteClick(mockDomain);
      });

      expect(result.current.showDeleteModal).toBe(true);
    });

    it('should refuse to verify without update:my_org:domains', async () => {
      const onVerifyDomain = vi.fn().mockResolvedValue(true);
      mockUseDomainTableService.mockReturnValue(
        createMockDomainTableServiceReturn({ onVerifyDomain }),
      );
      const { result } = renderWithPermissions(['read:my_org:domains']);

      await act(async () => {
        await result.current.handleVerifyClick(mockDomain);
      });

      expect(onVerifyDomain).not.toHaveBeenCalled();
    });

    it('should refuse the create submit without create:my_org:domains', async () => {
      const onCreateDomain = vi.fn().mockResolvedValue(mockDomain);
      mockUseDomainTableService.mockReturnValue(
        createMockDomainTableServiceReturn({ onCreateDomain }),
      );
      const { result } = renderWithPermissions(['read:my_org:domains']);

      await act(async () => {
        await result.current.handleCreate('test.com');
      });

      expect(onCreateDomain).not.toHaveBeenCalled();
    });

    it('should refuse the verify submit without update:my_org:domains', async () => {
      const onVerifyDomain = vi.fn().mockResolvedValue(true);
      mockUseDomainTableService.mockReturnValue(
        createMockDomainTableServiceReturn({ onVerifyDomain }),
      );
      const { result } = renderWithPermissions(['read:my_org:domains']);

      await act(async () => {
        await result.current.handleVerify(mockDomain);
      });

      expect(onVerifyDomain).not.toHaveBeenCalled();
    });

    it('should refuse the delete submit without delete:my_org:domains', async () => {
      const onDeleteDomain = vi.fn().mockResolvedValue(undefined);
      mockUseDomainTableService.mockReturnValue(
        createMockDomainTableServiceReturn({ onDeleteDomain }),
      );
      const { result } = renderWithPermissions(['read:my_org:domains']);

      await act(async () => {
        await result.current.handleDelete(mockDomain);
      });

      expect(onDeleteDomain).not.toHaveBeenCalled();
    });

    it('should refuse associating a provider without the create provider-domain scope', async () => {
      const onAssociateToProvider = vi.fn().mockResolvedValue(undefined);
      mockUseDomainTableService.mockReturnValue(
        createMockDomainTableServiceReturn({ onAssociateToProvider }),
      );
      const { result } = renderWithPermissions(['delete:my_org:identity_providers_domains']);

      await act(async () => {
        await result.current.handleToggleSwitch(verifiedDomain, mockProvider, true);
      });

      expect(onAssociateToProvider).not.toHaveBeenCalled();
    });

    it('should refuse dissociating a provider without the delete provider-domain scope', async () => {
      const onDeleteFromProvider = vi.fn().mockResolvedValue(undefined);
      mockUseDomainTableService.mockReturnValue(
        createMockDomainTableServiceReturn({ onDeleteFromProvider }),
      );
      const { result } = renderWithPermissions(['create:my_org:identity_providers_domains']);

      await act(async () => {
        await result.current.handleToggleSwitch(verifiedDomain, mockProvider, false);
      });

      expect(onDeleteFromProvider).not.toHaveBeenCalled();
    });

    it('should still allow each direction when its own scope is granted', async () => {
      const onAssociateToProvider = vi.fn().mockResolvedValue(undefined);
      const onDeleteFromProvider = vi.fn().mockResolvedValue(undefined);
      mockUseDomainTableService.mockReturnValue(
        createMockDomainTableServiceReturn({ onAssociateToProvider, onDeleteFromProvider }),
      );
      const { result } = renderWithPermissions([
        'create:my_org:identity_providers_domains',
        'delete:my_org:identity_providers_domains',
      ]);

      await act(async () => {
        await result.current.handleToggleSwitch(verifiedDomain, mockProvider, true);
      });
      await act(async () => {
        await result.current.handleToggleSwitch(verifiedDomain, mockProvider, false);
      });

      expect(onAssociateToProvider).toHaveBeenCalledTimes(1);
      expect(onDeleteFromProvider).toHaveBeenCalledTimes(1);
    });

    it('should refuse every action when readOnly is set, even with the scopes granted', () => {
      const { result } = renderWithGranted(ALL_MY_ORG_PERMISSIONS, {
        ...defaultOptions,
        readOnly: true,
      });

      act(() => {
        result.current.handleCreateClick();
      });
      act(() => {
        result.current.handleDeleteClick(mockDomain);
      });

      expect(result.current.showCreateModal).toBe(false);
      expect(result.current.showDeleteModal).toBe(false);
    });
  });
});
