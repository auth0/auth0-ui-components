/**
 * Custom message type definitions for member management.
 * @module member-management-types
 * @internal
 */

import type { OrganizationInvitationTabMessages } from './invitation-tab-types';

export interface OrganizationMemberManagementMessages {
  header?: {
    title?: string;
    description?: string;
  };
  tabs?: {
    members?: string;
    invitations?: string;
  };
  invitation?: OrganizationInvitationTabMessages;
}

export interface OrganizationMemberDetailMessages {
  member?: {
    detail?: {
      back_button?: string;
      tabs?: {
        details?: string;
        roles?: string;
      };
      user_details?: {
        title?: string;
        name?: string;
        email?: string;
        phone_number?: string;
        provider?: string;
        created_at?: string;
        last_login?: string;
      };
      danger_zone?: {
        remove_from_org?: {
          title?: string;
          description?: string;
          button?: string;
          confirm_title?: string;
          confirm_description?: string;
          confirm_button?: string;
          cancel_button?: string;
          success?: string;
        };
        delete_member?: {
          title?: string;
          description?: string;
          button?: string;
          confirm_title?: string;
          confirm_description?: string;
          confirm_button?: string;
          cancel_button?: string;
          success?: string;
        };
      };
      roles?: {
        title?: string;
        description?: string;
        assign_button?: string;
        table?: {
          name?: string;
          description?: string;
          empty_message?: string;
          remove_button_label?: string;
        };
        assign_modal?: {
          title?: string;
          description?: string;
          roles_label?: string;
          roles_placeholder?: string;
          submit_button?: string;
          cancel_button?: string;
          no_roles_available?: string;
        };
        remove_confirm?: {
          title?: string;
          description?: string;
          confirm_button?: string;
          cancel_button?: string;
        };
      };
      error?: {
        fetch_failed?: string;
        fetch_roles_failed?: string;
        remove_from_org_failed?: string;
        delete_failed?: string;
        assign_role_failed?: string;
        remove_role_failed?: string;
      };
    };
  };
}
