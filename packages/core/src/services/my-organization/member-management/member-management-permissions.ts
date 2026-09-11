/**
 * Member Management permission declarations.
 * @module member-management-permissions
 * @internal
 */
import { createPermissionResolver } from '../../permissions/permission-map';

export const getMemberManagementPermissions = createPermissionResolver({
  canListMembers: ['read:my_org:members'],
  canListInvitations: ['read:my_org:member_invitations'],
  canInvite: ['create:my_org:member_invitations'],
  canAssignRole: ['create:my_org:member_roles'],
  canRemoveRole: ['delete:my_org:member_roles'],
  canRemoveFromOrganization: ['delete:my_org:memberships'],
  canRevokeInvitation: ['delete:my_org:member_invitations'],
  canResendInvitation: ['delete:my_org:member_invitations', 'create:my_org:member_invitations'],
  canShowMemberMenu: { any: ['create:my_org:member_roles', 'delete:my_org:memberships'] },
  canShowInvitationMenu: {
    any: ['create:my_org:member_invitations', 'delete:my_org:member_invitations'],
  },
} as const);

export type MemberManagementPermissions = ReturnType<typeof getMemberManagementPermissions>;
