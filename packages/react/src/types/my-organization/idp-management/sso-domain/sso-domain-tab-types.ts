import type {
  ComponentAction,
  Domain,
  DomainCreateSchemas,
  IdentityProvider,
  SharedComponentProps,
  SsoDomainTabMessages,
} from '@auth0/universal-components-core';

/* ============ Components ============ */

export interface SsoDomainsTabEditProps {
  createAction?: ComponentAction<Domain>;
  verifyAction?: ComponentAction<Domain>;
  deleteAction?: ComponentAction<Domain, void>;
  associateToProviderAction?: ComponentAction<Domain, IdentityProvider | null>;
  deleteFromProviderAction?: ComponentAction<Domain, IdentityProvider | null>;
}

export interface SsoDomainTabClasses {
  'SsoDomainsTab-header'?: string;
  'SsoDomainsTab-table'?: string;
  'SsoDomainsTab-createModal'?: string;
  'SsoDomainsTab-verifyModal'?: string;
  'SsoDomainsTab-deleteModal'?: string;
}

export interface SsoProviderEditDomainsTabSchema {
  create: DomainCreateSchemas;
}

export interface SsoDomainsTabProps
  extends SharedComponentProps<
    SsoDomainTabMessages,
    SsoDomainTabClasses,
    SsoProviderEditDomainsTabSchema
  > {
  domains: SsoDomainsTabEditProps | undefined;
  idpId: string;
  provider: IdentityProvider | null;
}

/* ============ Subcomponents ============ */

export interface SsoDomainTabActionColumn
  extends SharedComponentProps<
    SsoDomainTabMessages,
    SsoDomainTabClasses,
    SsoProviderEditDomainsTabSchema
  > {
  translatorKey?: string;
  idpDomains: string[];
  domain: Domain;
  handleVerify: (domain: Domain) => Promise<void>;
  isUpdating: boolean;
  isUpdatingId: string | null;
  onToggle: (domain: Domain, newCheckedValue: boolean) => Promise<void>;
}

/* ============ Hooks ============ */

export interface UseSsoDomainTabOptions extends SharedComponentProps {
  domains: SsoDomainsTabEditProps;
  provider: IdentityProvider | null;
}

export interface UseSsoDomainTabReturn {
  domainsList: Domain[];
  isLoading: boolean;
  showCreateModal: boolean;
  isCreating: boolean;
  selectedDomain: Domain | null;
  showVerifyModal: boolean;
  showDeleteModal: boolean;
  isVerifying: boolean;
  verifyError: string | undefined;
  isDeleting: boolean;
  idpDomains: string[];
  isUpdating: boolean;
  isUpdatingId: string | null;
  setShowCreateModal: (show: boolean) => void;
  handleCreate: (domainUrl: string) => Promise<void>;
  handleCloseVerifyModal: () => void;
  handleVerify: (domain: Domain) => Promise<void>;
  handleDeleteClick: (domain: Domain) => void;
  setShowDeleteModal: (show: boolean) => void;
  handleDelete: (domain: Domain) => void;
  handleVerifyActionColumn: (domain: Domain) => Promise<void>;
  handleToggleSwitch: (domain: Domain, newCheckedValue: boolean) => Promise<void>;
}
