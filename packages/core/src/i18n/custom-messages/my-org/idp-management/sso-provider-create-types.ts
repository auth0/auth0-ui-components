/**
 * Interface for SSO Provider Select messages that can be used in the UI.
 */

export interface SsoProviderSelectMessages {
  title?: string;
  description?: string;
}

export interface SsoProviderDetailsMessages {
  title?: string;
  description?: string;
  fields?: {
    name?: {
      label?: string;
      placeholder?: string;
      helper_text?: string;
      error?: string;
    };
    display_name?: {
      label?: string;
      placeholder?: string;
      helper_text?: string;
      error?: string;
    };
  };
}
