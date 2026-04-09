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

  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);
  const [showRevokeModal, setShowRevokeModal] = React.useState(false);
  const [showRevokeResendModal, setShowRevokeResendModal] = React.useState(false);
  const [selectedInvitation, setSelectedInvitation] = React.useState<MemberInvitation | null>(null);
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

  const handleCreateClick = React.useCallback(() => {
    if (readOnly) return;
    setShowCreateModal(true);
  }, [readOnly]);

  const handleCreateSubmit = React.useCallback(
    (data: CreateInvitationInput) => {
      createInvitationMutation.mutate(data, {
        onSuccess: () => setShowCreateModal(false),
      });
    },
    [createInvitationMutation],
  );

  const handleCreateCancel = React.useCallback(() => {
    setShowCreateModal(false);
  }, []);

  const handleDetailsClick = React.useCallback(
    async (invitation: MemberInvitation) => {
      setSelectedInvitation(invitation);
      setShowDetailsModal(true);
      const requestId = ++detailsRequestIdRef.current;
      try {
        const response = await fetchInvitationDetails(invitation.id!);
        if (detailsRequestIdRef.current === requestId) {
          setSelectedInvitation(response);
        }
      } catch {
        if (detailsRequestIdRef.current === requestId) {
          showToast({ type: 'error', message: t('invitation.error.fetch_failed') });
        }
      }
    },
    [fetchInvitationDetails, t],
  );

  const handleDetailsClose = React.useCallback(() => {
    setShowDetailsModal(false);
    setSelectedInvitation(null);
  }, []);

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
    if (!selectedInvitation) return;
    revokeInvitationMutation.mutate(selectedInvitation, {
      onSuccess: () => {
        setShowRevokeModal(false);
        setSelectedInvitation(null);
      },
    });
  }, [selectedInvitation, revokeInvitationMutation]);

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
    if (!selectedInvitation) return;
    resendInvitationMutation.mutate(selectedInvitation, {
      onSuccess: () => {
        setShowRevokeResendModal(false);
        setSelectedInvitation(null);
      },
    });
  }, [selectedInvitation, resendInvitationMutation]);

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
      hasNextPage: !!invitationNextToken,
      hasPreviousPage: invitationHasPreviousPage,
    },
    invitationFilters,
    invitationSortConfig,
    showCreateModal,
    showDetailsModal,
    showRevokeModal,
    showRevokeResendModal,
    selectedInvitation,

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
}
