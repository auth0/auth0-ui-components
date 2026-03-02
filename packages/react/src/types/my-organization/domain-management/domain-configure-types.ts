/**
 * Domain configure modal types.
 * @module domain-configure-types
 */

import type {
  Domain,
  DomainConfigureMessages,
  IdentityProviderAssociatedWithDomain,
} from '@auth0/universal-components-core';

/** Props for DomainConfigureProvidersModal. */
export interface DomainConfigureProvidersModalProps {
  className?: string;
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
