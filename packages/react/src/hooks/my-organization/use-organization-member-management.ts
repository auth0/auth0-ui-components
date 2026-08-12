/**
 * Organization member management hook.
 * @module use-organization-member-management
 */

import type { Role } from '@auth0/universal-components-core';
import { type MemberInvitation } from '@auth0/universal-components-core';
import * as React from 'react';

import { showToast } from '@/components/auth0/shared/toast';
import { useMemberManagementService } from '@/hooks/my-organization/shared/services/use-member-management-service';
import { useCheckpointPagination } from '@/hooks/shared/use-checkpoint-pagination';
import { useTranslator } from '@/hooks/shared/use-translator';
import { ROLES_PREFETCH_THRESHOLD } from '@/lib/constants/my-organization/member-management/member-management-constants';
import { isMutationLoading } from '@/lib/utils/tanstack-compat';
import type {
  ConnectionOption,
  CreateInvitationInput,
} from '@/types/my-organization/member-management/organization-invitation-table-types';
import type {
  ActiveTab,
  MemberManagementModalState,
  MemberManagementFilterState,
  MemberManagementSortConfig,
  UseOrganizationMemberManagementOptions,
  UseOrganizationMemberManagementResult,
  ViewMemberDetailsParams,
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
    viewMemberDetailsAction,
    assignRolesAction,
    removeFromOrganizationAction,
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
  const [selectedInvitations, setSelectedInvitations] = React.useState<MemberInvitation[]>([]);
  const detailsRequestIdRef = React.useRef(0);

  const selectedMemberForRoles = modalState.type === 'assignRole' ? modalState.member : null;
  const selectedMemberRolesCount = selectedMemberForRoles?.roles?.length ?? 0;

  const {
    providersQuery,
    userStoresQuery,
    rolesQuery,
    rolesSearchQuery,
    setRoleSearchTerm,
    enableRoleSearch,
    invitationsQuery,
    membersQuery,
    organizationQuery,
    memberRolesQuery,
    createInvitationMutation,
    revokeInvitationMutation,
    resendInvitationMutation,
    assignRolesMutation,
    removeFromOrganizationMutation,
    fetchInvitationDetails,
  } = useMemberManagementService({
    customMessages,
    activeTab,
    userId: selectedMemberForRoles?.user_id,
    memberRolesQueryEnabled:
      modalState.type === 'assignRole' && selectedMemberRolesCount >= ROLES_PREFETCH_THRESHOLD,
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
    assignRolesAction,
    removeFromOrganizationAction,
    deferRoleSearch: true,
  });

  React.useEffect(() => {
    if (modalState.type === 'create' || modalState.type === 'assignRole') {
      enableRoleSearch();
    }
  }, [modalState.type, enableRoleSearch]);

  React.useEffect(() => {
    setSelectedInvitations([]);
  }, [activeTab, invitationFilters, invitationSortConfig]);

  const availableConnections: ConnectionOption[] = React.useMemo(
    () => [...(providersQuery.data ?? []), ...(userStoresQuery.data ?? [])],
    [providersQuery.data, userStoresQuery.data],
  );
  const availableRoles = rolesQuery.data ?? [];
  const searchedRoles = rolesSearchQuery.data ?? [];
  const currentInvitations = invitationsQuery.data?.invitations ?? [];
  const currentMembers = membersQuery.data?.members ?? [];
  const invitationNextToken = invitationsQuery.data?.next ?? null;
  const memberNextToken = membersQuery.data?.next ?? null;
  const organizationDisplayName = organizationQuery.data?.display_name ?? '';

  const openModal = React.useCallback(
    async (state: MemberManagementModalState) => {
      if (state.type === 'create' && readOnly) return;
      if ((state.type === 'revoke' || state.type === 'revokeResend') && readOnly) return;
      if (state.type === 'bulkRevoke' && readOnly) return;
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
    const invitations =
      modalState.type === 'revoke'
        ? [modalState.invitation]
        : modalState.type === 'bulkRevoke'
          ? modalState.invitations
          : [];
    if (invitations.length === 0) return;
    revokeInvitationMutation.mutate(invitations, {
      onSuccess: () => {
        setSelectedInvitations([]);
        closeModal();
      },
    });
  }, [modalState, revokeInvitationMutation, closeModal]);

  const handleRevokeResendConfirm = React.useCallback(() => {
    if (modalState.type !== 'revokeResend') return;
    resendInvitationMutation.mutate(modalState.invitation, {
      onSuccess: () => closeModal(),
    });
  }, [modalState, resendInvitationMutation, closeModal]);

  const handleBulkRevokeClick = React.useCallback(
    (invitations: MemberInvitation[]) => {
      if (readOnly || invitations.length === 0) return;
      openModal({ type: 'bulkRevoke', invitations });
    },
    [readOnly, openModal],
  );

  const handleCopyUrl = React.useCallback(async (invitation: MemberInvitation) => {
    if (!invitation.invitation_url) return;
    await navigator.clipboard.writeText(invitation.invitation_url);
  }, []);

  const handleViewMemberDetails = React.useCallback(
    (params: ViewMemberDetailsParams) => {
      viewMemberDetailsAction?.onAfter?.(params);
    },
    [viewMemberDetailsAction],
  );

  const handleAssignRolesSubmit = React.useCallback(
    (roleIds: string[], memberRoles: Role[], userId?: string | null) => {
      assignRolesMutation.mutate(
        { roleIds, memberRoles, userId },
        {
          onSuccess: (result) => {
            if (result?.aborted) return;
            closeModal();
          },
        },
      );
    },
    [assignRolesMutation, closeModal],
  );

  const handleRemoveFromOrganizationConfirm = React.useCallback(
    (userId?: string | null, memberName?: string, organizationName?: string) => {
      removeFromOrganizationMutation.mutate(
        { userId, memberName, organizationName },
        {
          onSuccess: () => {
            closeModal();
          },
        },
      );
    },
    [removeFromOrganizationMutation, closeModal],
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
    } else {
      invitationGoToPreviousPage();
    }
  }, [activeTab, invitationGoToPreviousPage, memberGoToPreviousPage]);

  const handlePageSizeChange = React.useCallback(
    (pageSize: number) => {
      if (activeTab === 'members') {
        memberChangePageSize(pageSize);
      } else {
        invitationChangePageSize(pageSize);
      }
    },
    [activeTab, invitationChangePageSize, memberChangePageSize],
  );

  const handleSortChange = React.useCallback(
    (sortConfig: MemberManagementSortConfig) => {
      if (activeTab === 'members') {
        memberChangeSortConfig(sortConfig);
      } else {
        invitationChangeSortConfig(sortConfig);
      }
    },
    [activeTab, invitationChangeSortConfig, memberChangeSortConfig],
  );

  const handleRoleFilterChange = React.useCallback(
    (roleId: string | undefined) => {
      if (activeTab === 'members') {
        memberChangeFilters((prev) => ({ ...prev, roleId }));
      } else {
        invitationChangeFilters((prev) => ({ ...prev, roleId }));
      }
    },
    [activeTab, invitationChangeFilters, memberChangeFilters],
  );

  return {
    activeTab,
    availableRoles,
    searchedRoles,
    onRoleSearch: setRoleSearchTerm,
    availableConnections,

    invitations: currentInvitations,
    members: currentMembers,
    organizationDisplayName: organizationDisplayName,
    isInitialLoading: membersQuery.isLoading,
    isFetchingInvitations: invitationsQuery.isFetching,
    isLoadingInvitations: invitationsQuery.isLoading,
    isFetchingMembers: membersQuery.isFetching,
    isMembersStale: membersQuery.isStale,
    isInvitationsStale: invitationsQuery.isStale,
    membersUpdatedAt: membersQuery.dataUpdatedAt,
    invitationsUpdatedAt: invitationsQuery.dataUpdatedAt,
    refetchMembers: membersQuery.refetch,
    refetchInvitations: invitationsQuery.refetch,
    isFetchingAvailableRoles: rolesQuery.isLoading || rolesQuery.isFetching,
    isRemovingFromOrganization: isMutationLoading(removeFromOrganizationMutation),
    isAssigningRoles: isMutationLoading(assignRolesMutation),
    isLoadingMemberRoles: memberRolesQuery.isLoading,
    memberRoles: memberRolesQuery.data,
    isCreatingInvitation: isMutationLoading(createInvitationMutation),
    isRevokingInvitation: isMutationLoading(revokeInvitationMutation),
    isResendingInvitation: isMutationLoading(resendInvitationMutation),
    selectedInvitations,
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

    setActiveTab,
    openModal,
    closeModal,
    onSelectedInvitationsChange: setSelectedInvitations,
    handleCreateSubmit,
    handleRevokeConfirm,
    handleRevokeResendConfirm,
    handleBulkRevokeClick,
    handleCopyUrl,
    handleNextPage,
    handlePreviousPage,
    handlePageSizeChange,
    handleSortChange,
    handleRoleFilterChange,
    handleViewMemberDetails,
    handleAssignRolesSubmit,
    handleRemoveFromOrganizationConfirm,
  };
}
