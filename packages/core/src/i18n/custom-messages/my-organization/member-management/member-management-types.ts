/**
 * Custom message type definitions for member management.
 * @module member-management-types
 * @internal
 */

import type { OrganizationInvitationTabMessages } from './invitation-tab-types';
import type { OrganizationMemberTabMessages } from './member-tab-types';

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
  member?: OrganizationMemberTabMessages;
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
      actions?: {
        remove_from_organization?: {
          title?: string;
          description?: string;
          button?: string;
          modal?: {
            title?: string;
            description?: string;
            cancel_button?: string;
            confirm_button?: string;
          };
          success?: string;
        };
      };
      roles?: {
        title?: string;
        description?: string;
        assign_button?: string;
        roles_selected?: string;
        roles_selected_plural?: string;
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
          title_plural?: string;
          description?: string;
          description_plural?: string;
          confirm_button?: string;
          cancel_button?: string;
        };
      };
      error?: {
        fetch_failed?: string;
        fetch_roles_failed?: string;
        remove_from_organization_failed?: string;
        assign_role_failed?: string;
        remove_role_failed?: string;
      };
    };
  };
}
