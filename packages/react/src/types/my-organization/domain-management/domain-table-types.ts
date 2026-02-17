import type {
  SharedComponentProps,
  IdentityProvider,
  DomainCreateMessages,
  DomainCreateSchemas,
  ComponentAction,
  Domain,
  DomainDeleteMessages,
  DomainConfigureMessages,
  DomainVerifyMessages,
  DomainTableMessages,
  IdentityProviderAssociatedWithDomain,
} from '@auth0/universal-components-core';

export type { Domain };

/* ============ Components ============ */

// HTML classNames that the user can override
export interface DomainTableClasses {
  'DomainTable-header'?: string;
  'DomainTable-table'?: string;
  'DomainTable-createModal'?: string;
  'DomainTable-configureModal'?: string;
  'DomainTable-deleteModal'?: string;
}

// Component messages that the user can override
export interface DomainTableMainMessages extends DomainTableMessages {
  create: DomainCreateMessages;
  configure: DomainConfigureMessages;
  verify: DomainVerifyMessages;
  delete: DomainDeleteMessages;
}

// Validation schemas that the user can override
export interface DomainTableSchema {
  create?: DomainCreateSchemas;
}

export interface DomainTableProps
  extends SharedComponentProps<DomainTableMainMessages, DomainTableClasses, DomainTableSchema> {
  hideHeader?: boolean;
  createAction?: ComponentAction<Domain>;
  verifyAction?: ComponentAction<Domain>;
  deleteAction?: ComponentAction<Domain>;
  associateToProviderAction?: ComponentAction<Domain, IdentityProvider>;
  deleteFromProviderAction?: ComponentAction<Domain, IdentityProvider>;
  // Used in the "View" buttons to open an IdP
  onOpenProvider?: (provider: IdentityProvider) => void;
  // Used in the "Create provider" buttons to open the create IdP wizard
  onCreateProvider?: () => void;
}

/* ============ Subcomponents ============ */

export interface DomainTableActionsColumnProps {
  customMessages?: Partial<DomainTableMainMessages>;
  readOnly: boolean;
  domain: Domain;
  onView: (domain: Domain) => void;
  onConfigure: (domain: Domain) => void;
  onVerify: (domain: Domain) => void;
  onDelete: (domain: Domain) => void;
}

/* ============ Hooks ============ */

export interface UseDomainTableOptions {
  createAction?: DomainTableProps['createAction'];
  verifyAction?: DomainTableProps['verifyAction'];
  deleteAction?: DomainTableProps['deleteAction'];
  associateToProviderAction?: DomainTableProps['associateToProviderAction'];
  deleteFromProviderAction?: DomainTableProps['deleteFromProviderAction'];
  customMessages?: DomainTableProps['customMessages'];
}

export interface UseDomainTableResult extends SharedComponentProps {
  domains: Domain[];
  providers: IdentityProviderAssociatedWithDomain[];
  error: unknown;
  retry: () => Promise<void>;
  isFetching: boolean;
  isLoadingProviders: boolean;
  isCreating: boolean;
  isDeleting: boolean;
  isVerifying: boolean;
  showCreateModal: boolean;
  showConfigureModal: boolean;
  showVerifyModal: boolean;
  showDeleteModal: boolean;
  verifyError: string | undefined;
  selectedDomain: Domain | null;
  closeModal: () => void;

  handleCreate: (domainUrl: string) => Promise<void>;
  handleVerify: (domain: Domain) => Promise<void>;
  handleDelete: (domain: Domain) => Promise<void>;
  handleToggleSwitch: (
    domain: Domain,
    provider: IdentityProvider,
    checked: boolean,
  ) => Promise<void>;
  handleCreateClick: () => void;
  handleConfigureClick: (domain: Domain) => void;
  handleVerifyClick: (domain: Domain) => Promise<void>;
  handleDeleteClick: (domain: Domain) => void;
}
