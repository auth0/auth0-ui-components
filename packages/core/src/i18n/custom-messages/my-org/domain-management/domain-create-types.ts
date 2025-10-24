export interface DomainCreateMessages {
  modal: {
    title?: string;
    field?: {
      label?: string;
      placeholder?: string;
      error?: string;
    };
    actions?: {
      cancel_button_text?: string;
      create_button_text?: string;
    };
  };
}
