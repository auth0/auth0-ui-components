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
const mockIdpConfig = vi.hoisted(() => ({ current: {} as Record<string, unknown> }));

vi.mock('@/hooks/my-organization/shared/services/use-idp-config-service', () => ({
  useIdpConfig: () => ({
    idpConfig: mockIdpConfig.current,
    isLoadingIdpConfig: false,
    isProvisioningEnabled: vi.fn(() => true),
    isProvisioningMethodEnabled: vi.fn(() => true),
    showCrossAppAccess: vi.fn(() => false),
    isCrossAppAccessReadOnly: vi.fn(() => true),
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
const mockEnableProvider = vi.fn();

let mockServiceReturn = createMockSsoProviderEditServiceReturn({
  updateProvider: mockUpdateProvider,
  enableProvider: mockEnableProvider,
});

describe('useSsoProviderEdit - logic behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIdpConfig.current = {};
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

  describe('domain verification mode', () => {
    const useProvider = (provider: { is_enabled: boolean; domains?: string[] }) => {
      mockServiceReturn = createMockSsoProviderEditServiceReturn({
        provider: {
          id: 'test-provider-id',
          name: 'Test Provider',
          strategy: 'waad',
          options: {},
          ...provider,
        },
        enableProvider: mockEnableProvider,
      });
      vi.mocked(useSsoProviderEditServiceModule.useSsoProviderEditService).mockReturnValue(
        mockServiceReturn,
      );
    };
    const setMode = (mode: 'none' | 'optional' | 'required') => {
      mockIdpConfig.current = { domain_aliases_config: { domain_verification: mode } };
    };

    it('defaults to optional and does not block enabling', () => {
      useProvider({ is_enabled: false, domains: [] });
      const { result } = render();

      expect(result.current.domainVerificationMode).toBe('optional');
      expect(result.current.isEnableBlockedByDomains).toBe(false);
    });

    it('blocks enabling a provider without domains in required mode', async () => {
      setMode('required');
      useProvider({ is_enabled: false, domains: [] });
      const { result } = render();

      expect(result.current.isEnableBlockedByDomains).toBe(true);
      await act(async () => {
        await result.current.handleToggleProvider(true);
      });
      expect(mockEnableProvider).not.toHaveBeenCalled();
    });

    it('enables a provider in required mode once it has a domain', async () => {
      setMode('required');
      useProvider({ is_enabled: false, domains: ['example.com'] });
      const { result } = render();

      expect(result.current.isEnableBlockedByDomains).toBe(false);
      await act(async () => {
        await result.current.handleToggleProvider(true);
      });
      expect(mockEnableProvider).toHaveBeenCalledWith(true);
    });

    it('still lets an enabled provider be disabled in required mode', async () => {
      setMode('required');
      useProvider({ is_enabled: true, domains: [] });
      const { result } = render();

      await act(async () => {
        await result.current.handleToggleProvider(false);
      });
      expect(mockEnableProvider).toHaveBeenCalledWith(false);
    });
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

  describe('provider access level', () => {
    const mockProviderAccess = (access_level?: 'readonly' | 'limited' | 'full') => {
      mockServiceReturn = createMockSsoProviderEditServiceReturn({
        provider: {
          id: 'test-provider-id',
          name: 'Test Provider',
          strategy: 'okta',
          options: {},
          is_enabled: true,
          access_level,
        },
        updateProvider: mockUpdateProvider,
        enableProvider: mockEnableProvider,
      });
      vi.mocked(useSsoProviderEditServiceModule.useSsoProviderEditService).mockReturnValue(
        mockServiceReturn,
      );
    };

    const fullUpdate = {
      strategy: 'okta' as const,
      display_name: 'Renamed',
      show_as_button: true,
      assign_membership_on_login: true,
      client_id: 'new-client-id',
    };

    it('treats a provider without an access level as full', async () => {
      mockProviderAccess(undefined);
      const { result } = render();

      expect(result.current.providerAccess.accessLevel).toBe('full');
      await act(async () => {
        await result.current.updateProvider(fullUpdate);
      });
      expect(mockUpdateProvider).toHaveBeenCalledWith(fullUpdate);
    });

    it('sends only the login settings with limited access', async () => {
      mockProviderAccess('limited');
      const { result } = render();

      await act(async () => {
        await result.current.updateProvider(fullUpdate);
      });
      expect(mockUpdateProvider).toHaveBeenCalledTimes(1);
      const [sent] = mockUpdateProvider.mock.calls[0]!;
      expect(sent).toEqual({
        strategy: 'okta',
        show_as_button: true,
        assign_membership_on_login: true,
      });
      // toEqual ignores undefined-valued keys, so check the key itself is absent
      expect(Object.keys(sent)).not.toContain('is_enabled');
    });

    it('lets limited access toggle the provider and remove it, but not delete it', async () => {
      mockProviderAccess('limited');
      const { result } = render();

      await act(async () => {
        await result.current.handleToggleProvider(false);
        await result.current.onRemoveConfirm();
        await result.current.onDeleteConfirm();
      });
      expect(mockEnableProvider).toHaveBeenCalledWith(false);
      expect(mockServiceReturn.onRemoveConfirm).toHaveBeenCalled();
      expect(mockServiceReturn.onDeleteConfirm).not.toHaveBeenCalled();
    });

    it('blocks every change with read-only access', async () => {
      mockProviderAccess('readonly');
      const { result } = render();

      await act(async () => {
        await result.current.updateProvider(fullUpdate);
        await result.current.handleToggleProvider(false);
        await result.current.syncSsoAttributes();
        await result.current.onRemoveConfirm();
        await result.current.onDeleteConfirm();
      });
      expect(mockUpdateProvider).not.toHaveBeenCalled();
      expect(mockEnableProvider).not.toHaveBeenCalled();
      expect(mockServiceReturn.syncSsoAttributes).not.toHaveBeenCalled();
      expect(mockServiceReturn.onRemoveConfirm).not.toHaveBeenCalled();
      expect(mockServiceReturn.onDeleteConfirm).not.toHaveBeenCalled();
    });
  });
});
