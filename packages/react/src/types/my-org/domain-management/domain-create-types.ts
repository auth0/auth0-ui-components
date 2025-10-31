import type { DomainCreateMessages, DomainCreateSchemas } from '@auth0-web-ui-components/core';

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
