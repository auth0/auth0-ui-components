/**
 * Domain table types.
 * @module domain-table-types
 */

import type {
  SharedComponentProps,
  IdpKnownResponse,
  DomainCreateMessages,
  DomainCreateSchemas,
  ComponentAction,
  Domain,
  DomainDeleteMessages,
  DomainConfigureMessages,
  DomainVerifyMessages,
  DomainTableMessages,
  CreateOrganizationDomainRequestContent,
  IdentityProviderAssociatedWithDomain,
} from '@auth0/universal-components-core';
import type { UseQueryResult } from '@tanstack/react-query';
import type React from 'react';

export type { Domain };
interface DomainsQueryData {
  domains: Domain[];
  next: string | null;
}

type RefetchDomains = UseQueryResult<DomainsQueryData>['refetch'];

/** CSS classes for DomainTable. */
export interface DomainTableClasses {
  'DomainTable-header'?: string;
  'DomainTable-table'?: string;
  'DomainTable-tableHeader'?: string;
  'DomainTable-createModal'?: string;
  'DomainTable-configureModal'?: string;
  'DomainTable-deleteModal'?: string;
}

/** Domain table pagination state. */
export interface DomainTablePaginationState {
  pageSize: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/** DomainTable translation messages. */
export interface DomainTableMainMessages extends DomainTableMessages {
  create: DomainCreateMessages;
  configure: DomainConfigureMessages;
  verify: DomainVerifyMessages;
  delete: DomainDeleteMessages;
}

/** DomainTable validation schemas. */
export interface DomainTableSchema {
  create?: DomainCreateSchemas;
}

/** Props for DomainTable component. */
export interface DomainTableProps
  extends SharedComponentProps<DomainTableMainMessages, DomainTableClasses, DomainTableSchema> {
  hideHeader?: boolean;
  createAction?: ComponentAction<Domain>;
  verifyAction?: ComponentAction<Domain>;
  deleteAction?: ComponentAction<Domain>;
  associateToProviderAction?: ComponentAction<Domain, IdpKnownResponse>;
  deleteFromProviderAction?: ComponentAction<Domain, IdpKnownResponse>;
  onOpenProvider?: (provider: IdpKnownResponse) => void;
  onCreateProvider?: () => void;
}

/** Props for DomainTable actions column. */
export interface DomainTableActionsColumnProps {
  customMessages?: Partial<DomainTableMainMessages>;
  readOnly: boolean;
  domain: Domain;
  onView: (domain: Domain) => void;
  onConfigure: (domain: Domain) => void;
  onVerify: (domain: Domain) => void;
  onDelete: (domain: Domain) => void;
}

/** Parameters for domain pagination API calls. */
export interface DomainPaginationParams {
  pageSize: number;
  fromToken?: string;
}

/** Options for domain table hooks (shared by service and public hook). */
export interface UseDomainTableOptions {
  createAction?: DomainTableProps['createAction'];
  verifyAction?: DomainTableProps['verifyAction'];
  deleteAction?: DomainTableProps['deleteAction'];
  associateToProviderAction?: DomainTableProps['associateToProviderAction'];
  deleteFromProviderAction?: DomainTableProps['deleteFromProviderAction'];
  customMessages?: DomainTableProps['customMessages'];
}

/** @internal */
export interface UseDomainTableServiceOptions extends UseDomainTableOptions {
  paginationParams?: DomainPaginationParams;
}

/** Return type for the internal domain table service hook. */
export interface UseDomainTableServiceReturn {
  domains: Domain[];
  providers: IdentityProviderAssociatedWithDomain[];
  nextToken: string | null;
  isFetching: boolean;
  isRefetchingDomains: boolean;
  isDomainsStale: boolean;
  domainsUpdatedAt: number;
  isLoadingProviders: boolean;
  isCreating: boolean;
  isDeleting: boolean;
  isVerifying: boolean;
  refetchDomains: RefetchDomains;
  fetchProviders: (domain: Domain) => Promise<void>;
  fetchDomains: () => Promise<void>;
  onCreateDomain: (data: CreateOrganizationDomainRequestContent) => Promise<Domain>;
  onVerifyDomain: (domain: Domain) => Promise<boolean>;
  onDeleteDomain: (domain: Domain) => Promise<void>;
  onAssociateToProvider: (domain: Domain, provider: IdpKnownResponse) => Promise<void>;
  onDeleteFromProvider: (domain: Domain, provider: IdpKnownResponse) => Promise<void>;
}

/** Return type for the public domain table hook. */
export interface UseDomainTableReturn {
  // Data
  domains: Domain[];
  providers: IdentityProviderAssociatedWithDomain[];

  // Loading states
  isFetching: boolean;
  isRefetchingDomains: boolean;
  isDomainsStale: boolean;
  domainsUpdatedAt: number;
  isCreating: boolean;
  isDeleting: boolean;
  isVerifying: boolean;
  isLoadingProviders: boolean;

  // Pagination
  pagination: DomainTablePaginationState;
  // Refresh
  refetchDomains: RefetchDomains;

  // Modal state
  showCreateModal: boolean;
  showConfigureModal: boolean;
  showVerifyModal: boolean;
  showDeleteModal: boolean;
  verifyError: string | undefined;
  selectedDomain: Domain | null;

  // State setters
  setShowCreateModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowConfigureModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowVerifyModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>>;

  // Handlers
  handleCreate: (domainUrl: string) => Promise<void>;
  handleVerify: (domain: Domain) => Promise<void>;
  handleDelete: (domain: Domain) => Promise<void>;
  handleToggleSwitch: (
    domain: Domain,
    provider: IdpKnownResponse,
    checked: boolean,
  ) => Promise<void>;
  handleCloseVerifyModal: () => void;
  handleCreateClick: () => void;
  handleConfigureClick: (domain: Domain) => void;
  handleVerifyClick: (domain: Domain) => Promise<void>;
  handleDeleteClick: (domain: Domain) => void;
  handleNextPage: () => void;
  handlePreviousPage: () => void;
  handlePageSizeChange: (pageSize: number) => void;
}

/** Props for the DomainTableView presentational component. @internal */
export interface DomainTableViewProps {
  domainTable: UseDomainTableReturn;
  schema: DomainTableProps['schema'];
  styling: DomainTableProps['styling'];
  hideHeader: DomainTableProps['hideHeader'];
  readOnly: DomainTableProps['readOnly'];
  customMessages: DomainTableProps['customMessages'];
  createAction: DomainTableProps['createAction'];
  onOpenProvider: DomainTableProps['onOpenProvider'];
  onCreateProvider: DomainTableProps['onCreateProvider'];
}
