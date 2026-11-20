/**
 * Domain management constants.
 * @module domain-management-constants
 * @internal
 */
import type { IdpDomainVerificationMode } from '../config/config-types';

export const DOMAIN_VERIFICATION_MODES = {
  NONE: 'none',
  OPTIONAL: 'optional',
  REQUIRED: 'required',
} as const satisfies Record<string, IdpDomainVerificationMode>;

/** The API reports `optional` when the mode isn't configured. */
export const DEFAULT_DOMAIN_VERIFICATION_MODE: IdpDomainVerificationMode =
  DOMAIN_VERIFICATION_MODES.OPTIONAL;
