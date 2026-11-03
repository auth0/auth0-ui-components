/**
 * Organization table hook.
 * Single public hook that consumes the internal service hook.
 * @module use-organization-table
 */

import {
  getOrganizationDetailsPermissions,
  OrganizationDetailsMappers,
  organizationDetailsQueryKeys,
  userOrganizationQueryKeys,
  type UserOrganization,
} from '@auth0/universal-components-core';
import { useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { showToast } from '@/components/auth0/shared/toast';
import { useOrganizationTableService } from '@/hooks/my-account/shared/services/use-organization-table-service';
import { useOrganizationDeleteMutation } from '@/hooks/my-organization/shared/services/use-organization-delete-mutation';
import { useCheckpointPagination } from '@/hooks/shared/use-checkpoint-pagination';
import { useCoreClient } from '@/hooks/shared/use-core-client';
import { usePermissions } from '@/hooks/shared/use-permissions';
import { useTranslator } from '@/hooks/shared/use-translator';
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
 * @param options.deleteConfirmationOrganizationId - Opens the delete confirmation for this organization
 * @param options.readOnly - Whether the table is read-only
 * @param options.customMessages - Custom translation messages to override defaults
 * @returns Hook state and methods
 */
export function useOrganizationTable({
  currentOrganizationId,
  deleteAction,
  deleteConfirmationOrganizationId,
  readOnly = false,
  customMessages = {},
}: UseOrganizationTableOptions = {}): UseOrganizationTableResult {
  const queryClient = useQueryClient();
  const { coreClient } = useCoreClient();
  const { t: tCommon } = useTranslator('common', customMessages.common);
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

  const { createPermissionResolver, isLoading: isPermissionsLoading } = usePermissions();
  const permissions = useMemo(
    () => createPermissionResolver(getOrganizationDetailsPermissions, { readOnly }),
    [createPermissionResolver, readOnly],
  );

  // The API deletes the organization of the session's token, and the permissions belong to that
  // session too, so only the signed-in organization can be deleted here. Another one is deleted by
  // signing in to it first, when the host supports that.
  const hasSwitch = !!deleteAction?.onSwitchOrganization;
  const getDeleteState = useCallback(
    (organization: UserOrganization): OrganizationTableDeleteState => {
      if (deleteAction?.disabled) return 'disabled';
      if (!currentOrganizationId || organization.id !== currentOrganizationId) {
        return hasSwitch ? 'switch_required' : 'other_organization';
      }
      if (!permissions.canDeleteOrganization) return 'forbidden';
      return 'enabled';
    },
    [currentOrganizationId, permissions.canDeleteOrganization, deleteAction?.disabled, hasSwitch],
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
      const state = getDeleteState(organization);
      if (state === 'enabled') setDeleteTarget(organization);
      if (state === 'switch_required') deleteAction?.onSwitchOrganization?.(organization);
    },
    [getDeleteState, deleteAction],
  );

  // After the host signed the user in to the organization to delete, open its confirmation once.
  // The name comes from the loaded rows, or from the organization's details when it is on another page.
  const pendingId =
    deleteConfirmationOrganizationId && deleteConfirmationOrganizationId === currentOrganizationId
      ? deleteConfirmationOrganizationId
      : undefined;
  const pendingRow = pendingId
    ? service.organizations.find(({ id }) => id === pendingId)
    : undefined;
  const pendingDetailsQuery = useQuery({
    queryKey: organizationDetailsQueryKeys.details(),
    queryFn: async () => {
      const response = await coreClient!.getMyOrganizationApiClient().organizationDetails.get();
      return OrganizationDetailsMappers.fromAPI(response);
    },
    enabled: !!coreClient && !!pendingId && !service.isFetching && !pendingRow,
  });
  const handledPendingIdRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!pendingId || handledPendingIdRef.current === pendingId) return;
    if (service.isFetching || isPermissionsLoading) return;

    const details = pendingDetailsQuery.data;
    const organization =
      pendingRow ??
      (details?.name
        ? { id: pendingId, name: details.name, display_name: details.display_name }
        : undefined);
    if (!organization) {
      if (pendingDetailsQuery.isError) handledPendingIdRef.current = pendingId;
      return;
    }

    handledPendingIdRef.current = pendingId;
    const state = getDeleteState(organization);
    if (state === 'enabled') {
      setDeleteTarget(organization);
    } else if (state === 'forbidden') {
      // The user came here to delete it, so say why the dialog does not open.
      showToast({ type: 'error', message: tCommon('error.forbidden') });
    }
  }, [
    pendingId,
    pendingRow,
    pendingDetailsQuery.data,
    pendingDetailsQuery.isError,
    service.isFetching,
    isPermissionsLoading,
    getDeleteState,
    tCommon,
  ]);

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
