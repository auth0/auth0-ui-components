import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useSsoProviderEditLogic } from '../use-sso-provider-edit-logic';

// Mock useConfig and useIdpConfig to avoid network/queryClient
vi.mock('@/hooks/my-organization/use-config', () => ({
  useConfig: () => ({
    shouldAllowDeletion: true,
    isLoadingConfig: false,
  }),
}));
vi.mock('@/hooks/my-organization/use-idp-config', () => ({
  useIdpConfig: () => ({
    idpConfig: {},
    isLoadingIdpConfig: false,
    isProvisioningEnabled: vi.fn(() => true),
    isProvisioningMethodEnabled: vi.fn(() => true),
  }),
}));

describe('useSsoProviderEditLogic', () => {
  const mockUpdateProvider = { updateProvider: vi.fn() };
  const mockHandlers = {
    listScimTokens: vi.fn(),
    syncSsoAttributes: vi.fn(),
    onDeleteConfirm: vi.fn(),
    onRemoveConfirm: vi.fn(),
    createProvisioning: vi.fn(),
    deleteProvisioning: vi.fn(),
    createScimToken: vi.fn(),
    deleteScimToken: vi.fn(),
    syncProvisioningAttributes: vi.fn(),
    fetchProvider: vi.fn(),
    fetchOrganizationDetails: vi.fn(),
    fetchProvisioning: vi.fn(),
  };

  const mockLogic = {
    isLoading: false,
    isUpdating: false,
    isDeleting: false,
    isRemoving: false,
    idpConfig: {},
    customMessages: {},
    backButton: undefined,
    shouldAllowDeletion: true,
    isLoadingConfig: false,
    isLoadingIdpConfig: false,
    showProvisioningTab: true,
    isProvisioningUpdating: false,
    isProvisioningDeleting: false,
    isScimTokensLoading: false,
    isScimTokenCreating: false,
    isScimTokenDeleting: false,
    isSsoAttributesSyncing: false,
    isProvisioningAttributesSyncing: false,
    hasSsoAttributeSyncWarning: false,
    hasProvisioningAttributeSyncWarning: false,
    provisioningConfig: null,
    isProvisioningLoading: false,
  };
  const mockProvider = {
    provider: {
      id: 'test-provider-id',
      name: 'Test Provider',
      is_enabled: true,
      strategy: 'waad' as const,
      options: {},
    },
  };

  const mockOrganization = {
    organization: {
      name: 'Org',
      branding: {
        colors: {
          primary: '',
          page_background: '',
        },
        logo_url: undefined,
      },
    },
  };
  const ssoProviderEdit = {
    ...mockHandlers,
    ...mockLogic,
    ...mockProvider,
    ...mockOrganization,
    ...mockUpdateProvider,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return correct logic state', () => {
    const { result } = renderHook(() => useSsoProviderEditLogic(ssoProviderEdit));
    expect(result.current.shouldAllowDeletion).toBe(true);
    expect(result.current.isLoadingConfig).toBe(false);
    expect(result.current.idpConfig).toEqual({});
    expect(result.current.isLoadingIdpConfig).toBe(false);
    expect(result.current.showProvisioningTab).toBe(true);
    expect(typeof result.current.handleToggleProvider).toBe('function');
  });

  it('should call updateProvider with correct params on handleToggleProvider', async () => {
    const { result } = renderHook(() => useSsoProviderEditLogic(ssoProviderEdit));
    await act(async () => {
      await result.current.handleToggleProvider(false);
    });
    expect(mockUpdateProvider.updateProvider).toHaveBeenCalledWith({
      strategy: ssoProviderEdit.provider.strategy,
      is_enabled: false,
    });
  });

  it('should not call updateProvider if provider.strategy is missing', async () => {
    const ssoProviderEditNoStrategy = {
      ...ssoProviderEdit,
      provider: null,
    };
    const { result } = renderHook(() => useSsoProviderEditLogic(ssoProviderEditNoStrategy));
    await act(async () => {
      await result.current.handleToggleProvider(true);
    });
    expect(mockUpdateProvider.updateProvider).not.toHaveBeenCalled();
  });
});
