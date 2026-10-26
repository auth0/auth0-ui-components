/**
 * Custom message type definitions for organization delete component.
 * @module organization-delete-types
 * @internal
 */
import type { SharedMessages } from '../../shared/shared-types';

export interface OrganizationDeleteMessages extends SharedMessages {
  /** Section title. */
  title?: string;
  /** Warning text shown below the section title. */
  description?: string;
  /** Label for the button that opens the confirmation modal and confirms deletion. */
  delete_button_label?: string;
  /** Confirmation modal title. Supports `${organizationName}`. */
  modal_title?: string;
  /** Confirmation modal body text. Supports `${organizationName}`. */
  modal_description?: string;
  /** Placeholder for the field where the user types the organization name to confirm. */
  organization_name_field_placeholder?: string;
  /** Label for the field where the user types the organization name to confirm. */
  organization_name_field_label?: string;
  /** Error shown when the typed name does not match. Supports `${organizationName}`. */
  organization_name_field_error?: string;
  /** Label for the button that closes the confirmation modal without deleting. */
  cancel_button_label?: string;
  notifications?: {
    /** Shown after the organization is deleted. Supports `${organizationName}`. */
    success?: string;
    /** Shown when deletion is rejected because the organization still has other members. Supports `${organizationName}`. */
    not_empty_error?: string;
    /** Shown when deletion fails for any other reason. */
    general_error?: string;
  };
}
