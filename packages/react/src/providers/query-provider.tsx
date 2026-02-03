import {
  QueryClient,
  QueryClientProvider as TanStackQueryClientProvider,
} from '@tanstack/react-query';
import { useState, type ReactElement, type ReactNode } from 'react';

export interface QueryCacheConfig {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
  refetchOnWindowFocus?: boolean | 'always';
}

/** Default cache configuration. */
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

/** Merges user config with defaults. */
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

function createQueryClient(cacheConfig: Required<QueryCacheConfig>): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: cacheConfig.staleTime,
        gcTime: cacheConfig.gcTime,
        refetchOnWindowFocus: cacheConfig.refetchOnWindowFocus,
        retry: QUERY_RETRY_CONFIG.maxRetries,
        retryDelay: (attemptIndex: number) =>
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

export interface QueryProviderProps {
  children: ReactNode;
  /** Cache config, only read on mount. */
  cacheConfig?: QueryCacheConfig;
}

/** Internal TanStack Query provider wrapper. */
export function QueryProvider({ children, cacheConfig }: QueryProviderProps): ReactElement {
  const [queryClient] = useState(() => createQueryClient(resolveCacheConfig(cacheConfig)));

  return <TanStackQueryClientProvider client={queryClient}>{children}</TanStackQueryClientProvider>;
}
