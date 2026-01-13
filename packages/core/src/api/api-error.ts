import type { ApiError } from './api-types';

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
 * Type guard to check if an error has a structured API error body.
 *
 * @param error - The unknown value to test
 * @returns `true` if the error has a body property with optional detail, title, status, or type fields
 */
export function hasApiErrorBody(
  error: unknown,
): error is { body?: { detail?: string; title?: string; status?: number; type?: string } } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'body' in error &&
    typeof error.body === 'object' &&
    error.body !== null
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

/**
 * Extracts the HTTP status code from an unknown error object.
 *
 * This function checks multiple common locations where status codes may be stored:
 * - `error.status`
 * - `error.statusCode`
 * - `error.response.status`
 * - `error.body.status`
 *
 * @param error - The unknown error to extract the status code from
 * @returns The HTTP status code if found, otherwise `undefined`
 */
export function getStatusCode(error: unknown): number | undefined {
  return typeof error === 'object' && error !== null
    ? [
        (error as { status?: unknown }).status,
        (error as { statusCode?: unknown }).statusCode,
        (error as { response?: { status?: unknown } }).response?.status,
        (error as { body?: { status?: unknown } }).body?.status,
      ].find((s) => typeof s === 'number')
    : undefined;
}
