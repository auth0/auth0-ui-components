import type { Domain, DomainDeleteMessages } from '@auth0-web-ui-components/core';

export interface DomainDeleteModalProps {
  className?: string;
  customMessages?: Partial<DomainDeleteMessages>;
  domain: Domain | null;
  isOpen: boolean;
  isLoading: boolean;
  onClose: () => void;
  onDelete: (domain: Domain) => void;
}
