/**
 * Custom message type definitions for provisioning token component.
 * @module provisioning-token-types
 * @internal
 */
export interface ProvisioningCreateTokenModalContentMessages {
  description?: string;
  field?: {
    label?: string;
  };
}

export interface ProvisioningCreateTokenFormMessages {
  no_expiration?: {
    label?: string;
    helper_text?: string;
  };
  token_lifetime?: {
    label?: string;
    suffix?: string;
    helper_default?: string;
    helper_max?: string;
    helper_min?: string;
    errors?: {
      required?: string;
      integer?: string;
      min?: string;
      max?: string;
    };
  };
  scopes?: {
    label?: string;
    helper_text?: string;
    errors?: {
      required?: string;
    };
  };
}

export interface ProvisioningCreateTokenModalMessages {
  title?: string;
  copy_and_close_button_label?: string;
  next_button_label?: string;
  steps?: {
    configure?: string;
    review?: string;
  };
  fields?: ProvisioningCreateTokenFormMessages;
  content?: ProvisioningCreateTokenModalContentMessages;
}

export interface ProvisioningDeleteTokenModalContentMessages {
  confirmation?: string;
  description?: string;
}

export interface ProvisioningDeleteTokenModalMessages {
  title?: string;
  content?: ProvisioningDeleteTokenModalContentMessages;
}
