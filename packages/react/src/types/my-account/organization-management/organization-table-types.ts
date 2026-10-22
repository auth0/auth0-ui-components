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
}

/** Props for the OrganizationTable block component. */
export interface OrganizationTableProps
  extends SharedComponentProps<OrganizationTableMessages, OrganizationTableClasses> {
  /** Hide the title and description. */
  hideHeader?: boolean;
  /**
   * Shows an "Edit" row action. Editing another organization needs an organization-scoped
   * token, so the host app handles it, e.g. by logging in to that organization and then
   * rendering OrganizationDetailsEdit. Also used for row clicks.
   */
  onEditOrganization?: (organization: UserOrganization) => void;
  /**
   * Shows a "Delete" row action. Deleting needs a token scoped to that organization, so the
   * host app handles it, e.g. by logging in to the organization and rendering
   * OrganizationDelete, which asks the user to confirm by typing the name.
   */
  onDeleteOrganization?: (organization: UserOrganization) => void;
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
  isFetching: boolean;
  /** True during any fetch, including background refetches. */
  isRefetching: boolean;
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
  onDeleteOrganization?: OrganizationTableProps['onDeleteOrganization'];
  onCreateOrganization?: OrganizationTableProps['onCreateOrganization'];
}

export interface OrganizationTableActionsColumnProps {
  organization: UserOrganization;
  customMessages?: OrganizationTableProps['customMessages'];
  onEdit?: (organization: UserOrganization) => void;
  onDelete?: (organization: UserOrganization) => void;
}
