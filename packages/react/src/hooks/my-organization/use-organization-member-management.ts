/**
 * API hook for organization member management - handles both members and invitations API calls.
 * @module use-organization-member-management
 */

import { getStatusCode, type MemberInvitation } from '@auth0/universal-components-core';
import * as React from 'react';

import { showToast } from '@/components/auth0/shared/toast';
import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useTranslator } from '@/hooks/shared/use-translator';
import type {
  Member,
  Invitation,
  CreateInvitationInput,
  InvitationStatus,
  InvitationPaginationState,
  InvitationFilterState,
  RoleOption,
  IdentityProviderOption,
  OrganizationMemberManagementMessages,
} from '@/types';

const DEFAULT_PAGE_SIZE = 10;

export interface UseOrganizationMemberManagementOptions {
  customMessages?: OrganizationMemberManagementMessages;
  /** Available roles for invitations */
  availableRoles?: RoleOption[];
  /** Available identity providers for invitations */
  availableProviders?: IdentityProviderOption[];
}

/**
 * Maps SDK OrgMember to UI Member type.
 * @param orgMember - The SDK organization member object.
 * @returns The mapped Member object.
 */
function mapOrgMemberToMember(orgMember: {
  user_id?: string;
  email?: string;
  name?: string;
  picture?: string;
  roles?: Array<{ id?: string; name?: string }>;
}): Member {
  return {
    user_id: orgMember.user_id ?? '',
    email: orgMember.email,
    name: orgMember.name,
    picture: orgMember.picture,
    roles: orgMember.roles?.map((role) => role.name ?? role.id ?? '') ?? [],
  };
}

/**
 * Determines the status of an invitation.
 * @param invitation - The SDK member invitation object.
 * @returns The invitation status.
 */
function getInvitationStatus(invitation: MemberInvitation): InvitationStatus {
  if (invitation.expires_at) {
    const expiresAt = new Date(invitation.expires_at);
    if (expiresAt < new Date()) {
      return 'expired';
    }
  }
  return 'pending';
}

/**
 * Maps SDK MemberInvitation to UI Invitation type.
 * @param memberInvitation - The SDK member invitation object.
 * @returns The mapped Invitation object.
 */
function mapMemberInvitationToInvitation(memberInvitation: MemberInvitation): Invitation {
  return {
    id: memberInvitation.id,
    invitee: {
      email: memberInvitation.invitee?.email ?? '',
    },
    inviter: {
      name: memberInvitation.inviter?.name,
    },
    roles: memberInvitation.roles,
    created_at: memberInvitation.created_at,
    expires_at: memberInvitation.expires_at,
    status: getInvitationStatus(memberInvitation),
    invitation_url: memberInvitation.invitation_url,
    identity_provider_id: memberInvitation.identity_provider_id,
  };
}

/**
 * API hook for organization member management.
 * Handles all API calls for both members and invitations.
 * @param options - Hook configuration options.
 * @returns Member management state and actions.
 */
export function useOrganizationMemberManagement(options: UseOrganizationMemberManagementOptions) {
  const {
    customMessages = {},
    availableRoles: providedRoles = [],
    availableProviders: providedProviders = [],
  } = options;
  const { coreClient } = useCoreClient();
  const { t } = useTranslator('member_management', customMessages as Record<string, unknown>);

  // ========== MEMBER STATE ==========
  const [members, setMembers] = React.useState<Member[]>([]);
  const [isFetchingMembers, setIsFetchingMembers] = React.useState(false);
  const [isRemovingMember, setIsRemovingMember] = React.useState(false);

  // ========== INVITATION STATE ==========
  const [invitations, setInvitations] = React.useState<Invitation[]>([]);
  const [isFetchingInvitations, setIsFetchingInvitations] = React.useState(false);
  const [isCreatingInvitation, setIsCreatingInvitation] = React.useState(false);
  const [isRevokingInvitation, setIsRevokingInvitation] = React.useState(false);
  const [isResendingInvitation, setIsResendingInvitation] = React.useState(false);

  const [invitationPagination, setInvitationPagination] = React.useState<InvitationPaginationState>(
    {
      currentPage: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      totalItems: 0,
      totalPages: 0,
    },
  );

  const [invitationFilters, setInvitationFilters] = React.useState<InvitationFilterState>({});
  const [availableRoles] = React.useState<RoleOption[]>(providedRoles);
  const [availableProviders] = React.useState<IdentityProviderOption[]>(providedProviders);

  // ========== MEMBER API CALLS ==========
  const fetchMembers = React.useCallback(async () => {
    if (!coreClient) return;

    setIsFetchingMembers(true);
    try {
      const response = await coreClient.getMyOrganizationApiClient().organization.members.list();
      const mappedMembers = (response.members ?? []).map(mapOrgMemberToMember);
      setMembers(mappedMembers);
    } catch (error) {
      const status = getStatusCode(error);
      if (status !== 404) {
        showToast({ type: 'error', message: t('member.error.fetch_failed') });
      }
      setMembers([]);
    } finally {
      setIsFetchingMembers(false);
    }
  }, [coreClient, t]);

  const removeMember = React.useCallback(
    async (member: Member): Promise<boolean> => {
      if (!coreClient) return false;

      setIsRemovingMember(true);
      try {
        await coreClient
          .getMyOrganizationApiClient()
          .organization.members.delete(member.user_id, { delete_user: false });
        setMembers((prev) => prev.filter((m) => m.user_id !== member.user_id));
        showToast({
          type: 'success',
          message: t('member.remove.success', { name: member.name ?? member.email ?? '' }),
        });
        return true;
      } catch (error) {
        showToast({ type: 'error', message: t('member.error.remove_failed') });
        return false;
      } finally {
        setIsRemovingMember(false);
      }
    },
    [coreClient, t],
  );

  // ========== INVITATION API CALLS ==========
  const fetchInvitations = React.useCallback(
    async (page = 1, filters?: InvitationFilterState) => {
      if (!coreClient) return;

      setIsFetchingInvitations(true);
      try {
        const response = await coreClient
          .getMyOrganizationApiClient()
          .organization.invitations.list();

        // SDK returns an async iterable, collect all invitations
        const allInvitations: Invitation[] = [];
        for await (const invitation of response) {
          allInvitations.push(mapMemberInvitationToInvitation(invitation));
        }

        // Apply filters
        let filteredInvitations = allInvitations;
        const currentFilters = filters ?? invitationFilters;
        if (currentFilters.searchQuery) {
          const query = currentFilters.searchQuery.toLowerCase();
          filteredInvitations = filteredInvitations.filter((inv: Invitation) =>
            inv.invitee.email.toLowerCase().includes(query),
          );
        }

        const totalItems = filteredInvitations.length;
        const totalPages = Math.ceil(totalItems / invitationPagination.pageSize);
        const startIndex = (page - 1) * invitationPagination.pageSize;
        const paginatedInvitations = filteredInvitations.slice(
          startIndex,
          startIndex + invitationPagination.pageSize,
        );

        setInvitations(paginatedInvitations);
        setInvitationPagination((prev) => ({ ...prev, currentPage: page, totalItems, totalPages }));
      } catch (error) {
        const status = getStatusCode(error);
        if (status !== 404) {
          showToast({ type: 'error', message: t('invitation.error.fetch_failed') });
        }
        setInvitations([]);
      } finally {
        setIsFetchingInvitations(false);
      }
    },
    [coreClient, t, invitationFilters, invitationPagination.pageSize],
  );

  const createInvitation = React.useCallback(
    async (data: CreateInvitationInput): Promise<Invitation | null> => {
      if (!coreClient) return null;

      setIsCreatingInvitation(true);
      try {
        const response = await coreClient
          .getMyOrganizationApiClient()
          .organization.invitations.create({
            invitee: { email: data.invitee.email },
            inviter: data.inviter,
            roles: data.roles,
            identity_provider_id: data.identity_provider_id,
            ttl_sec: data.ttl_sec,
          });
        const newInvitation = mapMemberInvitationToInvitation(response);
        showToast({ type: 'success', message: t('invitation.create.success') });
        void fetchInvitations();
        return newInvitation;
      } catch (error) {
        showToast({ type: 'error', message: t('invitation.error.create_failed') });
        return null;
      } finally {
        setIsCreatingInvitation(false);
      }
    },
    [coreClient, t, fetchInvitations],
  );

  const revokeInvitation = React.useCallback(
    async (invitation: Invitation): Promise<boolean> => {
      if (!coreClient) return false;

      setIsRevokingInvitation(true);
      try {
        await coreClient
          .getMyOrganizationApiClient()
          .organization.invitations.delete(invitation.id);
        setInvitations((prev) => prev.filter((inv) => inv.id !== invitation.id));
        showToast({ type: 'success', message: t('invitation.revoke.success') });
        return true;
      } catch (error) {
        showToast({ type: 'error', message: t('invitation.error.revoke_failed') });
        return false;
      } finally {
        setIsRevokingInvitation(false);
      }
    },
    [coreClient, t],
  );

  const resendInvitation = React.useCallback(
    async (invitation: Invitation): Promise<Invitation | null> => {
      if (!coreClient) return null;

      setIsResendingInvitation(true);
      try {
        // Delete and recreate
        await coreClient
          .getMyOrganizationApiClient()
          .organization.invitations.delete(invitation.id);
        const response = await coreClient
          .getMyOrganizationApiClient()
          .organization.invitations.create({
            invitee: { email: invitation.invitee.email },
            roles: invitation.roles,
            identity_provider_id: invitation.identity_provider_id,
          });
        const newInvitation = mapMemberInvitationToInvitation(response);
        showToast({ type: 'success', message: t('invitation.resend.success') });
        void fetchInvitations();
        return newInvitation;
      } catch (error) {
        showToast({ type: 'error', message: t('invitation.error.resend_failed') });
        return null;
      } finally {
        setIsResendingInvitation(false);
      }
    },
    [coreClient, t, fetchInvitations],
  );

  // Fetch data on mount
  React.useEffect(() => {
    if (coreClient) {
      void fetchMembers();
      void fetchInvitations();
    }
  }, [coreClient, fetchMembers, fetchInvitations]);

  return {
    // Member state & actions
    members,
    isFetchingMembers,
    isRemovingMember,
    fetchMembers,
    removeMember,

    // Invitation state & actions
    invitations,
    isFetchingInvitations,
    isCreatingInvitation,
    isRevokingInvitation,
    isResendingInvitation,
    invitationPagination,
    invitationFilters,
    availableRoles,
    availableProviders,
    fetchInvitations,
    createInvitation,
    revokeInvitation,
    resendInvitation,
    setInvitationFilters,
    setInvitationPagination,
  };
}

export type UseOrganizationMemberManagementResult = ReturnType<
  typeof useOrganizationMemberManagement
>;
