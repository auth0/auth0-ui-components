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

/** Query cache configuration. */
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
};

const QUERY_RETRY_CONFIG = {
  maxRetries: 3,
  maxRetryDelay: 30_000,
  backoffMultiplier: 2,
} as const;

const MUTATION_RETRY_CONFIG = {
  maxRetries: 1,
} as const;

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
    };
  }

  return merged;
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
 * @param setGateKeeperState - Setter for GateKeeper context state.
 * @returns The configured QueryClient instance
 * @internal
 */
function createQueryClient(
  cacheConfig: Required<QueryCacheConfig>,
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
        refetchOnWindowFocus: cacheConfig.refetchOnWindowFocus,
        retry: (failureCount, error) =>
          !isMfaRequiredError(error) && failureCount < QUERY_RETRY_CONFIG.maxRetries,
        retryDelay: (attemptIndex: number) =>
          Math.min(
            1000 * QUERY_RETRY_CONFIG.backoffMultiplier ** attemptIndex,
            QUERY_RETRY_CONFIG.maxRetryDelay,
          ),
        refetchOnReconnect: true,
      },
      mutations: {
        retry: (failureCount, error) =>
          !isMfaRequiredError(error) && failureCount < MUTATION_RETRY_CONFIG.maxRetries,
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
}

/**
 * Internal TanStack Query provider wrapper.
 * @param props - Component props.
 * @param props.children - Child components.
 * @param props.cacheConfig - Cache configuration.
 * @returns The context provider component
 * @internal
 */
export function QueryProvider({ children, cacheConfig }: QueryProviderProps): ReactElement {
  const [gateKeeperState, setGateKeeperState] = useState<{
    error: Error;
    onRetry: () => Promise<boolean>;
  } | null>(null);
  const [queryClient] = useState(() =>
    createQueryClient(resolveCacheConfig(cacheConfig), setGateKeeperState),
  );

  const contextValue = useMemo(() => gateKeeperState ?? { error: null }, [gateKeeperState]);

  return (
    <GateKeeperContext.Provider value={contextValue}>
      <TanStackQueryClientProvider client={queryClient}>{children}</TanStackQueryClientProvider>
    </GateKeeperContext.Provider>
  );
}
