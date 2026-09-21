/**
 * Organization member table types.
 * @module organization-member-table-types
 */

import type {
  MemberManagementPermissions,
  OrgMember,
  OrganizationMemberTabMessages,
  Role,
} from '@auth0/universal-components-core';

import type {
  MemberManagementFilterState,
  MemberManagementPaginationState,
  MemberManagementSortConfig,
  ViewMemberDetailsParams,
} from './organization-member-management-types';

/** Props for OrganizationMemberTableActionsColumn component. */
export interface OrganizationMemberTableActionsColumnProps {
  member: OrgMember;
  customMessages?: Partial<OrganizationMemberTabMessages>;
  permissions: MemberManagementPermissions;
  onViewDetails?: (params: ViewMemberDetailsParams) => void;
  onAssignRole?: (member: OrgMember) => void;
  onRemoveFromOrganization?: (member: OrgMember) => void;
}

/** Props for OrganizationMemberTable component. */
export interface OrganizationMemberTableProps {
  members: OrgMember[];
  loading?: boolean;
  pagination: MemberManagementPaginationState;
  pageSizeOptions?: number[];
  filters?: MemberManagementFilterState;
  sortConfig?: MemberManagementSortConfig;
  customMessages?: Partial<OrganizationMemberTabMessages>;
  availableRoles?: Role[];
  readOnly?: boolean;
  permissions: MemberManagementPermissions;
  className?: string;
  onView?: (params: ViewMemberDetailsParams) => void;
  onAssignRole?: (member: OrgMember) => void;
  onRemoveFromOrganization?: (member: OrgMember) => void;
  onNextPage?: () => void;
  onPreviousPage?: () => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSortChange?: (sortConfig: MemberManagementSortConfig) => void;
  onRoleFilterChange?: (roleId: string | undefined) => void;
  onSearchTermChange?: (searchTerm: string) => void;
}
