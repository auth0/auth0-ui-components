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
  CreateOrganizationDomainRequestContent,
  EnhancedTranslationFunction,
  IdentityProviderAssociatedWithDomain,
} from '@auth0/web-ui-components-core';

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
  isFetching: boolean;
  isLoadingProviders: boolean;
  isCreating: boolean;
  isDeleting: boolean;
  isVerifying: boolean;
  fetchProviders: (domain: Domain) => Promise<void>;
  fetchDomains: () => Promise<void>;
  onCreateDomain: (data: CreateOrganizationDomainRequestContent) => Promise<Domain | null>;
  onVerifyDomain: (data: Domain) => Promise<boolean>;
  onDeleteDomain: (domain: Domain) => Promise<void>;
  onAssociateToProvider: (domain: Domain, provider: IdentityProvider) => Promise<void>;
  onDeleteFromProvider: (domain: Domain, provider: IdentityProvider) => Promise<void>;
}

export interface UseDomainTableLogicOptions {
  t: EnhancedTranslationFunction;
  onCreateDomain: UseDomainTableResult['onCreateDomain'];
  onVerifyDomain: UseDomainTableResult['onVerifyDomain'];
  onDeleteDomain: UseDomainTableResult['onDeleteDomain'];
  onAssociateToProvider: UseDomainTableResult['onAssociateToProvider'];
  onDeleteFromProvider: UseDomainTableResult['onDeleteFromProvider'];
  fetchProviders: UseDomainTableResult['fetchProviders'];
  fetchDomains: UseDomainTableResult['fetchDomains'];
}

export interface UseDomainTableLogicResult {
  // Modal state
  showCreateModal: boolean;
  showConfigureModal: boolean;
  showVerifyModal: boolean;
  showDeleteModal: boolean;
  verifyError: string | undefined;
  selectedDomain: Domain | null;

  // State setters
  setShowCreateModal: (show: boolean) => void;
  setShowConfigureModal: (show: boolean) => void;
  setShowVerifyModal: (show: boolean) => void;
  setShowDeleteModal: (show: boolean) => void;

  // Handlers
  handleCreate: (domainUrl: string) => Promise<void>;
  handleVerify: (domain: Domain) => Promise<void>;
  handleDelete: (domain: Domain) => void;
  handleToggleSwitch: (domain: Domain, provider: IdentityProvider, checked: boolean) => void;
  handleCloseVerifyModal: () => void;
  handleCreateClick: () => void;
  handleConfigureClick: (domain: Domain) => void;
  handleVerifyClick: (domain: Domain) => Promise<void>;
  handleDeleteClick: (domain: Domain) => void;
}
