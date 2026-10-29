/**
 * Domain configure modal types.
 * @module domain-configure-types
 */

import type {
  ComponentStyling,
  Domain,
  DomainConfigureMessages,
  DomainManagementPermissions,
  IdentityProviderAssociatedWithDomain,
} from '@auth0/universal-components-core';

import type { DomainTableClasses } from './domain-table-types';

/** Props for DomainConfigureProvidersModal. */
export interface DomainConfigureProvidersModalProps {
  styling?: ComponentStyling<DomainTableClasses>;
  customMessages?: Partial<DomainConfigureMessages>;
  isOpen: boolean;
  isLoading: boolean;
  /** Whether an assign or remove request is in progress. */
  isSaving?: boolean;
  /** @deprecated No longer used; the modal uses a single provider field. Use `isSaving`. */
  isLoadingSwitch?: boolean;
  permissions: DomainManagementPermissions;
  domain: Domain | null;
  providers: IdentityProviderAssociatedWithDomain[];
  onClose: () => void;
  /** Called on Save with the provider selected for an unassigned domain. */
  onAssign: (domain: Domain, provider: IdentityProviderAssociatedWithDomain) => void;
  /** Called when an assigned provider is removed from the domain. */
  onRemove: (domain: Domain, provider: IdentityProviderAssociatedWithDomain) => void;
  /** @deprecated No longer called; use `onAssign` and `onRemove`. */
  onToggleSwitch?: (
    domain: Domain,
    provider: IdentityProviderAssociatedWithDomain,
    enable: boolean,
  ) => void;
  onOpenProvider?: (provider: IdentityProviderAssociatedWithDomain) => void;
  onCreateProvider?: () => void;
}
