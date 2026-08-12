import type {
  ListUserStoresResponseContent,
  MemberInvitation,
  Role,
  UserStore,
} from '@auth0/universal-components-core';
import { vi } from 'vitest';

import type {
  ConnectionOption,
  OrganizationInvitationBulkRevokeModalProps,
  OrganizationInvitationCreateModalProps,
  OrganizationInvitationDetailsModalProps,
  OrganizationInvitationRevokeModalProps,
  OrganizationInvitationTableActionsColumnProps,
  OrganizationInvitationTableProps,
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

export const createMockUserStore = (overrides?: Partial<UserStore>): UserStore => ({
  id: 'us_store1',
  name: 'acme-directory',
  display_name: 'Acme Directory',
  ...overrides,
});

export const createMockListUserStoresResponse = (
  stores: UserStore[] = [createMockUserStore()],
): ListUserStoresResponseContent => ({
  user_stores: stores,
});

export const createMockRoles = (): Role[] => [
  { id: 'role_admin', name: 'Admin', description: 'Administrator role' },
  { id: 'role_member', name: 'Member', description: 'Member role' },
  { id: 'role_viewer', name: 'Viewer', description: 'Viewer role' },
];

export const createMockConnections = (): ConnectionOption[] => [
  { id: 'con_provider1', name: 'Google', type: 'identity_provider' },
  { id: 'us_store1', name: 'Acme Directory', type: 'user_store' },
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
  readOnly: false,
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

export const createMockInvitations = (): MemberInvitation[] => [
  createMockInvitation({ id: 'inv_1', invitee: { email: 'a@example.com' } }),
  createMockInvitation({ id: 'inv_2', invitee: { email: 'b@example.com' } }),
];

export const createMockTableProps = (
  overrides: Partial<OrganizationInvitationTableProps> = {},
): OrganizationInvitationTableProps => {
  const invitations = overrides.invitations ?? createMockInvitations();

  return {
    invitations,
    loading: false,
    customMessages: {},
    pagination: {
      pageSize: 10,
      currentPage: 1,
      totalItems: invitations.length,
      hasNextPage: false,
      hasPreviousPage: false,
    },
    ...overrides,
  };
};

export const createMockBulkRevokeModalProps = (
  overrides: Partial<OrganizationInvitationBulkRevokeModalProps> = {},
): OrganizationInvitationBulkRevokeModalProps => ({
  invitations: createMockInvitations(),
  isOpen: true,
  isLoading: false,
  customMessages: {},
  onClose: vi.fn(),
  onConfirm: vi.fn(),
  ...overrides,
});
