import type {
  CreateIdentityProviderRequestContentPrivate,
  IdentityProvider,
} from '@auth0/universal-components-core';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach, type Mock } from 'vitest';

import { showToast } from '../../../../components/ui/toast';
import { useCoreClient } from '../../../use-core-client';
import { useTranslator } from '../../../use-translator';
import { useSsoProviderCreate } from '../use-sso-provider-create';

vi.mock('../../../use-core-client');
vi.mock('../../../use-translator');
vi.mock('../../../../components/ui/toast');

describe('useSsoProviderCreate', () => {
  const mockCreate = vi.fn();
  const mockT = vi.fn((key: string, params?: Record<string, string>) => {
    if (key === 'notifications.provider_create_success') {
      return `Provider ${params?.providerName} created successfully`;
    }
    if (key === 'notifications.provider_create_duplicated_provider_error') {
      return `Provider ${params?.providerName} already exists`;
    }
    if (key === 'notifications.general_error') {
      return 'An error occurred';
    }
    return key;
  });

  const mockCoreClient = {
    getMyOrganizationApiClient: () => ({
      organization: {
        identityProviders: {
          create: mockCreate,
        },
      },
    }),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useCoreClient as Mock).mockReturnValue({ coreClient: mockCoreClient });
    (useTranslator as Mock).mockReturnValue({ t: mockT });
  });

  it('should initialize with isCreating as false', () => {
    const { result } = renderHook(() => useSsoProviderCreate());

    expect(result.current.isCreating).toBe(false);
    expect(typeof result.current.createProvider).toBe('function');
  });

  it('should create a provider successfully', async () => {
    const mockProviderData: CreateIdentityProviderRequestContentPrivate = {
      strategy: 'samlp',
      name: 'test-provider',
      display_name: 'Test Provider',
      signingCert: 'cert123',
    };

    const mockResult: IdentityProvider = {
      id: 'idp_123',
      name: 'test-provider',
      strategy: 'samlp',
      display_name: 'Test Provider',
      options: {},
    };

    mockCreate.mockResolvedValue(mockResult);

    const { result } = renderHook(() => useSsoProviderCreate());

    await result.current.createProvider(mockProviderData);

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

    mockCreate.mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));

    const { result } = renderHook(() => useSsoProviderCreate());

    const createPromise = result.current.createProvider(mockProviderData);

    await waitFor(() => {
      expect(result.current.isCreating).toBe(false);
    });

    await createPromise;

    expect(result.current.isCreating).toBe(true);
  });

  it('should handle duplicate provider error (409)', async () => {
    const mockProviderData: CreateIdentityProviderRequestContentPrivate = {
      strategy: 'samlp',
      name: 'duplicate-provider',
      display_name: 'Duplicate Provider',
      signingCert: 'cert123',
    };

    const error = {
      body: {
        status: 409,
        type: 'https://auth0.com/api-errors#A0E-409-0001',
      },
    };

    mockCreate.mockRejectedValue(error);

    const { result } = renderHook(() => useSsoProviderCreate());

    await result.current.createProvider(mockProviderData);

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith({
        type: 'error',
        message: 'Provider duplicate-provider already exists',
      });
      expect(result.current.isCreating).toBe(false);
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

    const { result } = renderHook(() => useSsoProviderCreate());

    await result.current.createProvider(mockProviderData);

    await waitFor(() => {
      expect(showToast).toHaveBeenCalledWith({
        type: 'error',
        message: 'An error occurred',
      });
      expect(result.current.isCreating).toBe(false);
    });
  });

  it('should call onBefore callback and proceed when it returns true', async () => {
    const mockProviderData: CreateIdentityProviderRequestContentPrivate = {
      strategy: 'samlp',
      name: 'test-provider',
      display_name: 'Test Provider',
      signingCert: 'cert123',
    };

    const mockResult: IdentityProvider = {
      id: 'idp_123',
      name: 'test-provider',
      strategy: 'samlp',
      display_name: 'Test Provider',
      options: {},
    };

    const onBefore = vi.fn().mockReturnValue(true);
    mockCreate.mockResolvedValue(mockResult);

    const { result } = renderHook(() =>
      useSsoProviderCreate({
        createAction: { onBefore },
      }),
    );

    await result.current.createProvider(mockProviderData);

    await waitFor(() => {
      expect(onBefore).toHaveBeenCalledWith(mockProviderData);
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

    const { result } = renderHook(() =>
      useSsoProviderCreate({
        createAction: { onBefore },
      }),
    );

    await result.current.createProvider(mockProviderData);

    expect(onBefore).toHaveBeenCalledWith(mockProviderData);
    expect(mockCreate).not.toHaveBeenCalled();
    expect(showToast).not.toHaveBeenCalled();
  });

  it('should call onAfter callback after successful creation', async () => {
    const mockProviderData: CreateIdentityProviderRequestContentPrivate = {
      strategy: 'samlp',
      name: 'test-provider',
      display_name: 'Test Provider',
      signingCert: 'cert123',
    };

    const mockResult: IdentityProvider = {
      id: 'idp_123',
      name: 'test-provider',
      strategy: 'samlp',
      display_name: 'Test Provider',
      options: {},
    };

    const onAfter = vi.fn();
    mockCreate.mockResolvedValue(mockResult);

    const { result } = renderHook(() =>
      useSsoProviderCreate({
        createAction: { onAfter },
      }),
    );

    await result.current.createProvider(mockProviderData);

    await waitFor(() => {
      expect(onAfter).toHaveBeenCalledWith(mockProviderData, mockResult);
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

    const { result } = renderHook(() =>
      useSsoProviderCreate({
        createAction: { onAfter },
      }),
    );

    await result.current.createProvider(mockProviderData);

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

    const { result } = renderHook(() => useSsoProviderCreate());

    await result.current.createProvider(mockProviderData);

    expect(mockCreate).not.toHaveBeenCalled();
    expect(showToast).not.toHaveBeenCalled();
  });
});
