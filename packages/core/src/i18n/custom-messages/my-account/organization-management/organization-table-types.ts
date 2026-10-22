/**
 * Custom message type definitions for organization table component.
 * @module organization-table-types
 * @internal
 */
import type { SharedMessages } from '../../shared/shared-types';

export interface OrganizationTableMessages extends SharedMessages {
  header?: {
    /** Table title. */
    title?: string;
    /** Text below the table title. */
    description?: string;
    /** Header button shown when `onCreateOrganization` is provided. */
    create_button_text?: string;
  };
  table?: {
    /** Shown when the user does not belong to any organization. */
    empty_message?: string;
    /** Error title shown in place of the table when the organizations could not be loaded. */
    error_message?: string;
    /** Text below the error title. */
    error_description?: string;
    /** Label for the button that retries loading after an error. */
    retry_button_text?: string;
    columns?: {
      /** Display name column header. */
      display_name?: string;
      /** Name (slug) column header. */
      name?: string;
      /** Organization ID column header. */
      id?: string;
    };
    actions?: {
      /** Accessible label for the row actions menu trigger. Supports `${organizationName}`. */
      menu_label?: string;
      /** Row action shown when `onEditOrganization` is provided. */
      edit_button_text?: string;
      /** Row action shown when `onDeleteOrganization` is provided. */
      delete_button_text?: string;
    };
  };
}
