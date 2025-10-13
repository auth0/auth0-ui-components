/**
 * Schema configuration for Step 1: Provider Selection
 */
export interface ProviderSelectionSchema {
  strategy?: {
    required?: boolean;
    errorMessage?: string;
  };
}

/**
 * Schema configuration for Step 2: Provider Details
 */
export interface ProviderDetailsSchema {
  name?: {
    regex?: RegExp;
    errorMessage?: string;
    minLength?: number;
    maxLength?: number;
    required?: boolean;
  };
  displayName?: {
    regex?: RegExp;
    errorMessage?: string;
    minLength?: number;
    maxLength?: number;
    required?: boolean;
  };
}

/**
 * Schema configuration for Step 3: Provider Configure
 */
export interface ProviderConfigureSchema {
  okta?: {
    domain?: {
      regex?: RegExp;
      errorMessage?: string;
      minLength?: number;
      maxLength?: number;
      required?: boolean;
    };
    client_id?: {
      regex?: RegExp;
      errorMessage?: string;
      minLength?: number;
      maxLength?: number;
      required?: boolean;
    };
    client_secret?: {
      regex?: RegExp;
      errorMessage?: string;
      minLength?: number;
      maxLength?: number;
      required?: boolean;
    };
    icon_url?: {
      regex?: RegExp;
      errorMessage?: string;
      minLength?: number;
      maxLength?: number;
      required?: boolean;
    };
    callback_url?: {
      regex?: RegExp;
      errorMessage?: string;
      minLength?: number;
      maxLength?: number;
      required?: boolean;
    };
  };

  adfs?: {
    meta_data_source?: {
      required?: boolean;
      errorMessage?: string;
    };
    meta_data_location_url?: {
      regex?: RegExp;
      errorMessage?: string;
      minLength?: number;
      maxLength?: number;
      required?: boolean;
    };
    adfs_server?: {
      regex?: RegExp;
      errorMessage?: string;
      minLength?: number;
      maxLength?: number;
      required?: boolean;
    };
    fedMetadataXml?: {
      regex?: RegExp;
      errorMessage?: string;
      minLength?: number;
      maxLength?: number;
      required?: boolean;
    };
  };

  'google-apps'?: {
    domain?: {
      regex?: RegExp;
      errorMessage?: string;
      minLength?: number;
      maxLength?: number;
      required?: boolean;
    };
    client_id?: {
      regex?: RegExp;
      errorMessage?: string;
      minLength?: number;
      maxLength?: number;
      required?: boolean;
    };
    client_secret?: {
      regex?: RegExp;
      errorMessage?: string;
      minLength?: number;
      maxLength?: number;
      required?: boolean;
    };
    icon_url?: {
      regex?: RegExp;
      errorMessage?: string;
      minLength?: number;
      maxLength?: number;
      required?: boolean;
    };
    callback_url?: {
      regex?: RegExp;
      errorMessage?: string;
      minLength?: number;
      maxLength?: number;
      required?: boolean;
    };
  };

  oidc?: {
    type?: {
      regex?: RegExp;
      errorMessage?: string;
      minLength?: number;
      maxLength?: number;
      required?: boolean;
    };
    client_id?: {
      regex?: RegExp;
      errorMessage?: string;
      minLength?: number;
      maxLength?: number;
      required?: boolean;
    };
    client_secret?: {
      regex?: RegExp;
      errorMessage?: string;
      minLength?: number;
      maxLength?: number;
      required?: boolean;
    };
    discovery_url?: {
      regex?: RegExp;
      errorMessage?: string;
      minLength?: number;
      maxLength?: number;
      required?: boolean;
    };
  };

  'ping-federate'?: {
    signatureAlgorithm?: {
      regex?: RegExp;
      errorMessage?: string;
      minLength?: number;
      maxLength?: number;
      required?: boolean;
    };
    digestAlgorithm?: {
      regex?: RegExp;
      errorMessage?: string;
      minLength?: number;
      maxLength?: number;
      required?: boolean;
    };
    signSAMLRequest?: {
      errorMessage?: string;
      required?: boolean;
    };
    metadataUrl?: {
      regex?: RegExp;
      errorMessage?: string;
      minLength?: number;
      maxLength?: number;
      required?: boolean;
    };
    signingCert?: {
      regex?: RegExp;
      errorMessage?: string;
      minLength?: number;
      maxLength?: number;
      required?: boolean;
    };
    idpInitiated?: {
      errorMessage?: string;
      required?: boolean;
    };
    icon_url?: {
      regex?: RegExp;
      errorMessage?: string;
      minLength?: number;
      maxLength?: number;
      required?: boolean;
    };
  };

  samlp?: {
    meta_data_source?: {
      required?: boolean;
      errorMessage?: string;
    };
    single_sign_on_login_url?: {
      required?: boolean;
      errorMessage?: string;
    };
    signatureAlgorithm?: {
      regex?: RegExp;
      errorMessage?: string;
      minLength?: number;
      maxLength?: number;
      required?: boolean;
    };
    digestAlgorithm?: {
      regex?: RegExp;
      errorMessage?: string;
      minLength?: number;
      maxLength?: number;
      required?: boolean;
    };
    protocolBinding?: {
      regex?: RegExp;
      errorMessage?: string;
      minLength?: number;
      maxLength?: number;
      required?: boolean;
    };
    signSAMLRequest?: {
      errorMessage?: string;
      required?: boolean;
    };
    bindingMethod?: {
      regex?: RegExp;
      errorMessage?: string;
      minLength?: number;
      maxLength?: number;
      required?: boolean;
    };
    metadataUrl?: {
      regex?: RegExp;
      errorMessage?: string;
      minLength?: number;
      maxLength?: number;
      required?: boolean;
    };
    cert?: {
      regex?: RegExp;
      errorMessage?: string;
      minLength?: number;
      maxLength?: number;
      required?: boolean;
    };
    idpInitiated?: {
      errorMessage?: string;
      required?: boolean;
    };
    icon_url?: {
      regex?: RegExp;
      errorMessage?: string;
      minLength?: number;
      maxLength?: number;
      required?: boolean;
    };
  };

  waad?: {
    domain?: {
      regex?: RegExp;
      errorMessage?: string;
      minLength?: number;
      maxLength?: number;
      required?: boolean;
    };
    client_id?: {
      regex?: RegExp;
      errorMessage?: string;
      minLength?: number;
      maxLength?: number;
      required?: boolean;
    };
    client_secret?: {
      regex?: RegExp;
      errorMessage?: string;
      minLength?: number;
      maxLength?: number;
      required?: boolean;
    };
    icon_url?: {
      regex?: RegExp;
      errorMessage?: string;
      minLength?: number;
      maxLength?: number;
      required?: boolean;
    };
    callback_url?: {
      regex?: RegExp;
      errorMessage?: string;
      minLength?: number;
      maxLength?: number;
      required?: boolean;
    };
  };
}

//TODO: to update once all the step components are done
export interface SsoProviderSchema {
  name?: {
    regex?: RegExp;
    errorMessage?: string;
    minLength?: number;
    maxLength?: number;
    required?: boolean;
  };
  displayName?: {
    regex?: RegExp;
    errorMessage?: string;
    minLength?: number;
    maxLength?: number;
    required?: boolean;
  };
  strategy?: {
    required?: boolean;
    errorMessage?: string;
  };
}
