/**
 * Organization member detail hook.
 * @module use-member-detail
 */

import type { Role } from '@auth0/universal-components-core';
import * as React from 'react';

import { useMemberDetailService } from '@/hooks/my-organization/shared/services/use-member-detail-service';
import type {
  MemberDetailModalState,
  MemberDetailTab,
  UseOrganizationMemberDetailOptions,
  UseOrganizationMemberDetailResult,
} from '@/types/my-organization/member-management/organization-member-detail-types';

/**
 * Hook for organization member detail page.
 * @param options - Hook configuration options.
 * @returns State and handler functions.
 */
export function useOrganizationMemberDetail(
  options: UseOrganizationMemberDetailOptions,
): UseOrganizationMemberDetailResult {
  const {
    userId,
    onBack,
    customMessages = {},
    readOnly = false,
    removeFromOrgAction,
    assignRolesAction,
    removeRolesAction,
  } = options;

  const {
    memberQuery,
    memberRolesQuery,
    rolesQuery,
    organizationQuery,
    removeFromOrgMutation,
    assignRolesMutation,
    removeRolesMutation,
  } = useMemberDetailService({
    userId,
    customMessages,
    removeFromOrgAction,
    assignRolesAction,
    removeRolesAction,
  });

  const [activeTab, setActiveTab] = React.useState<MemberDetailTab>('details');
  const [modalState, setModalState] = React.useState<MemberDetailModalState>({ type: null });
  const [selectedRoles, setSelectedRoles] = React.useState<Role[]>([]);

  const handleBack = React.useCallback(() => {
    onBack?.();
  }, [onBack]);

  const openModal = React.useCallback(
    (state: MemberDetailModalState) => {
      if (readOnly && state.type !== null) return;
      setModalState(state);
    },
    [readOnly],
  );

  const closeModal = React.useCallback(() => {
    setModalState({ type: null });
  }, []);

  const handleRemoveFromOrgConfirm = React.useCallback(() => {
    removeFromOrgMutation.mutate(undefined, {
      onSuccess: () => {
        closeModal();
        onBack?.();
      },
    });
  }, [removeFromOrgMutation, closeModal, onBack]);

  const handleAssignRolesSubmit = React.useCallback(
    (roleIds: string[]) => {
      assignRolesMutation.mutate(roleIds, {
        onSuccess: () => {
          closeModal();
        },
      });
    },
    [assignRolesMutation, closeModal],
  );

  const handleRemoveRolesCancel = React.useCallback(() => {
    setSelectedRoles([]);
    closeModal();
  }, [closeModal]);

  const handleRemoveRolesConfirm = React.useCallback(() => {
    if (modalState.type !== 'removeRoles') return;
    removeRolesMutation.mutate(modalState.roles, {
      onSuccess: () => {
        setSelectedRoles([]);
        closeModal();
      },
    });
  }, [modalState, removeRolesMutation, closeModal]);

  const member = memberQuery.data ?? null;
  const orgDisplayName = organizationQuery.data?.display_name ?? '';
  const memberRoles: Role[] = memberRolesQuery.data ?? [];
  const assignedRoleIds = React.useMemo(() => new Set(memberRoles.map((r) => r.id)), [memberRoles]);
  const availableRoles: Role[] = React.useMemo(
    () => (rolesQuery.data ?? []).filter((r) => !assignedRoleIds.has(r.id)),
    [rolesQuery.data, assignedRoleIds],
  );

  const removingRoles = modalState.type === 'removeRoles' ? modalState.roles : [];

  return {
    activeTab,
    member,
    orgDisplayName,
    memberRoles,
    availableRoles,
    selectedRoles,
    isFetchingMember: memberQuery.isLoading || memberQuery.isFetching,
    isFetchingMemberRoles: memberRolesQuery.isLoading || memberRolesQuery.isFetching,
    isFetchingAvailableRoles: rolesQuery.isLoading || rolesQuery.isFetching,
    isLoading: memberQuery.isLoading,
    isRemovingFromOrg: removeFromOrgMutation.isPending,
    isAssigningRoles: assignRolesMutation.isPending,
    isRemovingRoles: removeRolesMutation.isPending,
    removingRoleIds: removeRolesMutation.isPending ? removingRoles.map((r) => r.id) : [],
    modalState,

    setActiveTab,
    setSelectedRoles,
    handleBack,
    openModal,
    closeModal,
    handleRemoveFromOrgConfirm,
    handleAssignRolesSubmit,
    handleRemoveRolesCancel,
    handleRemoveRolesConfirm,
  };
}
