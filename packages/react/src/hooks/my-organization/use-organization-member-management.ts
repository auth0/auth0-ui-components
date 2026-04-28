/**
 * Organization member management hook.
 * @module use-organization-member-management
 */

import { type MemberInvitation } from '@auth0/universal-components-core';
import * as React from 'react';

import { showToast } from '@/components/auth0/shared/toast';
import { useMemberManagementService } from '@/hooks/my-organization/shared/services/use-member-management-service';
import { useConfig } from '@/hooks/my-organization/use-config';
import { useCheckpointPagination } from '@/hooks/shared/use-checkpoint-pagination';
import { useTranslator } from '@/hooks/shared/use-translator';
import type {
  CreateInvitationInput,
  InvitationFilterState,
  InvitationSortConfig,
  RoleOption,
  IdentityProviderOption,
} from '@/types/my-organization/member-management/organization-invitation-table-types';
import type {
  ActiveTab,
  MemberManagementModalState,
  UseOrganizationMemberManagementOptions,
  UseOrganizationMemberManagementResult,
} from '@/types/my-organization/member-management/organization-member-management-types';

export { memberManagementQueryKeys } from '@/hooks/my-organization/shared/services/use-member-management-service';

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
  } = options;

  const { t } = useTranslator('member_management', customMessages as Record<string, unknown>);

  const [activeTab, setActiveTab] = React.useState<ActiveTab>('members');

  const { allowedRoles } = useConfig();
  const availableRoles: RoleOption[] = allowedRoles;

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
  } = useCheckpointPagination<InvitationFilterState>();

  const [modalState, setModalState] = React.useState<MemberManagementModalState>({ type: null });
  const detailsRequestIdRef = React.useRef(0);

  const {
    providersQuery,
    invitationsQuery,
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
  });

  const availableProviders: IdentityProviderOption[] = providersQuery.data ?? [];
  const currentInvitations = invitationsQuery.data?.invitations ?? [];
  const invitationNextToken = invitationsQuery.data?.next ?? null;
  const invitationsTotalItems = invitationsQuery.data?.total;

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

  const handleNextPage = React.useCallback(() => {
    if (invitationNextToken) {
      invitationGoToNextPage(invitationNextToken);
    }
  }, [invitationNextToken, invitationGoToNextPage]);

  const handlePreviousPage = React.useCallback(() => {
    invitationGoToPreviousPage();
  }, [invitationGoToPreviousPage]);

  const handlePageSizeChange = React.useCallback(
    (pageSize: number) => {
      invitationChangePageSize(pageSize);
    },
    [invitationChangePageSize],
  );

  const handleSortChange = React.useCallback(
    (sortConfig: InvitationSortConfig) => {
      invitationChangeSortConfig(sortConfig);
    },
    [invitationChangeSortConfig],
  );

  const handleRoleFilterChange = React.useCallback(
    (roleId: string | undefined) => {
      invitationChangeFilters((prev) => ({ ...prev, roleId }));
    },
    [invitationChangeFilters],
  );

  return {
    activeTab,
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
      hasNextPage: !!invitationNextToken,
      hasPreviousPage: invitationHasPreviousPage,
    },
    invitationFilters,
    invitationSortConfig,
    modalState,

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
  };
}
