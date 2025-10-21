/**
 * Interface for SSO Provider Select messages that can be used in the UI.
 */
export interface ProviderSelectMessages {
  title?: string;
  description?: string;
}

export interface ProviderDetailsMessages {
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

/**
 * Interface for provider configuration field messages
 */
export interface ProviderConfigureFieldsMessages {
  okta?: {
    domain?: {
      label?: string;
      placeholder?: string;
      helper_text?: string;
      error?: string;
    };
    client_id?: {
      label?: string;
      placeholder?: string;
      helper_text?: string;
      error?: string;
    };
    client_secret?: {
      label?: string;
      placeholder?: string;
      helper_text?: string;
      error?: string;
    };
    icon_url?: {
      label?: string;
      placeholder?: string;
      helper_text?: string;
      error?: string;
    };
    callback_url?: {
      label?: string;
      placeholder?: string;
      helper_text?: string;
      error?: string;
    };
  };

  adfs?: {
    meta_data_source?: {
      label?: string;
      helper_text?: string;
      options?: {
        meta_data_url?: {
          label?: string;
        };
        meta_data_file?: {
          label?: string;
        };
      };
    };
    meta_data_url?: {
      label?: string;
      placeholder?: string;
      helper_text?: string;
      error?: string;
    };
    meta_data_location_url?: {
      label?: string;
      placeholder?: string;
      helper_text?: string;
      error?: string;
    };
    federation_meta_data_file?: {
      label?: string;
      placeholder?: string;
      helper_text?: string;
      error?: string;
    };
    upload_button_label?: string;
  };

  'google-apps'?: {
    domain?: {
      label?: string;
      placeholder?: string;
      helper_text?: string;
      error?: string;
    };
    client_id?: {
      label?: string;
      placeholder?: string;
      helper_text?: string;
      error?: string;
    };
    client_secret?: {
      label?: string;
      placeholder?: string;
      helper_text?: string;
      error?: string;
    };
    icon_url?: {
      label?: string;
      placeholder?: string;
      helper_text?: string;
      error?: string;
    };
    callback_url?: {
      label?: string;
      placeholder?: string;
      helper_text?: string;
      error?: string;
    };
  };

  oidc?: {
    type?: {
      label?: string;
      helper_text?: string;
      options?: {
        back_channel?: {
          label?: string;
        };
        front_channel?: {
          label?: string;
        };
      };
    };
    client_id?: {
      label?: string;
      placeholder?: string;
      helper_text?: string;
      error?: string;
    };
    client_secret?: {
      label?: string;
      placeholder?: string;
      helper_text?: string;
      error?: string;
    };
    discovery_url?: {
      label?: string;
      placeholder?: string;
      helper_text?: string;
      error?: string;
    };
  };

  pingfederate?: {
    ping_federate_baseurl?: {
      label?: string;
      placeholder?: string;
      helper_text?: string;
      error?: string;
    };
    sign_cert?: {
      label?: string;
      placeholder?: string;
      helper_text?: string;
      error?: string;
    };
    advanced_settings?: {
      title?: string;
      upload_button_label?: string;
      sign_request?: {
        label?: string;
        placeholder?: string;
        helper_text?: string;
        error?: string;
      };
      sign_request_algorithm?: {
        label?: string;
        placeholder?: string;
        helper_text?: string;
        error?: string;
      };
      sign_request_algorithm_digest?: {
        label?: string;
        placeholder?: string;
        helper_text?: string;
        error?: string;
      };
    };
  };

  samlp?: {
    meta_data_source?: {
      label?: string;
      helper_text?: string;
      options?: {
        meta_data_url?: {
          label?: string;
        };
        meta_data_file?: {
          label?: string;
        };
      };
    };
    meta_data_url?: {
      label?: string;
      placeholder?: string;
      helper_text?: string;
      error?: string;
    };
    single_sign_on_login_url?: {
      label?: string;
      placeholder?: string;
      helper_text?: string;
      error?: string;
    };
    cert?: {
      label?: string;
      placeholder?: string;
      helper_text?: string;
      error?: string;
    };
    advanced_settings?: {
      title?: string;
      sign_request?: {
        label?: string;
        placeholder?: string;
        helper_text?: string;
        error?: string;
      };
      request_protocol_binding?: {
        label?: string;
        placeholder?: string;
        helper_text?: string;
        error?: string;
      };
      sign_request_algorithm?: {
        label?: string;
        placeholder?: string;
        helper_text?: string;
        error?: string;
      };
      sign_request_algorithm_digest?: {
        label?: string;
        placeholder?: string;
        helper_text?: string;
        error?: string;
      };
    };
  };

  waad?: {
    tenant_domain?: {
      label?: string;
      placeholder?: string;
      helper_text?: string;
      error?: string;
    };
    client_id?: {
      label?: string;
      placeholder?: string;
      helper_text?: string;
      error?: string;
    };
    client_secret?: {
      label?: string;
      placeholder?: string;
      helper_text?: string;
      error?: string;
    };
    icon_url?: {
      label?: string;
      placeholder?: string;
      helper_text?: string;
      error?: string;
    };
    callback_url?: {
      label?: string;
      placeholder?: string;
      helper_text?: string;
      error?: string;
    };
  };
}

/**
 * Interface for provider configuration messages
 */
export interface ProviderConfigureMessages {
  title?: string;
  description?: string;
  guided_setup_button_text?: string;
  fields?: ProviderConfigureFieldsMessages;
}

export interface SsoProviderCreateMessages {
  header?: {
    title?: string;
    back_button_text?: string;
  };
  provider_select?: ProviderSelectMessages;
  provider_details?: ProviderDetailsMessages;
  provider_configure?: ProviderConfigureMessages;
  notifications?: {
    general_error?: string;
    provider_create_success?: string;
  };
}
