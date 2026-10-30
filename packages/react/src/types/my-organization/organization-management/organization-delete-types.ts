/**
 * Organization delete types.
 * @module organization-delete-types
 */

import type {
  ComponentAction,
  ComponentStyling,
  OrganizationDeleteMessages,
  OrganizationPrivate,
  SharedComponentProps,
} from '@auth0/universal-components-core';

import type { UseConfigResult } from '@/types/my-organization/config/config-types';

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

/** Props for the OrganizationDelete block component. */
export interface OrganizationDeleteProps
  extends SharedComponentProps<OrganizationDeleteMessages, OrganizationDeleteClasses> {
  /** Lifecycle hooks for the delete operation. Use `onAfter` to redirect after deletion. */
  deleteAction?: OrganizationDeleteAction;
}

export interface UseOrganizationDeleteOptions {
  deleteAction?: OrganizationDeleteProps['deleteAction'];
  readOnly?: OrganizationDeleteProps['readOnly'];
  customMessages?: OrganizationDeleteProps['customMessages'];
}

export type UseOrganizationDeleteServiceOptions = Pick<
  UseOrganizationDeleteOptions,
  'deleteAction' | 'customMessages'
>;

export interface UseOrganizationDeleteResult {
  organization: OrganizationPrivate;
  /** Whether the user may delete: granted the scope, not read-only, and not disabled via `deleteAction`. */
  canDelete: boolean;
  /** Whether the delete scope is missing (drives the permission-denied tooltip; always `false` in read-only mode). */
  permissionDenied: boolean;
  /** How the API restricts deletion; `undefined` until the configuration has loaded. */
  deletionBehavior: UseConfigResult['organizationDeletionBehavior'];
  isFetchLoading: boolean;
  isDeleteLoading: boolean;
  /** Deletes the organization. Resolves to `true` on success, `false` when denied, cancelled, or failed. */
  deleteOrganization: () => Promise<boolean>;
}

/** Props for the delete section rendered inside OrganizationDelete and OrganizationDetailsEdit. */
export interface OrganizationDeleteSectionProps {
  organization: OrganizationPrivate;
  customMessages?: OrganizationDeleteProps['customMessages'];
  styling?: ComponentStyling<OrganizationDeleteClasses>;
  readOnly?: boolean;
  canDelete: boolean;
  permissionDenied: boolean;
  /** When `allow_if_empty`, the section tells the user they must be the only member. */
  deletionBehavior?: UseConfigResult['organizationDeletionBehavior'];
  isDeleteLoading: boolean;
  onDelete: () => Promise<boolean>;
}

/** Props for the delete confirmation modal. */
export interface OrganizationDeleteModalProps {
  className?: string;
  isOpen: boolean;
  onClose: () => void;
  organization: OrganizationPrivate;
  customMessages?: OrganizationDeleteProps['customMessages'];
  isLoading: boolean;
  onDelete: () => Promise<boolean>;
}

export interface OrganizationDeleteViewProps extends OrganizationDeleteSectionProps {
  styling: ComponentStyling<OrganizationDeleteClasses>;
}
