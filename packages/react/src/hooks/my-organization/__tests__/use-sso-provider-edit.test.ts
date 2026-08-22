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
const mockEnableProvider = vi.fn();

let mockServiceReturn = createMockSsoProviderEditServiceReturn({
  updateProvider: mockUpdateProvider,
  enableProvider: mockEnableProvider,
});

describe('useSsoProviderEdit - logic behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockServiceReturn = createMockSsoProviderEditServiceReturn({
      updateProvider: mockUpdateProvider,
      enableProvider: mockEnableProvider,
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

  it('should call enableProvider with correct params on handleToggleProvider', async () => {
    const { result } = renderHook(() => useSsoProviderEdit('test-idp-id'));
    await act(async () => {
      await result.current.handleToggleProvider(false);
    });
    expect(mockEnableProvider).toHaveBeenCalledWith(false);
  });

  it('should not call enableProvider if provider.strategy is missing', async () => {
    mockServiceReturn = createMockSsoProviderEditServiceReturn({
      provider: null,
      enableProvider: mockEnableProvider,
    });
    vi.mocked(useSsoProviderEditServiceModule.useSsoProviderEditService).mockReturnValue(
      mockServiceReturn,
    );

    const { result } = renderHook(() => useSsoProviderEdit('test-idp-id'));
    await act(async () => {
      await result.current.handleToggleProvider(true);
    });
    expect(mockEnableProvider).not.toHaveBeenCalled();
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
