import type { CoreClientInterface } from '@auth0/universal-components-core';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { mockCreateCoreClient } from '../../internals';
import { useCoreClientInitialization } from '../use-core-client-initialization';

const { createCoreClient } = mockCreateCoreClient();

describe('useCoreClientInitialization', () => {
  const mockCoreClient = {
    initialize: vi.fn(),
  } as unknown as CoreClientInterface;

  const defaultProps = {
    authDetails: {
      authProxyUrl: '/api/auth',
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null initially', () => {
    createCoreClient.mockReturnValue(new Promise(() => {}));

    const { result } = renderHook(() => useCoreClientInitialization(defaultProps));

    expect(result.current).toBeNull();
  });

  it('should return coreClient after successful initialization', async () => {
    createCoreClient.mockResolvedValue(mockCoreClient);

    const { result } = renderHook(() => useCoreClientInitialization(defaultProps));

    await waitFor(() => {
      expect(result.current).toBe(mockCoreClient);
    });

    expect(createCoreClient).toHaveBeenCalledWith(defaultProps.authDetails, undefined, undefined);
  });

  it('should pass i18nOptions to createCoreClient', async () => {
    createCoreClient.mockResolvedValue(mockCoreClient);

    const propsWithI18n = {
      authDetails: { authProxyUrl: '/api/auth' },
      i18nOptions: { currentLanguage: 'es', fallbackLanguage: 'en' },
    };

    const { result } = renderHook(() => useCoreClientInitialization(propsWithI18n));

    await waitFor(() => {
      expect(result.current).toBe(mockCoreClient);
    });

    expect(createCoreClient).toHaveBeenCalledWith(
      propsWithI18n.authDetails,
      propsWithI18n.i18nOptions,
      undefined,
    );
  });

  it('should pass customFetch to createCoreClient', async () => {
    createCoreClient.mockResolvedValue(mockCoreClient);

    const customFetch = vi.fn();
    const propsWithCustomFetch = {
      authDetails: { authProxyUrl: '/api/auth' },
      customFetch,
    };

    const { result } = renderHook(() => useCoreClientInitialization(propsWithCustomFetch));

    await waitFor(() => {
      expect(result.current).toBe(mockCoreClient);
    });

    expect(createCoreClient).toHaveBeenCalledWith(
      propsWithCustomFetch.authDetails,
      undefined,
      customFetch,
    );
  });

  it('should pass both i18nOptions and customFetch to createCoreClient', async () => {
    createCoreClient.mockResolvedValue(mockCoreClient);

    const customFetch = vi.fn();
    const propsWithBoth = {
      authDetails: { authProxyUrl: '/api/auth' },
      i18nOptions: { currentLanguage: 'es', fallbackLanguage: 'en' },
      customFetch,
    };

    const { result } = renderHook(() => useCoreClientInitialization(propsWithBoth));

    await waitFor(() => {
      expect(result.current).toBe(mockCoreClient);
    });

    expect(createCoreClient).toHaveBeenCalledWith(
      propsWithBoth.authDetails,
      propsWithBoth.i18nOptions,
      customFetch,
    );
  });

  it('should return null on initialization error', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const error = new Error('Initialization failed');
    createCoreClient.mockRejectedValue(error);

    const { result } = renderHook(() => useCoreClientInitialization(defaultProps));

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(error);
    });

    expect(result.current).toBeNull();
    consoleSpy.mockRestore();
  });

  it('should reinitialize when authProxyUrl changes', async () => {
    createCoreClient.mockResolvedValue(mockCoreClient);

    const { result, rerender } = renderHook((props) => useCoreClientInitialization(props), {
      initialProps: defaultProps,
    });

    await waitFor(() => {
      expect(result.current).toBe(mockCoreClient);
    });

    rerender({
      authDetails: { authProxyUrl: '/api/auth-v2' },
    });

    await waitFor(() => {
      expect(createCoreClient).toHaveBeenCalledTimes(2);
    });
  });

  it('should reinitialize when domain changes', async () => {
    createCoreClient.mockResolvedValue(mockCoreClient);

    const propsWithDomain = {
      authDetails: { authProxyUrl: '/api/auth', domain: 'test.auth0.com' },
    };

    const { result, rerender } = renderHook((props) => useCoreClientInitialization(props), {
      initialProps: propsWithDomain,
    });

    await waitFor(() => {
      expect(result.current).toBe(mockCoreClient);
    });

    rerender({
      authDetails: { authProxyUrl: '/api/auth', domain: 'new.auth0.com' },
    });

    await waitFor(() => {
      expect(createCoreClient).toHaveBeenCalledTimes(2);
    });
  });
});
