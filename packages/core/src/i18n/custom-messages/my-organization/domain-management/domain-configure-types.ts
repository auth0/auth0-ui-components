export interface DomainConfigureMessages {
  modal?: {
    title?: string;
    description?: string;
    table?: {
      empty_message?: string;
      columns?: {
        name?: string;
        provider?: string;
      };
      actions?: {
        add_provider_button_text?: string;
        view_provider_button_text?: string;
      };
    };
    actions?: {
      close_button_text?: string;
    };
  };
}
