export interface DomainTableMessages {
  header?: {
    title?: string;
    description?: string;
    create_button_text?: string;
  };
  table?: {
    empty_message?: string;
    columns?: {
      domain?: string;
      status?: string;
    };
    actions?: {
      configure_button_text?: string;
      view_button_text?: string;
      verify_button_text?: string;
      delete_button_text?: string;
    };
  };
  notifications?: {
    fetch_providers_error?: string;
    fetch_domains_error?: string;
    domain_create_success?: string;
    domain_create_error?: string;
    domain_verify_success?: string;
    domain_verify_error?: string;
    domain_verify_verification_failed?: string;
    domain_delete_success?: string;
    domain_delete_error?: string;
    domain_associate_provider_success?: string;
    domain_associate_provider_error?: string;
    domain_delete_provider_success?: string;
    domain_delete_provider_error?: string;
  };
}
