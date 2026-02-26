/** @module domain-table */

import {
  type Domain,
  getComponentStyles,
  MY_ORGANIZATION_DOMAIN_SCOPES,
} from '@auth0/universal-components-core';
import { Plus } from 'lucide-react';
import * as React from 'react';

import { DomainConfigureProvidersModal } from '@/components/auth0/my-organization/shared/domain-management/domain-configure/domain-configure-providers-modal';
import { DomainCreateModal } from '@/components/auth0/my-organization/shared/domain-management/domain-create/domain-create-modal';
import { DomainDeleteModal } from '@/components/auth0/my-organization/shared/domain-management/domain-delete/domain-delete-modal';
import { DomainTableActionsColumn } from '@/components/auth0/my-organization/shared/domain-management/domain-table/domain-table-actions-column';
import { DomainVerifyModal } from '@/components/auth0/my-organization/shared/domain-management/domain-verify/domain-verify-modal';
import { DataTable, type Column } from '@/components/auth0/shared/data-table';
import { Header } from '@/components/auth0/shared/header';
import { Badge } from '@/components/ui/badge';
import { withMyOrganizationService } from '@/hoc/with-services';
import { useDomainTable } from '@/hooks/my-organization/use-domain-table';
import { useDomainTableLogic } from '@/hooks/my-organization/use-domain-table-logic';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import { getStatusBadgeVariant } from '@/lib/utils/my-organization/domain-management/domain-management-utils';
import type {
  DomainTableProps,
  DomainTableViewProps,
} from '@/types/my-organization/domain-management/domain-table-types';

/**
 * DomainTableContainer Component.
 * @param props - Component props
 * @returns Domain table container element
 * @internal
 */
function DomainTableContainer(props: DomainTableProps) {
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

  const { t } = useTranslator('domain_management', customMessages);

  const domainTableState = useDomainTable({
    createAction,
    verifyAction,
    deleteAction,
    associateToProviderAction,
    deleteFromProviderAction,
    customMessages,
  });

  const domainTableHandlers = useDomainTableLogic({
    t,
    onCreateDomain: domainTableState.onCreateDomain,
    onVerifyDomain: domainTableState.onVerifyDomain,
    onDeleteDomain: domainTableState.onDeleteDomain,
    onAssociateToProvider: domainTableState.onAssociateToProvider,
    onDeleteFromProvider: domainTableState.onDeleteFromProvider,
    fetchProviders: domainTableState.fetchProviders,
    fetchDomains: domainTableState.fetchDomains,
  });

  const domainTableLogic = {
    ...domainTableState,
    schema,
    styling,
    hideHeader,
    readOnly,
    onOpenProvider,
    onCreateProvider,
  };

  return <DomainTableView logic={domainTableLogic} handlers={domainTableHandlers} />;
}

/**
 * DomainTableView — Presentational component.
 * @param props - View props with logic and handlers
 * @returns Domain table view element
 * @internal
 */
function DomainTableView({
  logic,
  handlers,
}: DomainTableViewProps & { handlers: ReturnType<typeof useDomainTableLogic> }) {
  const { isDarkMode } = useTheme();
  const { t } = useTranslator('domain_management', logic.customMessages);

  const {
    domains,
    providers,
    isCreating,
    isVerifying,
    isFetching,
    isLoadingProviders,
    isDeleting,
    schema,
    styling,
    hideHeader,
    readOnly = false,
    customMessages,
    createAction,
    onOpenProvider,
    onCreateProvider,
  } = logic;

  const {
    showCreateModal,
    showConfigureModal,
    showVerifyModal,
    showDeleteModal,
    verifyError,
    selectedDomain,
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
  } = handlers;

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
        render: (domain) => <div className="font-medium">{domain.domain}</div>,
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
            readOnly={readOnly}
            customMessages={logic.customMessages}
            onView={handleConfigureClick}
            onConfigure={handleConfigureClick}
            onVerify={handleVerifyClick}
            onDelete={handleDeleteClick}
          />
        ),
      },
    ],
    [t, readOnly, customMessages, handleConfigureClick, handleVerifyClick, handleDeleteClick],
  );

  return (
    <div style={currentStyles.variables}>
      {!hideHeader && (
        <div className={currentStyles.classes?.['DomainTable-header']}>
          <Header
            title={t('domain_table.header.title')}
            description={t('domain_table.header.description')}
            actions={[
              {
                type: 'button',
                label: t('domain_table.header.create_button_text'),
                onClick: () => handleCreateClick(),
                icon: Plus,
                disabled: createAction?.disabled || readOnly || isFetching,
              },
            ]}
          />
        </div>
      )}

      <DataTable
        columns={columns}
        data={domains}
        loading={isFetching}
        emptyState={{ title: t('domain_table.table.empty_message') }}
        className={currentStyles.classes?.['DomainTable-table']}
      />

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
        className={currentStyles.classes?.['DomainTable-configureModal']}
        domain={selectedDomain}
        providers={providers}
        isOpen={showConfigureModal}
        isLoading={isLoadingProviders}
        isLoadingSwitch={false}
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
        domain={selectedDomain}
        error={verifyError}
        onClose={handleCloseVerifyModal}
        onVerify={handleVerify}
        onDelete={handleDeleteClick}
        customMessages={customMessages?.verify}
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
    </div>
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
const DomainTable: React.ComponentType<DomainTableProps> = withMyOrganizationService(
  DomainTableContainer,
  MY_ORGANIZATION_DOMAIN_SCOPES,
);

export { DomainTable, DomainTableView };
