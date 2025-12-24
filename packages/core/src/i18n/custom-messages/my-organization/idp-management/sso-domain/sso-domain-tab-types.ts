export interface DomainTabCreateMessages {
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

export interface DomainTabDeleteMessages {
  modal: {
    title?: string;
    description?: {
      pending?: string;
      verified?: string;
    };
    actions?: {
      cancel_button_text?: string;
      create_button_text?: string;
    };
  };
}

export interface DomainTabVerifyMessages {
  modal: {
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
    errors: {
      verification_failed: string;
    };
  };
}

export interface SsoDomainTabMessages {
  title?: string;
  description?: string;
  create_button_text?: string;
  table?: {
    empty_message?: string;
    columns?: {
      name?: string;
      status?: string;
      verify?: string;
    };
    domain_statuses?: {
      pending?: string;
      verified?: string;
      failed?: string;
    };
  };
  domain_create?: DomainTabCreateMessages;
  domain_verify?: DomainTabVerifyMessages;
  domain_delete?: DomainTabDeleteMessages;
}
