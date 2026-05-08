/**
 * Member management type definitions for organization member and invitation operations.
 * @module member-management-types
 * @internal
 */
import type { MyOrganization } from '@auth0/myorganization-js';

/**
 * Organization member ID type.
 */
export type OrgMemberId = MyOrganization.OrgMemberId;

/**
 * Organization member entity.
 */
export interface OrgMember extends MyOrganization.OrgMember {
  phone_number?: string;
  provider?: string;
}

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
 * Response content for getting organization member roles.
 */
export type GetOrganizationMemberRolesResponseContent =
  MyOrganization.GetOrganizationMemberRolesResponseContent;

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

/**
 * Request content for deleting organization members.
 */
export type DeleteOrganizationMembersRequestContent =
  MyOrganization.DeleteOrganizationMembersRequestContent;

/**
 * Request content for changing roles of an organization member.
 */
export type OrganizationMemberRolesChangeRequestContent =
  MyOrganization.OrganizationMemberRolesChangeRequestContent;

/**
 * Response content for changing roles of an organization member.
 */
export type OrganizationMemberRolesChangeResponseContent =
  MyOrganization.OrganizationMemberRolesChangeResponseContent;
