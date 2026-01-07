import type { SsoDomainTabMessages } from '../sso-domain/sso-domain-tab-types';
import type { SsoProvisioningTabMessages } from '../sso-provisioning/sso-provisioning-tab-types';

import type {
  ProviderConfigureFieldsMessages,
  ProviderDetailsMessages,
} from './sso-provider-create-types';
import type {
  SsoProvideDeleteMessages,
  SsoProvideRemoveMessages,
} from './sso-provider-delete-types';

export interface SsoProviderEditMessages {
  header?: {
    back_button_text?: string;
    enable_provider_tooltip_text?: string;
    disable_provider_tooltip_text?: string;
  };
  tabs?: {
    sso?: {
      name?: string;
      content?: SsoProviderTabMessages;
    };
    provisioning?: {
      name?: string;
      content?: SsoProvisioningTabMessages;
    };
    domains?: {
      name?: string;
      content?: SsoDomainTabMessages;
    };
  };
}

export interface SsoProviderTabMessages {
  alert?: {
    warning: string;
    error: string;
  };
  delete?: SsoProvideDeleteMessages;
  remove?: SsoProvideRemoveMessages;
  details?: SsoProviderDetailsMessages;
  description?: string;
}

export interface SsoProviderDetailsMessages {
  submit_button_label?: string;
  unsaved_changes_text?: string;
  details_fields?: ProviderDetailsMessages;
  configure_fields?: ProviderConfigureFieldsMessages;
  mappings?: SsoProviderAttributeMappingsMessages;
}

export interface SsoProviderNotificationMessages {
  delete_success?: string;
  remove_success?: string;
  update_success?: string;
  general_error?: string;
  provisioning_disabled_success?: string;
  scim_token_delete_sucess?: string;
}

export interface AttributeMappingSectionMessages {
  title?: string;
  description?: string;
  table?: {
    columns?: {
      attribute_name_label?: string;
      external_field_label?: string;
    };
    tags?: {
      changed?: string;
      removed?: string;
      new?: string;
    };
  };
}

export interface SsoProviderAttributeMappingsMessages {
  title?: string;
  description?: string;
  description_provider_tab?: string;
  external_namespace?: {
    label?: string;
  };
  required?: AttributeMappingSectionMessages;
  optional?: AttributeMappingSectionMessages;
}
