/**
 * Hook for organization member table UI logic.
 * @module use-organization-member-table-logic
 */

import * as React from 'react';

import type {
  Member,
  UseOrganizationMemberTableLogicOptions,
  UseOrganizationMemberTableLogicResult,
} from '@/types';

/**
 * Hook for managing organization member table UI state and handlers.
 * @param options - The hook options.
 * @returns The UI state and handlers.
 */
export function useOrganizationMemberTableLogic(
  options: UseOrganizationMemberTableLogicOptions,
): UseOrganizationMemberTableLogicResult {
  const { onRemoveMember } = options;

  const [showRemoveModal, setShowRemoveModal] = React.useState(false);
  const [selectedMember, setSelectedMember] = React.useState<Member | null>(null);

  const handleRemoveClick = React.useCallback((member: Member) => {
    setSelectedMember(member);
    setShowRemoveModal(true);
  }, []);

  const handleRemove = React.useCallback(
    async (member: Member) => {
      await onRemoveMember(member);
      setShowRemoveModal(false);
      setSelectedMember(null);
    },
    [onRemoveMember],
  );

  return {
    showRemoveModal,
    selectedMember,
    setShowRemoveModal,
    handleRemoveClick,
    handleRemove,
  };
}
