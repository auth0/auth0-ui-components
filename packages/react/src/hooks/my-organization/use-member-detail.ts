/**
 * Organization member detail hook.
 * @module use-member-detail
 */

import type { OrgMember, OrgMemberRole } from '@auth0/universal-components-core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as React from 'react';

import { showToast } from '@/components/auth0/shared/toast';
import { useConfig } from '@/hooks/my-organization/use-config';
import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { RoleOption } from '@/types/my-organization/member-management/organization-invitation-table-types';
import type {
  MemberDetailTab,
  MemberDetailState,
  MemberDetailHandlers,
  UseOrganizationMemberDetailOptions,
} from '@/types/my-organization/member-management/organization-member-detail-types';

export const memberDetailQueryKeys = {
  all: ['member-detail'] as const,
  member: (id: string) => [...memberDetailQueryKeys.all, 'member', id] as const,
};

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

  const { coreClient } = useCoreClient();
  const { t } = useTranslator('member_management', customMessages as Record<string, unknown>);
  const queryClient = useQueryClient();
  const { allowedRoles } = useConfig();

  const availableRoles: RoleOption[] = allowedRoles;

  const [activeTab, setActiveTab] = React.useState<MemberDetailTab>('details');
  const [showRemoveFromOrgModal, setShowRemoveFromOrgModal] = React.useState(false);
  const [showDeleteMemberModal, setShowDeleteMemberModal] = React.useState(false);
  const [showAssignRolesModal, setShowAssignRolesModal] = React.useState(false);
  const [showRemoveRoleModal, setShowRemoveRoleModal] = React.useState(false);
  const [roleToRemove, setRoleToRemove] = React.useState<OrgMemberRole | null>(null);

  const memberQuery = useQuery({
    queryKey: memberDetailQueryKeys.member(userId),
    queryFn: () => coreClient!.getMyOrganizationApiClient().organization.members.get(userId),
    enabled: !!coreClient && !!userId,
  });

  const removeFromOrgMutation = useMutation({
    mutationFn: async () => {
      if (removeFromOrgAction?.onBefore && !removeFromOrgAction.onBefore(userId)) {
        throw new Error('Remove from org cancelled by onBefore');
      }
      await coreClient!
        .getMyOrganizationApiClient()
        .organization.memberships.deleteMemberships({ members: [userId] });
    },
    onSuccess: () => {
      removeFromOrgAction?.onAfter?.(userId);
      showToast({
        type: 'success',
        message: t('member.detail.danger_zone.remove_from_org.success'),
      });
      setShowRemoveFromOrgModal(false);
      onBack?.();
    },
    onError: () => {
      showToast({ type: 'error', message: t('member.detail.error.remove_from_org_failed') });
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: async () => {
      if (deleteMemberAction?.onBefore && !deleteMemberAction.onBefore(userId)) {
        throw new Error('Delete member cancelled by onBefore');
      }
      await coreClient!
        .getMyOrganizationApiClient()
        .organization.members.deleteMembers({ members: [userId] });
    },
    onSuccess: () => {
      deleteMemberAction?.onAfter?.(userId);
      showToast({ type: 'success', message: t('member.detail.danger_zone.delete_member.success') });
      setShowDeleteMemberModal(false);
      onBack?.();
    },
    onError: () => {
      showToast({ type: 'error', message: t('member.detail.error.delete_failed') });
    },
  });

  const assignRoleMutation = useMutation({
    mutationFn: async (roleIds: string[]) => {
      for (const roleId of roleIds) {
        if (assignRoleAction?.onBefore && !assignRoleAction.onBefore({ userId: userId, roleId })) {
          throw new Error('Assign role cancelled by onBefore');
        }
      }
      await coreClient!
        .getMyOrganizationApiClient()
        .organization.members.roles.assign(userId, { role_ids: roleIds });
      for (const roleId of roleIds) {
        assignRoleAction?.onAfter?.({ userId: userId, roleId });
      }
    },
    onSuccess: () => {
      showToast({ type: 'success', message: t('member.detail.roles.assign_button') });
      setShowAssignRolesModal(false);
      queryClient.invalidateQueries({ queryKey: memberDetailQueryKeys.member(userId) });
    },
    onError: () => {
      showToast({ type: 'error', message: t('member.detail.error.assign_role_failed') });
    },
  });

  const removeRoleMutation = useMutation({
    mutationFn: async (role: OrgMemberRole) => {
      if (
        removeRoleAction?.onBefore &&
        !removeRoleAction.onBefore({ userId: userId, roleId: role.id })
      ) {
        throw new Error('Remove role cancelled by onBefore');
      }
      await coreClient!
        .getMyOrganizationApiClient()
        .organization.members.roles.unassign(userId, { role_ids: [role.id] });
      removeRoleAction?.onAfter?.({ userId: userId, roleId: role.id });
    },
    onSuccess: () => {
      showToast({
        type: 'success',
        message: t('member.detail.roles.remove_confirm.confirm_button'),
      });
      setShowRemoveRoleModal(false);
      setRoleToRemove(null);
      queryClient.invalidateQueries({ queryKey: memberDetailQueryKeys.member(userId) });
    },
    onError: () => {
      showToast({ type: 'error', message: t('member.detail.error.remove_role_failed') });
    },
  });

  const handleBack = React.useCallback(() => {
    onBack?.();
  }, [onBack]);

  const handleRemoveFromOrgClick = React.useCallback(() => {
    if (readOnly) return;
    setShowRemoveFromOrgModal(true);
  }, [readOnly]);

  const handleRemoveFromOrgConfirm = React.useCallback(() => {
    if (!coreClient) return;
    removeFromOrgMutation.mutate();
  }, [coreClient]);

  const handleRemoveFromOrgCancel = React.useCallback(() => {
    setShowRemoveFromOrgModal(false);
  }, []);

  const handleDeleteMemberClick = React.useCallback(() => {
    if (readOnly) return;
    setShowDeleteMemberModal(true);
  }, [readOnly]);

  const handleDeleteMemberConfirm = React.useCallback(() => {
    if (!coreClient) return;
    deleteMemberMutation.mutate();
  }, [coreClient]);

  const handleDeleteMemberCancel = React.useCallback(() => {
    setShowDeleteMemberModal(false);
  }, []);

  const handleAssignRolesClick = React.useCallback(() => {
    if (readOnly) return;
    setShowAssignRolesModal(true);
  }, [readOnly]);

  const handleAssignRolesSubmit = React.useCallback(
    (roleIds: string[]) => {
      if (!coreClient) return;
      assignRoleMutation.mutate(roleIds);
    },
    [coreClient],
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
    if (!roleToRemove || !coreClient) return;
    removeRoleMutation.mutate(roleToRemove);
  }, [roleToRemove, coreClient]);

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
