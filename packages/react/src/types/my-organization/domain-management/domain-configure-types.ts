/**
 * Domain configure modal types.
 * @module domain-configure-types
 */

import type {
  ComponentStyling,
  Domain,
  DomainConfigureMessages,
  IdentityProviderAssociatedWithDomain,
} from '@auth0/universal-components-core';

import type { DomainTableClasses } from './domain-table-types';

/** Props for DomainConfigureProvidersModal. */
export interface DomainConfigureProvidersModalProps {
  styling?: ComponentStyling<DomainTableClasses>;
  customMessages?: Partial<DomainConfigureMessages>;
  isOpen: boolean;
  isLoading: boolean;
  isLoadingSwitch: boolean;
  domain: Domain | null;
  providers: IdentityProviderAssociatedWithDomain[];
  onClose: () => void;
  onToggleSwitch: (
    domain: Domain,
    provider: IdentityProviderAssociatedWithDomain,
    enable: boolean,
  ) => void;
  onOpenProvider?: (provider: IdentityProviderAssociatedWithDomain) => void;
  onCreateProvider?: () => void;
}
