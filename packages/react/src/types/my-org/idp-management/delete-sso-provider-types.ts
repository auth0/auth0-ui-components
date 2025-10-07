import type {
  SharedComponentProps,
  SsoProviderDeleteModalContentMessages,
} from '@auth0-web-ui-components/core';

export interface SsoProviderDeleteClasses {
  'ProviderDelete-root'?: string;
}

export interface SsoProviderDeleteModalContentProps
  extends SharedComponentProps<SsoProviderDeleteModalContentMessages, SsoProviderDeleteClasses> {
  onChange: (name: string, value: string) => void;
  className?: string;
}
