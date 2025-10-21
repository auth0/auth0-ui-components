import type {
  ProviderConfigureFieldsMessages,
  ProviderDetailsMessages,
} from './sso-provider-create-types';
import type { SsoProvideDeleteMessages } from './sso-provider-delete-types';

export interface SsoProvideEditMessages {
  delete?: SsoProvideDeleteMessages;
}

export interface SsoProviderDetailsMessages {
  save_button_label?: string;
  provider_details?: ProviderDetailsMessages;
  provider_configure?: ProviderConfigureFieldsMessages;
}
