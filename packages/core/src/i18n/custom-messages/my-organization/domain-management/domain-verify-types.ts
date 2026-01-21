export interface DomainVerifyMessages {
  modal?: {
    title?: string;
    txt_record_name?: {
      label?: string;
      description?: string;
    };
    txt_record_content?: {
      label?: string;
      description?: string;
    };
    verification_status?: {
      label?: string;
      description?: string;
      pending?: string;
    };
    actions?: {
      verify_button_text?: string;
      delete_button_text?: string;
      done_button_text?: string;
    };
    errors?: {
      verification_failed?: string;
    };
  };
}
