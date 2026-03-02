/**
 * TanStack Query cache configuration types.
 * @module cache-types
 */

/** Cache configuration options. */
export interface QueryCacheConfig {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
  refetchOnWindowFocus?: boolean | 'always';
}
