import type { OrgMember, OrgMemberRole } from '@auth0/universal-components-core';
import { vi } from 'vitest';

import type {
  MemberDetailDangerZoneProps,
  OrganizationMemberAssignRolesModalProps,
  OrganizationMemberDetailRolesTabProps,
  OrganizationMemberUserDetailsProps,
  MemberRemoveFromOrgModalProps,
  OrganizationMemberRemoveRoleModalProps,
} from '@/types/my-organization/member-management/organization-member-detail-types';

export const createMockMember = (overrides?: Partial<OrgMember>): OrgMember =>
  ({
    user_id: 'auth0|testuser123',
    name: 'Test User',
    email: 'test@example.com',
    created_at: '2024-01-01T00:00:00.000Z',
    last_login: '2024-06-15T10:00:00.000Z',
    ...overrides,
  }) as OrgMember;

export const createMockMemberWithPhone = (overrides?: Partial<OrgMember>): OrgMember =>
  createMockMember({
    phone_number: '+1234567890',
    provider: 'Username-Password-Authentication',
    ...overrides,
  });

export const createMockMemberRole = (overrides?: Partial<OrgMemberRole>): OrgMemberRole => ({
  id: 'rol_abc123',
  name: 'Admin',
  description: 'Administrator role',
  ...overrides,
});

export const createMockMemberRoles = (): OrgMemberRole[] => [
  createMockMemberRole({ id: 'rol_admin', name: 'Admin', description: 'Administrator role' }),
  createMockMemberRole({ id: 'rol_member', name: 'Member', description: 'Member role' }),
];

export const createMockAvailableRoles = (): OrgMemberRole[] => [
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
  isRemovingFromOrg: false,
  onRemoveFromOrgClick: vi.fn(),
  ...overrides,
});

export const createMockRemoveFromOrgModalProps = (
  overrides: Partial<MemberRemoveFromOrgModalProps> = {},
): MemberRemoveFromOrgModalProps => ({
  isOpen: true,
  isLoading: false,
  onClose: vi.fn(),
  onConfirm: vi.fn(),
  ...overrides,
});

export const createMockRolesTabProps = (
  overrides: Partial<OrganizationMemberDetailRolesTabProps> = {},
): OrganizationMemberDetailRolesTabProps => ({
  memberRoles: createMockMemberRoles(),
  availableRoles: createMockAvailableRoles(),
  isLoading: false,
  removingRoleIds: [],
  readOnly: false,
  onAssignRolesClick: vi.fn(),
  onRemoveRoles: vi.fn(),
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
