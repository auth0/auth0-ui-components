/**
 * Interface for MFA messages that can be used in the UI.
 */
export interface MFAMessages {
  title?: string;
  description?: string;
  no_active_mfa?: string;
  enroll?: string;
  delete?: string;
  enabled?: string;
  enrolled?: string;
  enroll_factor?: string;
  remove_factor?: string;
  delete_mfa_title?: string;
  delete_mfa_content?: string;
  cancel?: string;
  continue: string;
  deleting?: string;
  submit?: string;
  back?: string;
  enrollment?: string;
  confirmation?: string;
  sms?: MFAFactorContent;
  'push-notification'?: MFAFactorContent;
  otp?: MFAFactorContent;
  email?: MFAFactorContent;
  duo?: MFAFactorContent;
  'webauthn-roaming'?: MFAFactorContent;
  'webauthn-platform'?: MFAFactorContent;
  'recovery-code'?: MFAFactorContent;
  errors?: {
    factors_loading_error?: string;
    delete_factor?: string;
    failed?: string;
  };
  'component_error_title?': string;
  component_error_description?: string;
  actions?: string;
  remove?: string;
  'app-store'?: string;
  'google-play'?: string;
  loading?: string;
  enrollment_form?: MFAEnrollmentForm;
  confirm?: string;
  delete_mfa_phone_consent?: string;
  'delete_mfa_push-notification_consent'?: string;
  delete_mfa_totp_consent?: string;
  delete_mfa_email_consent?: string;
  'delete_mfa_recovery-code_consent'?: string;
}

export interface MFAFactorContent {
  title: string;
  description: string;
  'button-text'?: string;
}

export interface MFAEnrollmentForm {
  enroll_email_description?: string;
  enroll_sms_description?: string;
  email_address?: string;
  phone_number?: string;
  enroll_email_placeholder?: string;
  enroll_sms_placeholder?: string;
  show_otp?: MFAShowOTP;
  show_auth0_guardian_title?: string;
  recovery_code_description?: string;
  enroll_title?: string;
}

export interface MFAShowOTP {
  enter_opt_code?: string;
  enter_verify_code?: string;
  one_time_passcode?: string;
  verifying?: string;
  qr_code_description?: string;
  title?: string;
}
