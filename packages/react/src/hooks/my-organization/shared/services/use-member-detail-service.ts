/**
 * Member detail service hook.
 * @module use-member-detail-service
 * @internal
 */

import {
  memberDetailQueryKeys,
  memberManagementQueryKeys,
  OrganizationDetailsMappers,
  type Role,
} from '@auth0/universal-components-core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { showToast } from '@/components/auth0/shared/toast';
import { useMemberManagementService } from '@/hooks/my-organization/shared/services/use-member-management-service';
import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useErrorHandler } from '@/hooks/shared/use-error-handler';
import { useTranslator } from '@/hooks/shared/use-translator';
import { validateRequestRoleForMember } from '@/lib/utils/my-organization/member-management/member-management-utils';
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
    removeFromOrganizationAction,
    assignRolesAction,
    removeRolesAction,
  } = options;

  const { coreClient } = useCoreClient();
  const { t } = useTranslator('member_management', customMessages);
  const handleError = useErrorHandler();
  const queryClient = useQueryClient();

  const isValidUserId = !!userId && /^(?=.{1,1024}$).+\\|.+$/.test(userId);

  const memberQuery = useQuery({
    queryKey: memberDetailQueryKeys.member(userId),
    queryFn: () => coreClient!.getMyOrganizationApiClient().organization.members.get(userId),
    enabled: !!coreClient && isValidUserId,
  });

  const memberRolesQuery = useQuery({
    queryKey: memberDetailQueryKeys.memberRoles(userId),
    queryFn: async () => {
      const response = await coreClient!
        .getMyOrganizationApiClient()
        .organization.members.roles.list(userId);
      return response.data;
    },
    enabled: !!coreClient && isValidUserId && memberQuery.isSuccess,
  });

  const { rolesQuery, assignRolesMutation, removeFromOrganizationMutation } =
    useMemberManagementService({
      assignRolesAction,
      removeFromOrganizationAction,
    });

  const organizationQuery = useQuery({
    queryKey: memberDetailQueryKeys.organization,
    queryFn: async () => {
      const response = await coreClient!.getMyOrganizationApiClient().organizationDetails.get();
      return OrganizationDetailsMappers.fromAPI(response);
    },
    enabled: !!coreClient,
  });

  const removeRolesMutation = useMutation({
    mutationFn: async (roles: Role[]) => {
      if (!userId) throw new Error('userId is required');
      const roleIds = roles.map((r) => r.id);

      const validationResult = validateRequestRoleForMember(t, roleIds);
      if (validationResult?.aborted) {
        return validationResult;
      }

      if (removeRolesAction?.onBefore && !removeRolesAction.onBefore({ userId, roleIds })) {
        throw new Error('Remove roles cancelled by onBefore');
      }
      await coreClient!
        .getMyOrganizationApiClient()
        .organization.members.roles.unassign(userId, { role_ids: roleIds });
      removeRolesAction?.onAfter?.({ userId, roleIds });
      return { aborted: false } as const;
    },
    onSuccess: (result, roles) => {
      if (result?.aborted) return;
      const removedIds = new Set(roles.map((r) => r.id));
      queryClient.setQueryData<Role[]>(memberDetailQueryKeys.memberRoles(userId), (old) =>
        (old ?? []).filter((r) => !removedIds.has(r.id)),
      );
      const isSingle = roles.length === 1;
      const message = isSingle
        ? t('member.detail.roles.remove_confirm.success', { roleName: roles[0]?.name })
        : t('member.detail.roles.remove_confirm.success_plural', {
            roleNames: roles.map((r) => `"${r.name}"`).join(', '),
          });
      showToast({ type: 'success', message });
      queryClient.invalidateQueries({ queryKey: memberDetailQueryKeys.memberRoles(userId) });
      queryClient.invalidateQueries({ queryKey: memberManagementQueryKeys.members() });
    },
    onError: (error) => {
      handleError(error, { fallbackMessage: t('member.detail.error.remove_role_failed') });
    },
  });

  return {
    memberQuery,
    memberRolesQuery,
    rolesQuery,
    organizationQuery,
    removeFromOrganizationMutation,
    assignRolesMutation,
    removeRolesMutation,
  };
}
