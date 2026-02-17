import type { MfaRequiredError } from './step-up-types';

/**
 * Type guard to check if an error is an MFA required error.
 */
export function isMfaRequiredError(error: unknown): error is MfaRequiredError {
  if (typeof error !== 'object' || error === null) return false;

  const err = error as Record<string, unknown>;

  // Check if error properties are at the root level
  if (err.error === 'mfa_required' || err.code === 'mfa_required') {
    return true;
  }

  // Check if error properties are nested in a body property (API error structure)
  if (err.body && typeof err.body === 'object' && err.body !== null) {
    const body = err.body as Record<string, unknown>;
    return body.error === 'mfa_required' || body.code === 'mfa_required';
  }

  return false;
}
