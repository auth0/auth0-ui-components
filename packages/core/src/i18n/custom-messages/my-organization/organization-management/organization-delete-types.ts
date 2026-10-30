/**
 * Custom message type definitions for organization delete component.
 * @module organization-delete-types
 * @internal
 */
import type { SharedMessages } from '../../shared/shared-types';

export interface OrganizationDeleteMessages extends SharedMessages {
  title?: string;
  description?: string;
  allow_if_empty_hint?: string;
  delete_button_label?: string;
  modal_title?: string;
  modal_description?: string;
  organization_name_field_placeholder?: string;
  organization_name_field_label?: string;
  organization_name_field_error?: string;
  cancel_button_label?: string;
  notifications?: {
    success?: string;
    not_empty_error?: string;
    general_error?: string;
  };
}
