/**
 * Organization member detail types.
 * @module organization-member-detail-types
 */

import type {
  ComponentAction,
  SharedComponentProps,
  OrgMember,
  OrgMemberRole,
  OrganizationMemberDetailMessages,
} from '@auth0/universal-components-core';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';

import type { RoleOption } from './organization-invitation-table-types';

export type MemberDetailTab = 'details' | 'roles';

export interface MemberDetailServiceResult {
  memberQuery: UseQueryResult<OrgMember>;
  removeFromOrgMutation: UseMutationResult<void, Error, void>;
  assignRoleMutation: UseMutationResult<void, Error, string[]>;
  removeRoleMutation: UseMutationResult<void, Error, OrgMemberRole>;
}

export interface UseOrganizationMemberDetailOptions {
  userId: string;
  onBack?: () => void;
  customMessages?: Partial<OrganizationMemberDetailMessages>;
  readOnly?: boolean;
  removeFromOrgAction?: ComponentAction<string>;
  assignRoleAction?: ComponentAction<{ userId: string; roleId: string }>;
  removeRoleAction?: ComponentAction<{ userId: string; roleId: string }>;
}

/** Discriminated union for member detail modal state. */
export type MemberDetailModalState =
  | { type: null }
  | { type: 'removeFromOrg' }
  | { type: 'assignRoles' }
  | { type: 'removeRole'; role: OrgMemberRole };

export interface UseOrganizationMemberDetailResult {
  activeTab: MemberDetailTab;
  member: OrgMember | null;
  memberRoles: OrgMemberRole[];
  availableRoles: RoleOption[];
  isLoading: boolean;
  isFetchingMember: boolean;
  isFetchingRoles: boolean;
  isRemovingFromOrg: boolean;
  isAssigningRole: boolean;
  removingRoleId: string | null;
  modalState: MemberDetailModalState;

  setActiveTab: (tab: MemberDetailTab) => void;
  handleBack: () => void;
  openModal: (state: MemberDetailModalState) => void;
  closeModal: () => void;
  handleRemoveFromOrgConfirm: () => void;
  handleAssignRolesSubmit: (roleIds: string[]) => void;
  handleRemoveRoleConfirm: () => void;
}

/** CSS classes for OrganizationMemberDetail. */
export interface OrganizationMemberDetailClasses {
  'OrganizationMemberDetail-root'?: string;
  'OrganizationMemberDetail-header'?: string;
  'OrganizationMemberDetail-tabs'?: string;
  'OrganizationMemberDetail-detailsTab'?: string;
  'OrganizationMemberDetail-rolesTab'?: string;
}

export interface OrganizationMemberUserDetailsProps {
  member: OrgMember;
  customMessages?: Partial<OrganizationMemberDetailMessages>;
}

export interface OrganizationMemberEditDetailsTabProps {
  member: OrgMember | null;
  customMessages?: Partial<OrganizationMemberDetailMessages>;
  isRemovingFromOrg: boolean;
  onRemoveFromOrgClick: () => void;
}

export interface MemberDetailDangerCardProps {
  title: string;
  description: string;
  buttonLabel: string;
  isLoading?: boolean;
  disabled?: boolean;
  onClick: () => void;
}

export interface MemberDetailDangerZoneProps {
  readOnly?: boolean;
  isRemovingFromOrg?: boolean;
  customMessages?: Partial<OrganizationMemberDetailMessages>;
  onRemoveFromOrgClick: () => void;
}

export interface MemberRemoveFromOrgModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  customMessages?: Partial<OrganizationMemberDetailMessages>;
  onClose: () => void;
  onConfirm: () => void;
}

export interface OrganizationMemberDetailRolesTabProps {
  memberRoles: OrgMemberRole[];
  availableRoles: RoleOption[];
  isLoading?: boolean;
  removingRoleId?: string | null;
  readOnly?: boolean;
  customMessages?: Partial<OrganizationMemberDetailMessages>;
  onAssignRolesClick: () => void;
  onRemoveRole: (role: OrgMemberRole) => void;
}

export interface OrganizationMemberRemoveRoleModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  role: OrgMemberRole | null;
  customMessages?: Partial<OrganizationMemberDetailMessages>;
  onClose: () => void;
  onConfirm: () => void;
}

export interface OrganizationMemberAssignRolesModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  availableRoles: RoleOption[];
  assignedRoles: OrgMemberRole[];
  customMessages?: Partial<OrganizationMemberDetailMessages>;
  onClose: () => void;
  onAssign: (roleIds: string[]) => void;
}

export interface RolesTabHeaderProps {
  selectedRoles: OrgMemberRole[];
  customMessages?: Partial<OrganizationMemberDetailMessages>;
  onAssignRolesClick: () => void;
  onRemoveSelectedRoles: () => void;
}

export interface OrganizationMemberEditRolesTableProps {
  memberRoles: OrgMemberRole[];
  availableRoles: RoleOption[];
  isLoading?: boolean;
  removingRoleId?: string | null;
  selectedRoles: OrgMemberRole[];
  customMessages?: Partial<OrganizationMemberDetailMessages>;
  onRemoveRole: (role: OrgMemberRole) => void;
  onSelectedRolesChange: (roles: OrgMemberRole[]) => void;
}

export interface OrganizationMemberEditRolesTabProps {
  customMessages?: Partial<OrganizationMemberDetailMessages>;
  memberRoles: OrgMemberRole[];
  availableRoles: RoleOption[];
  isFetchingRoles?: boolean;
  removingRoleId?: string | null;
  isAssigningRole?: boolean;
  modalState: MemberDetailModalState;
  onAssignRolesClick: () => void;
  onAssignRolesCancel: () => void;
  onAssignRolesSubmit: (roleIds: string[]) => void;
  onRemoveRoleClick: (role: OrgMemberRole) => void;
  onRemoveRoleCancel: () => void;
  onRemoveRoleConfirm: () => void;
}

/** Props for OrganizationMemberDetail component. */
export interface OrganizationMemberDetailProps
  extends SharedComponentProps<OrganizationMemberDetailMessages, OrganizationMemberDetailClasses> {
  userId: string;
  onBack?: () => void;
  hideHeader?: boolean;
  removeFromOrgAction?: ComponentAction<string>;
  assignRoleAction?: ComponentAction<{ userId: string; roleId: string }>;
  removeRoleAction?: ComponentAction<{ userId: string; roleId: string }>;
}

/** Props for OrganizationMemberDetailView component. */
export interface OrganizationMemberDetailViewProps extends UseOrganizationMemberDetailResult {
  styling: OrganizationMemberDetailProps['styling'];
  customMessages: OrganizationMemberDetailProps['customMessages'];
}
