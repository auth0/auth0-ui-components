import {
  type Domain,
  getComponentStyles,
  MY_ORG_DOMAIN_SCOPES,
} from '@auth0/web-ui-components-core';
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
import { withMyOrgService } from '../../../hoc/with-services';
import { useDomainTable } from '../../../hooks/my-org/domain-management/use-domain-table';
import { useDomainTableLogic } from '../../../hooks/my-org/domain-management/use-domain-table-logic';
import { useTheme } from '../../../hooks/use-theme';
import { useTranslator } from '../../../hooks/use-translator';
import { getStatusBadgeVariant } from '../../../lib/my-org/domain-management';
import type { DomainTableProps } from '../../../types/my-org/domain-management/domain-table-types';

/**
 * DomainTable Component
 */
function DomainTableComponent({
  customMessages = {},
  schema,
  styling = {
    variables: { common: {}, light: {}, dark: {} },
    classes: {},
  },
  hideHeader = false,
  readOnly = false,
  createAction,
  verifyAction,
  deleteAction,
  associateToProviderAction,
  deleteFromProviderAction,
  onOpenProvider,
  onCreateProvider,
}: DomainTableProps) {
  const { isDarkMode } = useTheme();
  const { t } = useTranslator('domain_management', customMessages);

  const {
    domains,
    providers,
    isFetching,
    isCreating,
    isVerifying,
    isDeleting,
    isLoadingProviders,
    fetchProviders,
    fetchDomains,
    onCreateDomain,
    onVerifyDomain,
    onDeleteDomain,
    onAssociateToProvider,
    onDeleteFromProvider,
  } = useDomainTable({
    createAction,
    verifyAction,
    deleteAction,
    associateToProviderAction,
    deleteFromProviderAction,
    customMessages,
  });

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
  } = useDomainTableLogic({
    t,
    onCreateDomain,
    onVerifyDomain,
    onDeleteDomain,
    onAssociateToProvider,
    onDeleteFromProvider,
    fetchProviders,
    fetchDomains,
  });

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

export const DomainTable = withMyOrgService(DomainTableComponent, MY_ORG_DOMAIN_SCOPES);
