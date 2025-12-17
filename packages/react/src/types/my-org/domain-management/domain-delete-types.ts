import type { Domain, DomainDeleteMessages } from '@auth0/universal-components-core';

export interface DomainDeleteModalProps {
  translatorKey?: string;
  className?: string;
  customMessages?: Partial<DomainDeleteMessages>;
  domain: Domain | null;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onDelete: (domain: Domain) => void;
}
