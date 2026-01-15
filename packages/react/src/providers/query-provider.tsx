import {
  QueryClient,
  QueryClientProvider as TanStackQueryClientProvider,
} from '@tanstack/react-query';
import * as React from 'react';

import type { QueryCacheConfig } from '../types/cache-types';

// ============================================================================
// Constants
// ============================================================================

/**
 * Default cache configuration values.
 *
 * These defaults provide a balance between reducing API calls and keeping data fresh:
 * - `staleTime: 30s` - Data is considered fresh for 30 seconds, avoiding redundant fetches
 * - `gcTime: 60s` - Unused cache entries are garbage collected after 60 seconds
 * - `refetchOnWindowFocus: false` - Prevents unexpected refetches when switching tabs
 *
 * @see https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults
 */
export const DEFAULT_CACHE_CONFIG: Readonly<Required<QueryCacheConfig>> = {
  enabled: true,
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
  refetchOnWindowFocus: false,
} as const;

/** Retry configuration for failed queries */
const QUERY_RETRY_CONFIG = {
  /** Maximum number of retry attempts for failed queries */
  maxRetries: 3,
  /** Maximum delay between retries in milliseconds */
  maxRetryDelay: 30_000,
  /** Base multiplier for exponential backoff */
  backoffMultiplier: 2,
} as const;

/** Retry configuration for failed mutations */
const MUTATION_RETRY_CONFIG = {
  /** Number of retry attempts for failed mutations (lower than queries) */
  maxRetries: 1,
} as const;

/** Garbage collection time when caching is disabled (short to free memory) */
const DISABLED_CACHE_GC_TIME = 5 * 1000;

// ============================================================================
// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Merges user-provided cache configuration with default values.
 *
 * When caching is disabled (`enabled: false`), this function:
 * - Sets `staleTime` to 0, causing queries to always refetch on mount
 * - Uses a short `gcTime` to free memory quickly
 *
 * @param userConfig - Optional user-provided cache configuration
 * @returns Fully resolved cache configuration with all required properties
 *
 * @example
 * ```ts
 * // Use defaults
 * const config = resolveCacheConfig();
 *
 * // Override staleTime
 * const config = resolveCacheConfig({ staleTime: 60000 });
 *
 * // Disable caching entirely
 * const config = resolveCacheConfig({ enabled: false });
 * ```
 */
export function resolveCacheConfig(userConfig?: QueryCacheConfig): Required<QueryCacheConfig> {
  const merged: Required<QueryCacheConfig> = {
    ...DEFAULT_CACHE_CONFIG,
    ...userConfig,
  };

  // When caching is disabled, set staleTime to 0 (always refetch on mount)
  // and use a short gcTime to free memory quickly
  if (!merged.enabled) {
    return {
      ...merged,
      staleTime: 0,
      gcTime: DISABLED_CACHE_GC_TIME,
    };
  }

  return merged;
}

// ============================================================================
// QueryClient Factory
// ============================================================================

/**
 * Creates a new QueryClient instance with the specified cache configuration.
 *
 * The QueryClient is configured with:
 * - User-configurable: `staleTime`, `gcTime`, `refetchOnWindowFocus`
 * - Fixed settings: `retry`, `retryDelay`, `refetchOnReconnect`
 *
 * @param cacheConfig - Resolved cache configuration (all properties required)
 * @returns A new QueryClient instance
 *
 * @internal This function is not exported and should only be used within QueryProvider
 */
function createQueryClient(cacheConfig: Required<QueryCacheConfig>): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // User-configurable settings (via cacheConfig)
        staleTime: cacheConfig.staleTime,
        gcTime: cacheConfig.gcTime,
        refetchOnWindowFocus: cacheConfig.refetchOnWindowFocus,

        // Fixed settings - sensible defaults that shouldn't need customization
        retry: QUERY_RETRY_CONFIG.maxRetries,
        retryDelay: (attemptIndex) =>
          Math.min(
            1000 * QUERY_RETRY_CONFIG.backoffMultiplier ** attemptIndex,
            QUERY_RETRY_CONFIG.maxRetryDelay,
          ),
        refetchOnReconnect: true,
      },
      mutations: {
        retry: MUTATION_RETRY_CONFIG.maxRetries,
      },
    },
  });
}

// ============================================================================
// Component Types
// ============================================================================

/**
 * Props for the QueryProvider component.
 */
export interface QueryProviderProps {
  /** Child components that will have access to the QueryClient */
  children: React.ReactNode;

  /**
   * Optional cache configuration to customize TanStack Query behavior.
   *
   * This is typically passed through from `Auth0ComponentProvider`'s `cacheConfig` prop.
   * If not provided, default values from `DEFAULT_CACHE_CONFIG` are used.
   *
   * @see {@link DEFAULT_CACHE_CONFIG} for default values
   * @see {@link QueryCacheConfig} for available options
   */
  cacheConfig?: QueryCacheConfig;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Internal provider component that wraps TanStack Query's QueryClientProvider.
 *
 * This provider creates an **isolated** QueryClient that:
 * - Does not interfere with any QueryClient the consumer may have in their app
 * - Maintains a stable instance across re-renders using React.useRef
 * - Works correctly in React Strict Mode and Next.js environments
 * - Accepts configurable caching options via the `cacheConfig` prop
 *
 * ## Why useRef instead of useMemo or module singleton?
 *
 * - **useRef**: Persists for component lifetime, scoped to instance, works in Strict Mode
 * - **useMemo**: React may drop cached value (it's a performance hint, not a guarantee)
 * - **Module singleton**: Shared across all instances, problematic for testing and SSR
 *
 * @remarks
 * This component is internal and should not be used directly.
 * Use `Auth0ComponentProvider` instead, which wraps this provider.
 *
 * @example
 * ```tsx
 * // Internal use only - wrapped by Auth0ComponentProvider
 * <QueryProvider cacheConfig={{ staleTime: 60000 }}>
 *   <YourComponents />
 * </QueryProvider>
 * ```
 *
 * @see https://tanstack.com/query/latest/docs/framework/react/reference/QueryClientProvider
 */
export function QueryProvider({ children, cacheConfig }: QueryProviderProps): React.ReactElement {
  // Resolve user config with defaults once (initial render only)
  // Note: We intentionally don't react to cacheConfig changes after mount
  // as changing QueryClient config at runtime can cause unexpected behavior
  const resolvedConfig = resolveCacheConfig(cacheConfig);

  // useRef ensures a stable QueryClient instance across renders:
  // - Survives React Strict Mode double-invocation
  // - Scoped to this component instance (not shared globally)
  // - Persists for the component's entire lifetime
  const queryClientRef = React.useRef<QueryClient | null>(null);

  // Lazy initialization pattern - only create QueryClient once
  if (queryClientRef.current === null) {
    queryClientRef.current = createQueryClient(resolvedConfig);
  }

  return (
    <TanStackQueryClientProvider client={queryClientRef.current}>
      {children}
    </TanStackQueryClientProvider>
  );
}
