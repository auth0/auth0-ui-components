import {
  QueryClient,
  QueryClientProvider as TanStackQueryClientProvider,
} from '@tanstack/react-query';
import * as React from 'react';

import type { QueryCacheConfig } from '../types/cache-types';

// ============================================================================
// Constants
// ============================================================================

/** Default cache configuration values. */
export const DEFAULT_CACHE_CONFIG: Readonly<Required<QueryCacheConfig>> = {
  enabled: true,
  staleTime: 2 * 60 * 1000,
  gcTime: 5 * 60 * 1000,
  refetchOnWindowFocus: false,
} as const;

const QUERY_RETRY_CONFIG = {
  maxRetries: 3,
  maxRetryDelay: 30_000,
  backoffMultiplier: 2,
} as const;

const MUTATION_RETRY_CONFIG = {
  maxRetries: 1,
} as const;

const DISABLED_CACHE_GC_TIME = 5 * 1000;

// ============================================================================
// ============================================================================
// Utility Functions
// ============================================================================

/** Merges user-provided cache configuration with defaults. */
export function resolveCacheConfig(userConfig?: QueryCacheConfig): Required<QueryCacheConfig> {
  const merged: Required<QueryCacheConfig> = {
    ...DEFAULT_CACHE_CONFIG,
    ...userConfig,
  };

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

/** Creates a QueryClient with the provided cache configuration. */
function createQueryClient(cacheConfig: Required<QueryCacheConfig>): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: cacheConfig.staleTime,
        gcTime: cacheConfig.gcTime,
        refetchOnWindowFocus: cacheConfig.refetchOnWindowFocus,

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

export interface QueryProviderProps {
  children: React.ReactNode;

  cacheConfig?: QueryCacheConfig;
}

// ============================================================================
// Component
// ============================================================================

/** Internal provider wrapping TanStack Query's QueryClientProvider. */
export function QueryProvider({ children, cacheConfig }: QueryProviderProps): React.ReactElement {
  const resolvedConfig = resolveCacheConfig(cacheConfig);

  const queryClientRef = React.useRef<QueryClient | null>(null);

  if (queryClientRef.current === null) {
    queryClientRef.current = createQueryClient(resolvedConfig);
  }

  return (
    <TanStackQueryClientProvider client={queryClientRef.current}>
      {children}
    </TanStackQueryClientProvider>
  );
}
