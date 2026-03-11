import type {
  CreateIdentityProviderRequestContentPrivate,
  IdpStrategy,
  IdentityProvider,
} from '@auth0/universal-components-core';
import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, type Mock } from 'vitest';

import { showToast } from '@/components/auth0/shared/toast';
import { useSsoProviderCreate } from '@/hooks/my-organization/use-sso-provider-create';
import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useTranslator } from '@/hooks/shared/use-translator';
import { createTestQueryClientWrapper } from '@/tests/utils/test-provider';

vi.mock('@/hooks/my-organization/use-config', () => ({
  useConfig: () => ({ isLoadingConfig: false, filteredStrategies: [] as IdpStrategy[] }),
}));
vi.mock('@/hooks/my-organization/use-idp-config', () => ({
  useIdpConfig: () => ({ isLoadingIdpConfig: false, idpConfig: null }),
}));
vi.mock('@/hooks/shared/use-core-client');
vi.mock('@/hooks/shared/use-translator');
vi.mock('@/components/auth0/shared/toast');

describe('useSsoProviderCreate', () => {
  const mockCreate = vi.fn();

  const mockIdentityProvider: IdentityProvider = {
    id: 'idp_123',
    name: 'test-provider',
    strategy: 'samlp',
    display_name: 'Test Provider',
    options: {},
  };

  const mockT = vi.fn((key: string, params?: Record<string, string>) => {
    if (key === 'notifications.provider_create_success')
      return `Provider ${params?.providerName} created successfully`;
    if (key === 'notifications.provider_create_duplicated_provider_error')
      return `Provider ${params?.providerName} already exists`;
    if (key === 'notifications.provider_create_discovery_failure')
      return `${params?.domain} not found. Check the domain and try again.`;
    if (key === 'notifications.general_error') return 'An error occurred';
    return key;
  });

  const mockOrgClient = {
    withScopes: (_scopes: string) => mockOrgClient,
    organization: {
      identityProviders: {
        create: mockCreate,
      },
    },
  };
  const mockCoreClient = {
    getMyOrganizationApiClient: () => mockOrgClient,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useCoreClient as Mock).mockReturnValue({ coreClient: mockCoreClient });
    (useTranslator as Mock).mockReturnValue({ t: mockT });
  });

  const renderUseSsoProviderCreate = (...args: Parameters<typeof useSsoProviderCreate>) => {
    const { wrapper } = createTestQueryClientWrapper();
    return renderHook(() => useSsoProviderCreate(...args), { wrapper });
  };

  // Set up formData + configureRef then call handleCreate
  const setupFormAndCreate = (
    result: ReturnType<typeof renderUseSsoProviderCreate>['result'],
    data: CreateIdentityProviderRequestContentPrivate,
  ) => {
    const { strategy, name, display_name, ...restData } = data;
    act(() => {
      result.current.setFormData({ strategy, details: { name, display_name } });
    });
    result.current.configureRef.current = {
      validate: vi.fn().mockResolvedValue(true),
      getData: vi.fn().mockReturnValue(restData),
    };
    return result.current.handleCreate();
  };

  // ===== Initialization =====

  it('should initialize with isCreating as false', () => {
    const { result } = renderUseSsoProviderCreate();
    expect(result.current.isCreating).toBe(false);
    expect(typeof result.current.handleCreate).toBe('function');
  });

  // ===== Successful creation =====

  it('should create a provider successfully', async () => {
    const mockProviderData: CreateIdentityProviderRequestContentPrivate = {
      strategy: 'samlp',
      name: 'test-provider',
      display_name: 'Test Provider',
      signingCert: 'cert123',
    };

    mockCreate.mockResolvedValue(mockIdentityProvider);

    const { result } = renderUseSsoProviderCreate();

    await act(async () => {
      await setupFormAndCreate(result, mockProviderData);
    });

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledTimes(1);
      expect(showToast).toHaveBeenCalledWith({
        type: 'success',
        message: 'Provider test-provider created successfully',
      });
      expect(result.current.isCreating).toBe(false);
    });
  });

  it('should set isCreating to true during creation', async () => {
    const mockProviderData: CreateIdentityProviderRequestContentPrivate = {
      strategy: 'samlp',
      name: 'test-provider',
      display_name: 'Test Provider',
      signingCert: 'cert123',
    };

    mockCreate.mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve(mockIdentityProvider), 100)),
    );

    const { result } = renderUseSsoProviderCreate();

    const createPromise = setupFormAndCreate(result, mockProviderData);

    await waitFor(() => {
      expect(result.current.isCreating).toBe(true);
    });

    await act(async () => {
      await createPromise;
    });

    await waitFor(() => {
      expect(result.current.isCreating).toBe(false);
    });
  });

  // ===== Error handling =====

  it('should handle duplicate provider error (409)', async () => {
    const mockProviderData: CreateIdentityProviderRequestContentPrivate = {
      strategy: 'samlp',
      name: 'duplicate-provider',
      display_name: 'Duplicate Provider',
      signingCert: 'cert123',
    };

    mockCreate.mockRejectedValue({
      body: { status: 409, type: 'https://auth0.com/api-errors#A0E-409-0001' },
    });

    const { result } = renderUseSsoProviderCreate();

    await expect(setupFormAndCreate(result, mockProviderData)).rejects.toBeDefined();

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith({
        type: 'error',
        message: 'Provider duplicate-provider already exists',
      });
      expect(result.current.isCreating).toBe(false);
    });
  });

  describe('discovery failure errors', () => {
    const baseOktaProviderData: CreateIdentityProviderRequestContentPrivate = {
      strategy: 'okta',
      name: 'test-okta-provider',
      display_name: 'Test Okta Provider',
      domain: 'test.okta.com',
      client_id: 'client123',
      client_secret: 'secret123',
    };

    it('should handle discovery failure error with domain from error detail', async () => {
      mockCreate.mockRejectedValue({
        body: { status: 400, detail: 'discovery failure: invalid-domain.okta.com' },
      });

      const { result } = renderUseSsoProviderCreate();

      await expect(setupFormAndCreate(result, baseOktaProviderData)).rejects.toBeDefined();

      await waitFor(() => {
        expect(showToast).toHaveBeenCalledWith({
          type: 'error',
          message: 'invalid-domain.okta.com not found. Check the domain and try again.',
        });
        expect(result.current.isCreating).toBe(false);
      });
    });

    it('should handle discovery failure error with uppercase detail', async () => {
      mockCreate.mockRejectedValue({
        body: { status: 400, detail: 'Discovery Failure: test.okta.com' },
      });

      const { result } = renderUseSsoProviderCreate();

      await expect(setupFormAndCreate(result, baseOktaProviderData)).rejects.toBeDefined();

      await waitFor(() => {
        expect(showToast).toHaveBeenCalledWith({
          type: 'error',
          message: 'test.okta.com not found. Check the domain and try again.',
        });
      });
    });

    it('should fall back to general error when detail does not contain discovery failure', async () => {
      mockCreate.mockRejectedValue({
        body: { status: 400, detail: 'Some other error message' },
      });

      const { result } = renderUseSsoProviderCreate();

      await expect(setupFormAndCreate(result, baseOktaProviderData)).rejects.toBeDefined();

      await waitFor(() => {
        expect(showToast).toHaveBeenCalledWith({
          type: 'error',
          message: 'An error occurred',
        });
      });
    });

    it('should fall back to general error when detail is missing', async () => {
      mockCreate.mockRejectedValue({ body: { status: 400 } });

      const { result } = renderUseSsoProviderCreate();

      await expect(setupFormAndCreate(result, baseOktaProviderData)).rejects.toBeDefined();

      await waitFor(() => {
        expect(showToast).toHaveBeenCalledWith({
          type: 'error',
          message: 'An error occurred',
        });
      });
    });
  });

  it('should handle general errors', async () => {
    const mockProviderData: CreateIdentityProviderRequestContentPrivate = {
      strategy: 'samlp',
      name: 'test-provider',
      display_name: 'Test Provider',
      signingCert: 'cert123',
    };

    mockCreate.mockRejectedValue(new Error('Network error'));

    const { result } = renderUseSsoProviderCreate();

    await expect(setupFormAndCreate(result, mockProviderData)).rejects.toBeDefined();

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith({
        type: 'error',
        message: 'An error occurred',
      });
      expect(result.current.isCreating).toBe(false);
    });
  });

  // ===== createAction callbacks =====

  it('should call onBefore callback and proceed when it returns true', async () => {
    const mockProviderData: CreateIdentityProviderRequestContentPrivate = {
      strategy: 'samlp',
      name: 'test-provider',
      display_name: 'Test Provider',
      signingCert: 'cert123',
    };

    const onBefore = vi.fn().mockReturnValue(true);
    mockCreate.mockResolvedValue(mockIdentityProvider);

    const { result } = renderUseSsoProviderCreate({ createAction: { onBefore } });

    await act(async () => {
      await setupFormAndCreate(result, mockProviderData);
    });

    await waitFor(() => {
      expect(onBefore).toHaveBeenCalled();
      expect(mockCreate).toHaveBeenCalled();
    });
  });

  it('should call onBefore callback and abort when it returns false', async () => {
    const mockProviderData: CreateIdentityProviderRequestContentPrivate = {
      strategy: 'samlp',
      name: 'test-provider',
      display_name: 'Test Provider',
      signingCert: 'cert123',
    };

    const onBefore = vi.fn().mockReturnValue(false);

    const { result } = renderUseSsoProviderCreate({ createAction: { onBefore } });

    await act(async () => {
      await setupFormAndCreate(result, mockProviderData);
    });

    expect(onBefore).toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(showToast).not.toHaveBeenCalled();
    });
  });

  it('should call onAfter callback after successful creation', async () => {
    const mockProviderData: CreateIdentityProviderRequestContentPrivate = {
      strategy: 'samlp',
      name: 'test-provider',
      display_name: 'Test Provider',
      signingCert: 'cert123',
    };

    const onAfter = vi.fn();
    mockCreate.mockResolvedValue(mockIdentityProvider);

    const { result } = renderUseSsoProviderCreate({ createAction: { onAfter } });

    await act(async () => {
      await setupFormAndCreate(result, mockProviderData);
    });

    await waitFor(() => {
      expect(onAfter).toHaveBeenCalledWith(
        expect.objectContaining({ strategy: 'samlp' }),
        mockIdentityProvider,
      );
    });
  });

  it('should not call onAfter callback when creation fails', async () => {
    const mockProviderData: CreateIdentityProviderRequestContentPrivate = {
      strategy: 'samlp',
      name: 'test-provider',
      display_name: 'Test Provider',
      signingCert: 'cert123',
    };

    const onAfter = vi.fn();
    mockCreate.mockRejectedValue(new Error('Creation failed'));

    const { result } = renderUseSsoProviderCreate({ createAction: { onAfter } });

    await expect(setupFormAndCreate(result, mockProviderData)).rejects.toBeDefined();

    await waitFor(() => {
      expect(onAfter).not.toHaveBeenCalled();
    });
  });

  it('should return early if coreClient is not available', async () => {
    (useCoreClient as Mock).mockReturnValue({ coreClient: null });

    const mockProviderData: CreateIdentityProviderRequestContentPrivate = {
      strategy: 'samlp',
      name: 'test-provider',
      display_name: 'Test Provider',
      signingCert: 'cert123',
    };

    const { result } = renderUseSsoProviderCreate();

    await act(async () => {
      await setupFormAndCreate(result, mockProviderData);
    });

    expect(mockCreate).not.toHaveBeenCalled();
    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith({
        type: 'error',
        message: 'An error occurred',
      });
    });
  });

  // ===== Form logic =====

  describe('form logic', () => {
    it('should initialize formData and refs', () => {
      const { result } = renderUseSsoProviderCreate();
      expect(result.current.formData).toEqual({});
      expect(result.current.detailsRef.current).toBeNull();
      expect(result.current.configureRef.current).toBeNull();
    });

    it('should update formData via setFormData', () => {
      const { result } = renderUseSsoProviderCreate();
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

    it('createStepActions calls onNext and onPrevious handlers', async () => {
      const mockOnNext = vi.fn();
      const mockOnPrevious = vi.fn();
      const { result } = renderUseSsoProviderCreate({
        onNext: mockOnNext,
        onPrevious: mockOnPrevious,
      });
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
      const { result } = renderUseSsoProviderCreate();
      const ref = {
        current: {
          validate: vi.fn().mockResolvedValue(false),
          getData: vi.fn(),
        },
      };
      const actions = result.current.createStepActions('provider_details', ref);
      let nextResult: boolean | undefined;
      await act(async () => {
        nextResult = await actions.onNextAction();
      });
      expect(nextResult).toBe(false);
      expect(ref.current.validate).toHaveBeenCalled();
    });
  });
});
