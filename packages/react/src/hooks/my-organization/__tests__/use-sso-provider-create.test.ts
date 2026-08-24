import { renderHook, act } from '@testing-library/react';
import { createElement } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useSsoProviderCreate } from '../use-sso-provider-create';

import { PermissionContext } from '@/providers/permission-provider';
import { ALL_MY_ORG_PERMISSIONS } from '@/tests/utils/__mocks__/permissions/permission.mocks';

vi.mock('@/hooks/my-organization/shared/services/use-config-service', () => ({
  useConfig: () => ({
    isLoadingConfig: false,
    filteredStrategies: ['samlp', 'oidc'],
  }),
}));
vi.mock('@/hooks/my-organization/shared/services/use-idp-config-service', () => ({
  useIdpConfig: () => ({
    isLoadingIdpConfig: false,
    idpConfig: {},
  }),
}));
const mockCreateProvider = vi.fn();

vi.mock('@/hooks/my-organization/shared/services/use-sso-provider-create-service', () => ({
  useSsoProviderCreateService: () => ({
    createProvider: mockCreateProvider,
    isCreating: false,
  }),
}));
const mockOnNext = vi.fn();
const mockOnPrevious = vi.fn();

describe('useSsoProviderCreate - logic behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
});
