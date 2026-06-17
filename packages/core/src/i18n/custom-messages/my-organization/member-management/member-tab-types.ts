/**
 * Custom message type definitions for member tab.
 * @module member-tab-types
 * @internal
 */

export interface OrganizationMemberTabMessages {
  table?: {
    columns?: {
      name?: string;
      roles?: string;
      last_login?: string;
    };
    empty_message?: string;
    search_placeholder?: string;
    filter_by_role?: string;
    all_roles?: string;
    reset_filter?: string;
    showing_results?: string;
  };
  actions?: {
    menu_label?: string;
    view_details?: string;
    assign_roles?: string;
    remove_from_org?: string;
  };
  assign_roles?: {
    title?: string;
    description?: string;
    roles_label?: string;
    roles_placeholder?: string;
    submit_button?: string;
    cancel_button?: string;
    no_roles_available?: string;
  };
  remove_from_org?: {
    title?: string;
    description?: string;
    confirm_button?: string;
    cancel_button?: string;
  };
  success?: {
    removed_from_org?: string;
    role_assigned?: string;
  };
  error?: {
    fetch_failed?: string;
    assign_roles_failed?: string;
    remove_from_org_failed?: string;
  };
}
