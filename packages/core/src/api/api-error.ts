import type { ApiError } from './api-types';

/**
 * Creates an ApiError object to represent a failed API call.
 *
 * @param message - A human-readable error message.
 * @param status - The HTTP status code returned by the API.
 * @param data - Optional raw data from the API response.
 * @returns A structured ApiError object.
 */
export function createApiError(
  message: string,
  status: number,
  data?: Record<string, unknown>,
): ApiError {
  return { name: 'ApiError', message, status, data };
}

/**
 * Type guard to determine if a given value is an ApiError.
 *
 * @param error - The unknown value to test.
 * @returns `true` if the value conforms to the ApiError shape; otherwise, `false`.
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    (error as ApiError).name === 'ApiError' &&
    typeof (error as ApiError).message === 'string' &&
    typeof (error as ApiError).status === 'number'
  );
}

/**
 * Normalizes an unknown error into a standard JavaScript Error instance.
 *
 * This function tries to extract meaningful information from API errors,
 * strings, or other unknown error shapes. You can provide a custom resolver
 * function to map API error codes to user-friendly messages.
 *
 * @param error - The unknown error object or value to normalize.
 * @param options - Optional settings including:
 *   - resolver: A function that maps error codes to user-friendly messages.
 *   - fallbackMessage: A default message used when the error cannot be mapped.
 * @returns A standard Error object with an appropriate message.
 */
export function normalizeError(
  error: unknown,
  options?: {
    resolver?: (code: string) => string | undefined | null;
    fallbackMessage?: string;
  },
): Error {
  if (typeof error === 'string') return new Error(error);
  if (error instanceof Error) return error;

  if (isApiError(error)) {
    const code = error.data?.error;
    if (typeof code === 'string' && options?.resolver) {
      const resolved = options.resolver(code);
      if (resolved) return new Error(resolved);
    }
    return new Error(error.message ?? options?.fallbackMessage ?? 'Unknown API error');
  }

  return new Error(options?.fallbackMessage ?? 'An unknown error occurred');
}
