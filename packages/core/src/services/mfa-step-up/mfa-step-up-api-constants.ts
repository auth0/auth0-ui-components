export const MFA_REQUIRED_ERROR = 'mfa_required';

export const FACTOR_TYPE_OTP = 'otp';
export const FACTOR_TYPE_SMS = 'sms';
export const FACTOR_TYPE_PUSH = 'push';
export const FACTOR_TYPE_VOICE = 'voice';

export const FACTOR_TYPE_ALIASES: Record<string, string> = {
  phone: FACTOR_TYPE_SMS,
  'push-notification': FACTOR_TYPE_PUSH,
  totp: FACTOR_TYPE_OTP,
};
