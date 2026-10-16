/**
 * Internal connection group detail service hook.
 * Handles data fetching and role mutations for a single connection group.
 * @module use-connection-group-detail-service
 * @internal
 */

import type { Role } from '@auth0/universal-components-core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as React from 'react';

import { connectionGroupQueryKeys } from '@/hooks/my-organization/shared/services/use-connection-group-table-service';
import { useCoreClient } from '@/hooks/shared/use-core-client';
import { DEFAULT_ROLES_PAGE_SIZE } from '@/lib/constants/my-organization/member-management/member-management-constants';
import { getPreviousDataOption } from '@/lib/utils/tanstack-compat';
import type {
  ConnectionGroupDetailRole,
  ConnectionGroupDetailServiceResult,
  ConnectionGroupRolesMutationVariables,
  UseConnectionGroupDetailServiceOptions,
} from '@/types/my-organization/connection-group-management/organization-connection-group-detail-types';

const keepPreviousDataOption = getPreviousDataOption();

/**
 * Internal service hook for connection group detail data.
 *
 * The `@auth0/myorganization-js` client does not yet expose a `groups`
 * namespace, so the group roles and role mutations are stubs. Available
 * roles use the real `organization.roles.list` call.
 * Role queries are gated by permission: group roles load only with `canViewRoles`;
 * available roles load only with `canAssignRoles` and once the search is enabled
 * (deferred until the assign modal opens, like the member detail service).
 * @param groupId - Id of the group whose roles are managed.
 * @param options - Permission flags gating the role queries.
 * @returns Queries and mutations for the group detail.
 * @internal
 */
export function useConnectionGroupDetailService(
  groupId: string,
  options: UseConnectionGroupDetailServiceOptions,
): ConnectionGroupDetailServiceResult {
  const { canViewRoles, canAssignRoles } = options;
  const { coreClient } = useCoreClient();
  const queryClient = useQueryClient();

  const rolesQuery = useQuery({
    queryKey: connectionGroupQueryKeys.roles(groupId),
    queryFn: async (): Promise<ConnectionGroupDetailRole[]> => {
      // TODO(SDK): replace once available:
      //   GET /my-org/groups/{group_id}/roles
      // TODO(API): each role is assumed to carry `removable: boolean` (backend may
      // express it as `allowed_binding_actions`).
      return [];
    },
    enabled: !!coreClient && !!groupId && canViewRoles,
  });

  const [roleSearchTerm, setRoleSearchTerm] = React.useState('');
  const [roleSearchActive, setRoleSearchActive] = React.useState(false);
  const enableRoleSearch = React.useCallback(() => setRoleSearchActive(true), []);

  const availableRolesQuery = useQuery({
    queryKey: [...connectionGroupQueryKeys.all, 'available-roles', roleSearchTerm] as const,
    queryFn: async (): Promise<Role[]> => {
      const response = await coreClient!.getMyOrganizationApiClient().organization.roles.list({
        take: DEFAULT_ROLES_PAGE_SIZE,
        ...(roleSearchTerm ? { name: roleSearchTerm } : {}),
      });
      return response.data;
    },
    enabled: !!coreClient && canAssignRoles && roleSearchActive,
    ...keepPreviousDataOption,
  });

  const invalidateGroupData = () => {
    queryClient.invalidateQueries({ queryKey: connectionGroupQueryKeys.roles(groupId) });
    queryClient.invalidateQueries({ queryKey: connectionGroupQueryKeys.list() });
  };

  const assignRolesMutation = useMutation<void, Error, ConnectionGroupRolesMutationVariables>({
    mutationFn: async () => {
      // TODO(SDK): POST /my-org/groups/{group_id}/roles with { role_ids }
    },
    onSuccess: invalidateGroupData,
  });

  const removeRolesMutation = useMutation<void, Error, ConnectionGroupRolesMutationVariables>({
    mutationFn: async () => {
      // TODO(SDK): DELETE /my-org/groups/{group_id}/roles with { role_ids }
    },
    onSuccess: invalidateGroupData,
  });

  return {
    rolesQuery,
    availableRolesQuery,
    setRoleSearchTerm,
    enableRoleSearch,
    assignRolesMutation,
    removeRolesMutation,
  };
}
