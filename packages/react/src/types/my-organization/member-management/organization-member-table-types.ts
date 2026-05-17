/**
 * Organization member table types.
 * @module organization-member-table-types
 */

import type {
  OrgMember,
  OrganizationMemberTabMessages,
  Role,
} from '@auth0/universal-components-core';

/** Filter state for member table. */
export interface MemberFilterState {
  searchQuery?: string;
  roleId?: string;
}

/** Sort configuration for member table. */
export interface MemberSortConfig {
  key: string | null;
  direction: 'asc' | 'desc';
}

/** Pagination state for member table (checkpoint-based). */
export interface MemberPaginationState {
  pageSize: number;
  currentPage: number;
  totalItems?: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/** Props for OrganizationMemberTableActionsColumn component. */
export interface OrganizationMemberTableActionsColumnProps {
  member: OrgMember;
  onViewDetails?: (member: OrgMember) => void;
  onAssignRole?: (member: OrgMember) => void;
  onRemoveFromOrg?: (member: OrgMember) => void;
}

/** Props for OrganizationMemberTable component. */
export interface OrganizationMemberTableProps {
  members: OrgMember[];
  loading?: boolean;
  pagination: MemberPaginationState;
  filters?: MemberFilterState;
  sortConfig?: MemberSortConfig;
  customMessages?: Partial<OrganizationMemberTabMessages>;
  availableRoles?: Role[];
  readOnly?: boolean;
  className?: string;
  onView?: (member: OrgMember) => void;
  onAssignRole?: (member: OrgMember) => void;
  onRemoveFromOrg?: (member: OrgMember) => void;
  onNextPage?: () => void;
  onPreviousPage?: () => void;
  onPageSizeChange?: (pageSize: number) => void;
  onSortChange?: (sortConfig: MemberSortConfig) => void;
  onRoleFilterChange?: (roleId: string | undefined) => void;
  onSearchTermChange?: (searchTerm: string) => void;
}
