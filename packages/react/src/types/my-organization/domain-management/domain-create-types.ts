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
  onClose: () => void;
  onCreate: (domainName: string) => void | Promise<void>;
}
