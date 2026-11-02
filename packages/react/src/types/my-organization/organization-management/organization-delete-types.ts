/**
 * Organization delete types.
 * @module organization-delete-types
 */

import type {
  ComponentAction,
  ComponentStyling,
  OrganizationDeleteMessages,
  OrganizationPrivate,
} from '@auth0/universal-components-core';

/** CSS classes for OrganizationDelete. */
export interface OrganizationDeleteClasses {
  'OrganizationDelete-root'?: string;
  'OrganizationDelete-modal'?: string;
}

/**
 * Lifecycle hooks for deleting the organization. Deleting it invalidates the current
 * organization-scoped token, so `onAfter` should redirect the user away.
 */
export interface OrganizationDeleteAction extends ComponentAction<OrganizationPrivate> {}

export interface UseOrganizationDeleteOptions {
  /** Lifecycle hooks for the delete operation. Use `onAfter` to redirect after deletion. */
  deleteAction?: OrganizationDeleteAction;
  readOnly?: boolean;
  customMessages?: Partial<OrganizationDeleteMessages>;
}

export type UseOrganizationDeleteServiceOptions = Pick<
  UseOrganizationDeleteOptions,
  'deleteAction' | 'customMessages'
>;

export interface UseOrganizationDeleteMutationOptions<TItem> {
  /** What `deleteAction` receives; nothing is deleted while it is null. */
  item: TItem | null;
  /** Name used in the notifications. */
  organizationName: string;
  deleteAction?: ComponentAction<TItem>;
  customMessages?: Partial<OrganizationDeleteMessages>;
  /** Called after a successful delete, before `deleteAction.onAfter`. */
  onDeleted?: () => void;
  /** Component name used in console messages. */
  componentName: string;
}

export interface UseOrganizationDeleteMutationResult {
  /** Resolves to `true` on success, `false` when cancelled by `onBefore` or failed. */
  deleteOrganization: () => Promise<boolean>;
  isDeleteLoading: boolean;
}

export interface UseOrganizationDeleteResult {
  organization: OrganizationPrivate;
  /** Whether the user may delete: loaded, granted the scope, not read-only, not disabled via `deleteAction`, and allowed by the deletion behavior. */
  canDelete: boolean;
  /** Whether the delete scope is missing (drives the permission-denied tooltip; always `false` in read-only mode). */
  permissionDenied: boolean;
  isLoading: boolean;
  isDeleteLoading: boolean;
  /** Deletes the organization. Resolves to `true` on success, `false` when denied, cancelled, or failed. */
  deleteOrganization: () => Promise<boolean>;
}

/** Props for the delete section rendered inside OrganizationDetailsEdit. */
export interface OrganizationDeleteSectionProps {
  organization: OrganizationPrivate;
  customMessages?: Partial<OrganizationDeleteMessages>;
  styling?: ComponentStyling<OrganizationDeleteClasses>;
  readOnly?: boolean;
  canDelete: boolean;
  permissionDenied: boolean;
  isDeleteLoading: boolean;
  onDelete: () => Promise<boolean>;
}

/** Props for the delete confirmation modal. */
export interface OrganizationDeleteModalProps {
  styling?: ComponentStyling<OrganizationDeleteClasses>;
  isOpen: boolean;
  onClose: () => void;
  /** Always the name, never the display name: it is also what the user types to confirm. */
  organizationName: string;
  customMessages?: Partial<OrganizationDeleteMessages>;
  isLoading: boolean;
  onDelete: () => Promise<boolean>;
}
