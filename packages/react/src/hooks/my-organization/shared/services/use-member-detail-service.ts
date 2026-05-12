/**
 * Member detail service hook.
 * @module use-member-detail-service
 * @internal
 */

import type { OrgMemberRole } from '@auth0/universal-components-core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { showToast } from '@/components/auth0/shared/toast';
import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useTranslator } from '@/hooks/shared/use-translator';
import type {
  MemberDetailServiceResult,
  UseOrganizationMemberDetailOptions,
} from '@/types/my-organization/member-management/organization-member-detail-types';

export const memberDetailQueryKeys = {
  all: ['member-detail'] as const,
  member: (id: string) => [...memberDetailQueryKeys.all, 'member', id] as const,
};

type UseMemberDetailServiceOptions = Pick<
  UseOrganizationMemberDetailOptions,
  | 'userId'
  | 'customMessages'
  | 'removeFromOrgAction'
  | 'deleteMemberAction'
  | 'assignRoleAction'
  | 'removeRoleAction'
>;

/**
 * Service hook for member detail API operations.
 * @param options - Service configuration options.
 * @returns Query and mutation objects for member detail.
 */
export function useMemberDetailService(
  options: UseMemberDetailServiceOptions,
): MemberDetailServiceResult {
  const {
    userId,
    customMessages = {},
    removeFromOrgAction,
    deleteMemberAction,
    assignRoleAction,
    removeRoleAction,
  } = options;

  const { coreClient } = useCoreClient();
  const { t } = useTranslator('member_management', customMessages as Record<string, unknown>);
  const queryClient = useQueryClient();

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
    },
    onError: () => {
      showToast({ type: 'error', message: t('member.detail.error.delete_failed') });
    },
  });

  const assignRoleMutation = useMutation({
    mutationFn: async (roleIds: string[]) => {
      for (const roleId of roleIds) {
        if (assignRoleAction?.onBefore && !assignRoleAction.onBefore({ userId, roleId })) {
          throw new Error('Assign role cancelled by onBefore');
        }
      }
      await coreClient!
        .getMyOrganizationApiClient()
        .organization.members.roles.assign(userId, { role_ids: roleIds });
      for (const roleId of roleIds) {
        assignRoleAction?.onAfter?.({ userId, roleId });
      }
    },
    onSuccess: () => {
      showToast({ type: 'success', message: t('member.detail.roles.assign_modal.success') });
      queryClient.invalidateQueries({ queryKey: memberDetailQueryKeys.member(userId) });
    },
    onError: () => {
      showToast({ type: 'error', message: t('member.detail.error.assign_role_failed') });
    },
  });

  const removeRoleMutation = useMutation({
    mutationFn: async (role: OrgMemberRole) => {
      if (removeRoleAction?.onBefore && !removeRoleAction.onBefore({ userId, roleId: role.id })) {
        throw new Error('Remove role cancelled by onBefore');
      }
      await coreClient!
        .getMyOrganizationApiClient()
        .organization.members.roles.unassign(userId, { role_ids: [role.id] });
      removeRoleAction?.onAfter?.({ userId, roleId: role.id });
    },
    onSuccess: () => {
      showToast({
        type: 'success',
        message: t('member.detail.roles.remove_confirm.success'),
      });
      queryClient.invalidateQueries({ queryKey: memberDetailQueryKeys.member(userId) });
    },
    onError: () => {
      showToast({ type: 'error', message: t('member.detail.error.remove_role_failed') });
    },
  });

  return {
    memberQuery,
    removeFromOrgMutation,
    deleteMemberMutation,
    assignRoleMutation,
    removeRoleMutation,
  };
}
