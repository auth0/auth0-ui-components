/**
 * MFA enrollment flow constants.
 * @module mfa-constants
 * @internal
 */

export const GUARDIAN_APP_STORE_URL = 'https://apps.apple.com/us/app/auth0-guardian/id1093447833';
export const GUARDIAN_PLAY_STORE_URL =
  'https://play.google.com/store/apps/details?id=com.auth0.guardian';

export const ENTER_OTP = 'enterOtp';
export const ENTER_QR = 'showQr';
export const ENTER_CONTACT = 'enterContact';

export const ENROLL = 'enroll';
export const CONFIRM = 'confirm';

export const QR_PHASE_INSTALLATION = 'installation';
export const QR_PHASE_SCAN = 'scan';
export const QR_PHASE_ENTER_OTP = 'enter-otp';
export const SHOW_RECOVERY_CODE = 'showRecovery';
