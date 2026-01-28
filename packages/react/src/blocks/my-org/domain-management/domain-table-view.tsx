import { getComponentStyles, type Domain } from '@auth0/universal-components-core';
import { useTheme, useTranslator } from '@react/hooks';
import type { DomainTableViewProps } from '@react/types';
import { Plus } from 'lucide-react';
import * as React from 'react';

import { DomainConfigureProvidersModal } from '../../../components/my-org/domain-management/domain-configure/domain-configure-providers-modal';
import { DomainCreateModal } from '../../../components/my-org/domain-management/domain-create/domain-create-modal';
import { DomainDeleteModal } from '../../../components/my-org/domain-management/domain-delete/domain-delete-modal';
import { DomainTableActionsColumn } from '../../../components/my-org/domain-management/domain-table/domain-table-actions-column';
import { DomainVerifyModal } from '../../../components/my-org/domain-management/domain-verify/domain-verify-modal';
import { Badge } from '../../../components/ui/badge';
import { DataTable, type Column } from '../../../components/ui/data-table';
import { Header } from '../../../components/ui/header';
import { getStatusBadgeVariant } from '../../../lib/my-org/domain-management';

/**
 * DomainTableView component.
 *
 * Renders domain table component but requires external state management via the `logic` prop.
 * Use this when you need custom Domain Table or want to integrate with your own state.
 * @example
 * ```tsx
 * const customLogic = {
 *   state: { showCreateModal: false, setShowCreateModal: (show: boolean) => void },
 *   actions: { handleCreate: (type) => {...}, handleDelete: (id) => {...} },
 *   domainTableActions: { createAction: async () => {...} }
 * };
 *
 * <DomainTableView logic={customLogic} />
 * ```
 */
export function DomainTableView({
  customMessages = {},
  schema,
  hideHeader = false,
  readOnly = false,
  createAction,
  onOpenProvider,
  onCreateProvider,
  styling = {
    variables: { common: {}, light: {}, dark: {} },
    classes: {},
  },
  logic,
}: DomainTableViewProps) {
  const { isDarkMode } = useTheme();
  const { t } = useTranslator('domain_management', customMessages);

  const { state, actions, domainTableActions } = logic;
  const {
    // State variables and methods
    showCreateModal,
    showConfigureModal,
    showVerifyModal,
    showDeleteModal,
    verifyError,
    selectedDomain,
    setShowCreateModal,
    setShowConfigureModal,
    setShowDeleteModal,
  } = state;

  const {
    // Handlers
    handleCreate,
    handleVerify,
    handleDelete,
    handleToggleSwitch,
    handleCloseVerifyModal,
    handleCreateClick,
    handleConfigureClick,
    handleVerifyClick,
    handleDeleteClick,
  } = actions;

  const {
    domains,
    providers,
    isCreating,
    isVerifying,
    isFetching,
    isLoadingProviders,
    isDeleting,
  } = domainTableActions;

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
            customMessages={customMessages}
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
        customMessages={customMessages.create}
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
        customMessages={customMessages.configure}
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
        customMessages={customMessages.verify}
      />

      <DomainDeleteModal
        className={currentStyles.classes?.['DomainTable-deleteModal']}
        domain={selectedDomain}
        isOpen={showDeleteModal}
        isLoading={isDeleting}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleDelete}
        customMessages={customMessages.delete}
      />
    </div>
  );
}
