import type { Domain } from '@auth0/universal-components-core';
import { getComponentStyles } from '@auth0/universal-components-core';
import { Plus } from 'lucide-react';
import React from 'react';

import { DomainCreateModal } from '../../domain-management/domain-create/domain-create-modal';
import { DomainDeleteModal } from '../../domain-management/domain-delete/domain-delete-modal';
import { DomainVerifyModal } from '../../domain-management/domain-verify/domain-verify-modal';

import { SsoDomainTabActionsColumn } from './sso-domain-tab-action-column';

import { Badge } from '@/components/ui/badge';
import { DataTable, type Column } from '@/components/ui/data-table';
import { Header } from '@/components/ui/header';
import { useSsoDomainTab } from '@/hooks/my-organization/idp-management/use-sso-domain-tab';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import { getStatusBadgeVariant } from '@/lib/utils/my-organization/domain-management/domain-management-utils';
import type { SsoDomainsTabProps } from '@/types/my-organization/idp-management/sso-domain/sso-domain-tab-types';

/**
 * SsoDomainTab Component
 */
export function SsoDomainTab({
  customMessages = {},
  styling = {
    variables: { common: {}, light: {}, dark: {} },
    classes: {},
  },
  readOnly = false,
  schema,
  idpId,
  domains,
  provider,
}: SsoDomainsTabProps) {
  const { t } = useTranslator(
    'idp_management.edit_sso_provider.tabs.domains.content',
    customMessages,
  );

  const { isDarkMode } = useTheme();
  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const {
    domainsList,
    isCreating,
    selectedDomain,
    showVerifyModal,
    isVerifying,
    showDeleteModal,
    verifyError,
    handleCloseVerifyModal,
    handleVerify,
    handleDeleteClick,
    isLoading,
    isDeleting,
    setShowDeleteModal,
    handleDelete,
    setShowCreateModal,
    showCreateModal,
    handleCreate,
    idpDomains,
    handleVerifyActionColumn,
    isUpdating,
    isUpdatingId,
    handleToggleSwitch,
  } = useSsoDomainTab(idpId, {
    customMessages,
    domains,
    provider,
  });

  const columns: Column<Domain>[] = React.useMemo(
    () => [
      {
        type: 'text',
        accessorKey: 'domain',
        title: t('table.columns.name'),
        render: (domain) => <div className="font-medium">{domain.domain}</div>,
      },
      {
        type: 'text',
        accessorKey: 'status',
        title: t('table.columns.status'),
        render: (domain) => (
          <Badge variant={getStatusBadgeVariant(domain.status)} size={'sm'}>
            {t(`table.domain_statuses.${domain.status}`)}
          </Badge>
        ),
      },
      {
        type: 'actions',
        title: '',
        render: (domain) => (
          <SsoDomainTabActionsColumn
            translatorKey="idp_management.edit_sso_provider.tabs.domains.content"
            idpDomains={idpDomains}
            readOnly={readOnly}
            isUpdating={isUpdating}
            isUpdatingId={isUpdatingId}
            customMessages={customMessages}
            onToggle={handleToggleSwitch}
            handleVerify={handleVerifyActionColumn}
            domain={domain}
          />
        ),
      },
    ],
    [t],
  );

  return (
    <div style={currentStyles.variables} className="space-y-8">
      <div className={currentStyles.classes?.['SsoDomainsTab-header']}>
        <Header
          title={t('title')}
          description={t('description')}
          actions={[
            {
              type: 'button',
              label: t('create_button_text'),
              onClick: () => setShowCreateModal(true),
              icon: Plus,
              disabled: domains?.createAction?.disabled || readOnly,
            },
          ]}
        />
      </div>
      <DataTable
        columns={columns}
        data={domainsList}
        loading={isLoading}
        emptyState={{ title: t('table.empty_message') }}
        className={currentStyles.classes?.['SsoDomainsTab-table']}
      />

      <DomainCreateModal
        translatorKey="idp_management.edit_sso_provider.tabs.domains.content.domain_create.modal"
        className={currentStyles.classes?.['SsoDomainsTab-createModal']}
        isOpen={showCreateModal}
        isLoading={isCreating}
        schema={schema?.create}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreate}
        customMessages={customMessages.domain_create}
      />

      <DomainVerifyModal
        translatorKey="idp_management.edit_sso_provider.tabs.domains.content.domain_verify.modal"
        className={currentStyles.classes?.['SsoDomainsTab-verifyModal']}
        isOpen={showVerifyModal}
        isLoading={isVerifying}
        domain={selectedDomain}
        error={verifyError}
        onClose={handleCloseVerifyModal}
        onVerify={handleVerify}
        onDelete={handleDeleteClick}
        customMessages={customMessages.domain_verify}
      />

      <DomainDeleteModal
        translatorKey="idp_management.edit_sso_provider.tabs.domains.content.domain_delete.modal"
        className={currentStyles.classes?.['SsoDomainsTab-deleteModal']}
        domain={selectedDomain}
        isOpen={showDeleteModal}
        isLoading={isDeleting}
        onClose={() => setShowDeleteModal(false)}
        onDelete={handleDelete}
        customMessages={customMessages.domain_delete}
      />
    </div>
  );
}
