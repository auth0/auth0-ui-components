/**
 * Hook for organization invitation table data management.
 * @module use-organization-invitation-table
 */

import * as React from 'react';

import type {
  Invitation,
  CreateInvitationInput,
  UseOrganizationInvitationTableOptions,
  UseOrganizationInvitationTableResult,
} from '@/types';

/**
 * Hook for managing organization invitation table data.
 * Handles fetching invitations, create, and revoke operations.
 * @param options - The hook options.
 * @returns The invitation data and API methods.
 */
export function useOrganizationInvitationTable(
  options: UseOrganizationInvitationTableOptions,
): UseOrganizationInvitationTableResult {
  const { createAction, revokeAction } = options;

  const [invitations, setInvitations] = React.useState<Invitation[]>([]);
  const [isFetching, setIsFetching] = React.useState(false);
  const [isCreating, setIsCreating] = React.useState(false);
  const [isRevoking, setIsRevoking] = React.useState(false);

  const fetchInvitations = React.useCallback(async () => {
    setIsFetching(true);
    try {
      // TODO: Implement API call to fetch invitations
      // const response = await coreClient.myOrganizationApiClient.getInvitations();
      // setInvitations(response.invitations);
    } finally {
      setIsFetching(false);
    }
  }, []);

  const onCreateInvitation = React.useCallback(
    async (data: CreateInvitationInput): Promise<Invitation | null> => {
      setIsCreating(true);
      try {
        // Call onBefore hook if provided
        if (createAction?.onBefore) {
          const result = await createAction.onBefore(data);
          if (result === undefined) return null;
        }

        // TODO: Implement API call to create invitation
        // const invitation = await coreClient.myOrganizationApiClient.createInvitation(data);
        const invitation: Invitation = {
          id: crypto.randomUUID(),
          invitee: data.invitee,
          inviter: { name: 'Current User' },
          roles: data.roles,
          created_at: new Date().toISOString(),
        };

        // Add to local state
        setInvitations((prev) => [...prev, invitation]);

        // Call onAfter hook if provided
        if (createAction?.onAfter) {
          await createAction.onAfter(invitation);
        }

        return invitation;
      } finally {
        setIsCreating(false);
      }
    },
    [createAction],
  );

  const onRevokeInvitation = React.useCallback(
    async (invitation: Invitation) => {
      setIsRevoking(true);
      try {
        // Call onBefore hook if provided
        if (revokeAction?.onBefore) {
          const result = await revokeAction.onBefore(invitation);
          if (result === undefined) return;
        }

        // TODO: Implement API call to revoke invitation
        // await coreClient.myOrganizationApiClient.revokeInvitation(invitation.id);

        // Remove from local state
        setInvitations((prev) => prev.filter((i) => i.id !== invitation.id));

        // Call onAfter hook if provided
        if (revokeAction?.onAfter) {
          await revokeAction.onAfter(invitation);
        }
      } finally {
        setIsRevoking(false);
      }
    },
    [revokeAction],
  );

  // Fetch invitations on mount
  React.useEffect(() => {
    void fetchInvitations();
  }, [fetchInvitations]);

  return {
    invitations,
    isFetching,
    isCreating,
    isRevoking,
    fetchInvitations,
    onCreateInvitation,
    onRevokeInvitation,
  };
}
