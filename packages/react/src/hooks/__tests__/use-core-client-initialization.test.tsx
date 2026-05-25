import type { CoreClientInterface, TelemetryConfig } from '@auth0/universal-components-core';
import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

import { useCoreClientInitialization } from '@/hooks/shared/use-core-client-initialization';
import { mockCreateCoreClient } from '@/tests/utils';

const { createCoreClient } = mockCreateCoreClient();

describe('useCoreClientInitialization', () => {
  const mockCoreClient = {
    initialize: vi.fn(),
  } as unknown as CoreClientInterface;

  const defaultTelemetry: TelemetryConfig = {
    css: 'tailwind',
    distribution: 'npm',
    framework: 'react',
  };

  const defaultProps = {
    authDetails: {
      authProxyUrl: '/api/auth',
    },
    telemetry: defaultTelemetry,
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

    expect(createCoreClient).toHaveBeenCalledWith(
      defaultProps.authDetails,
      undefined,
      defaultTelemetry,
    );
  });

  it('should pass i18nOptions to createCoreClient', async () => {
    createCoreClient.mockResolvedValue(mockCoreClient);

    const propsWithI18n = {
      authDetails: { authProxyUrl: '/api/auth' },
      i18nOptions: { currentLanguage: 'es', fallbackLanguage: 'en' },
      telemetry: {
        css: 'scoped' as const,
        distribution: 'shadcn' as const,
        framework: 'react' as const,
      },
    };

    const { result } = renderHook(() => useCoreClientInitialization(propsWithI18n));

    await waitFor(() => {
      expect(result.current).toBe(mockCoreClient);
    });

    expect(createCoreClient).toHaveBeenCalledWith(
      propsWithI18n.authDetails,
      propsWithI18n.i18nOptions,
      propsWithI18n.telemetry,
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
      telemetry: defaultTelemetry,
    });

    await waitFor(() => {
      expect(createCoreClient).toHaveBeenCalledTimes(2);
    });
  });

  it('should not reinitialize when domain changes (domain is optional)', async () => {
    createCoreClient.mockResolvedValue(mockCoreClient);

    const propsWithDomain = {
      authDetails: { authProxyUrl: '/api/auth', domain: 'test.auth0.com' },
      telemetry: defaultTelemetry,
    };

    const { result, rerender } = renderHook((props) => useCoreClientInitialization(props), {
      initialProps: propsWithDomain,
    });

    await waitFor(() => {
      expect(result.current).toBe(mockCoreClient);
    });

    rerender({
      authDetails: { authProxyUrl: '/api/auth', domain: 'new.auth0.com' },
      telemetry: defaultTelemetry,
    });

    expect(createCoreClient).toHaveBeenCalledTimes(1);
  });
});
