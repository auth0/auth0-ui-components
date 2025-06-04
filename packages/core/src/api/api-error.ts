/**
 * Represents a standardized API error shape.
 */
export interface ApiError {
  readonly name: 'ApiError';
  readonly message: string;
  readonly status: number;
  readonly data?: unknown;
  readonly cause?: unknown;
}

/**
 * Creates an ApiError object to represent failed API calls.
 *
 * @param message - Human-readable error message.
 * @param status - HTTP status code from the response.
 * @param data - Optional raw response data from the server.
 * @param cause - Optional underlying error or context.
 * @returns A structured ApiError object.
 */
export function createApiError(
  message: string,
  status: number,
  data?: unknown,
  cause?: unknown,
): ApiError {
  return { name: 'ApiError', message, status, data, cause };
}

/**
 * Type guard to check if a value is an ApiError.
 *
 * @param error - The value to check.
 * @returns `true` if the value conforms to ApiError, `false` otherwise.
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
