/**
 * Organization member detail types.
 * @module organization-member-detail-types
 */

import type {
  ComponentAction,
  SharedComponentProps,
  OrgMember,
  Role,
  OrganizationMemberDetailMessages,
} from '@auth0/universal-components-core';
import type { UseMutationResult, UseQueryResult } from '@tanstack/react-query';

export type MemberDetailTab = 'details' | 'roles';

export interface MemberDetailServiceResult {
  memberQuery: UseQueryResult<OrgMember>;
  rolesQuery: UseQueryResult<Role[]>;
  removeFromOrgMutation: UseMutationResult<void, Error, void>;
  assignRolesMutation: UseMutationResult<void, Error, string[]>;
  removeRolesMutation: UseMutationResult<void, Error, Role[]>;
}

export interface UseOrganizationMemberDetailOptions {
  userId: string;
  onBack?: () => void;
  customMessages?: Partial<OrganizationMemberDetailMessages>;
  readOnly?: boolean;
  removeFromOrgAction?: ComponentAction<string>;
  assignRolesAction?: ComponentAction<{ userId: string; roleIds: string[] }>;
  removeRolesAction?: ComponentAction<{ userId: string; roleIds: string[] }>;
}

/** Discriminated union for member detail modal state. */
export type MemberDetailModalState =
  | { type: null }
  | { type: 'removeFromOrg' }
  | { type: 'assignRoles' }
  | { type: 'removeRoles'; roles: Role[] };

export interface UseOrganizationMemberDetailResult {
  activeTab: MemberDetailTab;
  member: OrgMember | null;
  memberRoles: Role[];
  availableRoles: Role[];
  selectedRoles: Role[];
  isLoading: boolean;
  isFetchingMember: boolean;
  isFetchingRoles: boolean;
  isRemovingFromOrg: boolean;
  isAssigningRoles: boolean;
  isRemovingRoles: boolean;
  removingRoleIds: string[];
  modalState: MemberDetailModalState;

  setActiveTab: (tab: MemberDetailTab) => void;
  setSelectedRoles: (roles: Role[]) => void;
  handleBack: () => void;
  openModal: (state: MemberDetailModalState) => void;
  closeModal: () => void;
  handleRemoveFromOrgConfirm: () => void;
  handleAssignRolesSubmit: (roleIds: string[]) => void;
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
}

export interface OrganizationMemberUserDetailsProps {
  member: OrgMember;
  customMessages?: Partial<OrganizationMemberDetailMessages>;
}

export interface RemoveMemberFromOrganizationCardProps {
  customMessages?: Partial<OrganizationMemberDetailMessages>;
  isRemovingFromOrg: boolean;
  onRemoveFromOrgClick: () => void;
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
  memberRoles: Role[];
  availableRoles: Role[];
  isLoading?: boolean;
  removingRoleIds?: string[];
  readOnly?: boolean;
  customMessages?: Partial<OrganizationMemberDetailMessages>;
  onAssignRolesClick: () => void;
  onRemoveRoles: (roles: Role[]) => void;
}

export interface OrganizationMemberRemoveRoleModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  roles: Role[];
  customMessages?: Partial<OrganizationMemberDetailMessages>;
  onClose: () => void;
  onConfirm: () => void;
}

export interface OrganizationMemberAssignRolesModalProps {
  isOpen: boolean;
  isLoading?: boolean;
  availableRoles: Role[];
  assignedRoles: Role[];
  customMessages?: Partial<OrganizationMemberDetailMessages>;
  onClose: () => void;
  onAssign: (roleIds: string[]) => void;
}

export interface RolesTabHeaderProps {
  selectedRoles: Role[];
  customMessages?: Partial<OrganizationMemberDetailMessages>;
  onAssignRolesClick: () => void;
  onRemoveSelectedRoles: () => void;
}

export interface OrganizationMemberEditRolesTableProps {
  memberRoles: Role[];
  isLoading?: boolean;
  removingRoleIds?: string[];
  selectedRoles: Role[];
  customMessages?: Partial<OrganizationMemberDetailMessages>;
  onRemoveRoles: (roles: Role[]) => void;
  onSelectedRolesChange: (roles: Role[]) => void;
}

export interface OrganizationMemberEditRolesTabProps {
  customMessages?: Partial<OrganizationMemberDetailMessages>;
  memberRoles: Role[];
  availableRoles: Role[];
  selectedRoles: Role[];
  isFetchingRoles?: boolean;
  removingRoleIds?: string[];
  isAssigningRoles?: boolean;
  isRemovingRoles?: boolean;
  modalState: MemberDetailModalState;
  onSelectedRolesChange: (roles: Role[]) => void;
  onAssignRolesClick: () => void;
  onAssignRolesCancel: () => void;
  onAssignRolesSubmit: (roleIds: string[]) => void;
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
  removeFromOrgAction?: ComponentAction<string>;
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
  'userId' | 'customMessages' | 'removeFromOrgAction' | 'assignRolesAction' | 'removeRolesAction'
>;
