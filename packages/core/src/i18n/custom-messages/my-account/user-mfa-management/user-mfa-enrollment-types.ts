/**
 * Custom message type definitions for MFA enrollment and OTP verification forms.
 * @module user-mfa-enrollment-types
 * @internal
 */

export interface UserMfaEnrollmentMessages {
  enrolling_text?: string;
  phone?: {
    title?: string;
    label?: string;
    description?: string;
    placeholder?: string;
    invalid?: string;
  };
  email?: {
    title?: string;
    label?: string;
    description?: string;
    placeholder?: string;
    invalid?: string;
  };
  totp?: {
    scan_title?: string;
    scan_description?: string;
    qr_alt?: string;
  };
  push?: {
    install_title?: string;
    install_description?: string;
    app_store?: string;
    google_play?: string;
    scan_title?: string;
    scan_description?: string;
    qr_alt?: string;
    download_hint?: string;
    download_hint_apple?: string;
    download_hint_google?: string;
  };
  recovery_code?: {
    title?: string;
    description?: string;
    confirmed?: string;
  };
  verify?: UserMfaVerifyMessages;
}

export interface UserMfaVerifyMessages {
  verifying_text?: string;
  resend_prompt?: string;
  resend?: string;
  totp?: {
    title?: string;
    description?: string;
  };
  phone?: {
    title?: string;
    description?: string;
  };
  email?: {
    title?: string;
    description?: string;
  };
}
