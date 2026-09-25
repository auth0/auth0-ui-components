'use client';

/**
 * TanStack Query provider wrapper.
 * @module query-provider
 * @internal
 */

import { isMfaRequiredError, isNotifiableError } from '@auth0/universal-components-core';
import {
  MutationCache,
  type Query,
  QueryCache,
  QueryClient,
  QueryClientProvider as TanStackQueryClientProvider,
} from '@tanstack/react-query';
import { useMemo, useState, type ReactElement, type ReactNode } from 'react';

import { GateKeeperContext } from '@/providers/gate-keeper-context';
import type { QueryCacheConfig } from '@/types/cache-types';
import type { QueryRetryConfig } from '@/types/retry-types';

/** Default cache configuration. */
export const DEFAULT_CACHE_CONFIG: Readonly<Required<QueryCacheConfig>> = {
  enabled: true,
  staleTime: 2 * 60 * 1000,
  gcTime: 5 * 60 * 1000,
  cacheTime: 5 * 60 * 1000,
  refetchOnWindowFocus: false,
};

/** Fully-resolved retry configuration (no optional fields). */
export type ResolvedRetryConfig = {
  enabled: boolean;
  queries: Required<NonNullable<QueryRetryConfig['queries']>>;
  mutations: Required<NonNullable<QueryRetryConfig['mutations']>>;
};

/** Default retry configuration. */
export const DEFAULT_RETRY_CONFIG: Readonly<ResolvedRetryConfig> = {
  enabled: true,
  queries: {
    maxRetries: 3,
    maxRetryDelay: 30_000,
    backoffMultiplier: 2,
  },
  mutations: {
    maxRetries: 1,
  },
};

const DISABLED_CACHE_GC_TIME = 5 * 1000;

/**
 * Merges user config with defaults.
 * @param userConfig - User-provided cache config.
 * @returns The resolved cache configuration
 * @internal
 */
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
      cacheTime: DISABLED_CACHE_GC_TIME,
    };
  }

  return merged;
}

/**
 * Merges user retry config with defaults.
 * @param userConfig - User-provided retry config.
 * @returns The resolved retry configuration
 * @internal
 */
export function resolveRetryConfig(userConfig?: QueryRetryConfig): ResolvedRetryConfig {
  return {
    enabled: userConfig?.enabled ?? DEFAULT_RETRY_CONFIG.enabled,
    queries: {
      ...DEFAULT_RETRY_CONFIG.queries,
      ...userConfig?.queries,
    },
    mutations: {
      ...DEFAULT_RETRY_CONFIG.mutations,
      ...userConfig?.mutations,
    },
  };
}

/**
 * Returns true if a cached query has an error that GateKeeper should handle.
 * @param query - The cached query to check.
 * @returns Whether the query error should be intercepted by GateKeeper.
 */
function isGateKeeperError(query: Query): boolean {
  return !!query.state.error && !isNotifiableError(query.state.error);
}

/**
 * Creates a QueryClient with config and global GateKeeper error interception.
 * @param cacheConfig - Cache configuration.
 * @param retryConfig - Retry configuration.
 * @param setGateKeeperState - Setter for GateKeeper context state.
 * @returns The configured QueryClient instance
 * @internal
 */
function createQueryClient(
  cacheConfig: Required<QueryCacheConfig>,
  retryConfig: ResolvedRetryConfig,
  setGateKeeperState: (state: { error: Error; onRetry: () => Promise<boolean> } | null) => void,
): QueryClient {
  const queryClient = new QueryClient({
    queryCache: new QueryCache({
      onError: (error) => {
        if (!isNotifiableError(error)) {
          setGateKeeperState({
            error,
            onRetry: async () => {
              await queryClient.refetchQueries({ predicate: isGateKeeperError });
              const stillFailing = queryClient.getQueryCache().getAll().some(isGateKeeperError);
              if (!stillFailing) setGateKeeperState(null);
              return !stillFailing;
            },
          });
        }
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, variables, _context, mutation) => {
        if (isMfaRequiredError(error)) {
          setGateKeeperState({
            error,
            onRetry: async () => {
              try {
                await mutation.execute(variables);
                setGateKeeperState(null);
                return true;
              } catch {
                return false;
              }
            },
          });
        }
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: cacheConfig.staleTime,
        gcTime: cacheConfig.gcTime,
        ...({ cacheTime: cacheConfig.cacheTime } as object),
        refetchOnWindowFocus: cacheConfig.refetchOnWindowFocus,
        retry: (failureCount, error) =>
          retryConfig.enabled &&
          !isMfaRequiredError(error) &&
          failureCount < retryConfig.queries.maxRetries,
        retryDelay: (attemptIndex: number) =>
          Math.min(
            1000 * retryConfig.queries.backoffMultiplier ** attemptIndex,
            retryConfig.queries.maxRetryDelay,
          ),
        refetchOnReconnect: true,
      },
      mutations: {
        retry: (failureCount, error) =>
          retryConfig.enabled &&
          !isMfaRequiredError(error) &&
          failureCount < retryConfig.mutations.maxRetries,
      },
    },
  });

  return queryClient;
}

/** Props for QueryProvider. */
export interface QueryProviderProps {
  children: ReactNode;
  /** Cache config, only read on mount. */
  cacheConfig?: QueryCacheConfig;
  /** Retry config, only read on mount. */
  retryConfig?: QueryRetryConfig;
}

/**
 * Internal TanStack Query provider wrapper.
 * @param props - Component props.
 * @param props.children - Child components.
 * @param props.cacheConfig - Cache configuration.
 * @param props.retryConfig - Retry configuration.
 * @returns The context provider component
 * @internal
 */
export function QueryProvider({
  children,
  cacheConfig,
  retryConfig,
}: QueryProviderProps): ReactElement {
  const [gateKeeperState, setGateKeeperState] = useState<{
    error: Error;
    onRetry: () => Promise<boolean>;
  } | null>(null);
  const [queryClient] = useState(() =>
    createQueryClient(
      resolveCacheConfig(cacheConfig),
      resolveRetryConfig(retryConfig),
      setGateKeeperState,
    ),
  );

  const contextValue = useMemo(() => gateKeeperState ?? { error: null }, [gateKeeperState]);

  return (
    <GateKeeperContext.Provider value={contextValue}>
      <TanStackQueryClientProvider client={queryClient}>{children}</TanStackQueryClientProvider>
    </GateKeeperContext.Provider>
  );
}
