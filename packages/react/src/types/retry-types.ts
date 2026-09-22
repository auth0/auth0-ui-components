/**
 * TanStack Query retry configuration types.
 * @module retry-types
 */

/** Retry configuration for API requests. Use `{ enabled: false }` to disable all retries. */
export interface QueryRetryConfig {
  /** Set to `false` to disable all retries (queries and mutations). Default: true. */
  enabled?: boolean;
  /** Retry behavior for queries (reads). Defaults: 3 retries, exponential backoff. */
  queries?: {
    /** Max retry attempts; 0 disables retries. Default: 3. */
    maxRetries?: number;
    /** Max delay between retries in ms. Default: 30000. */
    maxRetryDelay?: number;
    /** Exponential backoff multiplier. Default: 2. */
    backoffMultiplier?: number;
  };
  /** Retry behavior for mutations (writes). Default: 1 retry. */
  mutations?: {
    /** Max retry attempts; 0 disables retries. Default: 1. */
    maxRetries?: number;
  };
}
