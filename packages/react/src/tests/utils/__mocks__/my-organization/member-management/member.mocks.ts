import type { OrgMember, Role } from '@auth0/universal-components-core';
import { vi } from 'vitest';

import type {
  OrganizationMemberAssignRoleModalProps,
  OrganizationMemberRemoveFromOrgModalProps,
} from '@/types/my-organization/member-management/organization-member-management-types';
import type {
  OrganizationMemberTableActionsColumnProps,
  OrganizationMemberTableProps,
} from '@/types/my-organization/member-management/organization-member-table-types';

export const createMockMember = (overrides?: Partial<OrgMember>): OrgMember =>
  ({
    user_id: 'usr_123',
    name: 'Ada Lovelace',
    email: 'ada@example.com',
    given_name: 'Ada',
    family_name: 'Lovelace',
    last_login: '2026-05-13T12:00:00.000Z',
    roles: [{ id: 'role_admin', name: 'Admin' }],
    picture: undefined,
    ...overrides,
  }) as OrgMember;

export const createMockMembers = (): OrgMember[] => [
  createMockMember(),
  createMockMember({
    user_id: 'usr_456',
    name: 'Grace Hopper',
    email: 'grace@example.com',
    given_name: 'Grace',
    family_name: 'Hopper',
    last_login: undefined,
    roles: [],
  }),
];

export const createMockMemberActionsColumnProps = (
  overrides: Partial<OrganizationMemberTableActionsColumnProps> = {},
): OrganizationMemberTableActionsColumnProps => ({
  member: createMockMember(),
  onViewDetails: vi.fn(),
  onAssignRole: vi.fn(),
  onRemoveFromOrg: vi.fn(),
  ...overrides,
});

export const createMockMemberTableProps = (
  overrides: Partial<OrganizationMemberTableProps> = {},
): OrganizationMemberTableProps => ({
  members: createMockMembers(),
  loading: false,
  pagination: {
    pageSize: 10,
    currentPage: 1,
    totalItems: 2,
    hasNextPage: true,
    hasPreviousPage: false,
  },
  filters: {},
  sortConfig: { key: null, direction: 'asc' },
  availableRoles: [
    { id: 'role_admin', name: 'Admin' },
    { id: 'role_member', name: 'Member' },
  ],
  onView: vi.fn(),
  onAssignRole: vi.fn(),
  onRemoveFromOrg: vi.fn(),
  onNextPage: vi.fn(),
  onPreviousPage: vi.fn(),
  onPageSizeChange: vi.fn(),
  onSortChange: vi.fn(),
  onRoleFilterChange: vi.fn(),
  onSearchTermChange: vi.fn(),
  ...overrides,
});

export const createMockRoleOptions = (): Role[] => [
  { id: 'role_admin', name: 'Admin' },
  { id: 'role_member', name: 'Member' },
  { id: 'role_viewer', name: 'Viewer' },
];

export const createMockMemberAssignRoleModalProps = (
  overrides: Partial<OrganizationMemberAssignRoleModalProps> = {},
): OrganizationMemberAssignRoleModalProps => ({
  member: createMockMember(),
  isOpen: true,
  isLoading: false,
  availableRoles: createMockRoleOptions(),
  assignedRoles: [],
  onClose: vi.fn(),
  onAssign: vi.fn(),
  ...overrides,
});

export const createMockMemberRemoveFromOrgModalProps = (
  overrides: Partial<OrganizationMemberRemoveFromOrgModalProps> = {},
): OrganizationMemberRemoveFromOrgModalProps => ({
  member: createMockMember(),
  isOpen: true,
  isLoading: false,
  onClose: vi.fn(),
  onConfirm: vi.fn(),
  ...overrides,
});
