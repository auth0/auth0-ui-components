import type {
  SsoProvideDeleteMessages,
  SsoProviderDeleteModalContentMessages,
} from './sso-provider-delete-types';

export interface SsoProviderTableMessages {
  header?: {
    title?: string;
    description?: string;
    create_button_text?: string;
  };
  table?: {
    empty_message?: string;
    columns?: {
      name?: string;
      identity_provider?: string;
      display_name?: string;
    };
    actions?: {
      edit_button_text?: string;
      delete_button_text?: string;
      remove_button_text?: string;
    };
  };
  create_consent_modal?: {
    title?: string;
    description?: string;
    actions?: {
      cancel_button_text?: string;
      process_button_text?: string;
    };
  };
  delete_modal?: SsoProvideDeleteMessages;
  remove_modal?: {
    title?: string;
    description?: string;
    model_content?: SsoProviderDeleteModalContentMessages;
    actions?: {
      cancel_button_text?: string;
      remove_button_text?: string;
    };
  };
  notifications?: {
    general_error?: string;
    fetch_providers_error?: string;
    fetch_domains_error?: string;
    domain_create?: {
      success?: string;
      error?: string;
      on_before?: string;
    };
    domain_verify?: {
      success?: string;
      error?: string;
      on_before?: string;
      verification_failed?: string;
    };
    domain_delete?: {
      success?: string;
      error?: string;
    };
    domain_associate_provider?: {
      success?: string;
      error?: string;
      on_before?: string;
    };
    domain_delete_provider?: {
      success?: string;
      error?: string;
      on_before?: string;
    };
  };
}
