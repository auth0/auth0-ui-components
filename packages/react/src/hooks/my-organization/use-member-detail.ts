/**
 * Organization member detail hook.
 * @module use-member-detail
 */

import { resolveErrorMessage, type Role } from '@auth0/universal-components-core';
import * as React from 'react';

import { useMemberDetailService } from '@/hooks/my-organization/shared/services/use-member-detail-service';
import { useErrorHandler } from '@/hooks/shared/use-error-handler';
import { useTranslator } from '@/hooks/shared/use-translator';
import { isMutationLoading } from '@/lib/utils/tanstack-compat';
import type {
  MemberDetailModalState,
  OrganizationMemberDetailTab,
  UseOrganizationMemberDetailOptions,
  UseOrganizationMemberDetailResult,
} from '@/types/my-organization/member-management/organization-member-detail-types';

/**
 * Hook for organization member detail page.
 * @param options - Hook configuration options.
 * @returns State and handler functions.
 */
export function useOrganizationMemberDetail(
  options: UseOrganizationMemberDetailOptions,
): UseOrganizationMemberDetailResult {
  const {
    userId,
    onBack,
    customMessages = {},
    readOnly = false,
    initialTab,
    removeFromOrganizationAction,
    assignRolesAction,
    removeRolesAction,
  } = options;

  const {
    memberQuery,
    memberRolesQuery,
    rolesSearchQuery,
    setRoleSearchTerm,
    enableRoleSearch,
    organizationQuery,
    removeFromOrganizationMutation,
    assignRolesMutation,
    removeRolesMutation,
  } = useMemberDetailService({
    userId,
    customMessages,
    removeFromOrganizationAction,
    assignRolesAction,
    removeRolesAction,
  });

  const { t } = useTranslator('member_management', customMessages);
  const handleError = useErrorHandler();
  const hasShownMemberRolesError = React.useRef(false);

  React.useEffect(() => {
    if (memberRolesQuery.isError && !hasShownMemberRolesError.current) {
      handleError(memberRolesQuery.error, {
        fallbackMessage: t('member.detail.error.fetch_roles_failed'),
      });
      hasShownMemberRolesError.current = true;
    }
    if (!memberRolesQuery.isError) {
      hasShownMemberRolesError.current = false;
    }
  }, [memberRolesQuery.isError, memberRolesQuery.error, handleError, t]);

  const [activeTab, setActiveTab] = React.useState<OrganizationMemberDetailTab>(
    initialTab ?? 'details',
  );
  const [modalState, setModalState] = React.useState<MemberDetailModalState>({ type: null });
  const [selectedRoles, setSelectedRoles] = React.useState<Role[]>([]);

  React.useEffect(() => {
    if (modalState.type === 'assignRoles') {
      enableRoleSearch();
    }
  }, [modalState.type, enableRoleSearch]);

  const handleBack = React.useCallback(() => {
    onBack?.();
  }, [onBack]);

  const openModal = React.useCallback(
    (state: MemberDetailModalState) => {
      if (readOnly && state.type !== null) return;
      setModalState(state);
    },
    [readOnly],
  );

  const closeModal = React.useCallback(() => {
    setModalState({ type: null });
  }, []);

  const handleRemoveFromOrganizationConfirm = React.useCallback(
    (userId?: string | null, memberName?: string, organizationName?: string) => {
      removeFromOrganizationMutation.mutate(
        { userId, memberName, organizationName },
        {
          onSuccess: () => {
            closeModal();
            onBack?.();
          },
        },
      );
    },
    [removeFromOrganizationMutation, closeModal, onBack],
  );

  const handleAssignRolesSubmit = React.useCallback(
    (roleIds: string[], memberRoles: Role[], userId?: string | null) => {
      assignRolesMutation.mutate(
        { roleIds, memberRoles, userId },
        {
          onSuccess: (result) => {
            if (result?.aborted) return;
            closeModal();
          },
        },
      );
    },
    [assignRolesMutation, closeModal],
  );

  const handleRemoveRolesCancel = React.useCallback(() => {
    closeModal();
  }, [closeModal]);

  const handleRemoveRolesConfirm = React.useCallback(() => {
    if (modalState.type !== 'removeRoles') return;
    removeRolesMutation.mutate(modalState.roles, {
      onSuccess: (result) => {
        if (!result?.aborted) {
          setSelectedRoles([]);
        }
        closeModal();
      },
    });
  }, [modalState, removeRolesMutation, closeModal]);

  const member = memberQuery.data ?? null;
  const organizationDisplayName = organizationQuery.data?.display_name ?? '';
  const memberRoles: Role[] = memberRolesQuery.data ?? [];
  const assignedRoleIds = React.useMemo(() => new Set(memberRoles.map((r) => r.id)), [memberRoles]);

  const searchedRoles: Role[] = React.useMemo(
    () => (rolesSearchQuery.data ?? []).filter((r) => !assignedRoleIds.has(r.id)),
    [rolesSearchQuery.data, assignedRoleIds],
  );

  const removingRoles = modalState.type === 'removeRoles' ? modalState.roles : [];

  const memberErrorMessage = memberQuery.isError
    ? resolveErrorMessage(memberQuery.error, t('member.detail.error.fetch_failed'))
    : null;

  return {
    activeTab,
    member,
    organizationDisplayName,
    isLoadingOrganization: organizationQuery.isLoading,
    memberRoles,
    searchedRoles,
    onRoleSearch: setRoleSearchTerm,
    selectedRoles,
    memberError: memberErrorMessage,
    isFetchingMember: memberQuery.isLoading || memberQuery.isFetching,
    isFetchingMemberRoles: memberRolesQuery.isLoading,
    isLoading: memberQuery.isLoading,
    isRemovingFromOrganization: isMutationLoading(removeFromOrganizationMutation),
    isAssigningRoles: isMutationLoading(assignRolesMutation),
    isRemovingRoles: isMutationLoading(removeRolesMutation),
    removingRoleIds: isMutationLoading(removeRolesMutation) ? removingRoles.map((r) => r.id) : [],
    modalState,

    setActiveTab,
    setSelectedRoles,
    handleBack,
    openModal,
    closeModal,
    handleRemoveFromOrganizationConfirm,
    handleAssignRolesSubmit,
    handleRemoveRolesCancel,
    handleRemoveRolesConfirm,
  };
}
