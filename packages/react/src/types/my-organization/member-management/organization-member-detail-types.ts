/**
 * Organization member detail types.
 * @module organization-member-detail-types
 */

import type {
  ComponentAction,
  SharedComponentProps,
  OrgMember,
  OrgMemberRole,
} from '@auth0/universal-components-core';

import type { RoleOption } from './organization-invitation-table-types';

export type MemberDetailTab = 'details' | 'roles';

export interface UseOrganizationMemberDetailOptions {
  userId: string;
  onBack?: () => void;
  customMessages?: OrganizationMemberDetailMessages;
  readOnly?: boolean;
  removeFromOrgAction?: ComponentAction<string>;
  deleteMemberAction?: ComponentAction<string>;
  assignRoleAction?: ComponentAction<{ userId: string; roleId: string }>;
  removeRoleAction?: ComponentAction<{ userId: string; roleId: string }>;
}

export interface MemberDetailState {
  activeTab: MemberDetailTab;
  member: OrgMember | null;
  memberRoles: OrgMemberRole[];
  availableRoles: RoleOption[];
  isFetchingMember: boolean;
  isFetchingRoles: boolean;
  isLoading: boolean;
  isRemovingFromOrg: boolean;
  isDeletingMember: boolean;
  isAssigningRole: boolean;
  removingRoleId: string | null;
  showRemoveFromOrgModal: boolean;
  showDeleteMemberModal: boolean;
  showAssignRolesModal: boolean;
  showRemoveRoleModal: boolean;
  roleToRemove: OrgMemberRole | null;
}

export interface MemberDetailHandlers {
  setActiveTab: (tab: MemberDetailTab) => void;
  handleBack: () => void;
  handleRemoveFromOrgClick: () => void;
  handleRemoveFromOrgConfirm: () => void;
  handleRemoveFromOrgCancel: () => void;
  handleDeleteMemberClick: () => void;
  handleDeleteMemberConfirm: () => void;
  handleDeleteMemberCancel: () => void;
  handleAssignRolesClick: () => void;
  handleAssignRolesSubmit: (roleIds: string[]) => void;
  handleAssignRolesCancel: () => void;
  handleRemoveRoleClick: (role: OrgMemberRole) => void;
  handleRemoveRoleConfirm: () => void;
  handleRemoveRoleCancel: () => void;
}

/** CSS classes for OrganizationMemberDetail. */
export interface OrganizationMemberDetailClasses {
  'OrganizationMemberDetail-root'?: string;
  'OrganizationMemberDetail-header'?: string;
  'OrganizationMemberDetail-tabs'?: string;
  'OrganizationMemberDetail-detailsTab'?: string;
  'OrganizationMemberDetail-rolesTab'?: string;
}

/** OrganizationMemberDetail translation messages. */
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

/** Props for OrganizationMemberDetail component. */
export interface OrganizationMemberDetailProps
  extends SharedComponentProps<OrganizationMemberDetailMessages, OrganizationMemberDetailClasses> {
  userId: string;
  onBack?: () => void;
  hideHeader?: boolean;
  removeFromOrgAction?: ComponentAction<string>;
  deleteMemberAction?: ComponentAction<string>;
  assignRoleAction?: ComponentAction<{ userId: string; roleId: string }>;
  removeRoleAction?: ComponentAction<{ userId: string; roleId: string }>;
}
