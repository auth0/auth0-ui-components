import { MFA_REQUIRED_ERROR } from './mfa-step-up-api-constants';
import type { MfaRequiredError } from './mfa-step-up-api-types';

/**
 * Type guard for Auth0 `mfa_required` errors (direct or nested under `body`).
 *
 * @param error - The caught error value to inspect.
 * @returns Whether the error is an {@link MfaRequiredError}.
 */
export function isMfaRequiredError(error: unknown): error is MfaRequiredError {
  if (!error || typeof error !== 'object') return false;

  if (hasMfaCode(error)) return true;

  const body = 'body' in error ? error.body : undefined;
  return !!body && typeof body === 'object' && hasMfaCode(body);
}

/**
 * @param obj - Target object.
 * @returns Whether it signals `mfa_required`.
 */
function hasMfaCode(obj: object): boolean {
  return (
    ('error' in obj && obj.error === MFA_REQUIRED_ERROR) ||
    ('code' in obj && obj.code === MFA_REQUIRED_ERROR)
  );
}
