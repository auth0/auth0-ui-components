/**
 * API Error utilities for handling and normalizing API errors.
 * @module api-error
 * @internal
 */

import type { ApiError } from './api-types';

/**
 * Known Auth0 API error type codes returned in `error.body.type`.
 */
export const ERROR_CODES = {
  INSUFFICIENT_SCOPE: 'A0E-403-0002',
};

export const ERROR_CODE_TRANSLATION_KEYS: Record<string, string> = {
  invalid_phone_number: 'invalid_phone_number',
  invalid_code: 'invalid_code',
};

/**
 * Type guard to determine if a given value is an ApiError.
 * @internal
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
 * @internal
 *
 * @param error - The unknown value to test
 * @returns `true` if the error has a body property with optional detail, title, status, or type fields, `false` otherwise
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
 * Normalizes an unknown thrown value into a standard Error.
 * @internal
 *
 * Tries to resolve a user-friendly message via `resolver` before falling back.
 * Pass `defaultMessage` to show a UI-focused message when no code can be resolved —
 * it replaces the raw API message so the user never sees internal error details.
 *
 * @param error - The unknown value to normalize.
 * @param options - Normalization options.
 * @param options.resolver - Maps an error code to a user-facing message.
 * @param options.defaultMessage - UI-friendly message shown when no code resolves.
 * @returns A standard Error with an appropriate message.
 */
export function normalizeError(
  error: unknown,
  options?: {
    resolver?: (code: string) => string | undefined | null;
    defaultMessage?: string;
  },
): Error {
  const { defaultMessage, resolver: resolve } = options ?? {};

  if (typeof error === 'string') return new Error(error);

  if (isApiError(error)) {
    const code = error.data?.error;
    const resolved = typeof code === 'string' ? resolve?.(code) : undefined;
    return new Error(resolved ?? defaultMessage ?? error.message);
  }

  if (hasApiErrorBody(error)) {
    const body = error.body as { error?: string; detail?: string } | undefined;
    const resolved = [body?.error, body?.detail]
      .filter((c): c is string => !!c)
      .map((c) => resolve?.(c))
      .find(Boolean);
    const detail = body?.detail;
    return new Error(
      resolved ?? defaultMessage ?? (detail && detail.charAt(0).toUpperCase() + detail.slice(1)),
    );
  }

  if (error instanceof Error) return error;

  return new Error(defaultMessage);
}

/**
 * Extracts the HTTP status code from an unknown error object.
 * @internal
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
