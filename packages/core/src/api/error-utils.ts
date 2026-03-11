/**
 * Error utilities for filtering and extracting error information.
 * @module error-utils
 */

import { isMfaRequiredError } from '../services/mfa-step-up/mfa-step-up-api-utils';

import { hasApiErrorBody, getStatusCode } from './api-error';

/**
 * Determines whether an error should be surfaced to the user.
 * Returns `false` for MFA step-up errors and server errors (5xx) as these
 * are handled by a GateKeeper layer.
 *
 * @param error - The unknown error to evaluate.
 * @returns `true` if the error should be shown to the user; otherwise `false`.
 */
export function isNotifiableError(error: unknown): boolean {
  if (!error) return false;

  if (isMfaRequiredError(error)) return false;

  const statusCode = getStatusCode(error);
  return !(statusCode && statusCode >= 500);
}

/**
 * Extracts a human-readable message from an unknown error.
 * Resolution order:
 * 1. `error.body.detail` (structured API error)
 * 2. `error.message` (Error instance)
 * 3. `error` itself (string)
 * 4. `fallback`
 *
 * @param error - The unknown error to extract a message from.
 * @param fallback - Message to return when no other message can be extracted.
 * @returns A human-readable error message string.
 */
export function resolveErrorMessage(error: unknown, fallback: string): string {
  if (hasApiErrorBody(error) && error.body?.detail) return error.body.detail;
  if (error instanceof Error) return error.message;
  if (typeof error === 'string') return error;
  return fallback;
}
