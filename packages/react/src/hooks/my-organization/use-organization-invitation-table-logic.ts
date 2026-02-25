/**
 * Hook for organization invitation table UI logic.
 * @module use-organization-invitation-table-logic
 */

import * as React from 'react';

import type {
  Invitation,
  CreateInvitationInput,
  UseOrganizationInvitationTableLogicOptions,
  UseOrganizationInvitationTableLogicResult,
} from '@/types';

/**
 * Hook for managing organization invitation table UI state and handlers.
 * @param options - The hook options.
 * @returns The UI state and handlers.
 */
export function useOrganizationInvitationTableLogic(
  options: UseOrganizationInvitationTableLogicOptions,
): UseOrganizationInvitationTableLogicResult {
  const { onCreateInvitation, onRevokeInvitation } = options;

  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [showDetailsModal, setShowDetailsModal] = React.useState(false);
  const [showRevokeModal, setShowRevokeModal] = React.useState(false);
  const [selectedInvitation, setSelectedInvitation] = React.useState<Invitation | null>(null);

  const handleCreateClick = React.useCallback(() => {
    setShowCreateModal(true);
  }, []);

  const handleCreate = React.useCallback(
    async (data: CreateInvitationInput) => {
      await onCreateInvitation(data);
      setShowCreateModal(false);
    },
    [onCreateInvitation],
  );

  const handleDetailsClick = React.useCallback((invitation: Invitation) => {
    setSelectedInvitation(invitation);
    setShowDetailsModal(true);
  }, []);

  const handleRevokeClick = React.useCallback((invitation: Invitation) => {
    setSelectedInvitation(invitation);
    setShowRevokeModal(true);
  }, []);

  const handleRevoke = React.useCallback(
    async (invitation: Invitation) => {
      await onRevokeInvitation(invitation);
      setShowRevokeModal(false);
      setSelectedInvitation(null);
    },
    [onRevokeInvitation],
  );

  return {
    showCreateModal,
    showDetailsModal,
    showRevokeModal,
    selectedInvitation,
    setShowCreateModal,
    setShowDetailsModal,
    setShowRevokeModal,
    handleCreateClick,
    handleCreate,
    handleDetailsClick,
    handleRevokeClick,
    handleRevoke,
  };
}
