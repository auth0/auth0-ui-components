import { renderHook, act } from '@testing-library/react';
import { createElement } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useSsoProviderCreate } from '../use-sso-provider-create';

import type { ProviderConfigureFormHandle } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-create/provider-configure/provider-configure-fields';
import { PermissionContext } from '@/providers/permission-provider';
import { ALL_MY_ORG_PERMISSIONS } from '@/tests/utils/__mocks__/permissions/permission.mocks';

const mockUseConfig = vi.fn(() => ({
  isLoadingConfig: false,
  filteredStrategies: ['samlp', 'oidc'],
  showThirdPartyAccess: false,
}));

vi.mock('@/hooks/my-organization/shared/services/use-config-service', () => ({
  useConfig: () => mockUseConfig(),
}));

vi.mock('@/hooks/my-organization/shared/services/use-idp-config-service', () => ({
  useIdpConfig: () => ({
    isLoadingIdpConfig: false,
    idpConfig: {},
    showCrossAppAccess: vi.fn(() => false),
    isCrossAppAccessReadOnly: vi.fn(() => false),
    getCrossAppAccessDefaultValue: vi.fn(() => undefined),
  }),
}));

const mockCreateProvider = vi.fn();
let serviceOptions: { createAction?: { onAfter?: (...args: unknown[]) => unknown } } | undefined;

vi.mock('@/hooks/my-organization/shared/services/use-sso-provider-create-service', () => ({
  useSsoProviderCreateService: (options: typeof serviceOptions) => {
    serviceOptions = options;
    return {
      createProvider: mockCreateProvider,
      isCreating: false,
    };
  },
}));
const mockOnNext = vi.fn();
const mockOnPrevious = vi.fn();

describe('useSsoProviderCreate - logic behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseConfig.mockReturnValue({
      isLoadingConfig: false,
      filteredStrategies: ['samlp', 'oidc'],
      showThirdPartyAccess: false,
    });
  });

  const wrapperFor =
    (permissions: string[]) =>
    ({ children }: React.PropsWithChildren) =>
      createElement(
        PermissionContext.Provider,
        { value: { permissions, isLoading: false } },
        children,
      );

  const grantAll = { wrapper: wrapperFor(ALL_MY_ORG_PERMISSIONS) };

  it('should initialize formData and refs', () => {
    const { result } = renderHook(
      () =>
        useSsoProviderCreate({
          onNext: mockOnNext,
          onPrevious: mockOnPrevious,
        }),
      grantAll,
    );
    expect(result.current.formData).toEqual({});
    expect(result.current.detailsRef.current).toBeNull();
    expect(result.current.configureRef.current).toBeNull();
  });

  it('should update formData via setFormData', () => {
    const { result } = renderHook(
      () =>
        useSsoProviderCreate({
          onNext: mockOnNext,
          onPrevious: mockOnPrevious,
        }),
      grantAll,
    );
    act(() => {
      result.current.setFormData({
        strategy: 'samlp',
        details: { name: 'test', display_name: 'test provider' },
      });
    });
    expect(result.current.formData.strategy).toBe('samlp');
    expect(result.current.formData.details).toEqual({
      name: 'test',
      display_name: 'test provider',
    });
  });

  it('should call createProvider with merged data on handleCreate', async () => {
    const { result } = renderHook(
      () =>
        useSsoProviderCreate({
          onNext: mockOnNext,
          onPrevious: mockOnPrevious,
        }),
      grantAll,
    );
    act(() => {
      result.current.setFormData({
        strategy: 'oidc',
        details: { name: 'test', display_name: 'test provider' },
      });
    });
    result.current.configureRef.current = {
      validate: vi.fn().mockResolvedValue(true),
      getValues: vi.fn(),
      getData: vi
        .fn()
        .mockReturnValue({ name: 'test', display_name: 'test provider', strategy: 'oidc' }),
    };
    await act(async () => {
      await result.current.handleCreate();
    });
    expect(mockCreateProvider).toHaveBeenCalledWith({
      strategy: 'oidc',
      display_name: 'test provider',
      name: 'test',
    });
  });

  it('createStepActions calls onNext and onPrevious handlers', async () => {
    const { result } = renderHook(
      () =>
        useSsoProviderCreate({
          onNext: mockOnNext,
          onPrevious: mockOnPrevious,
        }),
      grantAll,
    );
    const ref = {
      current: {
        validate: vi.fn().mockResolvedValue(true),
        getData: vi.fn().mockReturnValue({ name: 'test' }),
        getValues: vi.fn(),
      },
    };
    const actions = result.current.createStepActions('provider_details', ref);
    await act(async () => {
      await actions.onNextAction();
      await actions.onPreviousAction();
    });
    expect(ref.current.validate).toHaveBeenCalled();
    expect(ref.current.getData).toHaveBeenCalled();
    expect(mockOnNext).toHaveBeenCalledWith(
      'provider_details',
      expect.objectContaining({ details: { name: 'test' } }),
    );
    expect(mockOnPrevious).toHaveBeenCalledWith(
      'provider_details',
      expect.objectContaining({ details: { name: 'test' } }),
    );
  });

  it('createStepActions returns false if validation fails', async () => {
    const { result } = renderHook(
      () =>
        useSsoProviderCreate({
          onNext: mockOnNext,
          onPrevious: mockOnPrevious,
        }),
      grantAll,
    );
    const ref = {
      current: {
        validate: vi.fn().mockResolvedValue(false),
        getData: vi.fn(),
        getValues: vi.fn(),
      },
    };
    const actions = result.current.createStepActions('provider_details', ref);
    let nextResult;
    await act(async () => {
      nextResult = await actions.onNextAction();
    });
    expect(nextResult).toBe(false);
    expect(ref.current.validate).toHaveBeenCalled();
    expect(mockOnNext).not.toHaveBeenCalled();
  });

  describe('permission guards', () => {
    it('should refuse to create a provider without create:my_org:identity_providers', async () => {
      const { result } = renderHook(() => useSsoProviderCreate({}), {
        wrapper: wrapperFor(['read:my_org:identity_providers']),
      });

      await act(async () => {
        await result.current.handleCreate();
      });

      expect(mockCreateProvider).not.toHaveBeenCalled();
    });

    it('should refuse to create a provider when readOnly is set', async () => {
      const { result } = renderHook(() => useSsoProviderCreate({ readOnly: true }), grantAll);

      await act(async () => {
        await result.current.handleCreate();
      });

      expect(mockCreateProvider).not.toHaveBeenCalled();
    });
  });

  describe('showThirdPartyAccess', () => {
    it('should return showThirdPartyAccess as false when config returns false', () => {
      mockUseConfig.mockReturnValue({
        isLoadingConfig: false,
        filteredStrategies: ['samlp', 'oidc'],
        showThirdPartyAccess: false,
      });

      const { result } = renderHook(() =>
        useSsoProviderCreate({
          onNext: mockOnNext,
          onPrevious: mockOnPrevious,
        }),
      );

      expect(result.current.showThirdPartyAccess).toBe(false);
    });

    it('should return showThirdPartyAccess as true when config returns true', () => {
      mockUseConfig.mockReturnValue({
        isLoadingConfig: false,
        filteredStrategies: ['samlp', 'oidc'],
        showThirdPartyAccess: true,
      });

      const { result } = renderHook(() =>
        useSsoProviderCreate({
          onNext: mockOnNext,
          onPrevious: mockOnPrevious,
        }),
      );

      expect(result.current.showThirdPartyAccess).toBe(true);
    });
  });

  describe('guidedSetup', () => {
    const created = { id: 'con_1', name: 'acme' };
    const requestData = { strategy: 'samlp', name: 'acme' };

    const handle = (getData: unknown, getValues: unknown = getData) => {
      const mocks = {
        validate: vi.fn().mockResolvedValue(true),
        getData: vi.fn().mockReturnValue(getData),
        getValues: vi.fn().mockReturnValue(getValues),
      };
      return mocks as unknown as ProviderConfigureFormHandle & typeof mocks;
    };

    const renderGuided = (options: Parameters<typeof useSsoProviderCreate>[0] = {}) => {
      const hook = renderHook(
        () => useSsoProviderCreate({ guidedSetup: { enabled: true }, ...options }),
        grantAll,
      );
      act(() => {
        hook.result.current.setFormData({
          strategy: 'samlp',
          details: { name: 'acme', display_name: 'Acme' },
        });
      });
      return hook;
    };

    it('is available only when enabled and the user can read the configuration', () => {
      const isAvailable = (enabled: boolean, permissions: string[]) =>
        renderHook(() => useSsoProviderCreate({ guidedSetup: { enabled } }), {
          wrapper: wrapperFor(permissions),
        }).result.current.guidedSetup?.isAvailable;
      const withoutConfiguration = ALL_MY_ORG_PERMISSIONS.filter(
        (permission) => permission !== 'read:my_org:configuration',
      );

      expect(isAvailable(true, ALL_MY_ORG_PERMISSIONS)).toBe(true);
      expect(isAvailable(false, ALL_MY_ORG_PERMISSIONS)).toBe(false);
      expect(isAvailable(true, withoutConfiguration)).toBe(false);
    });

    it('keeps the raw form values when starting and sends the normalized ones on create', async () => {
      const { result } = renderGuided();
      result.current.configureRef.current = handle(
        { normalized: true },
        { normalized: true, fedMetadataXml: '<xml/>' },
      );
      mockCreateProvider.mockResolvedValue(created);

      act(() => result.current.guidedSetup!.start());
      expect(result.current.guidedSetup!.isActive).toBe(true);
      expect(result.current.formData.configure).toEqual({
        normalized: true,
        fedMetadataXml: '<xml/>',
      });

      let ok = false;
      await act(async () => {
        ok = await result.current.guidedSetup!.create();
      });

      expect(ok).toBe(true);
      expect(mockCreateProvider).toHaveBeenCalledWith({
        strategy: 'samlp',
        name: 'acme',
        display_name: 'Acme',
        normalized: true,
      });
      expect(result.current.guidedSetup!.provider).toBe(created);
    });

    it('saves the guided form only when it validates', async () => {
      const { result } = renderGuided();
      const form = handle(requestData, { raw: true });
      result.current.guidedSetup!.configureRef.current = form;

      form.validate.mockResolvedValueOnce(false);
      await act(async () => {
        expect(await result.current.guidedSetup!.validate()).toBe(false);
      });
      expect(result.current.formData.configure).toBeUndefined();

      await act(async () => {
        expect(await result.current.guidedSetup!.validate()).toBe(true);
      });
      expect(result.current.formData.configure).toEqual({ raw: true });
    });

    it.each([
      ['the API returns nothing', () => mockCreateProvider.mockResolvedValue(undefined)],
      ['the request throws', () => mockCreateProvider.mockRejectedValue(new Error('boom'))],
    ])('reports no provider when %s', async (_name, arrange) => {
      const { result } = renderGuided();
      result.current.guidedSetup!.configureRef.current = handle(requestData);
      arrange();

      await act(async () => {
        expect(await result.current.guidedSetup!.create()).toBe(false);
      });
      expect(result.current.guidedSetup!.provider).toBeNull();
    });

    it('does not create without the permission or the entered details', async () => {
      const { result } = renderHook(
        () => useSsoProviderCreate({ guidedSetup: { enabled: true } }),
        grantAll,
      );

      await act(async () => {
        expect(await result.current.guidedSetup!.create()).toBe(false);
      });
      expect(mockCreateProvider).not.toHaveBeenCalled();
    });

    it('holds onAfter while guided and releases it once on complete', () => {
      const onAfter = vi.fn();
      const { result } = renderGuided({ createAction: { onAfter } });
      const data = { strategy: 'samlp' };

      act(() => result.current.guidedSetup!.start());
      serviceOptions?.createAction?.onAfter?.(data, created);
      expect(onAfter).not.toHaveBeenCalled();

      act(() => result.current.guidedSetup!.complete());
      act(() => result.current.guidedSetup!.complete());
      expect(onAfter).toHaveBeenCalledTimes(1);
      expect(onAfter).toHaveBeenCalledWith(data, created);
    });

    it('runs onAfter straight away outside guided setup', () => {
      const onAfter = vi.fn();
      renderGuided({ createAction: { onAfter } });
      const data = { strategy: 'samlp' };

      serviceOptions?.createAction?.onAfter?.(data, created);

      expect(onAfter).toHaveBeenCalledWith(data, created);
    });
  });
});
