/** @module organization-table */

import { getComponentStyles, type UserOrganization } from '@auth0/universal-components-core';
import { Plus, RefreshCcw } from 'lucide-react';
import * as React from 'react';

import { OrganizationTableActionsColumn } from '@/components/auth0/my-account/shared/organization-management/organization-table/organization-table-actions-column';
import { CopyableText } from '@/components/auth0/shared/copyable-text';
import { DataPagination } from '@/components/auth0/shared/data-pagination';
import { DataTable, type Column } from '@/components/auth0/shared/data-table';
import { GateKeeper } from '@/components/auth0/shared/gate-keeper/gate-keeper';
import { Header } from '@/components/auth0/shared/header';
import { RefreshIndicator } from '@/components/auth0/shared/refresh-indicator';
import { StyledScope } from '@/components/auth0/shared/styled-scope';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { useOrganizationTable } from '@/hooks/my-account/use-organization-table';
import { useTelemetry } from '@/hooks/shared/use-telemetry';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import { DEFAULT_PAGE_SIZE_OPTIONS } from '@/lib/constants/shared/constants';
import { cn } from '@/lib/utils';
import type {
  OrganizationTableProps,
  OrganizationTableViewProps,
} from '@/types/my-account/organization-management/organization-table-types';

/**
 * OrganizationTable container component.
 * @param props - Component props
 * @returns Organization table container element
 * @internal
 */
function OrganizationTable(props: OrganizationTableProps) {
  useTelemetry('organization-table');

  const {
    hideHeader = false,
    readOnly = false,
    customMessages = {},
    styling = { variables: { common: {}, light: {}, dark: {} }, classes: {} },
    onEditOrganization,
    onDeleteOrganization,
    onCreateOrganization,
  } = props;

  const organizationTable = useOrganizationTable();

  return (
    <GateKeeper isLoading={organizationTable.isFetching} styling={styling}>
      <OrganizationTableView
        organizationTable={organizationTable}
        styling={styling}
        hideHeader={hideHeader}
        readOnly={readOnly}
        customMessages={customMessages}
        onEditOrganization={onEditOrganization}
        onDeleteOrganization={onDeleteOrganization}
        onCreateOrganization={onCreateOrganization}
      />
    </GateKeeper>
  );
}

/**
 * OrganizationTableView — Presentational component.
 * @param props - View props
 * @returns Organization table view element
 * @internal
 */
function OrganizationTableView({
  organizationTable,
  styling,
  hideHeader,
  readOnly,
  customMessages,
  onEditOrganization,
  onDeleteOrganization,
  onCreateOrganization,
}: OrganizationTableViewProps) {
  const { isDarkMode } = useTheme();
  const { t } = useTranslator('organization_management.organization_table', customMessages);
  const { t: tCommon } = useTranslator('common', customMessages?.common);

  const {
    organizations,
    isFetching,
    isRefetching,
    isStale,
    isError,
    updatedAt,
    refetch,
    pagination,
    handleNextPage,
    handlePreviousPage,
    handlePageSizeChange,
  } = organizationTable;

  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const hasRowActions = !readOnly && (!!onEditOrganization || !!onDeleteOrganization);
  // A failed refresh keeps the rows already loaded; only a load with nothing to show is an error.
  const showError = isError && organizations.length === 0;

  const columns: Column<UserOrganization>[] = React.useMemo(
    () => [
      {
        // `custom` always renders, so organizations without a display name fall back to the name.
        type: 'custom',
        accessorKey: 'display_name',
        title: t('table.columns.display_name'),
        width: '30%',
        render: (organization) => (
          <div className="font-medium text-primary truncate">
            {organization.display_name || organization.name}
          </div>
        ),
      },
      {
        type: 'custom',
        accessorKey: 'name',
        title: t('table.columns.name'),
        width: '30%',
        render: (organization) => <CopyableText asCode value={organization.name} />,
      },
      {
        type: 'custom',
        accessorKey: 'id',
        title: t('table.columns.id'),
        width: '30%',
        render: (organization) => <CopyableText asCode value={organization.id} />,
      },
      ...(hasRowActions
        ? [
            {
              type: 'actions' as const,
              title: '',
              width: '10%',
              render: (organization: UserOrganization) => (
                <OrganizationTableActionsColumn
                  organization={organization}
                  customMessages={customMessages}
                  onEdit={onEditOrganization}
                  onDelete={onDeleteOrganization}
                />
              ),
            },
          ]
        : []),
    ],
    [t, customMessages, hasRowActions, onEditOrganization, onDeleteOrganization],
  );

  return (
    <StyledScope style={currentStyles.variables}>
      {!hideHeader && (
        <div className={currentStyles.classes?.['OrganizationTable-header']}>
          <Header
            title={t('header.title')}
            description={t('header.description')}
            actions={
              onCreateOrganization && !readOnly
                ? [
                    {
                      type: 'button',
                      label: t('header.create_button_text'),
                      onClick: () => onCreateOrganization(),
                      icon: Plus,
                    },
                  ]
                : []
            }
          />
        </div>
      )}

      <div
        className={cn(
          'flex justify-end mb-8',
          currentStyles.classes?.['OrganizationTable-tableActions'],
        )}
      >
        <RefreshIndicator
          isStale={isStale}
          isFetching={isRefetching}
          lastUpdatedAt={updatedAt || undefined}
          customMessages={customMessages}
          onRefresh={refetch}
        />
      </div>

      {showError ? (
        // Per design, a failed load replaces the whole table (no column headers or pagination).
        <Card className={cn('text-center', currentStyles.classes?.['OrganizationTable-table'])}>
          <CardContent className="flex flex-col items-center gap-2">
            <CardTitle>{t('table.error_message')}</CardTitle>
            <CardDescription>{t('table.error_description')}</CardDescription>
            <Button variant="outline" size="default" className="mt-2" onClick={() => refetch()}>
              <RefreshCcw className="size-4" />
              {t('table.retry_button_text')}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <DataTable
          columns={columns}
          data={organizations}
          loading={isFetching}
          emptyState={{ title: t('table.empty_message') }}
          className={currentStyles.classes?.['OrganizationTable-table']}
          onRowClick={readOnly ? undefined : onEditOrganization}
          rowClickLabel={(index) => tCommon('data_table.view_row', { index: index + 1 })}
        />
      )}

      {!showError && organizations.length > 0 && (
        <div className="mt-4">
          <DataPagination
            type="checkpoint"
            paginationState={pagination}
            pageSizeOptions={DEFAULT_PAGE_SIZE_OPTIONS}
            showPageSizeSelector
            onNextPage={handleNextPage}
            onPreviousPage={handlePreviousPage}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      )}
    </StyledScope>
  );
}

/**
 * Organization list for the authenticated user.
 *
 * Lists every organization the user belongs to (My Account API) with copyable
 * name and identifier, checkpoint pagination, and empty, error, and stale states.
 * Requires the `read:me:organizations` scope on the My Account API token.
 *
 * @param props - {@link OrganizationTableProps}
 * @param props.customMessages - Custom i18n message overrides
 * @param props.styling - CSS variables and class overrides
 * @param props.hideHeader - Hide the title and description
 * @param props.readOnly - Hide the create button and row actions
 * @param props.onEditOrganization - Shows an "Edit" row action; also handles row clicks
 * @param props.onDeleteOrganization - Shows a "Delete" row action
 * @param props.onCreateOrganization - Shows a "Create Organization" header button
 * @returns Organization table component
 *
 * @see {@link OrganizationTableProps} for full props documentation
 *
 * @example
 * ```tsx
 * <OrganizationTable
 *   onEditOrganization={(org) =>
 *     loginWithRedirect({
 *       authorizationParams: { organization: org.id },
 *       appState: { returnTo: '/organization-management' },
 *     })
 *   }
 *   onCreateOrganization={() => navigate('/organizations/new')}
 * />
 * ```
 */
export { OrganizationTable, OrganizationTableView };
