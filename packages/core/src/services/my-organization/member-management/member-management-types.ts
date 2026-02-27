/**
 * Member management type definitions for organization member and invitation operations.
 * @module member-management-types
 * @internal
 */
import type { MyOrganization } from '@auth0/myorganization-js';

// ============================================================================
// Member Types
// ============================================================================

/**
 * Organization member ID type.
 */
export type OrgMemberId = MyOrganization.OrgMemberId;

/**
 * Organization member entity.
 */
export type OrgMember = MyOrganization.OrgMember;

/**
 * Organization member role.
 */
export type OrgMemberRole = MyOrganization.OrgMemberRole;

/**
 * Organization member role ID.
 */
export type OrgMemberRoleId = MyOrganization.OrgMemberRoleId;

/**
 * Response content for listing organization members.
 */
export type ListOrganizationMembersResponseContent =
  MyOrganization.ListOrganizationMembersResponseContent;

/**
 * Response content for getting a single organization member.
 */
export type GetOrganizationMemberResponseContent =
  MyOrganization.GetOrganizationMemberResponseContent;

/**
 * Request parameters for listing organization members.
 */
export type ListOrganizationMembersRequestParameters =
  MyOrganization.ListOrganizationMembersRequestParameters;

/**
 * Request parameters for deleting an organization member.
 */
export type DeleteOrganizationMemberRequestParameters =
  MyOrganization.DeleteOrganizationMemberRequestParameters;

/**
 * Response content for getting organization member roles.
 */
export type GetOrganizationMemberRolesResponseContent =
  MyOrganization.GetOrganizationMemberRolesResponseContent;

/**
 * Request content for assigning a role to an organization member.
 */
export type AssignOrganizationMemberRoleRequestContent =
  MyOrganization.AssignOrganizationMemberRoleRequestContent;

/**
 * Response content for assigning a role to an organization member.
 */
export type AssignOrganizationMemberRoleResponseContent =
  MyOrganization.AssignOrganizationMemberRoleResponseContent;

// ============================================================================
// Invitation Types
// ============================================================================

/**
 * Invitation ID type.
 */
export type InvitationId = MyOrganization.InvitationId;

/**
 * Member invitation entity.
 */
export type MemberInvitation = MyOrganization.MemberInvitation;

/**
 * Member invitation invitee details.
 */
export type MemberInvitationInvitee = MyOrganization.MemberInvitationInvitee;

/**
 * Member invitation inviter details.
 */
export type MemberInvitationInviter = MyOrganization.MemberInvitationInviter;

/**
 * Response content for listing member invitations.
 */
export type ListMembersInvitationsResponseContent =
  MyOrganization.ListMembersInvitationsResponseContent;

/**
 * Request parameters for listing member invitations.
 */
export type ListMemberInvitationsRequestParameters =
  MyOrganization.ListMemberInvitationsRequestParameters;

/**
 * Request content for creating a member invitation.
 */
export type CreateMemberInvitationRequestContent =
  MyOrganization.CreateMemberInvitationRequestContent;

/**
 * Response content for creating a member invitation.
 */
export type CreateMemberInvitationResponseContent =
  MyOrganization.CreateMemberInvitationResponseContent;

/**
 * Response content for getting a member invitation.
 */
export type GetMemberInvitationResponseContent = MyOrganization.GetMemberInvitationResponseContent;
