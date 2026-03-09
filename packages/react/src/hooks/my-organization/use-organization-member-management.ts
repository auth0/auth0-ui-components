/**
 * Organization member management hook.
 * @module use-organization-member-management
 */

import { type MemberInvitation } from '@auth0/universal-components-core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as React from 'react';

import { showToast } from '@/components/auth0/shared/toast';
import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useTranslator } from '@/hooks/shared/use-translator';
import type {
  ActiveTab,
  Member,
  Invitation,
  CreateInvitationInput,
  InvitationStatus,
  InvitationSortConfig,
  InvitationFilterState,
  RoleOption,
  IdentityProviderOption,
  MemberManagementState,
  MemberManagementHandlers,
  UseOrganizationMemberManagementOptions,
} from '@/types';

const DEFAULT_PAGE_SIZE = 10;

export const memberManagementQueryKeys = {
  all: ['member-management'] as const,
  members: () => [...memberManagementQueryKeys.all, 'members'] as const,
  invitations: () => [...memberManagementQueryKeys.all, 'invitations'] as const,
};

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
 * Maps invitation table column accessor keys to the API's sort_by field names.
 * API sortable fields: email, status, created-at, expires-at, invited-by
 */
const INVITATION_SORT_FIELD_MAP: Record<string, string> = {
  invitee: 'email',
  status: 'status',
  created_at: 'created-at',
  expires_at: 'expires-at',
  inviter: 'invited-by',
};

/**
 * Hook for organization member management.
 * @param options - Hook configuration options.
 * @returns State and handler functions.
 */
export function useOrganizationMemberManagement(options: UseOrganizationMemberManagementOptions): {
  state: MemberManagementState;
  handlers: MemberManagementHandlers;
} {
  const {
    customMessages = {},
    defaultTab = 'members',
    readOnly = false,
    createInvitationAction,
    revokeInvitationAction,
    resendInvitationAction,
    removeMemberAction,
  } = options;
  const { coreClient } = useCoreClient();
  const { t } = useTranslator('member_management', customMessages as Record<string, unknown>);
  const queryClient = useQueryClient();

  /* ---- Common ---- */

  const [activeTab, setActiveTab] = React.useState<ActiveTab>(defaultTab);

  /* ---- Available Roles (from config API) ---- */

  const rolesQuery = useQuery({
    queryKey: [...memberManagementQueryKeys.all, 'roles'],
    queryFn: async () => {
      const response = await coreClient!
        .getMyOrganizationApiClient()
        .organization.configuration.get();
      const roles =
        (response as { allowed_roles?: Array<{ id: string; name: string; description?: string }> })
          ?.allowed_roles ?? [];
      return roles.map((r) => ({
        id: r.id,
        name: r.name,
        ...(r.description ? { description: r.description } : {}),
      }));
    },
    enabled: !!coreClient,
  });

  const availableRoles: RoleOption[] = rolesQuery.data ?? [];

  /* ---- Available Identity Providers (from API) ---- */

  const providersQuery = useQuery({
    queryKey: [...memberManagementQueryKeys.all, 'identity-providers'],
    queryFn: async () => {
      const response = await coreClient!
        .getMyOrganizationApiClient()
        .organization.identityProviders.list();
      const providers =
        (
          response as {
            identity_providers?: Array<{
              id: string;
              name: string;
              display_name?: string;
              strategy?: string;
            }>;
          }
        )?.identity_providers ?? [];
      return providers.map((p) => ({
        id: p.id,
        name: p.display_name ?? p.name,
        type: p.strategy,
      }));
    },
    enabled: !!coreClient,
  });

  const availableProviders: IdentityProviderOption[] = providersQuery.data ?? [];

  /* ---- Invitations ---- */

  const [invitationPageSize, setInvitationPageSize] = React.useState(DEFAULT_PAGE_SIZE);
  const [currentFromToken, setCurrentFromToken] = React.useState<string | undefined>(undefined);
  const [previousTokens, setPreviousTokens] = React.useState<Array<string | undefined>>([]);
  const [invitationCurrentPage, setInvitationCurrentPage] = React.useState(1);
  const [invitationFilters, setInvitationFilters] = React.useState<InvitationFilterState>({});
  const [invitationSortConfig, setInvitationSortConfig] = React.useState<InvitationSortConfig>({
    key: null,
    direction: 'asc',
  });
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);
  const [selectedInvitation, setSelectedInvitation] = React.useState<Invitation | null>(null);

  const invitationsQuery = useQuery({
    queryKey: [
      ...memberManagementQueryKeys.invitations(),
      invitationPageSize,
      currentFromToken,
      invitationFilters,
      invitationSortConfig,
    ],
    queryFn: async () => {
      const apiSortField = invitationSortConfig.key
        ? INVITATION_SORT_FIELD_MAP[invitationSortConfig.key]
        : undefined;
      const sortBy = apiSortField
        ? `${apiSortField}:${invitationSortConfig.direction === 'asc' ? '1' : '-1'}`
        : undefined;

      const page = await coreClient!.getMyOrganizationApiClient().organization.invitations.list({
        take: invitationPageSize,
        from: currentFromToken,
        sort_by: sortBy,
      });

      const invitations: Invitation[] = page.data.map(mapMemberInvitationToInvitation);
      const next = page.response.next ?? null;
      const total = (page.response as Record<string, unknown>).total as number | undefined;

      return {
        invitations,
        next,
        total,
      };
    },
    enabled: !!coreClient && activeTab === 'invitations',
  });

  const currentInvitations = invitationsQuery.data?.invitations ?? [];
  const nextToken = invitationsQuery.data?.next ?? null;
  const invitationsTotalItems = invitationsQuery.data?.total;

  const createInvitationMutation = useMutation({
    mutationFn: async (data: CreateInvitationInput) => {
      if (createInvitationAction?.onBefore && !createInvitationAction.onBefore(data)) {
        throw new Error('Create action cancelled by onBefore');
      }
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
    onSuccess: (result, data) => {
      createInvitationAction?.onAfter?.(data, result);
      showToast({ type: 'success', message: t('invitation.create.success') });
      queryClient.invalidateQueries({ queryKey: memberManagementQueryKeys.invitations() });
    },
    onError: () => {
      showToast({ type: 'error', message: t('invitation.error.create_failed') });
    },
  });

  const revokeInvitationMutation = useMutation({
    mutationFn: async (invitation: Invitation) => {
      if (revokeInvitationAction?.onBefore && !revokeInvitationAction.onBefore(invitation)) {
        throw new Error('Revoke action cancelled by onBefore');
      }
      await coreClient!.getMyOrganizationApiClient().organization.invitations.delete(invitation.id);
      return invitation;
    },
    onSuccess: (invitation) => {
      revokeInvitationAction?.onAfter?.(invitation);
      showToast({ type: 'success', message: t('invitation.revoke.success') });
      queryClient.invalidateQueries({ queryKey: memberManagementQueryKeys.invitations() });
    },
    onError: () => {
      showToast({ type: 'error', message: t('invitation.error.revoke_failed') });
    },
  });

  const resendInvitationMutation = useMutation({
    mutationFn: async (invitation: Invitation) => {
      if (resendInvitationAction?.onBefore && !resendInvitationAction.onBefore(invitation)) {
        throw new Error('Resend action cancelled by onBefore');
      }
      const freshInvitation = await coreClient!
        .getMyOrganizationApiClient()
        .organization.invitations.get(invitation.id);
      await coreClient!
        .getMyOrganizationApiClient()
        .organization.invitations.delete(freshInvitation.id);
      const response = await coreClient!
        .getMyOrganizationApiClient()
        .organization.invitations.create({
          invitee: { email: freshInvitation.invitee?.email ?? invitation.invitee.email },
          roles: freshInvitation.roles ?? invitation.roles,
          identity_provider_id:
            freshInvitation.identity_provider_id ?? invitation.identity_provider_id,
        });
      return mapMemberInvitationToInvitation(response);
    },
    onSuccess: (result, invitation) => {
      resendInvitationAction?.onAfter?.(invitation, result);
      showToast({ type: 'success', message: t('invitation.success.invitation_resent') });
      queryClient.invalidateQueries({ queryKey: memberManagementQueryKeys.invitations() });
    },
    onError: () => {
      showToast({ type: 'error', message: t('invitation.error.resend_failed') });
    },
  });

  const createInvitation = React.useCallback(
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

  const revokeInvitation = React.useCallback(
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

  const resendInvitation = React.useCallback(
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

  const handleCreateClick = React.useCallback(() => {
    if (readOnly) return;
    setShowCreateModal(true);
  }, [readOnly]);

  const handleCreateSubmit = React.useCallback(
    async (data: CreateInvitationInput) => {
      const result = await createInvitation(data);
      if (result) {
        setShowCreateModal(false);
      }
    },
    [createInvitation],
  );

  const handleCreateCancel = React.useCallback(() => {
    setShowCreateModal(false);
  }, []);

  const handleDetailsClick = React.useCallback(
    async (invitation: Invitation) => {
      setSelectedInvitation(invitation);
      setShowDetailsModal(true);
      if (!coreClient) return;
      try {
        const response = await coreClient
          .getMyOrganizationApiClient()
          .organization.invitations.get(invitation.id);
        setSelectedInvitation(mapMemberInvitationToInvitation(response));
      } catch {
        showToast({ type: 'error', message: t('invitation.error.fetch_failed') });
      }
    },
    [coreClient, t],
  );

  const handleDetailsClose = React.useCallback(() => {
    setShowDetailsModal(false);
    setSelectedInvitation(null);
  }, []);

  const [showRevokeModal, setShowRevokeModal] = React.useState(false);
  const [showRevokeResendModal, setShowRevokeResendModal] = React.useState(false);

  const handleRevokeClick = React.useCallback(
    (invitation: Invitation) => {
      if (readOnly) return;
      // Close the details modal if it's open (action triggered from details dialog)
      if (showDetailsModal) {
        setShowDetailsModal(false);
      }
      setSelectedInvitation(invitation);
      setShowRevokeModal(true);
    },
    [readOnly, showDetailsModal],
  );

  const handleRevokeConfirm = React.useCallback(async () => {
    if (!selectedInvitation) return;
    const success = await revokeInvitation(selectedInvitation);
    if (success) {
      setShowRevokeModal(false);
      setSelectedInvitation(null);
    }
  }, [selectedInvitation, revokeInvitation]);

  const handleRevokeCancel = React.useCallback(() => {
    setShowRevokeModal(false);
  }, []);

  const handleRevokeResendClick = React.useCallback(
    (invitation: Invitation) => {
      if (readOnly) return;
      // Close the details modal if it's open (action triggered from details dialog)
      if (showDetailsModal) {
        setShowDetailsModal(false);
      }
      setSelectedInvitation(invitation);
      setShowRevokeResendModal(true);
    },
    [readOnly, showDetailsModal],
  );

  const handleRevokeResendConfirm = React.useCallback(async () => {
    if (!selectedInvitation) return;
    const result = await resendInvitation(selectedInvitation);
    if (result) {
      setShowRevokeResendModal(false);
      setSelectedInvitation(null);
    }
  }, [selectedInvitation, resendInvitation]);

  const handleRevokeResendCancel = React.useCallback(() => {
    setShowRevokeResendModal(false);
  }, []);

  const handleCopyUrl = React.useCallback(
    async (invitation: Invitation) => {
      if (!invitation.invitation_url) return;
      try {
        await navigator.clipboard.writeText(invitation.invitation_url);
        showToast({ type: 'success', message: t('invitation.copy_url.success') });
      } catch {
        showToast({ type: 'error', message: t('invitation.copy_url.failed') });
      }
    },
    [t],
  );

  const handleNextPage = React.useCallback(() => {
    if (nextToken) {
      setPreviousTokens((prev) => [...prev, currentFromToken]);
      setCurrentFromToken(nextToken);
      setInvitationCurrentPage((prev) => prev + 1);
    }
  }, [nextToken, currentFromToken]);

  const handlePreviousPage = React.useCallback(() => {
    setPreviousTokens((prev) => {
      const newStack = [...prev];
      const previousToken = newStack.pop();
      setCurrentFromToken(previousToken);
      return newStack;
    });
    setInvitationCurrentPage((prev) => Math.max(1, prev - 1));
  }, []);

  const handlePageSizeChange = React.useCallback((pageSize: number) => {
    setInvitationPageSize(pageSize);
    setCurrentFromToken(undefined);
    setPreviousTokens([]);
    setInvitationCurrentPage(1);
  }, []);

  const handleRoleFilterChange = React.useCallback((roleId: string | undefined) => {
    setInvitationFilters((prev) => ({ ...prev, roleId }));
    setCurrentFromToken(undefined);
    setPreviousTokens([]);
    setInvitationCurrentPage(1);
  }, []);

  const handleSortChange = React.useCallback((sortConfig: InvitationSortConfig) => {
    setInvitationSortConfig(sortConfig);
    setCurrentFromToken(undefined);
    setPreviousTokens([]);
    setInvitationCurrentPage(1);
  }, []);

  /* ---- Members ---- */

  const [showRemoveModal, setShowRemoveModal] = React.useState(false);
  const [selectedMember, setSelectedMember] = React.useState<Member | null>(null);

  const membersQuery = useQuery({
    queryKey: memberManagementQueryKeys.members(),
    queryFn: async () => {
      const response = await coreClient!.getMyOrganizationApiClient().organization.members.list();
      return (response.members ?? []).map(mapOrgMemberToMember);
    },
    enabled: !!coreClient && activeTab === 'members',
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (member: Member) => {
      if (removeMemberAction?.onBefore && !removeMemberAction.onBefore(member)) {
        throw new Error('Remove action cancelled by onBefore');
      }
      await coreClient!
        .getMyOrganizationApiClient()
        .organization.members.delete(member.user_id, { delete_user: false });
      return member;
    },
    onSuccess: (member) => {
      removeMemberAction?.onAfter?.(member);
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

  const removeMember = React.useCallback(
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

  const handleRemoveClick = React.useCallback(
    (member: Member) => {
      if (readOnly) return;
      setSelectedMember(member);
      setShowRemoveModal(true);
    },
    [readOnly],
  );

  const handleRemoveConfirm = React.useCallback(async () => {
    if (!selectedMember) return;
    const success = await removeMember(selectedMember);
    if (success) {
      setShowRemoveModal(false);
      setSelectedMember(null);
    }
  }, [selectedMember, removeMember]);

  const handleRemoveCancel = React.useCallback(() => {
    setShowRemoveModal(false);
    setSelectedMember(null);
  }, []);

  const state: MemberManagementState = {
    activeTab,
    isLoading:
      membersQuery.isLoading ||
      membersQuery.isFetching ||
      invitationsQuery.isLoading ||
      invitationsQuery.isFetching,
    availableRoles,
    availableProviders,

    invitations: currentInvitations,
    isFetchingInvitations: invitationsQuery.isLoading || invitationsQuery.isFetching,
    isCreatingInvitation: createInvitationMutation.isPending,
    isRevokingInvitation: revokeInvitationMutation.isPending,
    isResendingInvitation: resendInvitationMutation.isPending,
    invitationPagination: {
      pageSize: invitationPageSize,
      currentPage: invitationCurrentPage,
      totalItems: invitationsTotalItems,
      hasNextPage: !!nextToken,
      hasPreviousPage: previousTokens.length > 0,
    },
    invitationFilters,
    invitationSortConfig,
    showCreateModal,
    showDetailsModal,
    showRevokeModal,
    showRevokeResendModal,
    selectedInvitation,

    members: membersQuery.data ?? [],
    isFetchingMembers: membersQuery.isLoading || membersQuery.isFetching,
    isRemovingMember: removeMemberMutation.isPending,
    showRemoveModal,
    selectedMember,
  };

  const handlers: MemberManagementHandlers = {
    setActiveTab,

    handleCreateClick,
    handleCreateSubmit,
    handleCreateCancel,
    handleDetailsClick,
    handleDetailsClose,
    handleRevokeClick,
    handleRevokeConfirm,
    handleRevokeCancel,
    handleRevokeResendClick,
    handleRevokeResendConfirm,
    handleRevokeResendCancel,
    handleCopyUrl,
    handleNextPage,
    handlePreviousPage,
    handlePageSizeChange,
    handleSortChange,
    handleRoleFilterChange,

    handleRemoveClick,
    handleRemoveConfirm,
    handleRemoveCancel,
  };

  return { state, handlers };
}

export type UseOrganizationMemberManagementResult = ReturnType<
  typeof useOrganizationMemberManagement
>;
