import type { DomainVerifyMessages, Domain } from '@auth0/universal-components-core';

export interface DomainVerifyModalProps {
  translatorKey?: string;
  isOpen: boolean;
  isLoading?: boolean;
  domain: Domain | null;
  error?: string;
  onClose: () => void;
  onVerify: (domain: Domain) => void;
  onDelete: (domain: Domain) => void;
  className?: string;
  customMessages?: Partial<DomainVerifyMessages>;
}
