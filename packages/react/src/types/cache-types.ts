/** Cache configuration options for TanStack Query. */
export interface QueryCacheConfig {
  enabled?: boolean;

  staleTime?: number;

  gcTime?: number;

  refetchOnWindowFocus?: boolean | 'always';
}
