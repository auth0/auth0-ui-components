/** @module domain-table */

import { type Domain, getComponentStyles } from '@auth0/universal-components-core';
import { Plus } from 'lucide-react';
import * as React from 'react';

import { DomainConfigureProvidersModal } from '@/components/auth0/my-organization/shared/domain-management/domain-configure/domain-configure-providers-modal';
import { DomainCreateModal } from '@/components/auth0/my-organization/shared/domain-management/domain-create/domain-create-modal';
import { DomainDeleteModal } from '@/components/auth0/my-organization/shared/domain-management/domain-delete/domain-delete-modal';
import { DomainTableActionsColumn } from '@/components/auth0/my-organization/shared/domain-management/domain-table/domain-table-actions-column';
import { DomainVerifyModal } from '@/components/auth0/my-organization/shared/domain-management/domain-verify/domain-verify-modal';
import { DataPagination } from '@/components/auth0/shared/data-pagination';
import { DataTable, type Column } from '@/components/auth0/shared/data-table';
import { GateKeeper } from '@/components/auth0/shared/gate-keeper/gate-keeper';
import { Header } from '@/components/auth0/shared/header';
import { RefreshIndicator } from '@/components/auth0/shared/refresh-indicator';
import { StyledScope } from '@/components/auth0/shared/styled-scope';
import { Badge } from '@/components/ui/badge';
import { useDomainTable } from '@/hooks/my-organization/use-domain-table';
import { useTelemetry } from '@/hooks/shared/use-telemetry';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import { DEFAULT_PAGE_SIZE_OPTIONS } from '@/lib/constants/shared/constants';
import { cn } from '@/lib/utils';
import { getStatusBadgeVariant } from '@/lib/utils/my-organization/domain-management/domain-management-utils';
import type {
  DomainTableProps,
  DomainTableViewProps,
} from '@/types/my-organization/domain-management/domain-table-types';

/**
 * DomainTable container component.
 * @param props - Component props
 * @returns Domain table container element
 * @internal
 */
function DomainTable(props: DomainTableProps) {
  useTelemetry('domain-management');

  const {
    schema,
    hideHeader = false,
    readOnly = false,
    createAction,
    verifyAction,
    deleteAction,
    associateToProviderAction,
    deleteFromProviderAction,
    customMessages = {},
    styling = { variables: { common: {}, light: {}, dark: {} }, classes: {} },
    onOpenProvider,
    onCreateProvider,
  } = props;

  const domainTable = useDomainTable({
    readOnly,
    createAction,
    verifyAction,
    deleteAction,
    associateToProviderAction,
    deleteFromProviderAction,
    customMessages,
  });

  return (
    <GateKeeper isLoading={domainTable.isFetching} styling={styling}>
      <DomainTableView
        domainTable={domainTable}
        schema={schema}
        styling={styling}
        hideHeader={hideHeader}
        readOnly={readOnly}
        customMessages={customMessages}
        createAction={createAction}
        onOpenProvider={onOpenProvider}
        onCreateProvider={onCreateProvider}
      />
    </GateKeeper>
  );
}

/**
 * DomainTableView — Presentational component.
 * @param props - View props
 * @returns Domain table view element
 * @internal
 */
function DomainTableView({
  domainTable,
  schema,
  styling,
  readOnly,
  hideHeader,
  customMessages,
  createAction,
  onOpenProvider,
  onCreateProvider,
}: DomainTableViewProps) {
  const { isDarkMode } = useTheme();
  const { t } = useTranslator('domain_management', customMessages);
  const { t: tCommon } = useTranslator('common', customMessages?.common);

  const {
    permissions,
    domains,
    providers,
    isCreating,
    isVerifying,
    isFetching,
    isRefetchingDomains,
    isDomainsStale,
    domainsUpdatedAt,
    isLoadingProviders,
    isDeleting,
    pagination,
    showCreateModal,
    showConfigureModal,
    showVerifyModal,
    showDeleteModal,
    verifyError,
    selectedDomain,
    refetchDomains,
    setShowCreateModal,
    setShowConfigureModal,
    setShowDeleteModal,
    handleCreate,
    handleVerify,
    handleDelete,
    handleToggleSwitch,
    handleCloseVerifyModal,
    handleCreateClick,
    handleConfigureClick,
    handleVerifyClick,
    handleDeleteClick,
    handleNextPage,
    handlePreviousPage,
    handlePageSizeChange,
  } = domainTable;

  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const columns: Column<Domain>[] = React.useMemo(
    () => [
      {
        type: 'text',
        accessorKey: 'domain',
        title: t('domain_table.table.columns.domain'),
        width: '35%',
        render: (domain) => (
          <div className="font-medium text-primary truncate">{domain.domain}</div>
        ),
      },
      {
        type: 'text',
        accessorKey: 'status',
        title: t('domain_table.table.columns.status'),
        width: '25%',
        render: (domain) => (
          <Badge variant={getStatusBadgeVariant(domain.status)} size={'sm'}>
            {t(`shared.domain_statuses.${domain.status}`)}
          </Badge>
        ),
      },
      {
        type: 'actions',
        title: '',
        width: '20%',
        render: (domain) => (
          <DomainTableActionsColumn
            domain={domain}
            permissions={permissions}
            customMessages={customMessages}
            onConfigure={handleConfigureClick}
            onVerify={handleVerifyClick}
            onDelete={handleDeleteClick}
          />
        ),
      },
    ],
    [t, permissions, customMessages, handleConfigureClick, handleVerifyClick, handleDeleteClick],
  );

  return (
    <StyledScope style={currentStyles.variables}>
      {!hideHeader && (
        <div className={currentStyles.classes?.['DomainTable-header']}>
          <Header
            title={t('domain_table.header.title')}
            description={t('domain_table.header.description')}
            actions={
              readOnly
                ? []
                : [
                    {
                      type: 'button',
                      label: t('domain_table.header.create_button_text'),
                      onClick: () => handleCreateClick(),
                      icon: Plus,
                      disabled:
                        createAction?.disabled || !permissions.canCreateDomain || isFetching,
                      ...(permissions.canCreateDomain
                        ? {}
                        : { tooltip: { content: tCommon('error.forbidden') } }),
                    },
                  ]
            }
          />
        </div>
      )}

      <div
        className={cn('flex justify-end mb-8', currentStyles.classes?.['DomainTable-tableActions'])}
      >
        <RefreshIndicator
          isStale={isDomainsStale}
          isFetching={isRefetchingDomains}
          lastUpdatedAt={domainsUpdatedAt || undefined}
          onRefresh={refetchDomains}
        />
      </div>

      <DataTable
        columns={columns}
        data={domains}
        loading={isFetching}
        emptyState={{ title: t('domain_table.table.empty_message') }}
        className={currentStyles.classes?.['DomainTable-table']}
        onRowClick={handleConfigureClick}
        rowClickLabel={(index) => tCommon('data_table.view_row', { index: index + 1 })}
      />

      {domains.length > 0 && (
        <div className="mt-4">
          <DataPagination
            type="checkpoint"
            paginationState={{
              pageSize: pagination.pageSize,
              currentPage: pagination.currentPage,
              hasNextPage: pagination.hasNextPage,
              hasPreviousPage: pagination.hasPreviousPage,
            }}
            pageSizeOptions={DEFAULT_PAGE_SIZE_OPTIONS}
            showPageSizeSelector
            onNextPage={handleNextPage}
            onPreviousPage={handlePreviousPage}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      )}

      <DomainCreateModal
        className={currentStyles.classes?.['DomainTable-createModal']}
        isOpen={showCreateModal}
        isLoading={isCreating}
        schema={schema?.create}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreate}
        customMessages={customMessages?.create}
      />

      <DomainConfigureProvidersModal
        styling={currentStyles}
        domain={selectedDomain}
        providers={providers}
        isOpen={showConfigureModal}
        isLoading={isLoadingProviders}
        isLoadingSwitch={false}
        permissions={permissions}
        onClose={() => setShowConfigureModal(false)}
        onToggleSwitch={handleToggleSwitch}
        onOpenProvider={onOpenProvider}
        onCreateProvider={onCreateProvider}
        customMessages={customMessages?.configure}
      />

      <DomainVerifyModal
        className={currentStyles.classes?.['DomainTable-verifyModal']}
        isOpen={showVerifyModal}
        isLoading={isVerifying}
        permissions={permissions}
        domain={selectedDomain}
        error={verifyError}
        onClose={handleCloseVerifyModal}
        onVerify={handleVerify}
        onDelete={handleDeleteClick}
        customMessages={customMessages?.verify}
        classes={currentStyles.classes}
      />

      <DomainDeleteModal
        className={currentStyles.classes?.['DomainTable-deleteModal']}
        domain={selectedDomain}
        isOpen={showDeleteModal}
        isLoading={isDeleting}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleDelete}
        customMessages={customMessages?.delete}
      />
    </StyledScope>
  );
}

/**
 * Domain management table.
 *
 * Displays organization domains with CRUD operations. Supports creating,
 * verifying, deleting domains, and associating them with identity providers.
 *
 * @param props - {@link DomainTableProps}
 * @param props.schema - Validation schema overrides
 * @param props.customMessages - Custom i18n message overrides
 * @param props.styling - CSS variables and class overrides
 * @param props.readOnly - Render in read-only mode
 * @param props.hideHeader - Hide the header section
 * @param props.createAction - Lifecycle hooks for create operation
 * @param props.verifyAction - Lifecycle hooks for verify operation
 * @param props.deleteAction - Lifecycle hooks for delete operation
 * @param props.associateToProviderAction - Lifecycle hooks for provider association
 * @param props.deleteFromProviderAction - Lifecycle hooks for provider removal
 * @param props.onOpenProvider - Callback when opening a provider
 * @param props.onCreateProvider - Callback when creating a provider
 * @returns Domain table component
 *
 * @see {@link DomainTableProps} for full props documentation
 *
 * @example
 * ```tsx
 * <DomainTable
 *   createAction={{ onAfter: (domain) => console.log('Created:', domain) }}
 *   verifyAction={{ onAfter: (domain) => console.log('Verified:', domain) }}
 *   deleteAction={{ onAfter: (domain) => console.log('Deleted:', domain) }}
 * />
 * ```
 */
export { DomainTable, DomainTableView };
