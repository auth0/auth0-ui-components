import type { MfaRequiredError } from './step-up-types';

/**
 * Type guard to check if an error is an MFA required error.
 */
export function isMfaRequiredError(error: unknown): error is MfaRequiredError {
  if (typeof error !== 'object' || error === null) return false;

  const err = error as Record<string, unknown>;
  return err.error === 'mfa_required' || err.code === 'mfa_required';
}
