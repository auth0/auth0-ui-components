import type { OrgMember, Role } from '@auth0/universal-components-core';
import { vi } from 'vitest';

import { ALL_MEMBER_PERMISSIONS } from '@/tests/utils/__mocks__/permissions/permission.mocks';
import type {
  MemberDetailDangerZoneProps,
  MemberDetailModalState,
  OrganizationMemberAssignRolesModalProps,
  OrganizationMemberDetailProps,
  OrganizationMemberDetailViewProps,
  OrganizationMemberUserDetailsProps,
  MemberRemoveFromOrganizationModalProps,
  OrganizationMemberRemoveRoleModalProps,
} from '@/types/my-organization/member-management/organization-member-detail-types';
import type {
  OrganizationMemberTableActionsColumnProps,
  OrganizationMemberTableProps,
} from '@/types/my-organization/member-management/organization-member-table-types';

export const createMockMember = (overrides?: Partial<OrgMember>): OrgMember =>
  ({
    user_id: 'auth0|testuser123',
    name: 'Test User',
    email: 'test@example.com',
    created_at: '2024-01-01T00:00:00.000Z',
    last_login: '2024-06-15T10:00:00.000Z',
    given_name: 'Ada',
    family_name: 'Lovelace',
    roles: [{ id: 'role_admin', name: 'Admin' }],
    picture: undefined,
    access_level: 'full',
    ...overrides,
  }) as OrgMember;

export const createMockMembers = (): OrgMember[] => [
  createMockMember(),
  createMockMember({
    user_id: 'auth0|testuser123',
    name: 'Test User',
    email: 'test@example.com',
    created_at: '2024-01-01T00:00:00.000Z',
    given_name: 'Ada',
    family_name: 'Lovelace',
    last_login: undefined,
    roles: [],
  }),
];

export const createMockMemberActionsColumnProps = (
  overrides: Partial<OrganizationMemberTableActionsColumnProps> = {},
): OrganizationMemberTableActionsColumnProps => ({
  member: createMockMember(),
  permissions: ALL_MEMBER_PERMISSIONS,
  onViewDetails: vi.fn(),
  onAssignRole: vi.fn(),
  onRemoveFromOrganization: vi.fn(),
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
  availableRoles: [],
  permissions: ALL_MEMBER_PERMISSIONS,
  onView: vi.fn(),
  onAssignRole: vi.fn(),
  onRemoveFromOrganization: vi.fn(),
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

export const createMockMemberWithPhone = (overrides?: Partial<OrgMember>): OrgMember =>
  createMockMember({
    phone_number: '+1234567890',
    identities: [{ provider: 'Username-Password-Authentication' }],
    ...overrides,
  });

export const createMockMemberRole = (overrides?: Partial<Role>): Role => ({
  id: 'rol_abc123',
  name: 'Admin',
  description: 'Administrator role',
  ...overrides,
});

export const createMockMemberRoles = (): Role[] => [
  createMockMemberRole({ id: 'rol_admin', name: 'Admin', description: 'Administrator role' }),
  createMockMemberRole({ id: 'rol_member', name: 'Member', description: 'Member role' }),
];

export const createMockAvailableRoles = (): Role[] => [
  { id: 'rol_admin', name: 'Admin', description: 'Administrator role' },
  { id: 'rol_member', name: 'Member', description: 'Member role' },
  { id: 'rol_viewer', name: 'Viewer', description: 'Viewer role' },
];

export const createMockUserDetailsProps = (
  overrides: Partial<OrganizationMemberUserDetailsProps> = {},
): OrganizationMemberUserDetailsProps => ({
  member: createMockMember(),
  ...overrides,
});

export const createMockDangerZoneProps = (
  overrides: Partial<MemberDetailDangerZoneProps> = {},
): MemberDetailDangerZoneProps => ({
  readOnly: false,
  isRemovingFromOrganization: false,
  onRemoveFromOrganizationClick: vi.fn(),
  ...overrides,
});

export const createMockRemoveFromOrgModalProps = (
  overrides: Partial<MemberRemoveFromOrganizationModalProps> = {},
): MemberRemoveFromOrganizationModalProps => ({
  isOpen: true,
  isLoading: false,
  onClose: vi.fn(),
  onConfirm: vi.fn(),
  ...overrides,
});

export const createMockAssignRolesModalProps = (
  overrides: Partial<OrganizationMemberAssignRolesModalProps> = {},
): OrganizationMemberAssignRolesModalProps => ({
  isOpen: true,
  isLoading: false,
  availableRoles: createMockAvailableRoles(),
  assignedRoles: [],
  onClose: vi.fn(),
  onAssign: vi.fn(),
  ...overrides,
});

export const createMockRemoveRoleModalProps = (
  overrides: Partial<OrganizationMemberRemoveRoleModalProps> = {},
): OrganizationMemberRemoveRoleModalProps => ({
  isOpen: true,
  isLoading: false,
  roles: [createMockMemberRole()],
  onClose: vi.fn(),
  onConfirm: vi.fn(),
  ...overrides,
});

export const noModal: MemberDetailModalState = { type: null };

export const createMockOrganizationMemberDetailProps = (
  overrides?: Partial<OrganizationMemberDetailProps>,
): OrganizationMemberDetailProps => ({
  userId: 'auth0|testuser123',
  onBack: vi.fn(),
  customMessages: {},
  styling: {
    variables: { common: {}, light: {}, dark: {} },
    classes: {},
  },
  removeFromOrganizationAction: undefined,
  assignRolesAction: undefined,
  removeRolesAction: undefined,
  ...overrides,
});

export const createMockOrganizationMemberDetailViewProps = (
  overrides?: Partial<OrganizationMemberDetailViewProps>,
): OrganizationMemberDetailViewProps => ({
  styling: {
    variables: { common: {}, light: {}, dark: {} },
    classes: {},
  },
  customMessages: {},
  activeTab: 'details',
  permissions: ALL_MEMBER_PERMISSIONS,
  member: createMockMember(),
  organizationDisplayName: 'Test Org',
  memberRoles: createMockMemberRoles(),
  searchedRoles: createMockAvailableRoles(),
  onRoleSearch: vi.fn(),
  selectedRoles: [],
  isFetchingMember: false,
  isFetchingMemberRoles: false,
  isSearchingRoles: false,
  isLoading: false,
  memberError: null,
  isRemovingFromOrganization: false,
  isAssigningRoles: false,
  isRemovingRoles: false,
  removingRoleIds: [],
  modalState: noModal,
  setActiveTab: vi.fn(),
  setSelectedRoles: vi.fn(),
  handleBack: vi.fn(),
  openModal: vi.fn(),
  closeModal: vi.fn(),
  handleRemoveFromOrganizationConfirm: vi.fn(),
  handleAssignRolesSubmit: vi.fn(),
  handleRemoveRolesCancel: vi.fn(),
  handleRemoveRolesConfirm: vi.fn(),
  ...overrides,
});
