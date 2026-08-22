import { renderHook, act } from '@testing-library/react';
import { createElement } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useSsoProviderEdit } from '../use-sso-provider-edit';

import * as useSsoProviderEditServiceModule from '@/hooks/my-organization/shared/services/use-sso-provider-edit-service';
import { PermissionContext } from '@/providers/permission-provider';
import { createMockSsoProviderEditServiceReturn } from '@/tests/utils/__mocks__/my-organization/idp-management/sso-provider-edit/sso-provider-edit.mocks';
import { ALL_MY_ORG_PERMISSIONS } from '@/tests/utils/__mocks__/permissions/permission.mocks';
import type { UseSsoProviderEditOptions } from '@/types/my-organization/idp-management/sso-provider/sso-provider-edit-types';

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

  const renderWithGranted = (
    permissions: string[],
    idpId = 'test-idp-id',
    options?: UseSsoProviderEditOptions,
  ) =>
    renderHook(() => useSsoProviderEdit(idpId, options), {
      wrapper: ({ children }: React.PropsWithChildren) =>
        createElement(
          PermissionContext.Provider,
          { value: { permissions, isLoading: false } },
          children,
        ),
    });

  const render = (idpId = 'test-idp-id', options?: UseSsoProviderEditOptions) =>
    renderWithGranted(ALL_MY_ORG_PERMISSIONS, idpId, options);

  it('should return correct logic state', () => {
    const { result } = render();
    expect(result.current.shouldAllowDeletion).toBe(true);
    expect(result.current.isLoadingConfig).toBe(false);
    expect(result.current.idpConfig).toEqual({});
    expect(result.current.isLoadingIdpConfig).toBe(false);
    expect(result.current.showProvisioningTab).toBe(true);
    expect(typeof result.current.handleToggleProvider).toBe('function');
  });

  it('should call enableProvider with correct params on handleToggleProvider', async () => {
    const { result } = render();
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

    const { result } = render();
    await act(async () => {
      await result.current.handleToggleProvider(true);
    });
    expect(mockEnableProvider).not.toHaveBeenCalled();
  });

  it('should pass skipProvisioningFetch option to useSsoProviderEditService', () => {
    render('test-idp-id', { skipProvisioningFetch: true });

    expect(useSsoProviderEditServiceModule.useSsoProviderEditService).toHaveBeenCalledWith(
      'test-idp-id',
      expect.objectContaining({
        skipProvisioningFetch: true,
      }),
    );
  });

  it('should pass skipProvisioningFetch as false by default', () => {
    render();

    expect(useSsoProviderEditServiceModule.useSsoProviderEditService).toHaveBeenCalledWith(
      'test-idp-id',
      expect.objectContaining({
        skipProvisioningFetch: false,
      }),
    );
  });

  describe('permission guards', () => {
    const MUTATIONS = [
      { name: 'updateProvider', scope: 'update:my_org:identity_providers', args: [{}] },
      { name: 'syncSsoAttributes', scope: 'update:my_org:identity_providers', args: [] },
      { name: 'onDeleteConfirm', scope: 'delete:my_org:identity_providers', args: [] },
      { name: 'onRemoveConfirm', scope: 'update:my_org:identity_providers_detach', args: [] },
      {
        name: 'createProvisioning',
        scope: 'create:my_org:identity_providers_provisioning',
        args: [],
      },
      {
        name: 'deleteProvisioning',
        scope: 'delete:my_org:identity_providers_provisioning',
        args: [],
      },
      {
        name: 'syncProvisioningAttributes',
        scope: 'update:my_org:identity_providers_provisioning',
        args: [],
      },
      {
        name: 'createScimToken',
        scope: 'create:my_org:identity_providers_scim_tokens',
        args: [{ name: 'token' }],
      },
      {
        name: 'deleteScimToken',
        scope: 'delete:my_org:identity_providers_scim_tokens',
        args: ['token-1'],
      },
    ] as const;

    const mockFor = (name: string) => {
      const spy = vi.fn();
      mockServiceReturn = createMockSsoProviderEditServiceReturn({ [name]: spy });
      vi.mocked(useSsoProviderEditServiceModule.useSsoProviderEditService).mockReturnValue(
        mockServiceReturn,
      );
      return spy;
    };

    it.each(MUTATIONS)('should refuse $name without $scope', async ({ name, args }) => {
      const spy = mockFor(name);
      const { result } = renderWithGranted(['read:my_org:identity_providers']);

      await act(async () => {
        await (result.current[name] as (...a: unknown[]) => Promise<unknown>)(...args);
      });

      expect(spy).not.toHaveBeenCalled();
    });

    it.each(MUTATIONS)(
      'should allow $name once $scope is granted',
      async ({ name, scope, args }) => {
        const spy = mockFor(name);
        const { result } = renderWithGranted(['read:my_org:identity_providers', scope]);

        await act(async () => {
          await (result.current[name] as (...a: unknown[]) => Promise<unknown>)(...args);
        });

        expect(spy).toHaveBeenCalledTimes(1);
      },
    );

    it.each(MUTATIONS)('should refuse $name when readOnly is set', async ({ name, args }) => {
      const spy = mockFor(name);
      const { result } = render('test-idp-id', { readOnly: true });

      await act(async () => {
        await (result.current[name] as (...a: unknown[]) => Promise<unknown>)(...args);
      });

      expect(spy).not.toHaveBeenCalled();
    });

    it('should leave the read-only token listing ungated', async () => {
      const spy = mockFor('listScimTokens');
      const { result } = renderWithGranted(['read:my_org:identity_providers']);

      await act(async () => {
        await result.current.listScimTokens();
      });

      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});
