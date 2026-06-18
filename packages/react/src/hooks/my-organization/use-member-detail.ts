/**
 * Organization member detail hook.
 * @module use-member-detail
 */

import { resolveErrorMessage, type Role } from '@auth0/universal-components-core';
import * as React from 'react';

import { useMemberDetailService } from '@/hooks/my-organization/shared/services/use-member-detail-service';
import { useErrorHandler } from '@/hooks/shared/use-error-handler';
import { useTranslator } from '@/hooks/shared/use-translator';
import type {
  MemberDetailModalState,
  MemberDetailTab,
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
    removeFromOrgAction,
    assignRolesAction,
    removeRolesAction,
  } = options;

  const {
    memberQuery,
    memberRolesQuery,
    rolesQuery,
    organizationQuery,
    removeFromOrgMutation,
    assignRolesMutation,
    removeRolesMutation,
  } = useMemberDetailService({
    userId,
    customMessages,
    removeFromOrgAction,
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

  const [activeTab, setActiveTab] = React.useState<MemberDetailTab>('details');
  const [modalState, setModalState] = React.useState<MemberDetailModalState>({ type: null });
  const [selectedRoles, setSelectedRoles] = React.useState<Role[]>([]);

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

  const handleRemoveFromOrgConfirm = React.useCallback(
    (userId?: string, memberName?: string, orgName?: string) => {
      removeFromOrgMutation.mutate(
        { userId, memberName, orgName },
        {
          onSuccess: () => {
            closeModal();
            onBack?.();
          },
        },
      );
    },
    [removeFromOrgMutation, closeModal, onBack],
  );

  const handleAssignRolesSubmit = React.useCallback(
    (roleIds: string[], memberRoles: Role[]) => {
      assignRolesMutation.mutate(
        { roleIds, memberRoles },
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
  const orgDisplayName = organizationQuery.data?.display_name ?? '';
  const memberRoles: Role[] = memberRolesQuery.data ?? [];
  const availableRoles: Role[] = React.useMemo(() => {
    const assignedIds = new Set(memberRoles.map((r) => r.id));
    return (rolesQuery.data ?? []).filter((r) => !assignedIds.has(r.id));
  }, [rolesQuery.data, memberRoles]);

  const removingRoles = modalState.type === 'removeRoles' ? modalState.roles : [];

  const memberErrorMessage = memberQuery.isError
    ? resolveErrorMessage(memberQuery.error, t('member.detail.error.fetch_failed'))
    : null;

  return {
    activeTab,
    member,
    orgDisplayName,
    memberRoles,
    availableRoles,
    selectedRoles,
    memberError: memberErrorMessage,
    isFetchingMember: memberQuery.isLoading || memberQuery.isFetching,
    isFetchingMemberRoles: memberRolesQuery.isLoading,
    isFetchingAvailableRoles: rolesQuery.isLoading || rolesQuery.isFetching,
    isLoading: memberQuery.isLoading,
    isRemovingFromOrg: removeFromOrgMutation.isPending,
    isAssigningRoles: assignRolesMutation.isPending,
    isRemovingRoles: removeRolesMutation.isPending,
    removingRoleIds: removeRolesMutation.isPending ? removingRoles.map((r) => r.id) : [],
    modalState,

    setActiveTab,
    setSelectedRoles,
    handleBack,
    openModal,
    closeModal,
    handleRemoveFromOrgConfirm,
    handleAssignRolesSubmit,
    handleRemoveRolesCancel,
    handleRemoveRolesConfirm,
  };
}
