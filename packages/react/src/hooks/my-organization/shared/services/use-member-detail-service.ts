/**
 * Member detail service hook.
 * @module use-member-detail-service
 * @internal
 */

import {
  memberDetailQueryKeys,
  OrganizationDetailsMappers,
  type Role,
} from '@auth0/universal-components-core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { showToast } from '@/components/auth0/shared/toast';
import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useErrorHandler } from '@/hooks/shared/use-error-handler';
import { useTranslator } from '@/hooks/shared/use-translator';
import type {
  MemberDetailServiceResult,
  UseMemberDetailServiceOptions,
} from '@/types/my-organization/member-management/organization-member-detail-types';

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
    assignRolesAction,
    removeRolesAction,
  } = options;

  const { coreClient } = useCoreClient();
  const { t } = useTranslator('member_management', customMessages);
  const handleError = useErrorHandler();
  const queryClient = useQueryClient();

  const memberQuery = useQuery({
    queryKey: memberDetailQueryKeys.member(userId),
    queryFn: () => coreClient!.getMyOrganizationApiClient().organization.members.get(userId),
    enabled: !!coreClient && !!userId,
  });

  const rolesQuery = useQuery({
    queryKey: memberDetailQueryKeys.roles(),
    queryFn: async () => {
      const response = await coreClient!
        .getMyOrganizationApiClient()
        .organization.roles.list({ take: 50 });
      return response.data;
    },
    enabled: !!coreClient,
  });

  const organizationQuery = useQuery({
    queryKey: memberDetailQueryKeys.organization,
    queryFn: async () => {
      const response = await coreClient!.getMyOrganizationApiClient().organizationDetails.get();
      return OrganizationDetailsMappers.fromAPI(response);
    },
    enabled: !!coreClient,
  });

  const removeFromOrgMutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('userId is required');
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
        message: t('member.detail.actions.remove_from_org.success'),
      });
    },
    onError: (error) => {
      handleError(error, { fallbackMessage: t('member.detail.error.remove_from_org_failed') });
    },
  });

  const assignRolesMutation = useMutation({
    mutationFn: async (roleIds: string[]) => {
      if (!userId) throw new Error('userId is required');
      if (assignRolesAction?.onBefore && !assignRolesAction.onBefore({ userId, roleIds })) {
        throw new Error('Assign roles cancelled by onBefore');
      }
      await coreClient!
        .getMyOrganizationApiClient()
        .organization.members.roles.assign(userId, { role_ids: roleIds });
      assignRolesAction?.onAfter?.({ userId, roleIds });
    },
    onSuccess: () => {
      showToast({ type: 'success', message: t('member.detail.roles.assign_modal.success') });
      queryClient.invalidateQueries({ queryKey: memberDetailQueryKeys.member(userId) });
      queryClient.invalidateQueries({ queryKey: memberDetailQueryKeys.roles() });
    },
    onError: (error) => {
      handleError(error, { fallbackMessage: t('member.detail.error.assign_role_failed') });
    },
  });

  const removeRolesMutation = useMutation({
    mutationFn: async (roles: Role[]) => {
      if (!userId) throw new Error('userId is required');
      const roleIds = roles.map((r) => r.id);
      if (removeRolesAction?.onBefore && !removeRolesAction.onBefore({ userId, roleIds })) {
        throw new Error('Remove roles cancelled by onBefore');
      }
      await coreClient!
        .getMyOrganizationApiClient()
        .organization.members.roles.unassign(userId, { role_ids: roleIds });
      removeRolesAction?.onAfter?.({ userId, roleIds });
    },
    onSuccess: () => {
      showToast({
        type: 'success',
        message: t('member.detail.roles.remove_confirm.success'),
      });
      queryClient.invalidateQueries({ queryKey: memberDetailQueryKeys.member(userId) });
      queryClient.invalidateQueries({ queryKey: memberDetailQueryKeys.roles() });
    },
    onError: (error) => {
      handleError(error, { fallbackMessage: t('member.detail.error.remove_role_failed') });
    },
  });

  return {
    memberQuery,
    rolesQuery,
    organizationQuery,
    removeFromOrgMutation,
    assignRolesMutation,
    removeRolesMutation,
  };
}
