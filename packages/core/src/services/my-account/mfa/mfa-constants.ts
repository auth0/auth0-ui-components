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
/** @internal */
export const FACTOR_TYPE_WEBAUTHN_ROAMING = 'webauthn-roaming';
/** @internal */
export const FACTOR_TYPE_WEBAUTHN_PLATFORM = 'webauthn-platform';

export const mfaQueryKeys = {
  all: ['mfa'] as const,
  factors: (onlyActive: boolean) => [...mfaQueryKeys.all, 'factors', { onlyActive }] as const,
};

export const mfaStepUpQueryKeys = {
  all: ['mfa-step-up'] as const,
  enrollmentFactors: (mfaToken: string) =>
    [...mfaStepUpQueryKeys.all, 'enrollment-factors', mfaToken] as const,
  authenticators: (mfaToken: string) =>
    [...mfaStepUpQueryKeys.all, 'authenticators', mfaToken] as const,
};
