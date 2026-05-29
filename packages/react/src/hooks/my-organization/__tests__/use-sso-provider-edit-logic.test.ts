import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useSsoProviderEdit } from '../use-sso-provider-edit';

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
vi.mock('@/hooks/my-organization/shared/services/use-sso-provider-edit-service', () => ({
  useSsoProviderEditService: () => ({
    ...mockServiceReturn,
  }),
  ssoProviderEditQueryKeys: {
    all: ['sso-providers'],
    list: () => ['sso-providers', 'list'],
    detail: (id: string) => ['sso-providers', 'detail', id],
    organization: () => ['organization', 'details'],
    provisioning: (id: string) => ['sso-providers', 'provisioning', id],
    scimTokens: (id: string) => ['sso-providers', 'scim-tokens', id],
  },
}));

const mockUpdateProvider = vi.fn();

const mockServiceReturn: Record<string, unknown> = {
  provider: {
    id: 'test-provider-id',
    name: 'Test Provider',
    is_enabled: true,
    strategy: 'waad' as const,
    options: {},
  },
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
  provisioningConfig: null,
  isLoading: false,
  isUpdating: false,
  isDeleting: false,
  isRemoving: false,
  isProvisioningUpdating: false,
  isProvisioningDeleting: false,
  isProvisioningLoading: false,
  isScimTokensLoading: false,
  isScimTokenCreating: false,
  isScimTokenDeleting: false,
  isSsoAttributesSyncing: false,
  isProvisioningAttributesSyncing: false,
  hasSsoAttributeSyncWarning: false,
  hasProvisioningAttributeSyncWarning: false,
  fetchProvider: vi.fn(),
  fetchOrganizationDetails: vi.fn(),
  fetchProvisioning: vi.fn(),
  updateProvider: mockUpdateProvider,
  createProvisioning: vi.fn(),
  deleteProvisioning: vi.fn(),
  listScimTokens: vi.fn(),
  createScimToken: vi.fn(),
  deleteScimToken: vi.fn(),
  syncSsoAttributes: vi.fn(),
  syncProvisioningAttributes: vi.fn(),
  onDeleteConfirm: vi.fn(),
  onRemoveConfirm: vi.fn(),
};

describe('useSsoProviderEdit - logic behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return correct logic state', () => {
    const { result } = renderHook(() => useSsoProviderEdit('test-idp-id'));
    expect(result.current.shouldAllowDeletion).toBe(true);
    expect(result.current.isLoadingConfig).toBe(false);
    expect(result.current.idpConfig).toEqual({});
    expect(result.current.isLoadingIdpConfig).toBe(false);
    expect(result.current.showProvisioningTab).toBe(true);
    expect(typeof result.current.handleToggleProvider).toBe('function');
  });

  it('should call updateProvider with correct params on handleToggleProvider', async () => {
    const { result } = renderHook(() => useSsoProviderEdit('test-idp-id'));
    await act(async () => {
      await result.current.handleToggleProvider(false);
    });
    expect(mockUpdateProvider).toHaveBeenCalledWith({
      strategy: 'waad',
      is_enabled: false,
    });
  });

  it('should not call updateProvider if provider.strategy is missing', async () => {
    mockServiceReturn.provider = null;
    const { result } = renderHook(() => useSsoProviderEdit('test-idp-id'));
    await act(async () => {
      await result.current.handleToggleProvider(true);
    });
    expect(mockUpdateProvider).not.toHaveBeenCalled();
  });
});
