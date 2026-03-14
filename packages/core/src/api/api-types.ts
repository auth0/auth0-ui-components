/**
 * API type definitions for standardized error handling.
 * @module api-types
 * @internal
 */

/**
 * Represents a standardized API error shape.
 * @internal
 */
export interface ApiError {
  readonly name: 'ApiError';
  readonly message: string;
  readonly status: number;
  readonly data?: {
    error?: string;
    [key: string]: unknown;
  };
}

/**
 * Fetcher function passed to SDK clients to handle auth and header injection per request.
 * @internal
 */
export type ServiceFetcher = (
  url: string,
  init?: RequestInit,
  authParams?: { scope?: string[]; audience?: string },
) => Promise<Response>;
