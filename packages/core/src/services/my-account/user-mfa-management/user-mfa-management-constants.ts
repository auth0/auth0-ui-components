/**
 * MFA factor type constants.
 * @module mfa-constants
 * @internal
 */

/** @internal */
export const FACTOR_TYPE_EMAIL = 'email';
/** @internal */
export const FACTOR_TYPE_PHONE = 'phone';
/** @internal */
export const FACTOR_TYPE_PUSH_NOTIFICATION = 'push-notification';
/** @internal */
export const FACTOR_TYPE_TOTP = 'totp';
/** @internal */
export const FACTOR_TYPE_RECOVERY_CODE = 'recovery-code';

export const mfaQueryKeys = {
  all: ['mfa'] as const,
  factors: (onlyActive: boolean) => [...mfaQueryKeys.all, 'factors', { onlyActive }] as const,
};
