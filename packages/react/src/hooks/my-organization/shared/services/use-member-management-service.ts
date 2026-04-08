/**
 * Member management service hook.
 * @module use-member-management-service
 * @internal
 */

import {
  type MemberInvitation,
  type ListIdentityProvidersResponseContent,
} from '@auth0/universal-components-core';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as React from 'react';

import { showToast } from '@/components/auth0/shared/toast';
import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useTranslator } from '@/hooks/shared/use-translator';
import type {
  CreateInvitationInput,
  InvitationSortConfig,
} from '@/types/my-organization/member-management/organization-invitation-table-types';
import type {
  UseMemberManagementServiceOptions,
  MemberManagementServiceResult,
} from '@/types/my-organization/member-management/organization-member-management-types';

export const memberManagementQueryKeys = {
  all: ['member-management'] as const,
  invitations: () => [...memberManagementQueryKeys.all, 'invitations'] as const,
};

const INVITATION_SORT_FIELD_MAP: Record<string, string> = {
  created_at: 'created_at',
};

/**
 * Builds a sort parameter string for the API.
 * @param sortConfig - The sort configuration.
 * @returns The formatted sort string, or undefined if no valid sort key.
 */
function buildSortParam(sortConfig: InvitationSortConfig): string | undefined {
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
  } = options;

  const isInvitationsTabActive = activeTab === 'invitations';

  const { coreClient } = useCoreClient();
  const { t } = useTranslator('member_management', customMessages as Record<string, unknown>);
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
    enabled: !!coreClient && isInvitationsTabActive,
  });

  const invitationsQuery = useQuery({
    queryKey: [
      ...memberManagementQueryKeys.invitations(),
      invitationParams.pageSize,
      invitationParams.fromToken,
      invitationParams.filters,
      invitationParams.sortConfig,
    ],
    queryFn: async () => {
      const page = await coreClient!.getMyOrganizationApiClient().organization.invitations.list({
        take: invitationParams.pageSize,
        from: invitationParams.fromToken,
        sort: buildSortParam(invitationParams.sortConfig),
      });

      const invitations: MemberInvitation[] = page.data;
      const next = page.response.next ?? null;
      const total = (page.response as Record<string, unknown>).total as number | undefined;

      return { invitations, next, total };
    },
    enabled: !!coreClient && isInvitationsTabActive,
  });

  const createInvitationMutation = useMutation({
    mutationFn: async (data: CreateInvitationInput) => {
      if (createInvitationAction?.onBefore && !createInvitationAction.onBefore(data)) {
        throw new Error('Create action cancelled by onBefore');
      }
      const response = await coreClient!
        .getMyOrganizationApiClient()
        .organization.invitations.create({
          invitees: [{ email: data.invitee.email, roles: data.roles }],
          inviter: data.inviter,
          ttl_sec: data.ttl_sec,
        });
      return Array.isArray(response) ? response[0] : response;
    },
    onSuccess: (result, data) => {
      createInvitationAction?.onAfter?.(data, result);
      showToast({ type: 'success', message: t('invitation.create.success') });
      queryClient.invalidateQueries({ queryKey: memberManagementQueryKeys.invitations() });
    },
    onError: () => {
      showToast({ type: 'error', message: t('invitation.error.create_failed') });
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
      showToast({ type: 'success', message: t('invitation.revoke.success') });
      queryClient.invalidateQueries({ queryKey: memberManagementQueryKeys.invitations() });
    },
    onError: () => {
      showToast({ type: 'error', message: t('invitation.error.revoke_failed') });
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
      showToast({ type: 'success', message: t('invitation.success.invitation_resent') });
      queryClient.invalidateQueries({ queryKey: memberManagementQueryKeys.invitations() });
    },
    onError: () => {
      showToast({ type: 'error', message: t('invitation.error.resend_failed') });
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
    invitationsQuery,
    createInvitationMutation,
    revokeInvitationMutation,
    resendInvitationMutation,
    fetchInvitationDetails,
  };
}
