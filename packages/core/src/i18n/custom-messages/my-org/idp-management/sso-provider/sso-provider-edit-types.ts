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
}

export interface SsoProviderDetailsMessages {
  submit_button_label?: string;
  unsaved_changes_text?: string;
  details_fields?: ProviderDetailsMessages;
  configure_fields?: ProviderConfigureFieldsMessages;
}

export interface SsoProviderNotificationMessages {
  delete_success?: string;
  remove_success?: string;
  update_success?: string;
  general_error?: string;
  provisioning_disabled_success?: string;
  scim_token_delete_sucess?: string;
}
