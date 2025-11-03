/**
 * Type guard to check if an error has a structured API error body
 */
export function hasApiErrorBody(
  error: unknown,
): error is { body?: { detail?: string; title?: string; status?: number } } {
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
    resolver?: (code: number) => string | undefined | null;
    fallbackMessage?: string;
  },
): Error {
  if (hasApiErrorBody(error)) {
    const code = error.body?.status;
    if (typeof code === 'number' && options?.resolver) {
      const resolved = options.resolver(code);
      if (resolved) return new Error(resolved);
    }
    return new Error(error.body?.detail ?? options?.fallbackMessage ?? 'Unknown API error');
  }

  return new Error(options?.fallbackMessage ?? 'An unknown error occurred');
}

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
