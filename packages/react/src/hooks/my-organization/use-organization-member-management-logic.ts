/**
 * Member management UI logic hook.
 * @module use-organization-member-management-logic
 */

import * as React from 'react';

import type { UseOrganizationMemberManagementResult } from '@/hooks/my-organization/use-organization-member-management';
import type { Member, Invitation, CreateInvitationInput } from '@/types';

export type ActiveTab = 'members' | 'invitations';

export interface UseOrganizationMemberManagementLogicOptions {
  api: UseOrganizationMemberManagementResult;
  defaultTab?: ActiveTab;
  readOnly?: boolean;
}

export interface MemberManagementLogicState {
  activeTab: ActiveTab;
  showRemoveModal: boolean;
  selectedMember: Member | null;
  showCreateModal: boolean;
  showDetailsModal: boolean;
  showRevokeModal: boolean;
  showRevokeResendModal: boolean;
  selectedInvitation: Invitation | null;
  isLoading: boolean;
  isFetchingMembers: boolean;
  isFetchingInvitations: boolean;
  isRemovingMember: boolean;
  isCreatingInvitation: boolean;
  isRevokingInvitation: boolean;
  isResendingInvitation: boolean;
  members: Member[];
  invitations: Invitation[];
  invitationPagination: UseOrganizationMemberManagementResult['invitationPagination'];
  invitationFilters: UseOrganizationMemberManagementResult['invitationFilters'];
  availableRoles: UseOrganizationMemberManagementResult['availableRoles'];
  availableProviders: UseOrganizationMemberManagementResult['availableProviders'];
}

export interface MemberManagementHandlers {
  setActiveTab: (tab: ActiveTab) => void;
  handleRemoveClick: (member: Member) => void;
  handleRemoveConfirm: () => Promise<void>;
  handleRemoveCancel: () => void;
  handleCreateClick: () => void;
  handleCreateSubmit: (data: CreateInvitationInput) => Promise<void>;
  handleCreateCancel: () => void;
  handleDetailsClick: (invitation: Invitation) => void;
  handleDetailsClose: () => void;
  handleRevokeClick: (invitation: Invitation) => void;
  handleRevokeConfirm: () => Promise<void>;
  handleRevokeCancel: () => void;
  handleRevokeResendClick: (invitation: Invitation) => void;
  handleRevokeResendConfirm: () => Promise<void>;
  handleRevokeResendCancel: () => void;
  handleCopyUrl: (invitation: Invitation) => Promise<void>;
  handlePageChange: (page: number) => void;
  handlePageSizeChange: (pageSize: number) => void;
  handleRoleFilterChange: (roleId: string | undefined) => void;
}

/**
 * Logic hook for organization member management.
 * @param options - Hook configuration options.
 * @returns Logic state and handler functions.
 */
export function useOrganizationMemberManagementLogic(
  options: UseOrganizationMemberManagementLogicOptions,
): { logic: MemberManagementLogicState; handlers: MemberManagementHandlers } {
  const { api, defaultTab = 'members', readOnly = false } = options;

  const [activeTab, setActiveTab] = React.useState<ActiveTab>(defaultTab);
  const fetchedTabsRef = React.useRef<Set<ActiveTab>>(new Set());

  React.useEffect(() => {
    if (fetchedTabsRef.current.has(activeTab)) return;
    fetchedTabsRef.current.add(activeTab);

    if (activeTab === 'members') {
      void api.fetchMembers();
    } else {
      void api.fetchInvitations();
    }
  }, [activeTab, api.fetchMembers, api.fetchInvitations]);

  const [showRemoveModal, setShowRemoveModal] = React.useState(false);
  const [selectedMember, setSelectedMember] = React.useState<Member | null>(null);
  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);
  const [showRevokeModal, setShowRevokeModal] = React.useState(false);
  const [showRevokeResendModal, setShowRevokeResendModal] = React.useState(false);
  const [selectedInvitation, setSelectedInvitation] = React.useState<Invitation | null>(null);

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
    const success = await api.removeMember(selectedMember);
    if (success) {
      setShowRemoveModal(false);
      setSelectedMember(null);
    }
  }, [selectedMember, api]);

  const handleRemoveCancel = React.useCallback(() => {
    setShowRemoveModal(false);
    setSelectedMember(null);
  }, []);

  const handleCreateClick = React.useCallback(() => {
    if (readOnly) return;
    setShowCreateModal(true);
  }, [readOnly]);

  const handleCreateSubmit = React.useCallback(
    async (data: CreateInvitationInput) => {
      const result = await api.createInvitation(data);
      if (result) {
        setShowCreateModal(false);
      }
    },
    [api],
  );

  const handleCreateCancel = React.useCallback(() => {
    setShowCreateModal(false);
  }, []);

  const handleDetailsClick = React.useCallback((invitation: Invitation) => {
    setSelectedInvitation(invitation);
    setShowDetailsModal(true);
  }, []);

  const handleDetailsClose = React.useCallback(() => {
    setShowDetailsModal(false);
    setSelectedInvitation(null);
  }, []);

  const handleRevokeClick = React.useCallback(
    (invitation: Invitation) => {
      if (readOnly) return;
      setSelectedInvitation(invitation);
      setShowRevokeModal(true);
    },
    [readOnly],
  );

  const handleRevokeConfirm = React.useCallback(async () => {
    if (!selectedInvitation) return;
    const success = await api.revokeInvitation(selectedInvitation);
    if (success) {
      setShowRevokeModal(false);
      setSelectedInvitation(null);
    }
  }, [selectedInvitation, api]);

  const handleRevokeCancel = React.useCallback(() => {
    setShowRevokeModal(false);
    setSelectedInvitation(null);
  }, []);

  const handleRevokeResendClick = React.useCallback(
    (invitation: Invitation) => {
      if (readOnly) return;
      setSelectedInvitation(invitation);
      setShowRevokeResendModal(true);
    },
    [readOnly],
  );

  const handleRevokeResendConfirm = React.useCallback(async () => {
    if (!selectedInvitation) return;
    const result = await api.resendInvitation(selectedInvitation);
    if (result) {
      setShowRevokeResendModal(false);
      setSelectedInvitation(null);
    }
  }, [selectedInvitation, api]);

  const handleRevokeResendCancel = React.useCallback(() => {
    setShowRevokeResendModal(false);
    setSelectedInvitation(null);
  }, []);

  const handleCopyUrl = React.useCallback(async (invitation: Invitation) => {
    if (invitation.invitation_url) {
      try {
        await navigator.clipboard.writeText(invitation.invitation_url);
      } catch (error) {
        console.error('Failed to copy URL:', error);
      }
    }
  }, []);

  const handlePageChange = React.useCallback(
    (page: number) => {
      api.setInvitationPagination((prev) => ({ ...prev, currentPage: page }));
    },
    [api],
  );

  const handlePageSizeChange = React.useCallback(
    (pageSize: number) => {
      api.setInvitationPagination((prev) => ({ ...prev, pageSize, currentPage: 1 }));
    },
    [api],
  );

  const handleRoleFilterChange = React.useCallback(
    (roleId: string | undefined) => {
      api.setInvitationFilters((prev) => ({ ...prev, roleId }));
      api.setInvitationPagination((prev) => ({ ...prev, currentPage: 1 }));
    },
    [api],
  );

  const logic: MemberManagementLogicState = {
    activeTab,
    showRemoveModal,
    selectedMember,
    showCreateModal,
    showDetailsModal,
    showRevokeModal,
    showRevokeResendModal,
    selectedInvitation,
    isLoading: api.isFetchingMembers || api.isFetchingInvitations,
    isFetchingMembers: api.isFetchingMembers,
    isFetchingInvitations: api.isFetchingInvitations,
    isRemovingMember: api.isRemovingMember,
    isCreatingInvitation: api.isCreatingInvitation,
    isRevokingInvitation: api.isRevokingInvitation,
    isResendingInvitation: api.isResendingInvitation,
    members: api.members,
    invitations: api.invitations,
    invitationPagination: api.invitationPagination,
    invitationFilters: api.invitationFilters,
    availableRoles: api.availableRoles,
    availableProviders: api.availableProviders,
  };

  const handlers: MemberManagementHandlers = {
    setActiveTab,
    handleRemoveClick,
    handleRemoveConfirm,
    handleRemoveCancel,
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
    handlePageChange,
    handlePageSizeChange,
    handleRoleFilterChange,
  };

  return { logic, handlers };
}
