/**
 * Interface for MFA messages that can be used in the UI.
 */
export interface MFAMessages {
  title?: string;
  description?: string;
  no_active_mfa?: string;
  enroll?: string;
  delete?: string;
  enrolled?: string;
  enroll_factor?: string;
  remove_factor?: string;
  delete_mfa_title?: string;
  delete_mfa_content?: string;
  cancel?: string;
  deleting?: string;
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
}

export interface MFAFactorContent {
  title: string;
  description: string;
}
