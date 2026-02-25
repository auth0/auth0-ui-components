/**
 * Hook for organization member table data management.
 * @module use-organization-member-table
 */

import * as React from 'react';

import type {
  Member,
  UseOrganizationMemberTableOptions,
  UseOrganizationMemberTableResult,
} from '@/types';

/**
 * Hook for managing organization member table data.
 * Handles fetching members and remove operations.
 * @param options - The hook options.
 * @returns The member data and API methods.
 */
export function useOrganizationMemberTable(
  options: UseOrganizationMemberTableOptions,
): UseOrganizationMemberTableResult {
  const { removeAction } = options;

  const [members, setMembers] = React.useState<Member[]>([]);
  const [isFetching, setIsFetching] = React.useState(false);
  const [isRemoving, setIsRemoving] = React.useState(false);

  const fetchMembers = React.useCallback(async () => {
    setIsFetching(true);
    try {
      // TODO: Implement API call to fetch members
      // const response = await coreClient.myOrganizationApiClient.getMembers();
      // setMembers(response.members);
    } finally {
      setIsFetching(false);
    }
  }, []);

  const onRemoveMember = React.useCallback(
    async (member: Member) => {
      setIsRemoving(true);
      try {
        // Call onBefore hook if provided
        if (removeAction?.onBefore) {
          const result = await removeAction.onBefore(member);
          if (result === undefined) return;
        }

        // TODO: Implement API call to remove member
        // await coreClient.myOrganizationApiClient.removeMember(member.user_id);

        // Remove from local state
        setMembers((prev) => prev.filter((m) => m.user_id !== member.user_id));

        // Call onAfter hook if provided
        if (removeAction?.onAfter) {
          await removeAction.onAfter(member);
        }
      } finally {
        setIsRemoving(false);
      }
    },
    [removeAction],
  );

  // Fetch members on mount
  React.useEffect(() => {
    void fetchMembers();
  }, [fetchMembers]);

  return {
    members,
    isFetching,
    isRemoving,
    fetchMembers,
    onRemoveMember,
  };
}
