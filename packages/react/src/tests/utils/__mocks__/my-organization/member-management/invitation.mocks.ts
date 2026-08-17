import type { MemberInvitation, Role } from '@auth0/universal-components-core';
import { vi } from 'vitest';

import { ADMIN_MEMBER_PERMISSIONS } from '@/tests/utils/__mocks__/permissions/permission.mocks';
import type {
  IdentityProviderOption,
  OrganizationInvitationCreateModalProps,
  OrganizationInvitationDetailsModalProps,
  OrganizationInvitationRevokeModalProps,
  OrganizationInvitationTableActionsColumnProps,
  SearchFilterProps,
} from '@/types/my-organization/member-management/organization-invitation-table-types';

export const createMockInvitation = (overrides?: Partial<MemberInvitation>): MemberInvitation => ({
  id: 'inv_abc123xyz456',
  invitee: { email: 'test@example.com' },
  inviter: { name: 'Admin User' },
  roles: ['role_admin'],
  created_at: '2024-01-01T00:00:00.000Z',
  expires_at: '2099-12-31T23:59:59.000Z',
  invitation_url: 'https://example.auth0.com/invitation?ticket=abc123',
  ...overrides,
});

export const createMockPendingInvitation = (
  overrides?: Partial<MemberInvitation>,
): MemberInvitation =>
  createMockInvitation({
    invitation_url: 'https://example.auth0.com/invitation?ticket=pending123',
    ...overrides,
  });

export const createMockExpiredInvitation = (
  overrides?: Partial<MemberInvitation>,
): MemberInvitation =>
  createMockInvitation({
    expires_at: '2020-01-01T00:00:00.000Z',
    invitation_url: undefined,
    ...overrides,
  });

export const createMockRoles = (): Role[] => [
  { id: 'role_admin', name: 'Admin', description: 'Administrator role' },
  { id: 'role_member', name: 'Member', description: 'Member role' },
  { id: 'role_viewer', name: 'Viewer', description: 'Viewer role' },
];

export const createMockProviders = (): IdentityProviderOption[] => [
  { id: 'con_provider1', name: 'Google', type: 'social' },
  { id: 'con_provider2', name: 'Okta', type: 'enterprise' },
];

export const createMockCreateModalProps = (
  overrides: Partial<OrganizationInvitationCreateModalProps> = {},
): OrganizationInvitationCreateModalProps => ({
  isOpen: true,
  isLoading: false,
  onClose: vi.fn(),
  onCreate: vi.fn(),
  ...overrides,
});

export const createMockActionsColumnProps = (
  overrides: Partial<OrganizationInvitationTableActionsColumnProps> = {},
): OrganizationInvitationTableActionsColumnProps => ({
  invitation: createMockPendingInvitation(),
  permissions: ADMIN_MEMBER_PERMISSIONS,
  onViewDetails: vi.fn(),
  onCopyUrl: vi.fn(),
  onRevokeAndResend: vi.fn(),
  onRevoke: vi.fn(),
  ...overrides,
});

export const createMockDetailsModalProps = (
  overrides: Partial<OrganizationInvitationDetailsModalProps> = {},
): OrganizationInvitationDetailsModalProps => ({
  invitation: createMockPendingInvitation(),
  isOpen: true,
  isRevoking: false,
  isResending: false,
  permissions: ADMIN_MEMBER_PERMISSIONS,
  onClose: vi.fn(),
  onCopyUrl: vi.fn(),
  onRevoke: vi.fn(),
  onResend: vi.fn(),
  ...overrides,
});

export const createMockRevokeModalProps = (
  overrides: Partial<OrganizationInvitationRevokeModalProps> = {},
): OrganizationInvitationRevokeModalProps => ({
  invitation: createMockPendingInvitation(),
  isOpen: true,
  isLoading: false,
  isRevokeAndResend: false,
  onClose: vi.fn(),
  onConfirm: vi.fn(),
  ...overrides,
});

export const createMockSearchFilterProps = (
  overrides: Partial<SearchFilterProps> = {},
): SearchFilterProps => ({
  filters: {},
  availableRoles: createMockRoles(),
  onRoleFilterChange: vi.fn(),
  ...overrides,
});
