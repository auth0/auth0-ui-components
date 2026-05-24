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
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import React from 'react';

import { showToast } from '@/components/auth0/shared/toast';
import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useErrorHandler } from '@/hooks/shared/use-error-handler';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { CreateInvitationInput } from '@/types/my-organization/member-management/organization-invitation-table-types';
import type {
  UseMemberManagementServiceOptions,
  MemberManagementServiceResult,
  MemberManagementSortConfig,
} from '@/types/my-organization/member-management/organization-member-management-types';

const INVITATION_SORT_FIELD_MAP: Record<string, string> = {
  created_at: 'created_at',
};

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
    createInvitationAction,
    revokeInvitationAction,
    resendInvitationAction,
    invitationParams,
    memberParams,
    assignRolesAction,
    removeFromOrgAction,
  } = options;

  const isInvitationsTabActive = activeTab === 'invitations';
  const isMembersTabActive = activeTab === 'members';
  const isActiveTabProvided = !!activeTab;

  const { coreClient } = useCoreClient();
  const { t } = useTranslator('member_management', customMessages);
  const handleError = useErrorHandler();
  const queryClient = useQueryClient();

  const providersQuery = useQuery({
    queryKey: [...memberManagementQueryKeys.all, 'identity-providers'],
    queryFn: async () => {
      const response: ListIdentityProvidersResponseContent = await coreClient!
        .getMyOrganizationApiClient()
        .organization.identityProviders.list();
      const providers = response.identity_providers ?? [];
      return providers.map((p) => ({
        id: p.id!,
        name: p.display_name ?? p.name ?? '',
        type: p.strategy,
      }));
    },
    enabled: !!coreClient && isActiveTabProvided,
  });

  const rolesQuery = useQuery({
    queryKey: memberManagementQueryKeys.roles(),
    queryFn: async () => {
      const response = await coreClient!
        .getMyOrganizationApiClient()
        .organization.roles.list({ take: 50 });
      return response.data;
    },
    enabled: !!coreClient,
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
        take: invitationParams?.pageSize,
        from: invitationParams?.fromToken,
        sort: buildSortParam(invitationParams?.sortConfig ?? { key: null, direction: 'asc' }),
      });

      const invitations: MemberInvitation[] = page.data;
      const next = page.response.next ?? null;

      return { invitations, next };
    },
    enabled: !!coreClient && isInvitationsTabActive,
    placeholderData: keepPreviousData,
  });

  const membersQuery = useQuery({
    queryKey: [
      ...memberManagementQueryKeys.members(),
      memberParams?.pageSize,
      memberParams?.fromToken,
      memberParams?.filters,
      memberParams?.sortConfig,
    ],
    queryFn: async () => {
      const page = await coreClient!.getMyOrganizationApiClient().organization.members.list({
        take: memberParams?.pageSize,
        from: memberParams?.fromToken,
      });
      const members: OrgMember[] = page.data;
      const next = members.length < (memberParams?.pageSize ?? 0) ? null : page.response.next;
      return { members, next };
    },
    enabled: !!coreClient && isMembersTabActive,
    placeholderData: keepPreviousData,
  });

  const organizationQuery = useQuery({
    queryKey: memberManagementQueryKeys.organization,
    queryFn: async () => {
      const response = await coreClient!.getMyOrganizationApiClient().organizationDetails.get();
      return OrganizationDetailsMappers.fromAPI(response);
    },
    enabled: !!coreClient,
  });

  const assignRolesMutation = useMutation({
    mutationFn: async ({ roleIds, userId }: { roleIds: string[]; userId?: string | null }) => {
      if (!userId) throw new Error('userId is required');
      if (assignRolesAction?.onBefore && !assignRolesAction.onBefore({ userId, roleIds })) {
        throw new Error('Assign roles cancelled by onBefore');
      }
      await coreClient!
        .getMyOrganizationApiClient()
        .organization.members.roles.assign(userId, { role_ids: roleIds });
      assignRolesAction?.onAfter?.({ userId, roleIds });
    },
    onSuccess: (_, { roleIds, userId }) => {
      if (!userId) return;
      const allRoles = queryClient.getQueryData<Role[]>(memberManagementQueryKeys.roles()) ?? [];
      const newRoles = allRoles.filter((r) => roleIds.includes(r.id));
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
    },
    onError: (error) => {
      handleError(error, { fallbackMessage: t('member.detail.error.assign_role_failed') });
    },
  });

  const removeFromOrgMutation = useMutation({
    mutationFn: async ({
      userId,
    }: {
      userId?: string | null;
      memberName?: string;
      orgName?: string;
    }) => {
      if (!userId) throw new Error('userId is required');
      if (removeFromOrgAction?.onBefore && !removeFromOrgAction.onBefore(userId)) {
        throw new Error('Remove from org cancelled by onBefore');
      }
      await coreClient!
        .getMyOrganizationApiClient()
        .organization.memberships.deleteMemberships({ members: [userId] });
    },
    onSuccess: (_, { userId, memberName, orgName }) => {
      if (!userId) return;
      removeFromOrgAction?.onAfter?.(userId);
      showToast({
        type: 'success',
        message: t('member.detail.actions.remove_from_org.success', {
          memberName: memberName ?? '',
          orgName: orgName ?? '',
        }),
      });
      queryClient.invalidateQueries({ queryKey: memberManagementQueryKeys.all });
    },
    onError: (error) => {
      handleError(error, { fallbackMessage: t('member.detail.error.remove_from_org_failed') });
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
    mutationFn: async (invitation: MemberInvitation) => {
      if (revokeInvitationAction?.onBefore && !revokeInvitationAction.onBefore(invitation)) {
        throw new Error('Revoke action cancelled by onBefore');
      }
      await coreClient!
        .getMyOrganizationApiClient()
        .organization.invitations.delete(invitation.id!);
      return invitation;
    },
    onSuccess: (invitation) => {
      revokeInvitationAction?.onAfter?.(invitation);
      showToast({
        type: 'success',
        message: t('invitation.revoke.success', { email: invitation.invitee?.email ?? '' }),
      });
      queryClient.invalidateQueries({ queryKey: memberManagementQueryKeys.invitations() });
    },
    onError: (error) => {
      handleError(error, { fallbackMessage: t('invitation.error.revoke_failed') });
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
      await coreClient!
        .getMyOrganizationApiClient()
        .organization.invitations.delete(freshInvitation.id ?? invitation.id!);
      const email = freshInvitation.invitee?.email ?? invitation.invitee?.email ?? '';
      const roles = freshInvitation.roles ?? invitation.roles;
      const response = await coreClient!
        .getMyOrganizationApiClient()
        .organization.invitations.create({
          invitees: [{ email, roles }],
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
    rolesQuery,
    invitationsQuery,
    organizationQuery,
    membersQuery,
    assignRolesMutation,
    removeFromOrgMutation,
    createInvitationMutation,
    revokeInvitationMutation,
    resendInvitationMutation,
    fetchInvitationDetails,
  };
}
