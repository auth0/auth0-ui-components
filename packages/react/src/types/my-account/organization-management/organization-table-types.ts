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

/** CSS classes for OrganizationTable. */
export interface OrganizationTableClasses {
  'OrganizationTable-header'?: string;
  'OrganizationTable-tableActions'?: string;
  'OrganizationTable-table'?: string;
  'OrganizationTable-errorState'?: string;
}

/**
 * Lifecycle hooks for deleting the signed-in organization from the table. Deleting it invalidates
 * the session's organization-scoped token, so `onAfter` should sign the user in to another
 * organization or out.
 */
export interface OrganizationTableDeleteAction extends ComponentAction<UserOrganization> {
  /**
   * Enables Delete on organizations other than the signed-in one. The API only deletes the
   * organization of the session, so this is called to sign the user in to that organization;
   * bring them back to the table with its ID in `deleteConfirmationOrganizationId` to open the
   * confirmation dialog. Without it, Delete on those rows is disabled with a hint to switch first.
   */
  onSwitchOrganization?: (organization: UserOrganization) => void;
}

/**
 * Whether a row's Delete action is available, and why not. `switch_required` is available too: it
 * signs the user in to that organization first.
 */
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
  /**
   * ID of the organization the user is signed in to (the token's `org_id`). Only that organization
   * can be deleted from the table, because the API deletes the organization of the session's
   * token. Other rows show Delete disabled with a hint to switch to them first.
   */
  currentOrganizationId?: string;
  /**
   * Shows a "Delete" row action that asks the user to confirm by typing the organization name.
   * Requires `currentOrganizationId` and the `delete:my_org:organizations` permission.
   */
  deleteAction?: OrganizationTableDeleteAction;
  /**
   * Opens the delete confirmation for this organization once it is the signed-in organization,
   * e.g. after `deleteAction.onSwitchOrganization` signed the user in to it. It only opens the
   * dialog; the user still confirms by typing the name. Clear it once passed, so that a reload
   * does not open the dialog again.
   */
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
