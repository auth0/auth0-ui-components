import type {
  SharedComponentProps,
  SsoProvideDeleteMessages,
  SsoProviderDeleteModalContentMessages,
  IdentityProvider,
  SsoProviderDeleteSchema,
  SsoProvideRemoveMessages,
} from '@auth0/web-ui-components-core';

export interface SsoProviderDeleteClasses {
  'ProviderDelete-root'?: string;
}
export interface SsoProviderRemoveClasses {
  'ProviderRemove-root'?: string;
}
export interface SsoProviderDeleteModalContentProps
  extends SharedComponentProps<SsoProviderDeleteModalContentMessages, SsoProviderDeleteClasses> {
  onChange: (value: string) => void;
  className?: string;
}

export interface SsoProviderDeleteProps
  extends SharedComponentProps<
    SsoProvideDeleteMessages,
    SsoProviderDeleteClasses,
    SsoProviderDeleteSchema
  > {
  provider: IdentityProvider;
  onDelete: (provider: IdentityProvider) => Promise<void>;
  isLoading?: boolean;
}

export interface SsoProviderDeleteModalProps
  extends SharedComponentProps<
    SsoProvideDeleteMessages,
    SsoProviderDeleteClasses,
    SsoProviderDeleteSchema
  > {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  provider: IdentityProvider;
  onDelete: (provider: IdentityProvider) => Promise<void>;
  isLoading?: boolean;
}

export interface SsoProviderRemoveFromOrgProps
  extends SharedComponentProps<
    SsoProvideRemoveMessages,
    SsoProviderRemoveClasses,
    SsoProviderDeleteSchema
  > {
  provider: IdentityProvider;
  organizationName: string | undefined;
  onRemove: (provider: IdentityProvider) => Promise<void>;
  isLoading?: boolean;
}

export interface SsoProviderRemoveFromOrgModalProps
  extends SharedComponentProps<
    SsoProvideRemoveMessages,
    SsoProviderRemoveClasses,
    SsoProviderDeleteSchema
  > {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  provider: IdentityProvider;
  organizationName?: string;
  onRemove: (provider: IdentityProvider) => Promise<void>;
  isLoading?: boolean;
}
