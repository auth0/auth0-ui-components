/**
 * Organization table types.
 * @module organization-table-types
 */

import type {
  ComponentAction,
  ComponentStyling,
  OrganizationTableMessages,
  SharedComponentProps,
  UserOrganization,
} from '@auth0/universal-components-core';

import type { OrganizationDeleteClasses } from '@/types/my-organization/organization-management/organization-delete-types';

/** CSS classes for OrganizationTable, including its delete dialog. */
export interface OrganizationTableClasses extends OrganizationDeleteClasses {
  'OrganizationTable-header'?: string;
  'OrganizationTable-tableActions'?: string;
  'OrganizationTable-table'?: string;
  'OrganizationTable-errorState'?: string;
}

/** Lifecycle hooks for deleting the signed-in organization. `onAfter` should sign the user in elsewhere or out. */
export interface OrganizationTableDeleteAction extends ComponentAction<UserOrganization> {
  /**
   * Enables Delete on other organizations: called to sign the user in to that organization.
   * Bring them back with its ID in `deleteConfirmationOrganizationId` to open the confirmation.
   */
  onSwitchOrganization?: (organization: UserOrganization) => void;
}

/** Whether a row's Delete action is available. `switch_required` signs the user in to it first. */
export type OrganizationTableDeleteState =
  | 'enabled'
  | 'switch_required'
  | 'disabled'
  | 'forbidden'
  | 'other_organization';

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
  /** ID of the signed-in organization (the token's `org_id`). Only this one can be deleted. */
  currentOrganizationId?: string;
  /** Shows a "Delete" row action. Requires `currentOrganizationId` and `delete:my_org:organizations`. */
  deleteAction?: OrganizationTableDeleteAction;
  /** Opens the delete confirmation for this organization once it is signed in. Clear it once passed. */
  deleteConfirmationOrganizationId?: string;
}

export interface UseOrganizationTableOptions {
  currentOrganizationId?: OrganizationTableProps['currentOrganizationId'];
  deleteAction?: OrganizationTableProps['deleteAction'];
  deleteConfirmationOrganizationId?: OrganizationTableProps['deleteConfirmationOrganizationId'];
  readOnly?: OrganizationTableProps['readOnly'];
  customMessages?: OrganizationTableProps['customMessages'];
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
  organizationDelete: {
    /** Organization whose confirmation dialog is open. */
    target: UserOrganization | null;
    getState: (organization: UserOrganization) => OrganizationTableDeleteState;
    open: (organization: UserOrganization) => void;
    close: () => void;
    /** Deletes the target organization. Resolves to `true` on success. */
    confirm: () => Promise<boolean>;
    isLoading: boolean;
  };
}

export interface OrganizationTableViewProps {
  organizationTable: UseOrganizationTableResult;
  styling: ComponentStyling<OrganizationTableClasses>;
  hideHeader: boolean;
  readOnly: boolean;
  customMessages: OrganizationTableProps['customMessages'];
  onEditOrganization?: OrganizationTableProps['onEditOrganization'];
  onCreateOrganization?: OrganizationTableProps['onCreateOrganization'];
  hasDeleteAction: boolean;
}

export interface OrganizationTableActionsColumnProps {
  organization: UserOrganization;
  customMessages?: OrganizationTableProps['customMessages'];
  onEdit?: (organization: UserOrganization) => void;
  /** Shows a "Delete" item when set. */
  deleteState?: OrganizationTableDeleteState;
  onDelete?: (organization: UserOrganization) => void;
}
