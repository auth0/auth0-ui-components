/**
 * Custom message type definitions for organization table component.
 * @module organization-table-types
 * @internal
 */
import type { SharedMessages } from '../../shared/shared-types';

export interface OrganizationTableMessages extends SharedMessages {
  header?: {
    title?: string;
    description?: string;
    create_button_text?: string;
  };
  table?: {
    empty_message?: string;
    error_message?: string;
    error_description?: string;
    retry_button_text?: string;
    columns?: {
      display_name?: string;
      name?: string;
      id?: string;
    };
    actions?: {
      menu_label?: string;
      edit_button_text?: string;
      delete_button_text?: string;
    };
  };
}
