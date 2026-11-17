/**
 * Organization table types.
 * @module organization-table-types
 */

import type {
  ComponentStyling,
  OrganizationTableMessages,
  SharedComponentProps,
  UserOrganization,
} from '@auth0/universal-components-core';

/** CSS classes for OrganizationTable. */
export interface OrganizationTableClasses {
  'OrganizationTable-header'?: string;
  'OrganizationTable-tableActions'?: string;
  'OrganizationTable-table'?: string;
  'OrganizationTable-errorState'?: string;
}

/** Props for the OrganizationTable block component. */
export interface OrganizationTableProps
  extends SharedComponentProps<OrganizationTableMessages, OrganizationTableClasses> {
  hideHeader?: boolean;
  /**
   * Shows an "Edit" row action. Editing another organization needs an organization-scoped
   * token, so the host app handles it, e.g. by logging in to that organization and then
   * rendering OrganizationDetailsEdit. Also used for row clicks.
   */
  onEditOrganization?: (organization: UserOrganization) => void;
  /** Shows a "Create Organization" header button that calls this. */
  onCreateOrganization?: () => void;
}

export interface UseOrganizationTableServiceOptions {
  paginationParams?: {
    pageSize?: number;
    fromToken?: string;
  };
}

export interface UseOrganizationTableServiceResult {
  organizations: UserOrganization[];
  nextToken: string | null;
  /** True only while the first page has no data yet. */
  isLoading: boolean;
  /** True during any fetch, including page changes and background refetches. */
  isFetching: boolean;
  isStale: boolean;
  isError: boolean;
  updatedAt: number;
  refetch: () => void;
}

export interface UseOrganizationTableResult
  extends Omit<UseOrganizationTableServiceResult, 'nextToken'> {
  pagination: {
    pageSize: number;
    currentPage: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  handleNextPage: () => void;
  handlePreviousPage: () => void;
  handlePageSizeChange: (pageSize: number) => void;
}

export interface OrganizationTableViewProps {
  organizationTable: UseOrganizationTableResult;
  styling: ComponentStyling<OrganizationTableClasses>;
  hideHeader: boolean;
  readOnly: boolean;
  customMessages: OrganizationTableProps['customMessages'];
  onEditOrganization?: OrganizationTableProps['onEditOrganization'];
  onCreateOrganization?: OrganizationTableProps['onCreateOrganization'];
}

export interface OrganizationTableActionsColumnProps {
  organization: UserOrganization;
  customMessages?: OrganizationTableProps['customMessages'];
  onEdit?: (organization: UserOrganization) => void;
}
