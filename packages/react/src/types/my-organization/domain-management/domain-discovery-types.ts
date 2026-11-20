/**
 * Domain discovery modal types.
 * @module domain-discovery-types
 */

import type { Domain, DomainDiscoveryMessages } from '@auth0/universal-components-core';

/** Props for DomainDiscoveryModal. */
export interface DomainDiscoveryModalProps {
  translatorKey?: string;
  className?: string;
  customMessages?: Partial<DomainDiscoveryMessages>;
  domain: Domain | null;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onEnable: (domain: Domain) => void | Promise<void>;
}
