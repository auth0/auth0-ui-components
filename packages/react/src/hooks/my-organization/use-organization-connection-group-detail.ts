/**
 * Connection group detail hook.
 * Single public hook combining data access, permissions and UI logic.
 * @module use-organization-connection-group-detail
 */

import type { OrganizationConnectionGroupDetailMessages } from '@auth0/universal-components-core';
import * as React from 'react';

import { showToast } from '@/components/auth0/shared/toast';
import { useConnectionGroupDetailService } from '@/hooks/my-organization/shared/services/use-connection-group-detail-service';
import { useErrorHandler } from '@/hooks/shared/use-error-handler';
import { usePermissions } from '@/hooks/shared/use-permissions';
import { useTranslator } from '@/hooks/shared/use-translator';
import { getConnectionGroupDetailPermissions } from '@/lib/utils/my-organization/connection-group-management/connection-group-permissions';
import { isMutationLoading } from '@/lib/utils/tanstack-compat';
import type {
  ConnectionGroupDetailModalState,
  ConnectionGroupDetailRole,
  UseOrganizationConnectionGroupDetailOptions,
  UseOrganizationConnectionGroupDetailResult,
} from '@/types/my-organization/connection-group-management/organization-connection-group-detail-types';

const EMPTY_MESSAGES: Partial<OrganizationConnectionGroupDetailMessages> = {};

/**
 * Hook for the organization connection group detail page.
 * @param options - Hook configuration options.
 * @returns State and handler functions.
 */
export function useOrganizationConnectionGroupDetail(
  options: UseOrganizationConnectionGroupDetailOptions,
): UseOrganizationConnectionGroupDetailResult {
  const {
    groupId,
    onBack,
    readOnly = false,
    customMessages = EMPTY_MESSAGES,
    assignRolesAction,
    removeRolesAction,
  } = options;

  const { createPermissionResolver } = usePermissions();
  const permissions = React.useMemo(
    () => createPermissionResolver(getConnectionGroupDetailPermissions, { readOnly }),
    [createPermissionResolver, readOnly],
  );

  const {
    rolesQuery,
    availableRolesQuery,
    setRoleSearchTerm,
    enableRoleSearch,
    assignRolesMutation,
    removeRolesMutation,
  } = useConnectionGroupDetailService(groupId, {
    canViewRoles: permissions.canViewRoles,
    canAssignRoles: permissions.canAssignRoles,
  });

  const { t } = useTranslator('connection_group_management.detail', customMessages);
  const handleError = useErrorHandler();

  const [modalState, setModalState] = React.useState<ConnectionGroupDetailModalState>(null);
  const [selectedRoles, setSelectedRoles] = React.useState<ConnectionGroupDetailRole[]>([]);

  const hasShownRolesError = React.useRef(false);
  React.useEffect(() => {
    if (rolesQuery.isError && !hasShownRolesError.current) {
      handleError(rolesQuery.error, { fallbackMessage: t('notifications.fetch_roles_error') });
      hasShownRolesError.current = true;
    }
    if (!rolesQuery.isError) hasShownRolesError.current = false;
  }, [rolesQuery.isError, rolesQuery.error, handleError, t]);

  React.useEffect(() => {
    if (modalState?.type === 'assignRoles') {
      enableRoleSearch();
    }
  }, [modalState?.type, enableRoleSearch]);

  const handleBack = React.useCallback(() => {
    onBack();
  }, [onBack]);

  const openModal = React.useCallback(
    (state: Exclude<ConnectionGroupDetailModalState, null>) => {
      if (state.type === 'assignRoles' && !permissions.canAssignRoles) return;
      if (state.type === 'removeRoles' && !permissions.canRemoveRoles) return;
      setModalState(state);
    },
    [permissions],
  );

  const closeModal = React.useCallback(() => {
    setModalState(null);
  }, []);

  const handleAssignRolesSubmit = React.useCallback(
    async (roleIds: string[]) => {
      if (!permissions.canAssignRoles || isMutationLoading(assignRolesMutation)) return;
      const payload = { groupId, roleIds };
      if (assignRolesAction?.onBefore && !assignRolesAction.onBefore(payload)) return;
      try {
        await assignRolesMutation.mutateAsync({ roleIds });
      } catch (error) {
        handleError(error, { fallbackMessage: t('notifications.assign_error') });
        return;
      }
      assignRolesAction?.onAfter?.(payload);
      showToast({ type: 'success', message: t('notifications.assign_success') });
      closeModal();
    },
    [permissions, groupId, assignRolesAction, assignRolesMutation, handleError, t, closeModal],
  );

  const handleRemoveRolesConfirm = React.useCallback(async () => {
    if (modalState?.type !== 'removeRoles' || !permissions.canRemoveRoles) return;
    if (isMutationLoading(removeRolesMutation)) return;
    // Managed (non-removable) roles must never reach the API.
    const removableRoles = modalState.roles.filter((role) => role.removable);
    if (removableRoles.length === 0) return;
    const payload = { groupId, roleIds: removableRoles.map((role) => role.id) };
    if (removeRolesAction?.onBefore && !removeRolesAction.onBefore(payload)) return;
    try {
      await removeRolesMutation.mutateAsync({ roleIds: payload.roleIds });
    } catch (error) {
      handleError(error, { fallbackMessage: t('notifications.remove_error') });
      return;
    }
    removeRolesAction?.onAfter?.(payload);
    showToast({ type: 'success', message: t('notifications.remove_success') });
    setSelectedRoles((current) => current.filter((role) => !payload.roleIds.includes(role.id)));
    closeModal();
  }, [
    modalState,
    permissions,
    groupId,
    removeRolesAction,
    removeRolesMutation,
    handleError,
    t,
    closeModal,
  ]);

  const availableRoles = React.useMemo<ConnectionGroupDetailRole[]>(
    () =>
      (availableRolesQuery.data ?? []).map((role) => ({
        ...role,
        permissions: [],
        removable: true,
      })),
    [availableRolesQuery.data],
  );

  return {
    permissions,
    roles: rolesQuery.data ?? [],
    availableRoles,
    selectedRoles,
    modalState,
    readOnly,
    isFetchingRoles: rolesQuery.isLoading,
    isSearchingRoles: availableRolesQuery.isFetching,
    isAssigningRoles: isMutationLoading(assignRolesMutation),
    isRemovingRoles: isMutationLoading(removeRolesMutation),
    setSelectedRoles,
    onRoleSearch: setRoleSearchTerm,
    handleBack,
    openModal,
    closeModal,
    handleAssignRolesSubmit,
    handleRemoveRolesConfirm,
  };
}
