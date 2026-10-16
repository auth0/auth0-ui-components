/**
 * Custom message type definitions for the connection group detail component.
 * @module connection-group-detail-types
 * @internal
 */

import type { SharedMessages } from '../../shared/shared-types';

/**
 * Overridable translation messages for {@link OrganizationConnectionGroupDetail}.
 * Every field is optional; provided values take precedence over the bundled
 * `connection_group_management.detail` translations.
 */
export interface OrganizationConnectionGroupDetailMessages extends SharedMessages {
  back_button?: string;
  sources_label?: string;
  roles?: {
    title?: string;
    description?: string;
    assign_button?: string;
    remove_button?: string;
    /** Accessible label for the per-row remove button. Supports `${roleName}`. */
    remove_button_label?: string;
    /** Selection header text. Supports `${count}`. */
    selected_count?: string;
    empty_message?: string;
    columns?: {
      name?: string;
      description?: string;
      permissions?: string;
    };
    /** Overflow indicator for permissions beyond the visible cap. Supports `${count}`. */
    permissions_overflow?: string;
    /** Tooltip on the disabled remove button of a role managed by the tenant admin. */
    managed_role_tooltip?: string;
    /** Shown when the selection cap is reached. Supports `${max}`. */
    max_selection_message?: string;
  };
  assign_modal?: {
    title?: string;
    roles_label?: string;
    roles_placeholder?: string;
    submit_button?: string;
    cancel_button?: string;
    no_roles_available?: string;
    /** Supports `${max}`. */
    max_selection_message?: string;
    search_for_more?: string;
    no_matching_roles?: string;
    searching_message?: string;
  };
  remove_modal?: {
    title?: string;
    /** Supports `${groupName}` and the `<groupBold>` tag. */
    description?: string;
    confirm_button?: string;
    cancel_button?: string;
  };
  notifications?: {
    fetch_roles_error?: string;
    assign_success?: string;
    assign_error?: string;
    remove_success?: string;
    remove_error?: string;
  };
}
