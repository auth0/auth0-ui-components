import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { QueryProvider, resolveCacheConfig, DEFAULT_CACHE_CONFIG } from '../query-provider';

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
  it('should render children', () => {
    const { result } = renderHook(() => useQueryClient(), {
      wrapper: ({ children }) => <QueryProvider>{children}</QueryProvider>,
    });

    expect(result.current).toBeInstanceOf(QueryClient);
  });

  it('should create a query client with default config', () => {
    const { result } = renderHook(() => useQueryClient(), {
      wrapper: ({ children }) => <QueryProvider>{children}</QueryProvider>,
    });

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
    const { result, rerender } = renderHook(() => useQueryClient(), {
      wrapper: ({ children }) => <QueryProvider>{children}</QueryProvider>,
    });

    const firstClient = result.current;
    rerender();
    const secondClient = result.current;

    expect(firstClient).toBe(secondClient);
  });

  it('should set refetchOnReconnect to true', () => {
    const { result } = renderHook(() => useQueryClient(), {
      wrapper: ({ children }) => <QueryProvider>{children}</QueryProvider>,
    });

    const client = result.current;
    const defaultOptions = client.getDefaultOptions();

    expect(defaultOptions.queries?.refetchOnReconnect).toBe(true);
  });

  it('should configure retry with exponential backoff', () => {
    const { result } = renderHook(() => useQueryClient(), {
      wrapper: ({ children }) => <QueryProvider>{children}</QueryProvider>,
    });

    const client = result.current;
    const defaultOptions = client.getDefaultOptions();

    expect(defaultOptions.queries?.retry).toBe(3);
    expect(typeof defaultOptions.queries?.retryDelay).toBe('function');
  });

  it('should configure mutations with retry', () => {
    const { result } = renderHook(() => useQueryClient(), {
      wrapper: ({ children }) => <QueryProvider>{children}</QueryProvider>,
    });

    const client = result.current;
    const defaultOptions = client.getDefaultOptions();

    expect(defaultOptions.mutations?.retry).toBe(1);
  });
});
