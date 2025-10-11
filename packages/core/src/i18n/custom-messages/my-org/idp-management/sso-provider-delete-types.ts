export interface SsoProviderDeleteModalContentMessages {
  description?: string;
  field: {
    label?: string;
    placeholder?: string;
  };
}

export interface SsoProvideDeleteMessages {
  title?: string;
  description?: string;
  delete_button_label?: string;
  modal?: {
    title?: string;
    description?: string;
    modal_content: SsoProviderDeleteModalContentMessages;
    actions?: {
      cancel_button_label?: string;
      delete_button_label?: string;
    };
  };
}
