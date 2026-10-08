/**
 * Custom message type definitions for the connection group table component.
 * @module connection-group-table-types
 * @internal
 */

import type { SharedMessages } from '../../shared/shared-types';

/**
 * Overridable translation messages for {@link OrganizationConnectionGroupTable}.
 * Every field is optional; provided values take precedence over the bundled
 * `connection_group_management` translations.
 */
export interface OrganizationConnectionGroupTableMessages extends SharedMessages {
  header?: {
    title?: string;
    description?: string;
  };
  table?: {
    empty_message?: string;
    columns?: {
      name?: string;
      source?: string;
      assigned_roles?: string;
    };
    /** Overflow indicator for roles beyond the visible cap. Supports `${count}`. */
    assigned_roles_overflow?: string;
    /** Shown when a group has no assigned roles. */
    assigned_roles_empty?: string;
    actions?: {
      menu_label?: string;
      assign_roles?: string;
      view_details?: string;
    };
  };
  notifications?: {
    general_error?: string;
    fetch_groups_error?: string;
  };
}
