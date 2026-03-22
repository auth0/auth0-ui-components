import { QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { describe, it, expect } from 'vitest';

import { useGateKeeperContext } from '@/providers/gate-keeper-context';
import {
  QueryProvider,
  resolveCacheConfig,
  DEFAULT_CACHE_CONFIG,
} from '@/providers/query-provider';

describe('resolveCacheConfig', () => {
  it('should return default config when no user config provided', () => {
    const config = resolveCacheConfig();

    expect(config).toEqual(DEFAULT_CACHE_CONFIG);
  });

  it('should merge user config with defaults', () => {
    const userConfig = {
      staleTime: 120000,
    };

    const config = resolveCacheConfig(userConfig);

    expect(config).toEqual({
      ...DEFAULT_CACHE_CONFIG,
      staleTime: 120000,
    });
  });

  it('should set staleTime to 0 and gcTime to 5000 when caching is disabled', () => {
    const userConfig = {
      enabled: false,
    };

    const config = resolveCacheConfig(userConfig);

    expect(config.enabled).toBe(false);
    expect(config.staleTime).toBe(0);
    expect(config.gcTime).toBe(5000);
  });

  it('should preserve other user config values when caching is disabled', () => {
    const userConfig = {
      enabled: false,
      refetchOnWindowFocus: true,
    };

    const config = resolveCacheConfig(userConfig);

    expect(config.enabled).toBe(false);
    expect(config.staleTime).toBe(0);
    expect(config.gcTime).toBe(5000);
    expect(config.refetchOnWindowFocus).toBe(true);
  });

  it('should use user-provided gcTime when enabled is true', () => {
    const userConfig = {
      enabled: true,
      gcTime: 60000,
    };

    const config = resolveCacheConfig(userConfig);

    expect(config.gcTime).toBe(60000);
  });
});

describe('QueryProvider', () => {
  const wrapper = ({ children }: React.PropsWithChildren) => (
    <QueryProvider>{children}</QueryProvider>
  );

  it('should render children', () => {
    const { result } = renderHook(() => useQueryClient(), { wrapper });

    expect(result.current).toBeInstanceOf(QueryClient);
  });

  it('should create a query client with default config', () => {
    const { result } = renderHook(() => useQueryClient(), { wrapper });

    const client = result.current;
    const defaultOptions = client.getDefaultOptions();

    expect(defaultOptions.queries?.staleTime).toBe(DEFAULT_CACHE_CONFIG.staleTime);
    expect(defaultOptions.queries?.gcTime).toBe(DEFAULT_CACHE_CONFIG.gcTime);
    expect(defaultOptions.queries?.refetchOnWindowFocus).toBe(
      DEFAULT_CACHE_CONFIG.refetchOnWindowFocus,
    );
  });

  it('should create a query client with custom cache config', () => {
    const customConfig = {
      staleTime: 120000,
      gcTime: 180000,
      refetchOnWindowFocus: true,
    };

    const { result } = renderHook(() => useQueryClient(), {
      wrapper: ({ children }) => (
        <QueryProvider cacheConfig={customConfig}>{children}</QueryProvider>
      ),
    });

    const client = result.current;
    const defaultOptions = client.getDefaultOptions();

    expect(defaultOptions.queries?.staleTime).toBe(120000);
    expect(defaultOptions.queries?.gcTime).toBe(180000);
    expect(defaultOptions.queries?.refetchOnWindowFocus).toBe(true);
  });

  it('should create a query client with caching disabled', () => {
    const disabledConfig = {
      enabled: false,
    };

    const { result } = renderHook(() => useQueryClient(), {
      wrapper: ({ children }) => (
        <QueryProvider cacheConfig={disabledConfig}>{children}</QueryProvider>
      ),
    });

    const client = result.current;
    const defaultOptions = client.getDefaultOptions();

    expect(defaultOptions.queries?.staleTime).toBe(0);
    expect(defaultOptions.queries?.gcTime).toBe(5000);
  });

  it('should maintain the same query client instance across re-renders', () => {
    const { result, rerender } = renderHook(() => useQueryClient(), { wrapper });

    const firstClient = result.current;
    rerender();
    const secondClient = result.current;

    expect(firstClient).toBe(secondClient);
  });

  it('should set refetchOnReconnect to true', () => {
    const { result } = renderHook(() => useQueryClient(), { wrapper });

    const client = result.current;
    const defaultOptions = client.getDefaultOptions();

    expect(defaultOptions.queries?.refetchOnReconnect).toBe(true);
  });

  it('should configure retry with exponential backoff', () => {
    const { result } = renderHook(() => useQueryClient(), { wrapper });

    const client = result.current;
    const defaultOptions = client.getDefaultOptions();

    const retryFn = defaultOptions.queries?.retry as (
      failureCount: number,
      error: unknown,
    ) => boolean;
    expect(typeof retryFn).toBe('function');
    expect(retryFn(0, new Error('test'))).toBe(true);
    expect(retryFn(2, new Error('test'))).toBe(true);
    expect(retryFn(3, new Error('test'))).toBe(false);
    expect(typeof defaultOptions.queries?.retryDelay).toBe('function');
  });

  it('should configure mutations with retry', () => {
    const { result } = renderHook(() => useQueryClient(), { wrapper });

    const client = result.current;
    const defaultOptions = client.getDefaultOptions();

    const retryFn = defaultOptions.mutations?.retry;
    expect(typeof retryFn).toBe('function');
    expect((retryFn as Function)(0, new Error('server error'))).toBe(true);
    expect((retryFn as Function)(1, new Error('server error'))).toBe(false);
    const mfaError = Object.assign(new Error('mfa'), { error: 'mfa_required' });
    expect((retryFn as Function)(0, mfaError)).toBe(false);
  });
});

describe('QueryProvider GateKeeper integration', () => {
  const wrapper = ({ children }: React.PropsWithChildren) => (
    <QueryProvider>{children}</QueryProvider>
  );
  const serverError = Object.assign(new Error('Server Error'), { status: 500 });
  const mfaError = Object.assign(new Error('MFA Required'), { error: 'mfa_required' });

  it('should provide initial gate keeper state with no error', () => {
    const { result } = renderHook(() => useGateKeeperContext(), { wrapper });

    expect(result.current.error).toBeNull();
    expect(result.current.onRetry).toBeUndefined();
  });

  it('should set gate keeper error when a 5xx query error occurs', async () => {
    const { result } = renderHook(
      () => {
        const gkCtx = useGateKeeperContext();
        useQuery({
          queryKey: ['gk-5xx'],
          queryFn: () => Promise.reject(serverError),
          retry: false,
        });
        return { gkCtx };
      },
      { wrapper },
    );

    await waitFor(() => expect(result.current.gkCtx.error).toBe(serverError));
    expect(result.current.gkCtx.onRetry).toBeDefined();
  });

  it('should set gate keeper error when a query fails with MFA required', async () => {
    const { result } = renderHook(
      () => {
        const gkCtx = useGateKeeperContext();
        useQuery({
          queryKey: ['gk-mfa-query'],
          queryFn: () => Promise.reject(mfaError),
          retry: false,
        });
        return { gkCtx };
      },
      { wrapper },
    );

    await waitFor(() => expect(result.current.gkCtx.error).toBe(mfaError));
  });

  it('should not set gate keeper error for notifiable errors (4xx)', async () => {
    const clientError = Object.assign(new Error('Not Found'), { status: 404 });

    const { result } = renderHook(
      () => {
        const gkCtx = useGateKeeperContext();
        const query = useQuery({
          queryKey: ['gk-4xx'],
          queryFn: () => Promise.reject(clientError),
          retry: false,
        });
        return { gkCtx, query };
      },
      { wrapper },
    );

    await waitFor(() => expect(result.current.query.isError).toBe(true));
    expect(result.current.gkCtx.error).toBeNull();
  });

  it('should clear gate keeper state after successful query retry', async () => {
    let fail = true;

    const { result } = renderHook(
      () => {
        const gkCtx = useGateKeeperContext();
        useQuery({
          queryKey: ['gk-retry-success'],
          queryFn: () => (fail ? Promise.reject(serverError) : Promise.resolve('ok')),
          retry: false,
        });
        return { gkCtx };
      },
      { wrapper },
    );

    await waitFor(() => expect(result.current.gkCtx.error).toBe(serverError));

    fail = false;
    const success = await act(() => result.current.gkCtx.onRetry?.());

    expect(success).toBe(true);
    await waitFor(() => expect(result.current.gkCtx.error).toBeNull());
  });

  it('should keep gate keeper state when query retry still fails', async () => {
    const { result } = renderHook(
      () => {
        const gkCtx = useGateKeeperContext();
        useQuery({
          queryKey: ['gk-retry-fail'],
          queryFn: () => Promise.reject(serverError),
          retry: false,
        });
        return { gkCtx };
      },
      { wrapper },
    );

    await waitFor(() => expect(result.current.gkCtx.error).toBe(serverError));

    const success = await act(() => result.current.gkCtx.onRetry?.());

    expect(success).toBe(false);
    expect(result.current.gkCtx.error).not.toBeNull();
  });

  it('should set gate keeper error when a mutation fails with MFA required', async () => {
    const { result } = renderHook(
      () => {
        const gkCtx = useGateKeeperContext();
        const mutation = useMutation({
          mutationFn: () => Promise.reject(mfaError),
        });
        return { gkCtx, mutation };
      },
      { wrapper },
    );

    act(() => result.current.mutation.mutate());

    await waitFor(() => expect(result.current.gkCtx.error).toBe(mfaError));
    expect(result.current.gkCtx.onRetry).toBeDefined();
  });

  it('should not set gate keeper error for non-MFA mutation errors', async () => {
    const { result } = renderHook(
      () => {
        const gkCtx = useGateKeeperContext();
        const mutation = useMutation({
          mutationFn: () => Promise.reject(serverError),
          retry: false,
        });
        return { gkCtx, mutation };
      },
      { wrapper },
    );

    act(() => result.current.mutation.mutate());

    await waitFor(() => expect(result.current.mutation.isError).toBe(true));
    expect(result.current.gkCtx.error).toBeNull();
  });

  it('should clear gate keeper state after successful mutation retry', async () => {
    let fail = true;

    const { result } = renderHook(
      () => {
        const gkCtx = useGateKeeperContext();
        const mutation = useMutation({
          mutationFn: () => (fail ? Promise.reject(mfaError) : Promise.resolve('ok')),
          retry: false,
        });
        return { gkCtx, mutation };
      },
      { wrapper },
    );

    act(() => result.current.mutation.mutate());
    await waitFor(() => expect(result.current.gkCtx.error).toBe(mfaError));

    fail = false;
    const success = await act(() => result.current.gkCtx.onRetry?.());

    expect(success).toBe(true);
    await waitFor(() => expect(result.current.gkCtx.error).toBeNull());
  });

  it('should return false from mutation onRetry when retry still fails', async () => {
    const { result } = renderHook(
      () => {
        const gkCtx = useGateKeeperContext();
        const mutation = useMutation({
          mutationFn: () => Promise.reject(mfaError),
          retry: false,
        });
        return { gkCtx, mutation };
      },
      { wrapper },
    );

    act(() => result.current.mutation.mutate());
    await waitFor(() => expect(result.current.gkCtx.error).toBeDefined());

    const success = await act(() => result.current.gkCtx.onRetry?.());

    expect(success).toBe(false);
  });
});
