/**
 * Organization table hook.
 * Single public hook that consumes the internal service hook.
 * @module use-organization-table
 */

import {
  getOrganizationDetailsPermissions,
  userOrganizationQueryKeys,
  type UserOrganization,
} from '@auth0/universal-components-core';
import { useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';

import { useOrganizationTableService } from '@/hooks/my-account/shared/services/use-organization-table-service';
import { useOrganizationDeleteMutation } from '@/hooks/my-organization/shared/services/use-organization-delete-mutation';
import { useCheckpointPagination } from '@/hooks/shared/use-checkpoint-pagination';
import { usePermissions } from '@/hooks/shared/use-permissions';
import { DEFAULT_PAGE_SIZE_OPTIONS } from '@/lib/constants/shared/constants';
import type {
  OrganizationTableDeleteState,
  UseOrganizationTableOptions,
  UseOrganizationTableResult,
} from '@/types/my-account/organization-management/organization-table-types';

interface OrganizationsPage {
  organizations: UserOrganization[];
}

interface PagedOrganizations {
  pages: OrganizationsPage[];
}

const isOrganizationsPage = (value: unknown): value is OrganizationsPage =>
  !!value && Array.isArray((value as Partial<OrganizationsPage>).organizations);

const isPagedOrganizations = (value: unknown): value is PagedOrganizations => {
  const pages = (value as Partial<PagedOrganizations> | undefined)?.pages;
  return Array.isArray(pages) && pages.every(isOrganizationsPage);
};

/**
 * Removes a deleted organization from every cached list of the user's organizations
 * (table pages and the switcher's pages), so it disappears without a refetch.
 * @param queryClient - Query client holding the lists
 * @param organizationId - ID of the deleted organization
 */
function removeOrganizationFromLists(queryClient: QueryClient, organizationId: string) {
  const withoutOrganization = (page: OrganizationsPage) => ({
    ...page,
    organizations: page.organizations.filter(({ id }) => id !== organizationId),
  });

  queryClient.setQueriesData({ queryKey: userOrganizationQueryKeys.all }, (data: unknown) => {
    if (isOrganizationsPage(data)) return withoutOrganization(data);
    if (isPagedOrganizations(data)) return { ...data, pages: data.pages.map(withoutOrganization) };
    return data;
  });
}

/**
 * Hook for listing the organizations the authenticated user belongs to.
 * Manages checkpoint pagination, delegates fetching to the internal service hook, and deletes
 * the signed-in organization when asked.
 * @param options - Hook options.
 * @param options.currentOrganizationId - ID of the organization the user is signed in to
 * @param options.deleteAction - Lifecycle hooks for deleting the signed-in organization
 * @param options.readOnly - Whether the table is read-only
 * @param options.customMessages - Custom translation messages to override defaults
 * @returns Hook state and methods
 */
export function useOrganizationTable({
  currentOrganizationId,
  deleteAction,
  readOnly = false,
  customMessages = {},
}: UseOrganizationTableOptions = {}): UseOrganizationTableResult {
  const queryClient = useQueryClient();
  const {
    pageSize,
    fromToken,
    currentPage,
    hasPreviousPage,
    goToNextPage,
    goToPreviousPage,
    changePageSize,
  } = useCheckpointPagination({
    defaultPageSize: DEFAULT_PAGE_SIZE_OPTIONS[0],
  });

  const { nextToken, ...service } = useOrganizationTableService({
    paginationParams: { pageSize, fromToken },
  });

  // While a page loads, the service still shows the previous page and its next token. Another
  // Next click would then record the same cursor twice and push the page count out of step.
  const canGoNext = !!nextToken && !service.isFetching;

  const handleNextPage = useCallback(() => {
    if (nextToken && canGoNext) {
      goToNextPage(nextToken);
    }
  }, [nextToken, canGoNext, goToNextPage]);

  const { createPermissionResolver } = usePermissions();
  const permissions = useMemo(
    () => createPermissionResolver(getOrganizationDetailsPermissions, { readOnly }),
    [createPermissionResolver, readOnly],
  );

  // The API deletes the organization of the session's token, and the permissions belong to that
  // session too, so only the signed-in organization can be deleted here.
  const getDeleteState = useCallback(
    (organization: UserOrganization): OrganizationTableDeleteState => {
      if (!currentOrganizationId || organization.id !== currentOrganizationId) {
        return 'other_organization';
      }
      if (!permissions.canDeleteOrganization) return 'forbidden';
      if (deleteAction?.disabled) return 'disabled';
      return 'enabled';
    },
    [currentOrganizationId, permissions.canDeleteOrganization, deleteAction?.disabled],
  );

  const [deleteTarget, setDeleteTarget] = useState<UserOrganization | null>(null);

  const { deleteOrganization, isDeleteLoading } = useOrganizationDeleteMutation({
    item: deleteTarget,
    organizationName: deleteTarget?.name ?? '',
    deleteAction,
    customMessages: customMessages.delete,
    onDeleted: () => {
      if (deleteTarget) removeOrganizationFromLists(queryClient, deleteTarget.id);
    },
    componentName: 'OrganizationTable',
  });

  const openDelete = useCallback(
    (organization: UserOrganization) => {
      if (getDeleteState(organization) === 'enabled') setDeleteTarget(organization);
    },
    [getDeleteState],
  );

  const closeDelete = useCallback(() => setDeleteTarget(null), []);

  const confirmDelete = useCallback(async () => {
    if (!deleteTarget || getDeleteState(deleteTarget) !== 'enabled') return false;
    return deleteOrganization();
  }, [deleteTarget, getDeleteState, deleteOrganization]);

  return {
    ...service,
    pagination: {
      pageSize,
      currentPage,
      hasNextPage: canGoNext,
      hasPreviousPage,
    },
    handleNextPage,
    handlePreviousPage: goToPreviousPage,
    handlePageSizeChange: changePageSize,
    organizationDelete: {
      target: deleteTarget,
      getState: getDeleteState,
      open: openDelete,
      close: closeDelete,
      confirm: confirmDelete,
      isLoading: isDeleteLoading,
    },
  };
}
