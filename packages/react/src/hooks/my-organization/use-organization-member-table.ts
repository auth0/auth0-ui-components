/**
 * Hook for organization member table data management.
 * @module use-organization-member-table
 */

import { getStatusCode } from '@auth0/universal-components-core';
import * as React from 'react';

import { showToast } from '@/components/auth0/shared/toast';
import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useTranslator } from '@/hooks/shared/use-translator';
import type {
  Member,
  UseOrganizationMemberTableOptions,
  UseOrganizationMemberTableResult,
} from '@/types';

/**
 * Maps SDK OrgMember to UI Member type.
 * @param orgMember - The SDK organization member object.
 * @returns The mapped Member object.
 */
function mapOrgMemberToMember(orgMember: {
  user_id?: string;
  email?: string;
  name?: string;
  picture?: string;
  roles?: Array<{ id?: string; name?: string }>;
}): Member {
  return {
    user_id: orgMember.user_id ?? '',
    email: orgMember.email,
    name: orgMember.name,
    picture: orgMember.picture,
    roles: orgMember.roles?.map((role) => role.name ?? role.id ?? '') ?? [],
  };
}

/**
 * Hook for managing organization member table data.
 * Handles fetching members and remove operations.
 * @param options - The hook options.
 * @returns The member data and API methods.
 */
export function useOrganizationMemberTable(
  options: UseOrganizationMemberTableOptions,
): UseOrganizationMemberTableResult {
  const { removeAction, customMessages = {} } = options;
  const { coreClient } = useCoreClient();
  const { t } = useTranslator('member_management', customMessages);

  const [members, setMembers] = React.useState<Member[]>([]);
  const [isFetching, setIsFetching] = React.useState(false);
  const [isRemoving, setIsRemoving] = React.useState(false);

  const fetchMembers = React.useCallback(async () => {
    if (!coreClient) return;

    setIsFetching(true);
    try {
      const response = await coreClient.getMyOrganizationApiClient().organization.members.list();

      const mappedMembers = (response.members ?? []).map(mapOrgMemberToMember);
      setMembers(mappedMembers);
    } catch (error) {
      const status = getStatusCode(error);
      if (status !== 404) {
        showToast({
          type: 'error',
          message: t('member.error.fetch_failed'),
        });
      }
      setMembers([]);
    } finally {
      setIsFetching(false);
    }
  }, [coreClient, t]);

  const onRemoveMember = React.useCallback(
    async (member: Member) => {
      if (!coreClient) return;

      setIsRemoving(true);
      try {
        // Call onBefore hook if provided
        if (removeAction?.onBefore) {
          const result = await removeAction.onBefore(member);
          if (result === undefined) return;
        }

        // Call SDK to delete member
        await coreClient
          .getMyOrganizationApiClient()
          .organization.members.delete(member.user_id, { delete_user: false });

        // Remove from local state
        setMembers((prev) => prev.filter((m) => m.user_id !== member.user_id));

        showToast({
          type: 'success',
          message: t('member.remove.success', { name: member.name ?? member.email ?? '' }),
        });

        // Call onAfter hook if provided
        if (removeAction?.onAfter) {
          await removeAction.onAfter(member);
        }
      } catch (error) {
        showToast({
          type: 'error',
          message: t('member.error.remove_failed'),
        });
      } finally {
        setIsRemoving(false);
      }
    },
    [coreClient, removeAction, t],
  );

  // Fetch members on mount when coreClient is available
  React.useEffect(() => {
    if (coreClient) {
      void fetchMembers();
    }
  }, [coreClient, fetchMembers]);

  return {
    members,
    isFetching,
    isRemoving,
    fetchMembers,
    onRemoveMember,
  };
}
