import type {
  Domain,
  DomainConfigureMessages,
  IdentityProviderAssociatedWithDomain,
} from '@auth0-web-ui-components/core';

export interface DomainConfigureProvidersModalProps {
  className?: string;
  customMessages?: Partial<DomainConfigureMessages>;
  isOpen: boolean;
  isLoading: boolean;
  isLoadingSwitch: boolean;
  domain: Domain | null;
  providers: IdentityProviderAssociatedWithDomain[];
  onClose: () => void;
  // Enable/disable for selected provider
  onToggleSwitch: (
    domain: Domain,
    provider: IdentityProviderAssociatedWithDomain,
    enable: boolean,
  ) => void;
  // Open selected provider
  onOpenProvider?: (provider: IdentityProviderAssociatedWithDomain) => void;
  // Open create provider wizard
  onCreateProvider?: () => void;
}
