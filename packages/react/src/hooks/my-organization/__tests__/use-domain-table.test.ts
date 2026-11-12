import { renderHook, act } from '@testing-library/react';
import { createElement } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useDomainTable } from '../use-domain-table';

import { useConfig } from '@/hooks/my-organization/shared/services/use-config-service';
import { useDomainTableService } from '@/hooks/my-organization/shared/services/use-domain-table-service';
import { useIdpConfig } from '@/hooks/my-organization/shared/services/use-idp-config-service';
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

const { mockedShowToast } = mockToast();

vi.mock('@/hooks/my-organization/shared/services/use-domain-table-service', () => ({
  useDomainTableService: vi.fn(),
}));

vi.mock('@/hooks/my-organization/shared/services/use-config-service', () => ({
  useConfig: vi.fn(),
}));

vi.mock('@/hooks/my-organization/shared/services/use-idp-config-service', () => ({
  useIdpConfig: vi.fn(),
}));

const mockUseDomainTableService = vi.mocked(useDomainTableService);
const mockUseConfig = vi.mocked(useConfig);
const mockUseIdpConfig = vi.mocked(useIdpConfig);

const mockIdpConfig = (domainVerification?: 'none' | 'optional' | 'required') =>
  mockUseIdpConfig.mockReturnValue({
    idpConfig: domainVerification
      ? { domain_aliases_config: { domain_verification: domainVerification } }
      : null,
  } as ReturnType<typeof useIdpConfig>);

const createMockConfig = (overrides: Partial<ReturnType<typeof useConfig>> = {}) =>
  ({
    discoveryPolicy: null,
    showDiscovery: false,
    isDiscoveryReadOnly: true,
    discoveryDefaultValue: false,
    ...overrides,
  }) as ReturnType<typeof useConfig>;

const editableDiscoveryConfig = () =>
  createMockConfig({
    discoveryPolicy: { default_value: false, allowed_values: [true, false] },
    showDiscovery: true,
    isDiscoveryReadOnly: false,
    discoveryDefaultValue: false,
  });

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
    mockUseConfig.mockReturnValue(createMockConfig());
    mockIdpConfig();
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

  describe('domain verification mode', () => {
    it.each(['none', 'optional', 'required'] as const)('exposes the configured %s mode', (mode) => {
      mockIdpConfig(mode);
      const { result } = render();

      expect(result.current.domainVerificationMode).toBe(mode);
    });

    it('defaults to optional when the IdP configuration is unavailable', () => {
      mockIdpConfig();
      const { result } = render();

      expect(result.current.domainVerificationMode).toBe('optional');
    });

    it('keeps the providers loading until the IdP configuration resolves', () => {
      mockUseIdpConfig.mockReturnValue({
        idpConfig: null,
        isLoadingIdpConfig: true,
      } as ReturnType<typeof useIdpConfig>);
      const { result } = render();

      expect(result.current.isLoadingProviders).toBe(true);
    });
  });

  describe('domain discovery', () => {
    const mockServiceWith = (overrides = {}) => {
      const service = createMockDomainTableServiceReturn({
        onVerifyDomain: vi.fn().mockResolvedValue(true),
        onUpdateDomainDiscovery: vi.fn().mockResolvedValue(verifiedDomain),
        onCreateDomain: vi.fn().mockResolvedValue(mockDomain),
        fetchProviders: vi.fn().mockResolvedValue(undefined),
        ...overrides,
      });
      mockUseDomainTableService.mockReturnValue(service);
      return service;
    };

    it('exposes the discovery policy from the configuration', () => {
      mockUseConfig.mockReturnValue(editableDiscoveryConfig());
      const { result } = render();

      expect(result.current.showDiscovery).toBe(true);
      expect(result.current.isDiscoveryReadOnly).toBe(false);
      expect(result.current.discoveryDefaultValue).toBe(false);
    });

    it('omits use_for_organization_discovery on create when discovery is not available', async () => {
      const service = mockServiceWith();
      const { result } = render();

      await act(async () => {
        await result.current.handleCreate('test.com', true);
      });

      expect(service.onCreateDomain).toHaveBeenCalledWith({ domain: 'test.com' });
    });

    it('sends use_for_organization_discovery on create when discovery is available', async () => {
      mockUseConfig.mockReturnValue(editableDiscoveryConfig());
      const service = mockServiceWith();
      const { result } = render();

      await act(async () => {
        await result.current.handleCreate('test.com', true);
      });

      expect(service.onCreateDomain).toHaveBeenCalledWith({
        domain: 'test.com',
        use_for_organization_discovery: true,
      });
    });

    it('opens the discovery modal after verify when discovery is still off', async () => {
      mockUseConfig.mockReturnValue(editableDiscoveryConfig());
      mockServiceWith();
      const { result } = render();

      await act(async () => {
        await result.current.handleVerify({ ...mockDomain, use_for_organization_discovery: false });
      });

      expect(result.current.showVerifyModal).toBe(false);
      expect(result.current.showDiscoveryModal).toBe(true);
    });

    it('announces that discovery is on, without the modal, when it was already chosen', async () => {
      mockUseConfig.mockReturnValue(editableDiscoveryConfig());
      mockServiceWith();
      const { result } = render();

      await act(async () => {
        await result.current.handleVerify({ ...mockDomain, use_for_organization_discovery: true });
      });

      expect(result.current.showDiscoveryModal).toBe(false);
      expect(mockedShowToast).toHaveBeenCalledWith({
        type: 'success',
        message: 'domain_table.notifications.domain_verify.success_discovery_on',
      });
    });

    it('does not open the discovery modal when the policy locks discovery', async () => {
      mockUseConfig.mockReturnValue(
        createMockConfig({
          discoveryPolicy: { default_value: false, allowed_values: [false] },
          showDiscovery: true,
          isDiscoveryReadOnly: true,
        }),
      );
      mockServiceWith();
      const { result } = render();

      await act(async () => {
        await result.current.handleVerify(mockDomain);
      });

      expect(result.current.showDiscoveryModal).toBe(false);
    });

    it('turns discovery on from the modal and closes it', async () => {
      mockUseConfig.mockReturnValue(editableDiscoveryConfig());
      const service = mockServiceWith();
      const { result } = render();

      await act(async () => {
        await result.current.handleVerify(mockDomain);
      });
      await act(async () => {
        await result.current.handleEnableDiscovery(mockDomain);
      });

      expect(service.onUpdateDomainDiscovery).toHaveBeenCalledWith(mockDomain, true);
      expect(result.current.showDiscoveryModal).toBe(false);
    });

    it('reports an error and keeps the modal open when turning discovery on fails', async () => {
      mockUseConfig.mockReturnValue(editableDiscoveryConfig());
      const error = new Error('update failed');
      mockServiceWith({ onUpdateDomainDiscovery: vi.fn().mockRejectedValue(error) });
      const { result } = render();

      await act(async () => {
        await result.current.handleVerify(mockDomain);
      });
      await act(async () => {
        await result.current.handleEnableDiscovery(mockDomain);
      });

      expect(mockHandleError).toHaveBeenCalledWith(error, {
        fallbackMessage: 'domain_table.notifications.domain_discovery_update.error',
      });
      expect(result.current.showDiscoveryModal).toBe(true);
    });

    it('omits use_for_organization_discovery on create without the update permission', async () => {
      mockUseConfig.mockReturnValue(editableDiscoveryConfig());
      const service = mockServiceWith();
      const { result } = renderWithPermissions(['create:my_org:domains', 'read:my_org:domains']);

      await act(async () => {
        await result.current.handleCreate('test.com', true);
      });

      expect(service.onCreateDomain).toHaveBeenCalledWith({ domain: 'test.com' });
    });

    it('omits a discovery value the policy does not allow', async () => {
      mockUseConfig.mockReturnValue(
        createMockConfig({
          discoveryPolicy: { default_value: true, allowed_values: [true] },
          showDiscovery: true,
          isDiscoveryReadOnly: true,
          discoveryDefaultValue: true,
        }),
      );
      const service = mockServiceWith();
      const { result } = render();

      await act(async () => {
        await result.current.handleCreate('test.com', false);
      });

      expect(service.onCreateDomain).toHaveBeenCalledWith({ domain: 'test.com' });
    });

    it('still sends the one value a locked policy allows', async () => {
      mockUseConfig.mockReturnValue(
        createMockConfig({
          discoveryPolicy: { default_value: true, allowed_values: [true] },
          showDiscovery: true,
          isDiscoveryReadOnly: true,
          discoveryDefaultValue: true,
        }),
      );
      const service = mockServiceWith();
      const { result } = render();

      await act(async () => {
        await result.current.handleCreate('test.com', true);
      });

      expect(service.onCreateDomain).toHaveBeenCalledWith({
        domain: 'test.com',
        use_for_organization_discovery: true,
      });
    });

    it('keeps the discovery modal open while turning discovery on, and configures once', async () => {
      mockUseConfig.mockReturnValue(editableDiscoveryConfig());
      let finishUpdate: (domain: typeof verifiedDomain) => void = () => {};
      const pendingUpdate = new Promise<typeof verifiedDomain>((resolve) => {
        finishUpdate = resolve;
      });
      const service = mockServiceWith({
        onUpdateDomainDiscovery: vi.fn().mockReturnValue(pendingUpdate),
        isUpdatingDiscovery: true,
      });
      const { result } = render();

      await act(async () => {
        await result.current.handleVerifyClick(mockDomain);
      });
      expect(result.current.showDiscoveryModal).toBe(true);

      let enable: Promise<void> = Promise.resolve();
      act(() => {
        enable = result.current.handleEnableDiscovery(mockDomain);
      });
      await act(async () => {
        result.current.handleCloseDiscoveryModal();
      });

      expect(result.current.showDiscoveryModal).toBe(true);
      expect(service.fetchProviders).not.toHaveBeenCalled();

      await act(async () => {
        finishUpdate(verifiedDomain);
        await enable;
      });

      expect(service.fetchProviders).toHaveBeenCalledTimes(1);
      expect(result.current.showConfigureModal).toBe(true);
    });

    it('configures only once when the discovery modal is dismissed after turning discovery on', async () => {
      mockUseConfig.mockReturnValue(editableDiscoveryConfig());
      const service = mockServiceWith();
      const { result } = render();

      await act(async () => {
        await result.current.handleVerifyClick(mockDomain);
      });
      await act(async () => {
        await result.current.handleEnableDiscovery(mockDomain);
      });
      await act(async () => {
        result.current.handleCloseDiscoveryModal();
      });

      expect(service.fetchProviders).toHaveBeenCalledTimes(1);
    });

    it('opens the configure step after "Not now" when verify started from a row', async () => {
      mockUseConfig.mockReturnValue(editableDiscoveryConfig());
      const service = mockServiceWith();
      const { result } = render();

      await act(async () => {
        await result.current.handleVerifyClick(mockDomain);
      });
      expect(result.current.showDiscoveryModal).toBe(true);
      expect(result.current.showConfigureModal).toBe(false);

      await act(async () => {
        result.current.handleCloseDiscoveryModal();
      });

      expect(result.current.showDiscoveryModal).toBe(false);
      expect(service.fetchProviders).toHaveBeenCalledWith(mockDomain);
      expect(result.current.showConfigureModal).toBe(true);
    });

    it('toggles discovery for a verified domain and confirms with a toast', async () => {
      mockUseConfig.mockReturnValue(editableDiscoveryConfig());
      const service = mockServiceWith();
      const { result } = render();

      await act(async () => {
        await result.current.handleToggleDiscovery(verifiedDomain, false);
      });

      expect(service.onUpdateDomainDiscovery).toHaveBeenCalledWith(verifiedDomain, false);
      expect(mockedShowToast).toHaveBeenCalledWith({
        type: 'success',
        message: 'domain_table.notifications.domain_discovery_update.success_off',
      });
    });

    it('does not toggle discovery for an unverified domain', async () => {
      mockUseConfig.mockReturnValue(editableDiscoveryConfig());
      const service = mockServiceWith();
      const { result } = render();

      await act(async () => {
        await result.current.handleToggleDiscovery(mockDomain, true);
      });

      expect(service.onUpdateDomainDiscovery).not.toHaveBeenCalled();
    });

    it('does not toggle discovery when the policy locks it', async () => {
      mockUseConfig.mockReturnValue(
        createMockConfig({
          discoveryPolicy: { default_value: true, allowed_values: [true] },
          showDiscovery: true,
          isDiscoveryReadOnly: true,
        }),
      );
      const service = mockServiceWith();
      const { result } = render();

      await act(async () => {
        await result.current.handleToggleDiscovery(verifiedDomain, false);
      });

      expect(service.onUpdateDomainDiscovery).not.toHaveBeenCalled();
    });

    it('reports an error when toggling discovery fails', async () => {
      mockUseConfig.mockReturnValue(editableDiscoveryConfig());
      const error = new Error('toggle failed');
      mockServiceWith({ onUpdateDomainDiscovery: vi.fn().mockRejectedValue(error) });
      const { result } = render();

      await act(async () => {
        await result.current.handleToggleDiscovery(verifiedDomain, true);
      });

      expect(mockHandleError).toHaveBeenCalledWith(error, {
        fallbackMessage: 'domain_table.notifications.domain_discovery_update.error',
      });
    });
  });
});
