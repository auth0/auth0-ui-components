/**
 * Custom message type definitions for the UserMFAManagement component.
 * @module user-mfa-types
 * @internal
 */

import type { UserMfaDeleteMessages } from './user-mfa-delete-types';
import type { UserMfaEnrollmentMessages } from './user-mfa-enrollment-types';
import type {
  UserMfaFactorListItemMessages,
  UserMfaErrorMessages,
} from './user-mfa-factors-list-types';

export interface UserMfaManagementMessages {
  header?: {
    title?: string;
    description?: string;
  };
  no_active_mfa?: string;
  loading_text?: string;
  component_error?: {
    title?: string;
    description?: string;
  };

  actions?: {
    remove_button_label?: string;
    cancel_button_label?: string;
    confirm_button_label?: string;
    continue_button_label?: string;
    submit_button_label?: string;
    verify_button_label?: string;
    back_button_label?: string;
    deleting_button_text?: string;
    menu_aria_label?: string;
  };

  factors?: {
    meta?: {
      enabled?: string;
      created_at?: string;
      last_used?: string;
    };
    'push-notification'?: UserMfaFactorListItemMessages;
    phone?: UserMfaFactorListItemMessages;
    email?: UserMfaFactorListItemMessages;
    totp?: UserMfaFactorListItemMessages;
    'webauthn-roaming'?: UserMfaFactorListItemMessages;
    'webauthn-platform'?: UserMfaFactorListItemMessages;
    'recovery-code'?: UserMfaFactorListItemMessages;
  };

  notifications?: {
    factor_enroll_success?: string;
    factor_remove_success?: string;
    fetch_factors_error?: string;
    factor_delete_error?: string;
  };

  errors?: UserMfaErrorMessages;
  enrollment?: UserMfaEnrollmentMessages;
  remove_factor_dialog?: UserMfaDeleteMessages;
}
