import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useSsoProviderEdit } from '../use-sso-provider-edit';

import * as useSsoProviderEditServiceModule from '@/hooks/my-organization/shared/services/use-sso-provider-edit-service';
import { createMockSsoProviderEditServiceReturn } from '@/tests/utils/__mocks__/my-organization/idp-management/sso-provider-edit/sso-provider-edit.mocks';

vi.mock('@/hooks/my-organization/shared/services/use-config-service', () => ({
  useConfig: () => ({
    shouldAllowDeletion: true,
    isLoadingConfig: false,
  }),
}));
vi.mock('@/hooks/my-organization/shared/services/use-idp-config-service', () => ({
  useIdpConfig: () => ({
    idpConfig: {},
    isLoadingIdpConfig: false,
    isProvisioningEnabled: vi.fn(() => true),
    isProvisioningMethodEnabled: vi.fn(() => true),
    showCrossAppAccess: vi.fn(() => false),
    isCrossAppAccessReadOnly: vi.fn(() => false),
    getCrossAppAccessDefaultValue: vi.fn(() => undefined),
  }),
}));
vi.mock('@/hooks/my-organization/shared/services/use-sso-provider-edit-service', async () => {
  const actual = await vi.importActual(
    '@/hooks/my-organization/shared/services/use-sso-provider-edit-service',
  );

  return {
    ...actual,
    useSsoProviderEditService: vi.fn(),
  };
});

const mockUpdateProvider = vi.fn();

let mockServiceReturn = createMockSsoProviderEditServiceReturn({
  updateProvider: mockUpdateProvider,
});

describe('useSsoProviderEdit - logic behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockServiceReturn = createMockSsoProviderEditServiceReturn({
      updateProvider: mockUpdateProvider,
    });
    vi.mocked(useSsoProviderEditServiceModule.useSsoProviderEditService).mockReturnValue(
      mockServiceReturn,
    );
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
    mockServiceReturn = createMockSsoProviderEditServiceReturn({
      provider: null,
      updateProvider: mockUpdateProvider,
    });
    vi.mocked(useSsoProviderEditServiceModule.useSsoProviderEditService).mockReturnValue(
      mockServiceReturn,
    );

    const { result } = renderHook(() => useSsoProviderEdit('test-idp-id'));
    await act(async () => {
      await result.current.handleToggleProvider(true);
    });
    expect(mockUpdateProvider).not.toHaveBeenCalled();
  });

  it('should pass skipProvisioningFetch option to useSsoProviderEditService', () => {
    renderHook(() =>
      useSsoProviderEdit('test-idp-id', {
        skipProvisioningFetch: true,
      }),
    );

    expect(useSsoProviderEditServiceModule.useSsoProviderEditService).toHaveBeenCalledWith(
      'test-idp-id',
      expect.objectContaining({
        skipProvisioningFetch: true,
      }),
    );
  });

  it('should pass skipProvisioningFetch as false by default', () => {
    renderHook(() => useSsoProviderEdit('test-idp-id'));

    expect(useSsoProviderEditServiceModule.useSsoProviderEditService).toHaveBeenCalledWith(
      'test-idp-id',
      expect.objectContaining({
        skipProvisioningFetch: false,
      }),
    );
  });
});
