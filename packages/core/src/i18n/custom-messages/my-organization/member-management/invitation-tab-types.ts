/**
 * Custom message type definitions for invitation tab.
 * @module invitation-tab-types
 * @internal
 */

export interface OrganizationInvitationTabMessages {
  table?: {
    columns?: {
      email?: string;
      status?: string;
      inviter?: string;
      created_at?: string;
      expires_at?: string;
      roles?: string;
    };
    empty_message?: string;
    search_placeholder?: string;
    filter_by_role?: string;
    all_roles?: string;
    reset_filter?: string;
    showing_results?: string;
    status_pending?: string;
    status_expired?: string;
  };
  actions?: {
    menu_label?: string;
    view_details?: string;
    copy_url?: string;
    revoke_and_resend?: string;
    revoke?: string;
  };
  create?: {
    title?: string;
    description?: string;
    email_label?: string;
    email_placeholder?: string;
    email_helper?: string;
    email_limit_error?: string;
    email_invalid_error?: string;
    email_duplicate_error?: string;
    email_required_error?: string;
    roles_label?: string;
    roles_placeholder?: string;
    provider_label?: string;
    provider_placeholder?: string;
    provider_helper?: string;
    provider_group_user_store?: string;
    provider_group_identity_provider?: string;
    submit_button?: string;
    creating?: string;
    cancel_button?: string;
  };
  details?: {
    title?: string;
    email_label?: string;
    status_label?: string;
    roles_label?: string;
    connection_label?: string;
    created_at_label?: string;
    expires_at_label?: string;
    invited_by_label?: string;
    invitation_url_label?: string;
    copy_url_button?: string;
    close_button?: string;
    revoke_button?: string;
    resend_button?: string;
  };
  revoke?: {
    title?: string;
    description?: string;
    confirm_button?: string;
    cancel_button?: string;
  };
  revoke_resend?: {
    title?: string;
    description?: string;
    confirm_button?: string;
    cancel_button?: string;
  };
  success?: {
    url_copied?: string;
    invitation_resent?: string;
  };
  error?: {
    fetch_failed?: string;
    create_failed?: string;
    revoke_failed?: string;
    resend_failed?: string;
    revoke_resend_failed?: string;
    connection_required?: string;
    copy_url_failed?: string;
  };
}
