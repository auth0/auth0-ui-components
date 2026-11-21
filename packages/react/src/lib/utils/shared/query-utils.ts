/**
 * Shared helpers for the configuration query hooks.
 * @module query-utils
 * @internal
 */

import { hasApiErrorBody } from '@auth0/universal-components-core';
import type { QueryClient } from '@tanstack/react-query';

/**
 * Whether an error is an API 404.
 * @param error - Error thrown by a request.
 * @returns `true` for a 404 response.
 */
export function isNotFoundError(error: unknown): boolean {
  if (typeof error === 'object' && error !== null && 'statusCode' in error) {
    return error.statusCode === 404;
  }
  return hasApiErrorBody(error) && error.body?.status === 404;
}

/**
 * Query `retry` option that never retries a 404 and otherwise defers to the provider-level default.
 * @param queryClient - Query client holding the default `retry` option.
 * @returns A `retry` function for `useQuery`.
 */
export function createRetryUnlessNotFound(queryClient: QueryClient) {
  return (failureCount: number, error: Error): boolean => {
    if (isNotFoundError(error)) return false;
    const defaultRetry = queryClient.getDefaultOptions().queries?.retry;
    return typeof defaultRetry === 'function' ? defaultRetry(failureCount, error) : false;
  };
}

/**
 * Resolves a request, turning a 404 into `null` and rethrowing any other error.
 * @param request - Pending request.
 * @returns The response, or `null` when the resource doesn't exist.
 */
export async function nullOnNotFound<T>(request: PromiseLike<T>): Promise<T | null> {
  try {
    return await request;
  } catch (error) {
    if (isNotFoundError(error)) return null;
    throw error;
  }
}
