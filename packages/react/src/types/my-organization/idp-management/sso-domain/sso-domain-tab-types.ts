/**
 * SSO domain tab types.
 * @module sso-domain-tab-types
 */

import type {
  ComponentAction,
  CreateOrganizationDomainRequestContent,
  Domain,
  DomainCreateSchemas,
  IdpKnownResponse,
  SharedComponentProps,
  SsoDomainAssignMessages,
  SsoDomainTabMessages,
  IdpManagementPermissions,
} from '@auth0/universal-components-core';
import type { UseQueryResult } from '@tanstack/react-query';

export interface SsoDomainsQueryData {
  domains: Domain[];
  next: string | null;
}

type RefetchSsoDomains = UseQueryResult<SsoDomainsQueryData>['refetch'];

/** SSO domain create action — onBefore receives the request payload, onAfter receives the created Domain. */
export interface SsoDomainCreateAction extends Omit<ComponentAction<Domain>, 'onBefore'> {
  onBefore?: (item: CreateOrganizationDomainRequestContent) => boolean;
}

/** SSO domains tab edit action props. */
export interface SsoDomainsTabEditProps {
  /** @deprecated The Domains tab no longer creates domains; create them in domain management. */
  createAction?: SsoDomainCreateAction;
  /** @deprecated The Domains tab no longer lists unverified domains. */
  verifyAction?: ComponentAction<Domain>;
  /** @deprecated The Domains tab no longer deletes domains. */
  deleteAction?: ComponentAction<Domain, void>;
  associateToProviderAction?: ComponentAction<Domain, IdpKnownResponse | null>;
  deleteFromProviderAction?: ComponentAction<Domain, IdpKnownResponse | null>;
}

/** CSS classes for SsoDomainsTab. */
export interface SsoDomainTabClasses {
  'SsoDomainsTab-header'?: string;
  'SsoDomainsTab-table'?: string;
  'SsoDomainsTab-tableActions'?: string;
  'SsoDomainsTab-assignModal'?: string;
  'SsoDomainsTab-createModal'?: string;
  'SsoDomainsTab-verifyModal'?: string;
  'SsoDomainsTab-deleteModal'?: string;
}

/** SSO provider edit domains tab schema. */
export interface SsoProviderEditDomainsTabSchema {
  create: DomainCreateSchemas;
}

/** SSO domain tab pagination state. */
export interface SsoDomainTabPaginationState {
  pageSize: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/** Props for SsoDomainsTab component. */
export interface SsoDomainsTabProps
  extends SharedComponentProps<
    SsoDomainTabMessages,
    SsoDomainTabClasses,
    SsoProviderEditDomainsTabSchema
  > {
  domains: SsoDomainsTabEditProps | undefined;
  idpId: string;
  provider: IdpKnownResponse | null;
  permissions: IdpManagementPermissions;
}

export interface SsoDomainTabActionColumn
  extends SharedComponentProps<
    SsoDomainTabMessages,
    SsoDomainTabClasses,
    SsoProviderEditDomainsTabSchema
  > {
  translatorKey?: string;
  permissions: IdpManagementPermissions;
  domain: Domain;
  idpName?: string;
  isUpdating: boolean;
  isUpdatingId: string | null;
  onRemove: (domain: Domain) => Promise<void>;
  /** @deprecated The Domains tab no longer renders a toggle. */
  idpDomains?: string[];
  /** @deprecated The Domains tab no longer lists unverified domains. */
  handleVerify?: (domain: Domain) => Promise<void>;
  /** @deprecated The Domains tab no longer renders a toggle. Use `onRemove`. */
  onToggle?: (domain: Domain, newCheckedValue: boolean) => Promise<void>;
}

/** Props for the modal that assigns available domains to the identity provider. */
export interface SsoDomainAssignModalProps {
  translatorKey?: string;
  className?: string;
  customMessages?: Partial<SsoDomainAssignMessages>;
  isOpen: boolean;
  isLoading: boolean;
  isAssigning: boolean;
  domains: Domain[];
  onClose: () => void;
  onAssign: (domains: Domain[]) => Promise<boolean>;
}

export interface UseSsoDomainTabOptions extends SharedComponentProps {
  domains: SsoDomainsTabEditProps;
  provider: IdpKnownResponse | null;
}

export interface UseSsoDomainTabServiceOptions extends SharedComponentProps {
  domains: SsoDomainsTabEditProps;
  provider: IdpKnownResponse | null;
  /** @deprecated Domains are no longer paginated. */
  pageSize?: number;
  /** @deprecated Domains are no longer paginated. */
  fromToken?: string;
}

export interface UseSsoDomainTabServiceReturn {
  /** Verified domains assigned to the identity provider. */
  domainsList: Domain[];
  availableDomains: Domain[];
  isLoading: boolean;
  isRefetchingDomains: boolean;
  isDomainsStale: boolean;
  domainsUpdatedAt: number;
  nextToken: string | null;
  refetchDomains: RefetchSsoDomains;
  idpDomains: string[];
  isCreating: boolean;
  isVerifying: boolean;
  isDeleting: boolean;
  isAssociating: boolean;
  createDomain: (data: CreateOrganizationDomainRequestContent) => Promise<Domain>;
  verifyDomain: (domain: Domain) => Promise<{ updatedDomain: Domain; isVerified: boolean }>;
  deleteDomain: (domain: Domain) => Promise<Domain>;
  associateToProvider: (domain: Domain) => Promise<Domain>;
  deleteFromProvider: (domain: Domain) => Promise<Domain>;
}

export interface UseSsoDomainTabReturn {
  /** Verified domains assigned to the identity provider. */
  domainsList: Domain[];
  availableDomains: Domain[];
  showAssignModal: boolean;
  setShowAssignModal: (show: boolean) => void;
  isAssigning: boolean;
  handleAssign: (domains: Domain[]) => Promise<boolean>;
  handleRemove: (domain: Domain) => Promise<void>;
  isLoading: boolean;
  isRefetchingDomains: boolean;
  isDomainsStale: boolean;
  domainsUpdatedAt: number;
  /** @deprecated The Domains tab no longer creates domains. */
  showCreateModal: boolean;
  /** @deprecated The Domains tab no longer creates domains. */
  isCreating: boolean;
  selectedDomain: Domain | null;
  /** @deprecated The Domains tab no longer verifies domains. */
  showVerifyModal: boolean;
  /** @deprecated The Domains tab no longer deletes domains. */
  showDeleteModal: boolean;
  /** @deprecated The Domains tab no longer verifies domains. */
  isVerifying: boolean;
  /** @deprecated The Domains tab no longer verifies domains. */
  verifyError: string | undefined;
  /** @deprecated The Domains tab no longer deletes domains. */
  isDeleting: boolean;
  idpDomains: string[];
  isUpdating: boolean;
  isUpdatingId: string | null;
  /** @deprecated Domains are no longer paginated; this is always a single page. */
  pagination: SsoDomainTabPaginationState;
  /** @deprecated The Domains tab no longer creates domains. */
  setShowCreateModal: (show: boolean) => void;
  refetchDomains: RefetchSsoDomains;
  /** @deprecated The Domains tab no longer creates domains. */
  handleCreate: (domainUrl: string) => Promise<void>;
  /** @deprecated The Domains tab no longer verifies domains. */
  handleCloseVerifyModal: () => void;
  /** @deprecated The Domains tab no longer verifies domains. */
  handleVerify: (domain: Domain) => Promise<void>;
  /** @deprecated The Domains tab no longer deletes domains. */
  handleDeleteClick: (domain: Domain) => void;
  /** @deprecated The Domains tab no longer deletes domains. */
  setShowDeleteModal: (show: boolean) => void;
  /** @deprecated The Domains tab no longer deletes domains. */
  handleDelete: (domain: Domain) => void;
  /** @deprecated The Domains tab no longer verifies domains. */
  handleVerifyActionColumn: (domain: Domain) => Promise<void>;
  /** @deprecated Use `handleAssign` and `handleRemove`. */
  handleToggleSwitch: (domain: Domain, newCheckedValue: boolean) => Promise<void>;
  /** @deprecated Domains are no longer paginated. */
  handleNextPage: () => void;
  /** @deprecated Domains are no longer paginated. */
  handlePreviousPage: () => void;
  /** @deprecated Domains are no longer paginated. */
  handlePageSizeChange: (pageSize: number) => void;
}
