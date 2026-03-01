/**
 * Member management data and mutations hook.
 * @module use-organization-member-management
 */

import { getStatusCode, type MemberInvitation } from '@auth0/universal-components-core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useCallback } from 'react';

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

export const memberManagementQueryKeys = {
  all: ['member-management'] as const,
  members: () => [...memberManagementQueryKeys.all, 'members'] as const,
  invitations: () => [...memberManagementQueryKeys.all, 'invitations'] as const,
};

export interface UseOrganizationMemberManagementOptions {
  customMessages?: OrganizationMemberManagementMessages;
  availableRoles?: RoleOption[];
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
 * Hook for organization member management data and mutations.
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
  const queryClient = useQueryClient();

  const [invitationPagination, setInvitationPagination] = useState<InvitationPaginationState>({
    currentPage: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    totalItems: 0,
    totalPages: 0,
  });
  const [invitationFilters, setInvitationFilters] = useState<InvitationFilterState>({});
  const [availableRoles] = useState<RoleOption[]>(providedRoles);
  const [availableProviders] = useState<IdentityProviderOption[]>(providedProviders);

  const membersQuery = useQuery({
    queryKey: memberManagementQueryKeys.members(),
    queryFn: async () => {
      const response = await coreClient!.getMyOrganizationApiClient().organization.members.list();
      return (response.members ?? []).map(mapOrgMemberToMember);
    },
    enabled: false,
  });

  const invitationsQuery = useQuery({
    queryKey: memberManagementQueryKeys.invitations(),
    queryFn: async () => {
      const response = await coreClient!
        .getMyOrganizationApiClient()
        .organization.invitations.list();

      const allInvitations: Invitation[] = [];
      for await (const invitation of response) {
        allInvitations.push(mapMemberInvitationToInvitation(invitation));
      }
      return allInvitations;
    },
    enabled: false,
  });

  const allInvitations = invitationsQuery.data ?? [];

  const filteredInvitations = (() => {
    let result = allInvitations;
    if (invitationFilters.searchQuery) {
      const query = invitationFilters.searchQuery.toLowerCase();
      result = result.filter((inv) => inv.invitee.email.toLowerCase().includes(query));
    }
    if (invitationFilters.roleId) {
      result = result.filter((inv) => inv.roles?.includes(invitationFilters.roleId!));
    }
    return result;
  })();

  const totalItems = filteredInvitations.length;
  const totalPages = Math.ceil(totalItems / invitationPagination.pageSize);
  const startIndex = (invitationPagination.currentPage - 1) * invitationPagination.pageSize;
  const paginatedInvitations = filteredInvitations.slice(
    startIndex,
    startIndex + invitationPagination.pageSize,
  );

  const fetchMembers = useCallback(async () => {
    if (!coreClient) return;
    try {
      await membersQuery.refetch();
    } catch (error) {
      const status = getStatusCode(error);
      if (status !== 404) {
        showToast({ type: 'error', message: t('member.error.fetch_failed') });
      }
    }
  }, [coreClient, membersQuery, t]);

  const fetchInvitations = useCallback(
    async (page = 1) => {
      if (!coreClient) return;
      try {
        await invitationsQuery.refetch();
        setInvitationPagination((prev) => ({ ...prev, currentPage: page }));
      } catch (error) {
        const status = getStatusCode(error);
        if (status !== 404) {
          showToast({ type: 'error', message: t('invitation.error.fetch_failed') });
        }
      }
    },
    [coreClient, invitationsQuery, t],
  );

  const removeMemberMutation = useMutation({
    mutationFn: async (member: Member) => {
      await coreClient!
        .getMyOrganizationApiClient()
        .organization.members.delete(member.user_id, { delete_user: false });
      return member;
    },
    onSuccess: (member) => {
      showToast({
        type: 'success',
        message: t('member.remove.success', { name: member.name ?? member.email ?? '' }),
      });
      queryClient.invalidateQueries({ queryKey: memberManagementQueryKeys.members() });
    },
    onError: () => {
      showToast({ type: 'error', message: t('member.error.remove_failed') });
    },
  });

  const createInvitationMutation = useMutation({
    mutationFn: async (data: CreateInvitationInput) => {
      const response = await coreClient!
        .getMyOrganizationApiClient()
        .organization.invitations.create({
          invitee: { email: data.invitee.email },
          inviter: data.inviter,
          roles: data.roles,
          identity_provider_id: data.identity_provider_id,
          ttl_sec: data.ttl_sec,
        });
      return mapMemberInvitationToInvitation(response);
    },
    onSuccess: () => {
      showToast({ type: 'success', message: t('invitation.create.success') });
      queryClient.invalidateQueries({ queryKey: memberManagementQueryKeys.invitations() });
    },
    onError: () => {
      showToast({ type: 'error', message: t('invitation.error.create_failed') });
    },
  });

  const revokeInvitationMutation = useMutation({
    mutationFn: async (invitation: Invitation) => {
      await coreClient!.getMyOrganizationApiClient().organization.invitations.delete(invitation.id);
      return invitation;
    },
    onSuccess: () => {
      showToast({ type: 'success', message: t('invitation.revoke.success') });
      queryClient.invalidateQueries({ queryKey: memberManagementQueryKeys.invitations() });
    },
    onError: () => {
      showToast({ type: 'error', message: t('invitation.error.revoke_failed') });
    },
  });

  const resendInvitationMutation = useMutation({
    mutationFn: async (invitation: Invitation) => {
      await coreClient!.getMyOrganizationApiClient().organization.invitations.delete(invitation.id);
      const response = await coreClient!
        .getMyOrganizationApiClient()
        .organization.invitations.create({
          invitee: { email: invitation.invitee.email },
          roles: invitation.roles,
          identity_provider_id: invitation.identity_provider_id,
        });
      return mapMemberInvitationToInvitation(response);
    },
    onSuccess: () => {
      showToast({ type: 'success', message: t('invitation.success.invitation_resent') });
      queryClient.invalidateQueries({ queryKey: memberManagementQueryKeys.invitations() });
    },
    onError: () => {
      showToast({ type: 'error', message: t('invitation.error.resend_failed') });
    },
  });

  const removeMember = useCallback(
    async (member: Member): Promise<boolean> => {
      if (!coreClient) return false;
      try {
        await removeMemberMutation.mutateAsync(member);
        return true;
      } catch {
        return false;
      }
    },
    [coreClient, removeMemberMutation],
  );

  const createInvitation = useCallback(
    async (data: CreateInvitationInput): Promise<Invitation | null> => {
      if (!coreClient) return null;
      try {
        return await createInvitationMutation.mutateAsync(data);
      } catch {
        return null;
      }
    },
    [coreClient, createInvitationMutation],
  );

  const revokeInvitation = useCallback(
    async (invitation: Invitation): Promise<boolean> => {
      if (!coreClient) return false;
      try {
        await revokeInvitationMutation.mutateAsync(invitation);
        return true;
      } catch {
        return false;
      }
    },
    [coreClient, revokeInvitationMutation],
  );

  const resendInvitation = useCallback(
    async (invitation: Invitation): Promise<Invitation | null> => {
      if (!coreClient) return null;
      try {
        return await resendInvitationMutation.mutateAsync(invitation);
      } catch {
        return null;
      }
    },
    [coreClient, resendInvitationMutation],
  );

  return {
    members: membersQuery.data ?? [],
    isFetchingMembers: membersQuery.isLoading || membersQuery.isFetching,
    isRemovingMember: removeMemberMutation.isPending,
    fetchMembers,
    removeMember,

    invitations: paginatedInvitations,
    isFetchingInvitations: invitationsQuery.isLoading || invitationsQuery.isFetching,
    isCreatingInvitation: createInvitationMutation.isPending,
    isRevokingInvitation: revokeInvitationMutation.isPending,
    isResendingInvitation: resendInvitationMutation.isPending,
    invitationPagination: {
      ...invitationPagination,
      totalItems,
      totalPages,
    },
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
