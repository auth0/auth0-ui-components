/**
 * Member management service hook.
 * @module use-member-management-service
 * @internal
 */

import type { OrgMember, Role } from '@auth0/universal-components-core';
import {
  type MemberInvitation,
  type ListIdentityProvidersResponseContent,
  memberManagementQueryKeys,
  OrganizationDetailsMappers,
} from '@auth0/universal-components-core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import React from 'react';

import { showToast } from '@/components/auth0/shared/toast';
import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useErrorHandler } from '@/hooks/shared/use-error-handler';
import { useTranslator } from '@/hooks/shared/use-translator';
import { MEMBER_ACCESS_LEVELS } from '@/lib/constants/common-constants';
import { DEFAULT_ROLES_PAGE_SIZE } from '@/lib/constants/my-organization/member-management/member-management-constants';
import { isIdpKnownResponse } from '@/lib/utils/my-organization/idp-management/idp-management-utils';
import {
  isValidUserId,
  validateRequestRoleForMember,
} from '@/lib/utils/my-organization/member-management/member-management-utils';
import { getPreviousDataOption } from '@/lib/utils/tanstack-compat';
import type {
  ConnectionOption,
  CreateInvitationInput,
} from '@/types/my-organization/member-management/organization-invitation-table-types';
import type {
  UseMemberManagementServiceOptions,
  MemberManagementServiceResult,
  MemberManagementSortConfig,
} from '@/types/my-organization/member-management/organization-member-management-types';

const keepPreviousDataOption = getPreviousDataOption();

const INVITATION_SORT_FIELD_MAP: Record<string, string> = {
  created_at: 'created_at',
};

const MEMBER_LIST_FIELDS =
  'user_id,email,name,nickname,given_name,family_name,created_at,updated_at,last_login,phone_number,roles,access_level';

/**
 * Builds a sort parameter string for the API.
 * @param sortConfig - The sort configuration.
 * @returns The formatted sort string, or undefined if no valid sort key.
 */
function buildSortParam(sortConfig: MemberManagementSortConfig): string | undefined {
  if (!sortConfig.key) return undefined;
  const apiField = INVITATION_SORT_FIELD_MAP[sortConfig.key];
  if (!apiField) return undefined;
  const direction = sortConfig.direction === 'asc' ? '1' : '-1';
  return `${apiField}:${direction}`;
}

/**
 * Service hook for member management API operations.
 * @param options - Service configuration options.
 * @returns Query and mutation objects for member management.
 */
export function useMemberManagementService(
  options: UseMemberManagementServiceOptions,
): MemberManagementServiceResult {
  const {
    customMessages = {},
    activeTab,
    userId,
    memberRolesQueryEnabled = true,
    createInvitationAction,
    revokeInvitationAction,
    resendInvitationAction,
    invitationParams,
    memberParams,
    assignRolesAction,
    removeFromOrganizationAction,
    invitationRolesId,
    deferRoleSearch = false,
  } = options;

  const isInvitationsTabActive = activeTab === 'invitations';
  const isActiveTabProvided = !!activeTab;

  const { coreClient } = useCoreClient();
  const { t } = useTranslator('member_management', customMessages);
  const handleError = useErrorHandler();
  const queryClient = useQueryClient();

  const providersQuery = useQuery<ConnectionOption[]>({
    queryKey: memberManagementQueryKeys.identityProviders(),
    queryFn: async () => {
      const response: ListIdentityProvidersResponseContent = await coreClient!
        .getMyOrganizationApiClient()
        .organization.identityProviders.list({
          member_access_level: [...MEMBER_ACCESS_LEVELS],
        });
      const providers = response.identity_providers?.filter(isIdpKnownResponse) ?? [];
      return providers
        .filter((p) => !!p.id)
        .map((p) => ({
          id: p.id!,
          name: p.display_name ?? p.name ?? p.id!,
          type: 'identity_provider' as const,
        }));
    },
    enabled: !!coreClient && isActiveTabProvided,
  });

  const userStoresQuery = useQuery<ConnectionOption[]>({
    queryKey: memberManagementQueryKeys.userStores(),
    queryFn: async () => {
      const page = await coreClient!.getMyOrganizationApiClient().organization.userStores.list({
        is_enabled: true,
        member_access_level: [...MEMBER_ACCESS_LEVELS],
      });
      const userStores = page.user_stores ?? [];
      return userStores
        .filter((store) => !!store.id)
        .map((store) => ({
          id: store.id!,
          name: store.display_name ?? store.name ?? store.id!,
          type: 'user_store' as const,
        }));
    },
    enabled: !!coreClient && isActiveTabProvided,
  });

  const invitationRolesQuery = useQuery({
    queryKey: memberManagementQueryKeys.invitationRoles(invitationRolesId ?? ''),
    queryFn: async () => {
      const response = await coreClient!
        .getMyOrganizationApiClient()
        .organization.invitations.roles.list(invitationRolesId!);
      return response.roles ?? [];
    },
    enabled: !!coreClient && !!invitationRolesId,
  });

  const [roleSearchTerm, setRoleSearchTerm] = React.useState('');
  const [roleSearchActive, setRoleSearchActive] = React.useState(!deferRoleSearch);
  const enableRoleSearch = React.useCallback(() => setRoleSearchActive(true), []);

  const rolesSearchQuery = useQuery({
    queryKey: memberManagementQueryKeys.rolesSearch(roleSearchTerm),
    queryFn: async () => {
      const response = await coreClient!.getMyOrganizationApiClient().organization.roles.list({
        take: DEFAULT_ROLES_PAGE_SIZE,
        ...(roleSearchTerm ? { name: roleSearchTerm } : {}),
      });
      return response.data;
    },
    enabled: !!coreClient && roleSearchActive,
    ...keepPreviousDataOption,
  });

  const invitationsQuery = useQuery({
    queryKey: [
      ...memberManagementQueryKeys.invitations(),
      invitationParams?.pageSize,
      invitationParams?.fromToken,
      invitationParams?.filters,
      invitationParams?.sortConfig,
    ],
    queryFn: async () => {
      const page = await coreClient!.getMyOrganizationApiClient().organization.invitations.list({
        take: invitationParams!.pageSize,
        from: invitationParams!.fromToken,
        sort: buildSortParam(invitationParams!.sortConfig),
      });

      const invitations: MemberInvitation[] = page.data;
      const next = page.response.next ?? null;

      return { invitations, next };
    },
    enabled: !!coreClient && isInvitationsTabActive && !!invitationParams,
    ...keepPreviousDataOption,
  });

  const membersQuery = useQuery({
    queryKey: [
      ...memberManagementQueryKeys.members(),
      memberParams?.pageSize,
      memberParams?.fromToken,
    ],
    queryFn: async () => {
      const page = await coreClient!.getMyOrganizationApiClient().organization.members.list({
        take: memberParams!.pageSize,
        from: memberParams!.fromToken,
        fields: MEMBER_LIST_FIELDS,
      });
      const members: OrgMember[] = page.data;
      const next = members.length < memberParams!.pageSize ? null : page.response.next;
      return { members, next };
    },
    enabled: !!coreClient && !isInvitationsTabActive && !!memberParams,
    ...keepPreviousDataOption,
  });

  const organizationQuery = useQuery({
    queryKey: memberManagementQueryKeys.organization,
    queryFn: async () => {
      const response = await coreClient!.getMyOrganizationApiClient().organizationDetails.get();
      return OrganizationDetailsMappers.fromAPI(response);
    },
    enabled: !!coreClient,
  });

  const memberRolesQuery = useQuery({
    queryKey: memberManagementQueryKeys.memberRoles(userId ?? ''),
    queryFn: async () => {
      const response = await coreClient!
        .getMyOrganizationApiClient()
        .organization.members.roles.list(userId!);
      return response.data;
    },
    enabled: !!coreClient && isValidUserId(userId) && memberRolesQueryEnabled,
  });

  const assignRolesMutation = useMutation({
    mutationFn: async ({
      roleIds,
      memberRoles,
      userId,
    }: {
      roleIds: string[];
      memberRoles: Role[];
      userId?: string | null;
    }) => {
      if (!userId) throw new Error('userId is required');
      const validationResult = validateRequestRoleForMember(t, roleIds, memberRoles, true);
      if (validationResult?.aborted) {
        return validationResult;
      }

      if (assignRolesAction?.onBefore && !assignRolesAction.onBefore({ userId, roleIds })) {
        throw new Error('Assign roles cancelled by onBefore');
      }

      await coreClient!
        .getMyOrganizationApiClient()
        .organization.members.roles.assign(userId, { role_ids: roleIds });
      assignRolesAction?.onAfter?.({ userId, roleIds });
      return { aborted: false } as const;
    },
    onSuccess: (result, { roleIds, userId }) => {
      if (result?.aborted) return;
      if (!userId) return;
      const searchedRoles =
        queryClient.getQueryData<Role[]>(memberManagementQueryKeys.rolesSearch(roleSearchTerm)) ??
        [];
      const newRoles = searchedRoles.filter((r) => roleIds.includes(r.id));
      queryClient.setQueryData<Role[]>(memberManagementQueryKeys.memberRoles(userId), (old) => [
        ...(old ?? []),
        ...newRoles,
      ]);
      const assignKey =
        roleIds.length === 1
          ? 'member.detail.roles.assign_modal.success'
          : 'member.detail.roles.assign_modal.success_plural';
      showToast({ type: 'success', message: t(assignKey) });
      queryClient.invalidateQueries({ queryKey: memberManagementQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: memberManagementQueryKeys.memberRoles(userId) });
    },
    onError: (error) => {
      handleError(error, { fallbackMessage: t('member.detail.error.assign_role_failed') });
    },
  });

  const removeFromOrganizationMutation = useMutation({
    mutationFn: async ({
      userId,
    }: {
      userId?: string | null;
      memberName?: string;
      organizationName?: string;
    }) => {
      if (!userId) throw new Error('userId is required');
      if (
        removeFromOrganizationAction?.onBefore &&
        !removeFromOrganizationAction.onBefore(userId)
      ) {
        throw new Error('Remove from org cancelled by onBefore');
      }
      await coreClient!
        .getMyOrganizationApiClient()
        .organization.memberships.deleteMemberships({ members: [userId] });
    },
    onSuccess: (_, { userId, memberName, organizationName }) => {
      if (!userId) return;
      removeFromOrganizationAction?.onAfter?.(userId);
      showToast({
        type: 'success',
        message: t('member.detail.actions.remove_from_organization.success', {
          memberName: memberName ?? '',
          organizationName: organizationName ?? '',
        }),
      });
      queryClient.invalidateQueries({ queryKey: memberManagementQueryKeys.members() });
    },
    onError: (error) => {
      handleError(error, {
        fallbackMessage: t('member.detail.error.remove_from_organization_failed'),
      });
    },
  });

  const createInvitationMutation = useMutation({
    mutationFn: async (data: CreateInvitationInput) => {
      if (createInvitationAction?.onBefore && !createInvitationAction.onBefore(data)) {
        throw new Error('Create action cancelled by onBefore');
      }
      const response = await coreClient!
        .getMyOrganizationApiClient()
        .organization.invitations.create({
          invitees: data.invitees,
          inviter: data.inviter,
          identity_provider_id: data.identity_provider_id,
          user_store_id: data.user_store_id,
          ttl_sec: data.ttl_sec,
        });
      return Array.isArray(response) ? response[0] : response;
    },
    onSuccess: (result, data) => {
      createInvitationAction?.onAfter?.(data, result);
      const isBulk = data.invitees.length > 1;
      const message = isBulk
        ? t('invitation.create.success_bulk')
        : t('invitation.create.success', { email: data.invitees[0]?.email ?? '' });
      showToast({ type: 'success', message });
      queryClient.invalidateQueries({ queryKey: memberManagementQueryKeys.invitations() });
    },
    onError: (error) => {
      handleError(error, { fallbackMessage: t('invitation.error.create_failed') });
    },
  });

  const revokeInvitationMutation = useMutation({
    mutationFn: async (invitations: MemberInvitation[]) => {
      if (revokeInvitationAction?.onBefore && !revokeInvitationAction.onBefore(invitations)) {
        throw new Error('Revoke action cancelled by onBefore');
      }
      const ids = invitations.map((invitation) => invitation.id).filter((id): id is string => !!id);
      await coreClient!
        .getMyOrganizationApiClient()
        .organization.invitations.deleteMemberInvitations({ invitations: ids });
      return invitations;
    },
    onSuccess: (invitations) => {
      revokeInvitationAction?.onAfter?.(invitations);
      showToast({
        type: 'success',
        message:
          invitations.length === 1
            ? t('invitation.revoke.success', { email: invitations[0]?.invitee?.email ?? '' })
            : t('invitation.bulk_revoke.success', { count: invitations.length }),
      });
      queryClient.invalidateQueries({ queryKey: memberManagementQueryKeys.invitations() });
    },
    onError: (error, invitations) => {
      handleError(error, {
        fallbackMessage:
          invitations.length === 1
            ? t('invitation.error.revoke_failed')
            : t('invitation.error.bulk_revoke_failed'),
      });
    },
  });

  const resendInvitationMutation = useMutation({
    mutationFn: async (invitation: MemberInvitation) => {
      if (resendInvitationAction?.onBefore && !resendInvitationAction.onBefore(invitation)) {
        throw new Error('Resend action cancelled by onBefore');
      }
      const freshInvitation = await coreClient!
        .getMyOrganizationApiClient()
        .organization.invitations.get(invitation.id!);
      const identityProviderId =
        freshInvitation.identity_provider_id ?? invitation.identity_provider_id;
      const userStoreId = freshInvitation.user_store_id ?? invitation.user_store_id;

      if (!identityProviderId && !userStoreId) {
        throw new Error(t('invitation.error.connection_required'));
      }
      await coreClient!
        .getMyOrganizationApiClient()
        .organization.invitations.deleteMemberInvitations({
          invitations: [freshInvitation.id ?? invitation.id!],
        });
      const email = freshInvitation.invitee?.email ?? invitation.invitee?.email ?? '';
      const roles = freshInvitation.roles ?? invitation.roles;
      const response = await coreClient!
        .getMyOrganizationApiClient()
        .organization.invitations.create({
          invitees: [{ email, roles }],
          identity_provider_id: identityProviderId,
          user_store_id: userStoreId,
        });
      return Array.isArray(response) ? response[0] : response;
    },
    onSuccess: (result, invitation) => {
      resendInvitationAction?.onAfter?.(invitation, result);
      showToast({
        type: 'success',
        message: t('invitation.success.invitation_resent', {
          email: invitation.invitee?.email ?? '',
        }),
      });
      queryClient.invalidateQueries({ queryKey: memberManagementQueryKeys.invitations() });
    },
    onError: (error) => {
      handleError(error, { fallbackMessage: t('invitation.error.resend_failed') });
      queryClient.invalidateQueries({ queryKey: memberManagementQueryKeys.invitations() });
    },
  });

  const fetchInvitationDetails = React.useCallback(
    async (invitationId: string): Promise<MemberInvitation> => {
      return coreClient!.getMyOrganizationApiClient().organization.invitations.get(invitationId);
    },
    [coreClient],
  );

  return {
    providersQuery,
    userStoresQuery,
    invitationRolesQuery,
    rolesSearchQuery,
    setRoleSearchTerm,
    enableRoleSearch,
    invitationsQuery,
    organizationQuery,
    membersQuery,
    memberRolesQuery,
    assignRolesMutation,
    removeFromOrganizationMutation,
    createInvitationMutation,
    revokeInvitationMutation,
    resendInvitationMutation,
    fetchInvitationDetails,
  };
}
