/**
 * Organization member detail types.
 * @module organization-member-detail-types
 */

import type {
  ComponentAction,
  SharedComponentProps,
  OrgMember,
  OrganizationPrivate,
  Role,
  OrganizationMemberDetailMessages,
  OrganizationMemberTabMessages,
} from '@auth0/universal-components-core';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';
import type React from 'react';

export type MemberDetailTab = 'details' | 'roles';

export interface MemberDetailServiceResult {
  memberQuery: UseQueryResult<OrgMember>;
  memberRolesQuery: UseQueryResult<Role[]>;
  rolesSearchQuery: UseQueryResult<Role[]>;
  setRoleSearchTerm: (term: string) => void;
  enableRoleSearch: () => void;
  organizationQuery: UseQueryResult<OrganizationPrivate>;
  removeFromOrganizationMutation: UseMutationResult<
    void,
    Error,
    { userId?: string | null; memberName?: string; organizationName?: string }
  >;
  assignRolesMutation: UseMutationResult<
    { aborted: boolean },
    Error,
    { roleIds: string[]; memberRoles: Role[]; userId?: string | null }
  >;
  removeRolesMutation: UseMutationResult<{ aborted: boolean }, Error, Role[]>;
}

export interface UseOrganizationMemberDetailOptions {
  userId: string;
  onBack?: () => void;
  customMessages?: Partial<OrganizationMemberDetailMessages>;
  readOnly?: boolean;
  removeFromOrganizationAction?: ComponentAction<string>;
  assignRolesAction?: ComponentAction<{ userId: string; roleIds: string[] }>;
  removeRolesAction?: ComponentAction<{ userId: string; roleIds: string[] }>;
}

/** Discriminated union for member detail modal state. */
export type MemberDetailModalState =
  | { type: null }
  | { type: 'removeFromOrganization' }
  | { type: 'assignRoles' }
  | { type: 'removeRoles'; roles: Role[] };

export interface UseOrganizationMemberDetailResult {
  activeTab: MemberDetailTab;
  member: OrgMember | null;
  organizationDisplayName: string;
  memberRoles: Role[];
  searchedRoles: Role[];
  onRoleSearch: (term: string) => void;
  selectedRoles: Role[];
  isLoading: boolean;
  memberError: string | null;
  isFetchingMember: boolean;
  isFetchingMemberRoles: boolean;
  isRemovingFromOrganization: boolean;
  isAssigningRoles: boolean;
  isRemovingRoles: boolean;
  removingRoleIds: string[];
  modalState: MemberDetailModalState;

  setActiveTab: (tab: MemberDetailTab) => void;
  setSelectedRoles: (roles: Role[]) => void;
  handleBack: () => void;
  openModal: (state: MemberDetailModalState) => void;
  closeModal: () => void;
  handleRemoveFromOrganizationConfirm: (
    userId?: string | null,
    memberName?: string,
    organizationName?: string,
  ) => void;
  handleAssignRolesSubmit: (roleIds: string[], memberRoles: Role[], userId?: string | null) => void;
  handleRemoveRolesCancel: () => void;
  handleRemoveRolesConfirm: () => void;
}

/** CSS classes for OrganizationMemberDetail. */
export interface OrganizationMemberDetailClasses {
  'OrganizationMemberDetail-root'?: string;
  'OrganizationMemberDetail-header'?: string;
  'OrganizationMemberDetail-tabs'?: string;
  'OrganizationMemberDetail-detailsTab'?: string;
  'OrganizationMemberDetail-rolesTab'?: string;
  'MemberRemoveFromOrgModal-dialogContent'?: string;
  'OrganizationMemberRemoveRoleModal-dialogContent'?: string;
  'OrganizationMemberAssignRolesModal-dialogContent'?: string;
}

export interface OrganizationMemberUserDetailsProps {
  member: OrgMember;
  customMessages?: Partial<OrganizationMemberDetailMessages>;
}

export interface RemoveMemberFromOrganizationCardProps {
  customMessages?: Partial<OrganizationMemberDetailMessages>;
  isRemovingFromOrganization: boolean;
  canModify: boolean;
  onRemoveFromOrganizationClick: () => void;
}

export interface OrganizationMemberEditDetailsTabProps {
  member: OrgMember | null;
  customMessages?: Partial<OrganizationMemberDetailMessages>;
  isRemovingFromOrganization: boolean;
  onRemoveFromOrganizationClick: () => void;
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
  isRemovingFromOrganization?: boolean;
  customMessages?: Partial<OrganizationMemberDetailMessages>;
  onRemoveFromOrganizationClick: () => void;
}

export interface MemberRemoveFromOrganizationModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  memberName?: string;
  memberUserId?: string;
  organizationName?: string;
  customMessages?: Partial<OrganizationMemberDetailMessages | OrganizationMemberTabMessages>;
  classes?: Pick<OrganizationMemberDetailClasses, 'MemberRemoveFromOrgModal-dialogContent'>;
  style?: React.CSSProperties;
  onClose: () => void;
  onConfirm: (userId?: string, memberName?: string, organizationName?: string) => void;
}

export interface OrganizationMemberRemoveRoleModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  roles: Role[];
  memberName?: string;
  customMessages?: Partial<OrganizationMemberDetailMessages>;
  classes?: Pick<
    OrganizationMemberDetailClasses,
    'OrganizationMemberRemoveRoleModal-dialogContent'
  >;
  style?: React.CSSProperties;
  onClose: () => void;
  onConfirm: () => void;
}

export interface OrganizationMemberAssignRolesModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  availableRoles: Role[];
  assignedRoles: Role[];
  customMessages?: Partial<OrganizationMemberDetailMessages | OrganizationMemberTabMessages>;
  selectedMember?: OrgMember | null;
  classes?: Pick<
    OrganizationMemberDetailClasses,
    'OrganizationMemberAssignRolesModal-dialogContent'
  >;
  style?: React.CSSProperties;
  onClose: () => void;
  onAssign: (roleIds: string[], memberRoles: Role[], userId?: string | null) => void;
  onRoleSearch?: (value: string) => void;
}

export interface RolesTabHeaderProps {
  selectedRoles: Role[];
  organizationName?: string;
  customMessages?: Partial<OrganizationMemberDetailMessages>;
  canModify: boolean;
  onAssignRolesClick: () => void;
  onRemoveSelectedRoles: () => void;
}

export interface OrganizationMemberEditRolesTableProps {
  memberRoles: Role[];
  isLoading?: boolean;
  removingRoleIds?: string[];
  selectedRoles: Role[];
  customMessages?: Partial<OrganizationMemberDetailMessages>;
  canModify: boolean;
  onRemoveRoles: (roles: Role[]) => void;
  onSelectedRolesChange: (roles: Role[]) => void;
}

export interface OrganizationMemberEditRolesTabProps {
  customMessages?: Partial<OrganizationMemberDetailMessages>;
  organizationName?: string;
  memberName?: string;
  selectedMember?: OrgMember | null;
  memberRoles: Role[];
  searchedRoles: Role[];
  onRoleSearch: (term: string) => void;
  selectedRoles: Role[];
  isFetchingMemberRoles?: boolean;
  removingRoleIds?: string[];
  isAssigningRoles?: boolean;
  isRemovingRoles?: boolean;
  modalState: MemberDetailModalState;
  classes?: Pick<
    OrganizationMemberDetailClasses,
    | 'OrganizationMemberAssignRolesModal-dialogContent'
    | 'OrganizationMemberRemoveRoleModal-dialogContent'
  >;
  style?: React.CSSProperties;
  onSelectedRolesChange: (roles: Role[]) => void;
  onAssignRolesClick: () => void;
  onAssignRolesCancel: () => void;
  onAssignRolesSubmit: (roleIds: string[], memberRoles: Role[], userId?: string | null) => void;
  onRemoveRolesClick: (roles: Role[]) => void;
  onRemoveRolesCancel: () => void;
  onRemoveRolesConfirm: () => void;
}

/** Props for OrganizationMemberDetail component. */
export interface OrganizationMemberDetailProps
  extends SharedComponentProps<OrganizationMemberDetailMessages, OrganizationMemberDetailClasses> {
  userId: string;
  onBack?: () => void;
  hideHeader?: boolean;
  removeFromOrganizationAction?: ComponentAction<string>;
  assignRolesAction?: ComponentAction<{ userId: string; roleIds: string[] }>;
  removeRolesAction?: ComponentAction<{ userId: string; roleIds: string[] }>;
}

/** Props for OrganizationMemberDetailView component. */
export interface OrganizationMemberDetailViewProps extends UseOrganizationMemberDetailResult {
  styling: OrganizationMemberDetailProps['styling'];
  customMessages: OrganizationMemberDetailProps['customMessages'];
}

export type MemberDetailHeaderProps = Pick<
  OrganizationMemberDetailViewProps,
  'member' | 'styling' | 'customMessages' | 'handleBack'
>;

export type UseMemberDetailServiceOptions = Pick<
  UseOrganizationMemberDetailOptions,
  | 'userId'
  | 'customMessages'
  | 'removeFromOrganizationAction'
  | 'assignRolesAction'
  | 'removeRolesAction'
>;
