/**
 * Domain create modal types.
 * @module domain-create-types
 */

import type { DomainCreateMessages, DomainCreateSchemas } from '@auth0/universal-components-core';

/** Props for DomainCreateModal. */
export interface DomainCreateModalProps {
  translatorKey?: string;
  className?: string;
  customMessages?: Partial<DomainCreateMessages>;
  schema?: DomainCreateSchemas;
  isOpen: boolean;
  isLoading: boolean;
  showDiscoveryOption?: boolean;
  /** Locked by the discovery policy. */
  isDiscoveryReadOnly?: boolean;
  /** Locked because the user lacks permission. */
  canChangeDiscovery?: boolean;
  discoveryDefaultValue?: boolean;
  onClose: () => void;
  onCreate: (domainName: string, useForDiscovery?: boolean) => void | Promise<void>;
}
