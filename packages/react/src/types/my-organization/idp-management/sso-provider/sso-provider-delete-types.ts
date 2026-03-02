/**
 * SSO provider delete types.
 * @module sso-provider-delete-types
 */

import type {
  SharedComponentProps,
  SsoProvideDeleteMessages,
  SsoProviderDeleteModalContentMessages,
  IdentityProvider,
  SsoProviderDeleteSchema,
  SsoProvideRemoveMessages,
} from '@auth0/universal-components-core';

/** CSS classes for SsoProviderDelete. */
export interface SsoProviderDeleteClasses {
  'ProviderDelete-root'?: string;
}

/** CSS classes for SsoProviderRemove. */
export interface SsoProviderRemoveClasses {
  'ProviderRemove-root'?: string;
}

/** Props for SsoProviderDeleteModalContent. */
export interface SsoProviderDeleteModalContentProps
  extends SharedComponentProps<SsoProviderDeleteModalContentMessages, SsoProviderDeleteClasses> {
  onChange: (value: string) => void;
  className?: string;
}

/** Props for SsoProviderDelete component. */
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

/** Props for SsoProviderDeleteModal. */
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

/** Props for SsoProviderRemoveFromOrganization. */
export interface SsoProviderRemoveFromOrganizationProps
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

export interface SsoProviderRemoveFromOrganizationModalProps
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
