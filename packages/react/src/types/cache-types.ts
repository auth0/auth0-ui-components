/**
 * @fileoverview Cache configuration types for TanStack Query integration.
 *
 * This module defines the configuration interface for controlling
 * TanStack Query's caching behavior within Auth0 UI Components.
 *
 * @module cache-types
 */

/**
 * Configuration options for TanStack Query caching behavior.
 *
 * Use this to customize how Auth0 UI Components cache API responses.
 * Pass to `Auth0ComponentProvider` via the `cacheConfig` prop.
 *
 * @example
 * ```tsx
 * // Use default caching (recommended)
 * <Auth0ComponentProvider authDetails={authDetails}>
 *   <App />
 * </Auth0ComponentProvider>
 *
 * // Disable caching entirely
 * <Auth0ComponentProvider
 *   authDetails={authDetails}
 *   cacheConfig={{ enabled: false }}
 * >
 *   <App />
 * </Auth0ComponentProvider>
 *
 * // Custom cache timing
 * <Auth0ComponentProvider
 *   authDetails={authDetails}
 *   cacheConfig={{
 *     staleTime: 60000,  // 1 minute
 *     gcTime: 300000,    // 5 minutes
 *   }}
 * >
 *   <App />
 * </Auth0ComponentProvider>
 * ```
 *
 * @see {@link https://tanstack.com/query/latest/docs/react/guides/caching | TanStack Query Caching}
 */
export interface QueryCacheConfig {
  /**
   * Enable or disable TanStack Query caching.
   *
   * When set to `false`:
   * - `staleTime` is set to `0` (data is immediately stale)
   * - Every component mount triggers a fresh API request
   * - Useful for debugging or when real-time data is critical
   *
   * @default true
   */
  enabled?: boolean;

  /**
   * Time in milliseconds until cached data is considered stale.
   *
   * While data is fresh (not stale):
   * - Component mounts use cached data without API calls
   * - Background refetches do not occur
   *
   * After data becomes stale:
   * - Cached data is still returned immediately
   * - A background refetch is triggered
   *
   * @default 30000 (30 seconds)
   */
  staleTime?: number;

  /**
   * Time in milliseconds until inactive cached data is garbage collected.
   *
   * When a query has no active observers (no mounted components using it):
   * - Data remains in cache for this duration
   * - After this time, data is removed from memory
   *
   * Should be greater than or equal to `staleTime`.
   *
   * @default 60000 (60 seconds)
   */
  gcTime?: number;

  /**
   * Whether to automatically refetch queries when the browser window regains focus.
   *
   * - `false`: No refetch on window focus (default, less aggressive)
   * - `true`: Refetch if data is stale when window regains focus
   * - `'always'`: Always refetch on window focus, regardless of stale state
   *
   * @default false
   */
  refetchOnWindowFocus?: boolean | 'always';
}
