/**
 * MFA Factor Type Constants
 *
 * These constants define the supported MFA factor types that can be used
 * throughout the application for enrollment, confirmation, and validation.
 */

export const FACTOR_TYPE_EMAIL = 'email';
export const FACTOR_TYPE_SMS = 'sms';
export const FACTOR_TYPE_OTP = 'otp';
export const FACTOR_TYPE_PUSH_NOTIFICATION = 'push-notification';
export const FACTOR_TYPE_TOPT = 'totp';

/**
 * Array of all supported MFA factor types for validation and iteration
 */
export const SUPPORTED_FACTOR_TYPES = [
  FACTOR_TYPE_EMAIL,
  FACTOR_TYPE_SMS,
  FACTOR_TYPE_OTP,
  FACTOR_TYPE_PUSH_NOTIFICATION,
  FACTOR_TYPE_TOPT,
] as const;
