import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useSsoProviderCreateLogic } from '../use-sso-provider-create-logic';

// Mock useConfig and useIdpConfig to avoid hitting queryClient or network
vi.mock('@/hooks/my-organization/use-config', () => ({
  useConfig: () => ({
    isLoadingConfig: false,
    filteredStrategies: ['samlp', 'oidc'],
  }),
}));
vi.mock('@/hooks/my-organization/use-idp-config', () => ({
  useIdpConfig: () => ({
    isLoadingIdpConfig: false,
    idpConfig: {},
  }),
}));

// Minimal local mocks
const mockCreateProvider = vi.fn();
const mockOnNext = vi.fn();
const mockOnPrevious = vi.fn();

describe('useSsoProviderCreateLogic', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize formData and refs', () => {
    const { result } = renderHook(() =>
      useSsoProviderCreateLogic({
        onNext: mockOnNext,
        onPrevious: mockOnPrevious,
        createProvider: mockCreateProvider,
      }),
    );
    expect(result.current.formData).toEqual({});
    expect(result.current.detailsRef.current).toBeNull();
    expect(result.current.configureRef.current).toBeNull();
  });

  it('should update formData via setFormData', () => {
    const { result } = renderHook(() =>
      useSsoProviderCreateLogic({
        onNext: mockOnNext,
        onPrevious: mockOnPrevious,
        createProvider: mockCreateProvider,
      }),
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
    const { result } = renderHook(() =>
      useSsoProviderCreateLogic({
        onNext: mockOnNext,
        onPrevious: mockOnPrevious,
        createProvider: mockCreateProvider,
      }),
    );
    act(() => {
      result.current.setFormData({
        strategy: 'oidc',
        details: { name: 'test', display_name: 'test provider' },
      });
    });
    // Mock configureRef.current.getData
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
    const { result } = renderHook(() =>
      useSsoProviderCreateLogic({
        onNext: mockOnNext,
        onPrevious: mockOnPrevious,
        createProvider: mockCreateProvider,
      }),
    );
    // Mock ref with validate and getData
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
    const { result } = renderHook(() =>
      useSsoProviderCreateLogic({
        onNext: mockOnNext,
        onPrevious: mockOnPrevious,
        createProvider: mockCreateProvider,
      }),
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
});
