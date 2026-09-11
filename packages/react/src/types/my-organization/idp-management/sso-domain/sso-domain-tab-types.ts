/**
 * SSO domain tab types.
 * @module sso-domain-tab-types
 */

import type {
  ComponentAction,
  Domain,
  DomainCreateSchemas,
  IdpKnownResponse,
  SharedComponentProps,
  SsoDomainTabMessages,
  IdpManagementPermissions,
} from '@auth0/universal-components-core';
import type { UseQueryResult } from '@tanstack/react-query';

interface SsoDomainsQueryData {
  domains: Domain[];
  next: string | null;
}

type RefetchSsoDomains = UseQueryResult<SsoDomainsQueryData>['refetch'];

/** SSO domains tab edit action props. */
export interface SsoDomainsTabEditProps {
  createAction?: ComponentAction<Domain>;
  verifyAction?: ComponentAction<Domain>;
  deleteAction?: ComponentAction<Domain, void>;
  associateToProviderAction?: ComponentAction<Domain, IdpKnownResponse | null>;
  deleteFromProviderAction?: ComponentAction<Domain, IdpKnownResponse | null>;
}

/** CSS classes for SsoDomainsTab. */
export interface SsoDomainTabClasses {
  'SsoDomainsTab-header'?: string;
  'SsoDomainsTab-table'?: string;
  'SsoDomainsTab-tableActions'?: string;
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
  idpDomains: string[];
  domain: Domain;
  handleVerify: (domain: Domain) => Promise<void>;
  isUpdating: boolean;
  isUpdatingId: string | null;
  onToggle: (domain: Domain, newCheckedValue: boolean) => Promise<void>;
}

export interface UseSsoDomainTabOptions extends SharedComponentProps {
  domains: SsoDomainsTabEditProps;
  provider: IdpKnownResponse | null;
}

export interface UseSsoDomainTabReturn {
  domainsList: Domain[];
  isLoading: boolean;
  isRefetchingDomains: boolean;
  isDomainsStale: boolean;
  domainsUpdatedAt: number;
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
  pagination: SsoDomainTabPaginationState;
  setShowCreateModal: (show: boolean) => void;
  refetchDomains: RefetchSsoDomains;
  handleCreate: (domainUrl: string) => Promise<void>;
  handleCloseVerifyModal: () => void;
  handleVerify: (domain: Domain) => Promise<void>;
  handleDeleteClick: (domain: Domain) => void;
  setShowDeleteModal: (show: boolean) => void;
  handleDelete: (domain: Domain) => void;
  handleVerifyActionColumn: (domain: Domain) => Promise<void>;
  handleToggleSwitch: (domain: Domain, newCheckedValue: boolean) => Promise<void>;
  handleNextPage: () => void;
  handlePreviousPage: () => void;
  handlePageSizeChange: (pageSize: number) => void;
}
