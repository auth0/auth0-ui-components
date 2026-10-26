/**
 * Custom message type definitions for organization details edit component.
 * @module organization-details-edit-types
 * @internal
 */
import type { OrganizationDeleteMessages } from './organization-delete-types';
import type { OrganizationDetailsMessages } from './organization-details-types';

export interface OrganizationDetailsEditMessages {
  header?: {
    title?: string;
    back_button_text?: string;
  };
  details?: OrganizationDetailsMessages;
  /** Messages for the delete section, shown when `deleteAction` is provided. */
  delete?: OrganizationDeleteMessages;
  save_organization_changes_message?: string;
  organization_changes_error_message?: string;
  organization_changes_error_message_generic?: string;
}
