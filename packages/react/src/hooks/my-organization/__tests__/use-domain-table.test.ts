import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useDomainTable } from '../use-domain-table';

const mockHandleError = vi.fn();

vi.mock('@/hooks/shared/use-translator', () => ({
  useTranslator: () => ({ t: (key: string) => key }),
}));

vi.mock('@/hooks/shared/use-error-handler', () => ({
  useErrorHandler: () => mockHandleError,
}));

vi.mock('@/components/auth0/shared/toast', () => ({
  showToast: vi.fn(),
}));

vi.mock('@/hooks/my-organization/shared/services/use-domain-table-service', () => ({
  useDomainTableService: vi.fn(() => ({
    domains: [],
    providers: [],
    isFetching: false,
    isCreating: false,
    isDeleting: false,
    isVerifying: false,
    isLoadingProviders: false,
    fetchProviders: vi.fn(),
    fetchDomains: vi.fn(),
    onCreateDomain: vi.fn(),
    onVerifyDomain: vi.fn(),
    onDeleteDomain: vi.fn(),
    onAssociateToProvider: vi.fn(),
    onDeleteFromProvider: vi.fn(),
  })),
}));

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
  });

  it('should return correct initial state', () => {
    const { result } = renderHook(() => useDomainTable(defaultOptions));

    expect(result.current.showCreateModal).toBe(false);
    expect(result.current.showConfigureModal).toBe(false);
    expect(result.current.showVerifyModal).toBe(false);
    expect(result.current.showDeleteModal).toBe(false);
    expect(result.current.verifyError).toBeUndefined();
    expect(result.current.selectedDomain).toBeNull();
    expect(result.current.domains).toEqual([]);
    expect(result.current.providers).toEqual([]);
  });

  it('should call fetchDomains on mount', async () => {
    const mockFetchDomains = vi.fn();
    const { useDomainTableService } = await import(
      '@/hooks/my-organization/shared/services/use-domain-table-service'
    );
    vi.mocked(useDomainTableService).mockReturnValue({
      domains: [],
      providers: [],
      isFetching: false,
      isCreating: false,
      isDeleting: false,
      isVerifying: false,
      isLoadingProviders: false,
      fetchProviders: vi.fn(),
      fetchDomains: mockFetchDomains,
      onCreateDomain: vi.fn(),
      onVerifyDomain: vi.fn(),
      onDeleteDomain: vi.fn(),
      onAssociateToProvider: vi.fn(),
      onDeleteFromProvider: vi.fn(),
    });

    renderHook(() => useDomainTable(defaultOptions));
    expect(mockFetchDomains).toHaveBeenCalledTimes(1);
  });

  it('should show create modal on handleCreateClick', () => {
    const { result } = renderHook(() => useDomainTable(defaultOptions));

    act(() => {
      result.current.handleCreateClick();
    });

    expect(result.current.showCreateModal).toBe(true);
  });

  it('should create domain, show toast, and open verify modal on handleCreate', async () => {
    const mockOnCreateDomain = vi.fn().mockResolvedValue(mockDomain);
    const { useDomainTableService } = await import(
      '@/hooks/my-organization/shared/services/use-domain-table-service'
    );
    vi.mocked(useDomainTableService).mockReturnValue({
      domains: [],
      providers: [],
      isFetching: false,
      isCreating: false,
      isDeleting: false,
      isVerifying: false,
      isLoadingProviders: false,
      fetchProviders: vi.fn(),
      fetchDomains: vi.fn(),
      onCreateDomain: mockOnCreateDomain,
      onVerifyDomain: vi.fn(),
      onDeleteDomain: vi.fn(),
      onAssociateToProvider: vi.fn(),
      onDeleteFromProvider: vi.fn(),
    });

    const { result } = renderHook(() => useDomainTable(defaultOptions));

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
    const { useDomainTableService } = await import(
      '@/hooks/my-organization/shared/services/use-domain-table-service'
    );
    vi.mocked(useDomainTableService).mockReturnValue({
      domains: [],
      providers: [],
      isFetching: false,
      isCreating: false,
      isDeleting: false,
      isVerifying: false,
      isLoadingProviders: false,
      fetchProviders: vi.fn(),
      fetchDomains: vi.fn(),
      onCreateDomain: mockOnCreateDomain,
      onVerifyDomain: vi.fn(),
      onDeleteDomain: vi.fn(),
      onAssociateToProvider: vi.fn(),
      onDeleteFromProvider: vi.fn(),
    });

    const { result } = renderHook(() => useDomainTable(defaultOptions));

    await act(async () => {
      await result.current.handleCreate('test.com');
    });

    expect(mockHandleError).toHaveBeenCalledWith(error, {
      fallbackMessage: 'domain_table.notifications.domain_create.error',
    });
  });

  it('should verify domain and close verify modal on handleVerify success', async () => {
    const mockOnVerifyDomain = vi.fn().mockResolvedValue(true);
    const { useDomainTableService } = await import(
      '@/hooks/my-organization/shared/services/use-domain-table-service'
    );
    vi.mocked(useDomainTableService).mockReturnValue({
      domains: [],
      providers: [],
      isFetching: false,
      isCreating: false,
      isDeleting: false,
      isVerifying: false,
      isLoadingProviders: false,
      fetchProviders: vi.fn(),
      fetchDomains: vi.fn(),
      onCreateDomain: vi.fn(),
      onVerifyDomain: mockOnVerifyDomain,
      onDeleteDomain: vi.fn(),
      onAssociateToProvider: vi.fn(),
      onDeleteFromProvider: vi.fn(),
    });

    const { result } = renderHook(() => useDomainTable(defaultOptions));

    await act(async () => {
      await result.current.handleVerify(mockDomain);
    });

    expect(mockOnVerifyDomain).toHaveBeenCalledWith(mockDomain);
    expect(result.current.showVerifyModal).toBe(false);
  });

  it('should set verify error on handleVerify failure', async () => {
    const mockOnVerifyDomain = vi.fn().mockResolvedValue(false);
    const { useDomainTableService } = await import(
      '@/hooks/my-organization/shared/services/use-domain-table-service'
    );
    vi.mocked(useDomainTableService).mockReturnValue({
      domains: [],
      providers: [],
      isFetching: false,
      isCreating: false,
      isDeleting: false,
      isVerifying: false,
      isLoadingProviders: false,
      fetchProviders: vi.fn(),
      fetchDomains: vi.fn(),
      onCreateDomain: vi.fn(),
      onVerifyDomain: mockOnVerifyDomain,
      onDeleteDomain: vi.fn(),
      onAssociateToProvider: vi.fn(),
      onDeleteFromProvider: vi.fn(),
    });

    const { result } = renderHook(() => useDomainTable(defaultOptions));

    await act(async () => {
      await result.current.handleVerify(mockDomain);
    });

    expect(result.current.verifyError).toBe('domain_verify.modal.errors.verification_failed');
  });

  it('should handle verify error on handleVerify', async () => {
    const error = new Error('Verify failed');
    const mockOnVerifyDomain = vi.fn().mockRejectedValue(error);
    const { useDomainTableService } = await import(
      '@/hooks/my-organization/shared/services/use-domain-table-service'
    );
    vi.mocked(useDomainTableService).mockReturnValue({
      domains: [],
      providers: [],
      isFetching: false,
      isCreating: false,
      isDeleting: false,
      isVerifying: false,
      isLoadingProviders: false,
      fetchProviders: vi.fn(),
      fetchDomains: vi.fn(),
      onCreateDomain: vi.fn(),
      onVerifyDomain: mockOnVerifyDomain,
      onDeleteDomain: vi.fn(),
      onAssociateToProvider: vi.fn(),
      onDeleteFromProvider: vi.fn(),
    });

    const { result } = renderHook(() => useDomainTable(defaultOptions));

    await act(async () => {
      await result.current.handleVerify(mockDomain);
    });

    expect(mockHandleError).toHaveBeenCalledWith(error, {
      fallbackMessage: 'domain_table.notifications.domain_verify.error',
    });
  });

  it('should delete domain and close modals on handleDelete', async () => {
    const mockOnDeleteDomain = vi.fn().mockResolvedValue(undefined);
    const { useDomainTableService } = await import(
      '@/hooks/my-organization/shared/services/use-domain-table-service'
    );
    vi.mocked(useDomainTableService).mockReturnValue({
      domains: [],
      providers: [],
      isFetching: false,
      isCreating: false,
      isDeleting: false,
      isVerifying: false,
      isLoadingProviders: false,
      fetchProviders: vi.fn(),
      fetchDomains: vi.fn(),
      onCreateDomain: vi.fn(),
      onVerifyDomain: vi.fn(),
      onDeleteDomain: mockOnDeleteDomain,
      onAssociateToProvider: vi.fn(),
      onDeleteFromProvider: vi.fn(),
    });

    const { result } = renderHook(() => useDomainTable(defaultOptions));

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
    const { useDomainTableService } = await import(
      '@/hooks/my-organization/shared/services/use-domain-table-service'
    );
    vi.mocked(useDomainTableService).mockReturnValue({
      domains: [],
      providers: [],
      isFetching: false,
      isCreating: false,
      isDeleting: false,
      isVerifying: false,
      isLoadingProviders: false,
      fetchProviders: vi.fn(),
      fetchDomains: vi.fn(),
      onCreateDomain: vi.fn(),
      onVerifyDomain: vi.fn(),
      onDeleteDomain: mockOnDeleteDomain,
      onAssociateToProvider: vi.fn(),
      onDeleteFromProvider: vi.fn(),
    });

    const { result } = renderHook(() => useDomainTable(defaultOptions));

    await act(async () => {
      await result.current.handleDelete(mockDomain);
    });

    expect(mockHandleError).toHaveBeenCalledWith(error, {
      fallbackMessage: 'domain_table.notifications.domain_delete.error',
    });
  });

  it('should associate domain to provider on handleToggleSwitch with true', async () => {
    const mockOnAssociateToProvider = vi.fn().mockResolvedValue(undefined);
    const { useDomainTableService } = await import(
      '@/hooks/my-organization/shared/services/use-domain-table-service'
    );
    vi.mocked(useDomainTableService).mockReturnValue({
      domains: [],
      providers: [],
      isFetching: false,
      isCreating: false,
      isDeleting: false,
      isVerifying: false,
      isLoadingProviders: false,
      fetchProviders: vi.fn(),
      fetchDomains: vi.fn(),
      onCreateDomain: vi.fn(),
      onVerifyDomain: vi.fn(),
      onDeleteDomain: vi.fn(),
      onAssociateToProvider: mockOnAssociateToProvider,
      onDeleteFromProvider: vi.fn(),
    });

    const { result } = renderHook(() => useDomainTable(defaultOptions));

    await act(async () => {
      await result.current.handleToggleSwitch(mockDomain, mockProvider, true);
    });

    expect(mockOnAssociateToProvider).toHaveBeenCalledWith(mockDomain, mockProvider);
  });

  it('should delete domain from provider on handleToggleSwitch with false', async () => {
    const mockOnDeleteFromProvider = vi.fn().mockResolvedValue(undefined);
    const { useDomainTableService } = await import(
      '@/hooks/my-organization/shared/services/use-domain-table-service'
    );
    vi.mocked(useDomainTableService).mockReturnValue({
      domains: [],
      providers: [],
      isFetching: false,
      isCreating: false,
      isDeleting: false,
      isVerifying: false,
      isLoadingProviders: false,
      fetchProviders: vi.fn(),
      fetchDomains: vi.fn(),
      onCreateDomain: vi.fn(),
      onVerifyDomain: vi.fn(),
      onDeleteDomain: vi.fn(),
      onAssociateToProvider: vi.fn(),
      onDeleteFromProvider: mockOnDeleteFromProvider,
    });

    const { result } = renderHook(() => useDomainTable(defaultOptions));

    await act(async () => {
      await result.current.handleToggleSwitch(mockDomain, mockProvider, false);
    });

    expect(mockOnDeleteFromProvider).toHaveBeenCalledWith(mockDomain, mockProvider);
  });

  it('should handle associate to provider error on handleToggleSwitch', async () => {
    const error = new Error('Associate failed');
    const mockOnAssociateToProvider = vi.fn().mockRejectedValue(error);
    const { useDomainTableService } = await import(
      '@/hooks/my-organization/shared/services/use-domain-table-service'
    );
    vi.mocked(useDomainTableService).mockReturnValue({
      domains: [],
      providers: [],
      isFetching: false,
      isCreating: false,
      isDeleting: false,
      isVerifying: false,
      isLoadingProviders: false,
      fetchProviders: vi.fn(),
      fetchDomains: vi.fn(),
      onCreateDomain: vi.fn(),
      onVerifyDomain: vi.fn(),
      onDeleteDomain: vi.fn(),
      onAssociateToProvider: mockOnAssociateToProvider,
      onDeleteFromProvider: vi.fn(),
    });

    const { result } = renderHook(() => useDomainTable(defaultOptions));

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
    const { useDomainTableService } = await import(
      '@/hooks/my-organization/shared/services/use-domain-table-service'
    );
    vi.mocked(useDomainTableService).mockReturnValue({
      domains: [],
      providers: [],
      isFetching: false,
      isCreating: false,
      isDeleting: false,
      isVerifying: false,
      isLoadingProviders: false,
      fetchProviders: vi.fn(),
      fetchDomains: vi.fn(),
      onCreateDomain: vi.fn(),
      onVerifyDomain: vi.fn(),
      onDeleteDomain: vi.fn(),
      onAssociateToProvider: vi.fn(),
      onDeleteFromProvider: mockOnDeleteFromProvider,
    });

    const { result } = renderHook(() => useDomainTable(defaultOptions));

    await act(async () => {
      await result.current.handleToggleSwitch(mockDomain, mockProvider, false);
    });

    expect(mockHandleError).toHaveBeenCalledWith(error, {
      fallbackMessage: 'domain_table.notifications.domain_delete_provider.error',
    });
  });

  it('should close verify modal and clear error on handleCloseVerifyModal', async () => {
    const mockOnVerifyDomain = vi.fn().mockResolvedValue(false);
    const { useDomainTableService } = await import(
      '@/hooks/my-organization/shared/services/use-domain-table-service'
    );
    vi.mocked(useDomainTableService).mockReturnValue({
      domains: [],
      providers: [],
      isFetching: false,
      isCreating: false,
      isDeleting: false,
      isVerifying: false,
      isLoadingProviders: false,
      fetchProviders: vi.fn(),
      fetchDomains: vi.fn(),
      onCreateDomain: vi.fn(),
      onVerifyDomain: mockOnVerifyDomain,
      onDeleteDomain: vi.fn(),
      onAssociateToProvider: vi.fn(),
      onDeleteFromProvider: vi.fn(),
    });

    const { result } = renderHook(() => useDomainTable(defaultOptions));

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
    const { result } = renderHook(() => useDomainTable(defaultOptions));

    await act(async () => {
      await result.current.handleConfigureClick(mockDomain);
    });

    expect(result.current.selectedDomain).toEqual(mockDomain);
    expect(result.current.showVerifyModal).toBe(true);
  });

  it('should fetch providers and show configure modal for verified domain on handleConfigureClick', async () => {
    const mockFetchProviders = vi.fn().mockResolvedValue(undefined);
    const { useDomainTableService } = await import(
      '@/hooks/my-organization/shared/services/use-domain-table-service'
    );
    vi.mocked(useDomainTableService).mockReturnValue({
      domains: [],
      providers: [],
      isFetching: false,
      isCreating: false,
      isDeleting: false,
      isVerifying: false,
      isLoadingProviders: false,
      fetchProviders: mockFetchProviders,
      fetchDomains: vi.fn(),
      onCreateDomain: vi.fn(),
      onVerifyDomain: vi.fn(),
      onDeleteDomain: vi.fn(),
      onAssociateToProvider: vi.fn(),
      onDeleteFromProvider: vi.fn(),
    });

    const { result } = renderHook(() => useDomainTable(defaultOptions));

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
    const { useDomainTableService } = await import(
      '@/hooks/my-organization/shared/services/use-domain-table-service'
    );
    vi.mocked(useDomainTableService).mockReturnValue({
      domains: [],
      providers: [],
      isFetching: false,
      isCreating: false,
      isDeleting: false,
      isVerifying: false,
      isLoadingProviders: false,
      fetchProviders: mockFetchProviders,
      fetchDomains: vi.fn(),
      onCreateDomain: vi.fn(),
      onVerifyDomain: vi.fn(),
      onDeleteDomain: vi.fn(),
      onAssociateToProvider: vi.fn(),
      onDeleteFromProvider: vi.fn(),
    });

    const { result } = renderHook(() => useDomainTable(defaultOptions));

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
    const { useDomainTableService } = await import(
      '@/hooks/my-organization/shared/services/use-domain-table-service'
    );
    vi.mocked(useDomainTableService).mockReturnValue({
      domains: [],
      providers: [],
      isFetching: false,
      isCreating: false,
      isDeleting: false,
      isVerifying: false,
      isLoadingProviders: false,
      fetchProviders: mockFetchProviders,
      fetchDomains: vi.fn(),
      onCreateDomain: vi.fn(),
      onVerifyDomain: mockOnVerifyDomain,
      onDeleteDomain: vi.fn(),
      onAssociateToProvider: vi.fn(),
      onDeleteFromProvider: vi.fn(),
    });

    const { result } = renderHook(() => useDomainTable(defaultOptions));

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
    const { useDomainTableService } = await import(
      '@/hooks/my-organization/shared/services/use-domain-table-service'
    );
    vi.mocked(useDomainTableService).mockReturnValue({
      domains: [],
      providers: [],
      isFetching: false,
      isCreating: false,
      isDeleting: false,
      isVerifying: false,
      isLoadingProviders: false,
      fetchProviders: vi.fn(),
      fetchDomains: vi.fn(),
      onCreateDomain: vi.fn(),
      onVerifyDomain: mockOnVerifyDomain,
      onDeleteDomain: vi.fn(),
      onAssociateToProvider: vi.fn(),
      onDeleteFromProvider: vi.fn(),
    });

    const { result } = renderHook(() => useDomainTable(defaultOptions));

    await act(async () => {
      await result.current.handleVerifyClick(mockDomain);
    });

    expect(result.current.selectedDomain).toEqual(mockDomain);
  });

  it('should handle error on handleVerifyClick', async () => {
    const error = new Error('Verify click failed');
    const mockOnVerifyDomain = vi.fn().mockRejectedValue(error);
    const { useDomainTableService } = await import(
      '@/hooks/my-organization/shared/services/use-domain-table-service'
    );
    vi.mocked(useDomainTableService).mockReturnValue({
      domains: [],
      providers: [],
      isFetching: false,
      isCreating: false,
      isDeleting: false,
      isVerifying: false,
      isLoadingProviders: false,
      fetchProviders: vi.fn(),
      fetchDomains: vi.fn(),
      onCreateDomain: vi.fn(),
      onVerifyDomain: mockOnVerifyDomain,
      onDeleteDomain: vi.fn(),
      onAssociateToProvider: vi.fn(),
      onDeleteFromProvider: vi.fn(),
    });

    const { result } = renderHook(() => useDomainTable(defaultOptions));

    await act(async () => {
      await result.current.handleVerifyClick(mockDomain);
    });

    expect(mockHandleError).toHaveBeenCalledWith(error, {
      fallbackMessage: 'domain_table.notifications.domain_verify.error',
    });
  });

  it('should set selected domain, close verify modal, and show delete modal on handleDeleteClick', () => {
    const { result } = renderHook(() => useDomainTable(defaultOptions));

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
});
