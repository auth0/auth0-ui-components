/**
 * Organization member management hook.
 * @module use-organization-member-management
 */

import { type MemberInvitation } from '@auth0/universal-components-core';
import * as React from 'react';

import { showToast } from '@/components/auth0/shared/toast';
import { useMemberManagementService } from '@/hooks/my-organization/shared/services/use-member-management-service';
import { useCheckpointPagination } from '@/hooks/shared/use-checkpoint-pagination';
import { useTranslator } from '@/hooks/shared/use-translator';
import type {
  CreateInvitationInput,
  MemberManagementFilterState,
  MemberManagementSortConfig,
  IdentityProviderOption,
} from '@/types/my-organization/member-management/organization-invitation-table-types';
import type {
  ActiveTab,
  MemberManagementModalState,
  UseOrganizationMemberManagementOptions,
  UseOrganizationMemberManagementResult,
} from '@/types/my-organization/member-management/organization-member-management-types';

/**
 * Hook for organization member management.
 * @param options - Hook configuration options.
 * @returns State and handler functions.
 */
export function useOrganizationMemberManagement(
  options: UseOrganizationMemberManagementOptions,
): UseOrganizationMemberManagementResult {
  const {
    customMessages = {},
    readOnly = false,
    createInvitationAction,
    revokeInvitationAction,
    resendInvitationAction,
    assignRoleAction,
    removeFromOrgAction,
  } = options;

  const { t } = useTranslator('member_management', customMessages);

  const [activeTab, setActiveTab] = React.useState<ActiveTab>('members');

  /** Pagination and sorting for invitations */
  const {
    pageSize: invitationPageSize,
    currentPage: invitationCurrentPage,
    fromToken: invitationFromToken,
    hasPreviousPage: invitationHasPreviousPage,
    sortConfig: invitationSortConfig,
    filters: invitationFilters,
    goToNextPage: invitationGoToNextPage,
    goToPreviousPage: invitationGoToPreviousPage,
    changePageSize: invitationChangePageSize,
    changeSortConfig: invitationChangeSortConfig,
    changeFilters: invitationChangeFilters,
  } = useCheckpointPagination<MemberManagementFilterState>();

  /** Pagination and sorting for members */
  const {
    pageSize: memberPageSize,
    currentPage: memberCurrentPage,
    fromToken: memberFromToken,
    hasPreviousPage: memberHasPreviousPage,
    sortConfig: memberSortConfig,
    filters: memberFilters,
    goToNextPage: memberGoToNextPage,
    goToPreviousPage: memberGoToPreviousPage,
    changePageSize: memberChangePageSize,
    changeSortConfig: memberChangeSortConfig,
    changeFilters: memberChangeFilters,
  } = useCheckpointPagination<MemberManagementFilterState>();

  const [modalState, setModalState] = React.useState<MemberManagementModalState>({ type: null });
  const detailsRequestIdRef = React.useRef(0);

  const {
    providersQuery,
    rolesQuery,
    invitationsQuery,
    membersQuery,
    assignRoleMutation,
    removeFromOrgMutation,
    createInvitationMutation,
    revokeInvitationMutation,
    resendInvitationMutation,
    fetchInvitationDetails,
  } = useMemberManagementService({
    customMessages,
    activeTab,
    createInvitationAction,
    revokeInvitationAction,
    resendInvitationAction,
    invitationParams: {
      pageSize: invitationPageSize,
      fromToken: invitationFromToken,
      sortConfig: invitationSortConfig,
      filters: invitationFilters,
    },
    memberParams: {
      pageSize: memberPageSize,
      fromToken: memberFromToken,
      sortConfig: memberSortConfig,
      filters: memberFilters,
    },
    assignRoleAction,
    removeFromOrgAction,
  });

  const availableProviders: IdentityProviderOption[] = providersQuery.data ?? [];
  const availableRoles = rolesQuery.data ?? [];
  const currentInvitations = invitationsQuery.data?.invitations ?? [];
  const currentMembers = membersQuery.data?.members ?? [];
  const invitationNextToken = invitationsQuery.data?.next ?? null;
  const memberNextToken = membersQuery.data?.next ?? null;

  const openModal = React.useCallback(
    async (state: MemberManagementModalState) => {
      if (state.type === 'create' && readOnly) return;
      if ((state.type === 'revoke' || state.type === 'revokeResend') && readOnly) return;
      setModalState(state);

      if (state.type === 'details') {
        const requestId = ++detailsRequestIdRef.current;
        try {
          const response = await fetchInvitationDetails(state.invitation.id!);
          if (detailsRequestIdRef.current === requestId) {
            setModalState({ type: 'details', invitation: response });
          }
        } catch {
          if (detailsRequestIdRef.current === requestId) {
            showToast({ type: 'error', message: t('invitation.error.fetch_failed') });
          }
        }
      }
    },
    [readOnly, fetchInvitationDetails, t],
  );

  const closeModal = React.useCallback(() => {
    setModalState({ type: null });
  }, []);

  const handleCreateSubmit = React.useCallback(
    (data: CreateInvitationInput) => {
      createInvitationMutation.mutate(data, {
        onSuccess: () => closeModal(),
      });
    },
    [createInvitationMutation, closeModal],
  );

  const handleRevokeConfirm = React.useCallback(() => {
    if (modalState.type !== 'revoke') return;
    revokeInvitationMutation.mutate(modalState.invitation, {
      onSuccess: () => closeModal(),
    });
  }, [modalState, revokeInvitationMutation, closeModal]);

  const handleRevokeResendConfirm = React.useCallback(() => {
    if (modalState.type !== 'revokeResend') return;
    resendInvitationMutation.mutate(modalState.invitation, {
      onSuccess: () => closeModal(),
    });
  }, [modalState, resendInvitationMutation, closeModal]);

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

  const handleAssignRole = React.useCallback(
    (userId: string, roleId: string[]) => {
      assignRoleMutation.mutate({ userId, roleIds: roleId });
    },
    [assignRoleMutation],
  );

  const handleRemoveFromOrg = React.useCallback(
    (userId: string) => {
      removeFromOrgMutation.mutate(userId);
    },
    [removeFromOrgMutation],
  );

  const handleNextPage = React.useCallback(() => {
    if (activeTab === 'members' && memberNextToken) {
      memberGoToNextPage(memberNextToken);
    } else if (invitationNextToken) {
      invitationGoToNextPage(invitationNextToken);
    }
  }, [activeTab, invitationNextToken, memberNextToken, invitationGoToNextPage, memberGoToNextPage]);

  const handlePreviousPage = React.useCallback(() => {
    if (activeTab === 'members') {
      memberGoToPreviousPage();
    } else invitationGoToPreviousPage();
  }, [activeTab, invitationGoToPreviousPage, memberGoToPreviousPage]);

  const handlePageSizeChange = React.useCallback(
    (pageSize: number) => {
      if (activeTab === 'members') {
        memberChangePageSize(pageSize);
      } else invitationChangePageSize(pageSize);
    },
    [activeTab, invitationChangePageSize, memberChangePageSize],
  );

  const handleSortChange = React.useCallback(
    (sortConfig: MemberManagementSortConfig) => {
      if (activeTab === 'members') {
        memberChangeSortConfig(sortConfig);
      } else invitationChangeSortConfig(sortConfig);
    },
    [activeTab, invitationChangeSortConfig, memberChangeSortConfig],
  );

  const handleRoleFilterChange = React.useCallback(
    (roleId: string | undefined) => {
      if (activeTab === 'members') {
        memberChangeFilters((prev) => ({ ...prev, roleId }));
      } else invitationChangeFilters((prev) => ({ ...prev, roleId }));
    },
    [activeTab, invitationChangeFilters, memberChangeFilters],
  );

  return {
    activeTab,
    availableRoles,
    availableProviders,

    invitations: currentInvitations,
    members: currentMembers,
    isFetchingInvitations: invitationsQuery.isLoading || invitationsQuery.isFetching,
    isFetchingMembers: membersQuery.isLoading || membersQuery.isFetching,
    isFetchingRoles: rolesQuery.isLoading || rolesQuery.isFetching,
    isCreatingInvitation: createInvitationMutation.isPending,
    isRevokingInvitation: revokeInvitationMutation.isPending,
    isResendingInvitation: resendInvitationMutation.isPending,
    invitationPagination: {
      pageSize: invitationPageSize,
      currentPage: invitationCurrentPage,
      hasNextPage: !!invitationNextToken,
      hasPreviousPage: invitationHasPreviousPage,
    },
    memberPagination: {
      pageSize: memberPageSize,
      currentPage: memberCurrentPage,
      hasNextPage: !!memberNextToken,
      hasPreviousPage: memberHasPreviousPage,
    },
    invitationFilters,
    invitationSortConfig,
    memberFilters,
    memberSortConfig,
    modalState,
    isRemovingFromOrg: removeFromOrgMutation.isPending,
    isAssigningRole: assignRoleMutation.isPending,

    setActiveTab,
    openModal,
    closeModal,
    handleCreateSubmit,
    handleRevokeConfirm,
    handleRevokeResendConfirm,
    handleCopyUrl,
    handleNextPage,
    handlePreviousPage,
    handlePageSizeChange,
    handleSortChange,
    handleRoleFilterChange,
    handleAssignRole,
    handleRemoveFromOrg,
  };
}
