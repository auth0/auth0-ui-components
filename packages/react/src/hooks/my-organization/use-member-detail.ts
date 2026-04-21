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
  MemberDetailTab,
  MemberDetailState,
  MemberDetailHandlers,
  UseOrganizationMemberDetailOptions,
} from '@/types/my-organization/member-management/organization-member-detail-types';

export { memberDetailQueryKeys } from '@/hooks/my-organization/shared/services/use-member-detail-service';

/**
 * Hook for organization member detail page.
 * @param options - Hook configuration options.
 * @returns State and handler functions.
 */
export function useOrganizationMemberDetail(options: UseOrganizationMemberDetailOptions): {
  state: MemberDetailState;
  handlers: MemberDetailHandlers;
} {
  const {
    userId,
    onBack,
    customMessages = {},
    readOnly = false,
    removeFromOrgAction,
    deleteMemberAction,
    assignRoleAction,
    removeRoleAction,
  } = options;

  const { allowedRoles } = useConfig();
  const availableRoles: RoleOption[] = allowedRoles;

  const {
    memberQuery,
    removeFromOrgMutation,
    deleteMemberMutation,
    assignRoleMutation,
    removeRoleMutation,
  } = useMemberDetailService({
    userId,
    customMessages,
    removeFromOrgAction,
    deleteMemberAction,
    assignRoleAction,
    removeRoleAction,
  });

  const [activeTab, setActiveTab] = React.useState<MemberDetailTab>('details');
  const [showRemoveFromOrgModal, setShowRemoveFromOrgModal] = React.useState(false);
  const [showDeleteMemberModal, setShowDeleteMemberModal] = React.useState(false);
  const [showAssignRolesModal, setShowAssignRolesModal] = React.useState(false);
  const [showRemoveRoleModal, setShowRemoveRoleModal] = React.useState(false);
  const [roleToRemove, setRoleToRemove] = React.useState<OrgMemberRole | null>(null);

  const handleBack = React.useCallback(() => {
    onBack?.();
  }, [onBack]);

  const handleRemoveFromOrgClick = React.useCallback(() => {
    if (readOnly) return;
    setShowRemoveFromOrgModal(true);
  }, [readOnly]);

  const handleRemoveFromOrgConfirm = React.useCallback(() => {
    removeFromOrgMutation.mutate(undefined, {
      onSuccess: () => {
        setShowRemoveFromOrgModal(false);
        onBack?.();
      },
    });
  }, [removeFromOrgMutation, onBack]);

  const handleRemoveFromOrgCancel = React.useCallback(() => {
    setShowRemoveFromOrgModal(false);
  }, []);

  const handleDeleteMemberClick = React.useCallback(() => {
    if (readOnly) return;
    setShowDeleteMemberModal(true);
  }, [readOnly]);

  const handleDeleteMemberConfirm = React.useCallback(() => {
    deleteMemberMutation.mutate(undefined, {
      onSuccess: () => {
        setShowDeleteMemberModal(false);
        onBack?.();
      },
    });
  }, [deleteMemberMutation, onBack]);

  const handleDeleteMemberCancel = React.useCallback(() => {
    setShowDeleteMemberModal(false);
  }, []);

  const handleAssignRolesClick = React.useCallback(() => {
    if (readOnly) return;
    setShowAssignRolesModal(true);
  }, [readOnly]);

  const handleAssignRolesSubmit = React.useCallback(
    (roleIds: string[]) => {
      assignRoleMutation.mutate(roleIds, {
        onSuccess: () => {
          setShowAssignRolesModal(false);
        },
      });
    },
    [assignRoleMutation],
  );

  const handleAssignRolesCancel = React.useCallback(() => {
    setShowAssignRolesModal(false);
  }, []);

  const handleRemoveRoleClick = React.useCallback(
    (role: OrgMemberRole) => {
      if (readOnly) return;
      setRoleToRemove(role);
      setShowRemoveRoleModal(true);
    },
    [readOnly],
  );

  const handleRemoveRoleConfirm = React.useCallback(() => {
    if (!roleToRemove) return;
    removeRoleMutation.mutate(roleToRemove, {
      onSuccess: () => {
        setShowRemoveRoleModal(false);
        setRoleToRemove(null);
      },
    });
  }, [roleToRemove, removeRoleMutation]);

  const handleRemoveRoleCancel = React.useCallback(() => {
    setShowRemoveRoleModal(false);
    setRoleToRemove(null);
  }, []);

  const member = (memberQuery.data as OrgMember) ?? null;
  const memberRoles: OrgMemberRole[] = member?.roles ?? [];

  const state: MemberDetailState = {
    activeTab,
    member,
    memberRoles,
    availableRoles,
    isFetchingMember: memberQuery.isLoading || memberQuery.isFetching,
    isFetchingRoles: memberQuery.isLoading || memberQuery.isFetching,
    isLoading: memberQuery.isLoading,
    isRemovingFromOrg: removeFromOrgMutation.isPending,
    isDeletingMember: deleteMemberMutation.isPending,
    isAssigningRole: assignRoleMutation.isPending,
    removingRoleId: removeRoleMutation.isPending ? (roleToRemove?.id ?? null) : null,
    showRemoveFromOrgModal,
    showDeleteMemberModal,
    showAssignRolesModal,
    showRemoveRoleModal,
    roleToRemove,
  };

  const handlers: MemberDetailHandlers = {
    setActiveTab,
    handleBack,
    handleRemoveFromOrgClick,
    handleRemoveFromOrgConfirm,
    handleRemoveFromOrgCancel,
    handleDeleteMemberClick,
    handleDeleteMemberConfirm,
    handleDeleteMemberCancel,
    handleAssignRolesClick,
    handleAssignRolesSubmit,
    handleAssignRolesCancel,
    handleRemoveRoleClick,
    handleRemoveRoleConfirm,
    handleRemoveRoleCancel,
  };

  return { state, handlers };
}

export type UseOrganizationMemberDetailResult = ReturnType<typeof useOrganizationMemberDetail>;
