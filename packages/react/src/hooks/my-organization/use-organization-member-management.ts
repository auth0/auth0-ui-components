/**
 * Organization member management hook.
 * @module use-organization-member-management
 */

import {
  type MemberInvitation,
  type ListIdentityProvidersResponseContent,
} from '@auth0/universal-components-core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as React from 'react';

import { showToast } from '@/components/auth0/shared/toast';
import { useConfig } from '@/hooks/my-organization/use-config';
import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useTranslator } from '@/hooks/shared/use-translator';
import type {
  CreateInvitationInput,
  InvitationSortConfig,
  InvitationFilterState,
  RoleOption,
  IdentityProviderOption,
} from '@/types/my-organization/member-management/organization-invitation-table-types';
import type {
  ActiveTab,
  MemberManagementState,
  MemberManagementHandlers,
  UseOrganizationMemberManagementOptions,
} from '@/types/my-organization/member-management/organization-member-management-types';

const DEFAULT_PAGE_SIZE = 10;

export const memberManagementQueryKeys = {
  all: ['member-management'] as const,
  invitations: () => [...memberManagementQueryKeys.all, 'invitations'] as const,
};

/**
 * Maps invitation table column accessor keys to the API's sort field names.
 */
const INVITATION_SORT_FIELD_MAP: Record<string, string> = {
  created_at: 'created_at',
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
    readOnly = false,
    createInvitationAction,
    revokeInvitationAction,
    resendInvitationAction,
  } = options;
  const { coreClient } = useCoreClient();
  const { t } = useTranslator('member_management', customMessages as Record<string, unknown>);
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = React.useState<ActiveTab>('members');

  const { allowedRoles } = useConfig();
  const availableRoles: RoleOption[] = allowedRoles;

  const providersQuery = useQuery({
    queryKey: [...memberManagementQueryKeys.all, 'identity-providers'],
    queryFn: async () => {
      const response: ListIdentityProvidersResponseContent = await coreClient!
        .getMyOrganizationApiClient()
        .organization.identityProviders.list();
      const providers = response.identity_providers ?? [];
      return providers.map((p) => ({
        id: p.id!,
        name: p.display_name ?? p.name ?? '',
        type: p.strategy,
      }));
    },
    enabled: !!coreClient && activeTab === 'invitations',
  });

  const availableProviders: IdentityProviderOption[] = providersQuery.data ?? [];

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
  const [selectedInvitation, setSelectedInvitation] = React.useState<MemberInvitation | null>(null);
  const detailsRequestIdRef = React.useRef(0);

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
        sort: sortBy,
      });

      const invitations: MemberInvitation[] = page.data;
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
          invitees: [{ email: data.invitee.email, roles: data.roles }],
          inviter: data.inviter,
          ttl_sec: data.ttl_sec,
        });
      return Array.isArray(response) ? response[0] : response;
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
    mutationFn: async (invitation: MemberInvitation) => {
      if (revokeInvitationAction?.onBefore && !revokeInvitationAction.onBefore(invitation)) {
        throw new Error('Revoke action cancelled by onBefore');
      }
      await coreClient!
        .getMyOrganizationApiClient()
        .organization.invitations.delete(invitation.id!);
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
    mutationFn: async (invitation: MemberInvitation) => {
      if (resendInvitationAction?.onBefore && !resendInvitationAction.onBefore(invitation)) {
        throw new Error('Resend action cancelled by onBefore');
      }
      const freshInvitation = await coreClient!
        .getMyOrganizationApiClient()
        .organization.invitations.get(invitation.id!);
      await coreClient!
        .getMyOrganizationApiClient()
        .organization.invitations.delete(freshInvitation.id ?? invitation.id!);
      const email = freshInvitation.invitee?.email ?? invitation.invitee?.email ?? '';
      const roles = freshInvitation.roles ?? invitation.roles;
      const response = await coreClient!
        .getMyOrganizationApiClient()
        .organization.invitations.create({
          invitees: [{ email, roles }],
        });
      return Array.isArray(response) ? response[0] : response;
    },
    onSuccess: (result, invitation) => {
      resendInvitationAction?.onAfter?.(invitation, result);
      showToast({ type: 'success', message: t('invitation.success.invitation_resent') });
      queryClient.invalidateQueries({ queryKey: memberManagementQueryKeys.invitations() });
    },
    onError: () => {
      showToast({ type: 'error', message: t('invitation.error.resend_failed') });
      queryClient.invalidateQueries({ queryKey: memberManagementQueryKeys.invitations() });
    },
  });

  const handleCreateClick = React.useCallback(() => {
    if (readOnly) return;
    setShowCreateModal(true);
  }, [readOnly]);

  const handleCreateSubmit = React.useCallback(
    (data: CreateInvitationInput) => {
      if (!coreClient) return;
      createInvitationMutation.mutate(data, {
        onSuccess: () => setShowCreateModal(false),
      });
    },
    [coreClient],
  );

  const handleCreateCancel = React.useCallback(() => {
    setShowCreateModal(false);
  }, []);

  const handleDetailsClick = React.useCallback(
    async (invitation: MemberInvitation) => {
      setSelectedInvitation(invitation);
      setShowDetailsModal(true);
      if (!coreClient) return;
      const requestId = ++detailsRequestIdRef.current;
      try {
        const response = await coreClient
          .getMyOrganizationApiClient()
          .organization.invitations.get(invitation.id!);
        if (detailsRequestIdRef.current === requestId) {
          setSelectedInvitation(response);
        }
      } catch {
        if (detailsRequestIdRef.current === requestId) {
          showToast({ type: 'error', message: t('invitation.error.fetch_failed') });
        }
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
    (invitation: MemberInvitation) => {
      if (readOnly) return;
      if (showDetailsModal) {
        setShowDetailsModal(false);
      }
      setSelectedInvitation(invitation);
      setShowRevokeModal(true);
    },
    [readOnly, showDetailsModal],
  );

  const handleRevokeConfirm = React.useCallback(() => {
    if (!selectedInvitation || !coreClient) return;
    revokeInvitationMutation.mutate(selectedInvitation, {
      onSuccess: () => {
        setShowRevokeModal(false);
        setSelectedInvitation(null);
      },
    });
  }, [selectedInvitation, coreClient]);

  const handleRevokeCancel = React.useCallback(() => {
    setShowRevokeModal(false);
  }, []);

  const handleRevokeResendClick = React.useCallback(
    (invitation: MemberInvitation) => {
      if (readOnly) return;
      if (showDetailsModal) {
        setShowDetailsModal(false);
      }
      setSelectedInvitation(invitation);
      setShowRevokeResendModal(true);
    },
    [readOnly, showDetailsModal],
  );

  const handleRevokeResendConfirm = React.useCallback(() => {
    if (!selectedInvitation || !coreClient) return;
    resendInvitationMutation.mutate(selectedInvitation, {
      onSuccess: () => {
        setShowRevokeResendModal(false);
        setSelectedInvitation(null);
      },
    });
  }, [selectedInvitation, coreClient]);

  const handleRevokeResendCancel = React.useCallback(() => {
    setShowRevokeResendModal(false);
  }, []);

  const handleCopyUrl = React.useCallback(
    async (invitation: MemberInvitation) => {
      if (!invitation.invitation_url) return;
      try {
        await navigator.clipboard.writeText(invitation.invitation_url);
        showToast({ type: 'success', message: t('invitation.success.url_copied') });
      } catch {
        showToast({ type: 'error', message: t('invitation.error.copy_url_failed') });
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
    const previousToken = previousTokens[previousTokens.length - 1];
    setPreviousTokens((prev) => prev.slice(0, -1));
    setCurrentFromToken(previousToken);
    setInvitationCurrentPage((prev) => Math.max(1, prev - 1));
  }, [previousTokens]);

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

  const state: MemberManagementState = {
    activeTab,
    isLoading: invitationsQuery.isLoading || invitationsQuery.isFetching,
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
  };

  return { state, handlers };
}

export type UseOrganizationMemberManagementResult = ReturnType<
  typeof useOrganizationMemberManagement
>;
