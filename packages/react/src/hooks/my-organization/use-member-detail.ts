/**
 * Organization member detail hook.
 * @module use-member-detail
 */

import type { OrgMember, OrgMemberRole } from '@auth0/universal-components-core';
import * as React from 'react';

import { useMemberDetailService } from '@/hooks/my-organization/shared/services/use-member-detail-service';
import { useConfig } from '@/hooks/my-organization/use-config';
import type { RoleOption } from '@/types/my-organization/member-management/organization-invitation-table-types';
import type {
  MemberDetailModalState,
  MemberDetailTab,
  UseOrganizationMemberDetailOptions,
  UseOrganizationMemberDetailResult,
} from '@/types/my-organization/member-management/organization-member-detail-types';

export { memberDetailQueryKeys } from '@/hooks/my-organization/shared/services/use-member-detail-service';

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
    assignRoleAction,
    removeRoleAction,
  } = options;

  const { allowedRoles } = useConfig();
  const availableRoles: RoleOption[] = allowedRoles;

  const { memberQuery, removeFromOrgMutation, assignRoleMutation, removeRoleMutation } =
    useMemberDetailService({
      userId,
      customMessages,
      removeFromOrgAction,
      assignRoleAction,
      removeRoleAction,
    });

  const [activeTab, setActiveTab] = React.useState<MemberDetailTab>('details');
  const [modalState, setModalState] = React.useState<MemberDetailModalState>({ type: null });

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
      assignRoleMutation.mutate(roleIds, {
        onSuccess: () => {
          closeModal();
        },
      });
    },
    [assignRoleMutation, closeModal],
  );

  const handleRemoveRoleConfirm = React.useCallback(() => {
    if (modalState.type !== 'removeRole') return;
    removeRoleMutation.mutate(modalState.role, {
      onSuccess: () => {
        closeModal();
      },
    });
  }, [modalState, removeRoleMutation, closeModal]);

  const member = (memberQuery.data as OrgMember) ?? null;
  const memberRoles: OrgMemberRole[] = member?.roles ?? [];
  const removingRole = modalState.type === 'removeRole' ? modalState.role : null;

  return {
    activeTab,
    member,
    memberRoles,
    availableRoles,
    isFetchingMember: memberQuery.isLoading || memberQuery.isFetching,
    isFetchingRoles: memberQuery.isLoading || memberQuery.isFetching,
    isLoading: memberQuery.isLoading,
    isRemovingFromOrg: removeFromOrgMutation.isPending,
    isAssigningRole: assignRoleMutation.isPending,
    removingRoleId: removeRoleMutation.isPending ? (removingRole?.id ?? null) : null,
    modalState,

    setActiveTab,
    handleBack,
    openModal,
    closeModal,
    handleRemoveFromOrgConfirm,
    handleAssignRolesSubmit,
    handleRemoveRoleConfirm,
  };
}

export type { UseOrganizationMemberDetailResult };
