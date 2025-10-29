import {
  getComponentStyles,
  type IdentityProvider,
  STRATEGY_DISPLAY_NAMES,
  MY_ORG_SSO_PROVIDER_TABLE_SCOPES,
} from '@auth0-web-ui-components/core';
import { Plus } from 'lucide-react';
import * as React from 'react';

import { SsoProviderDeleteModal } from '../../../components/my-org/idp-management/sso-provider-delete/provider-delete-modal';
import { SsoProviderRemoveFromOrgModal } from '../../../components/my-org/idp-management/sso-provider-remove/provider-remove-modal';
import { SsoProviderTableActionsColumn } from '../../../components/my-org/idp-management/sso-provider-table/sso-provider-table-action';
import { DataTable, type Column } from '../../../components/ui/data-table';
import { Header } from '../../../components/ui/header';
import { Spinner } from '../../../components/ui/spinner';
import { withMyOrgService } from '../../../hoc/with-services';
import { useSsoProviderTable } from '../../../hooks/my-org/idp-management/use-sso-provider-table';
import { useTheme } from '../../../hooks/use-theme';
import { useTranslator } from '../../../hooks/use-translator';
import type { SsoProviderTableProps } from '../../../types';

/**
 * SsoProviderTable Component
 */
function SsoProviderTableComponent({
  customMessages = {},
  styling = {
    variables: { common: {}, light: {}, dark: {} },
    classes: {},
  },
  readOnly = false,
  create,
  edit,
  delete: deleteAction,
  removeFromOrg,
  enableProvider: enableAction,
}: SsoProviderTableProps) {
  const { isDarkMode } = useTheme();
  const { t } = useTranslator('idp_management.sso_provider_table', customMessages);

  const {
    providers,
    isLoading,
    isDeleting,
    isRemoving,
    isUpdating,
    onDeleteConfirm,
    onRemoveConfirm,
    onEnableProvider,
    organization,
  } = useSsoProviderTable(deleteAction, removeFromOrg, enableAction, customMessages);

  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [showRemoveModal, setShowRemoveModal] = React.useState(false);
  const [selectedIdp, setSelectedIdp] = React.useState<IdentityProvider | null>(null);

  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const handleCreate = React.useCallback(() => {
    if (create?.onAfter) {
      create.onAfter();
    }
  }, [create]);

  const handleEdit = React.useCallback(
    (idp: IdentityProvider) => {
      if (edit?.onAfter) {
        edit.onAfter(idp);
      }
    },
    [edit],
  );

  const handleDelete = React.useCallback(
    (idp: IdentityProvider) => {
      setSelectedIdp(idp);

      if (deleteAction?.onBefore) {
        const shouldProceed = deleteAction.onBefore(idp);
        if (!shouldProceed) return;
      }

      setShowDeleteModal(true);
    },
    [deleteAction],
  );

  const handleDeleteFromOrg = React.useCallback(
    (idp: IdentityProvider) => {
      setSelectedIdp(idp);

      if (removeFromOrg?.onBefore) {
        const shouldProceed = removeFromOrg.onBefore(idp);
        if (!shouldProceed) return;
      }

      setShowRemoveModal(true);
    },
    [removeFromOrg],
  );

  const handleToggleEnabled = React.useCallback(
    async (idp: IdentityProvider, enabled: boolean) => {
      if (readOnly || !onEnableProvider) return;

      await onEnableProvider(idp, enabled);
    },
    [readOnly, onEnableProvider],
  );

  const handleDeleteConfirm = React.useCallback(
    async (provider: IdentityProvider) => {
      await onDeleteConfirm(provider);
      setShowDeleteModal(false);
      setSelectedIdp(null);
    },
    [onDeleteConfirm, selectedIdp],
  );

  const handleRemoveConfirm = React.useCallback(
    async (provider: IdentityProvider) => {
      await onRemoveConfirm(provider);
      setShowRemoveModal(false);
      setSelectedIdp(null);
    },
    [onRemoveConfirm],
  );

  const columns: Column<IdentityProvider>[] = React.useMemo(
    () => [
      {
        type: 'text',
        accessorKey: 'name',
        title: t('table.columns.name'),
        width: '25%',
        render: (idp) => <div className="font-medium text-muted-foreground">{idp.name}</div>,
      },
      {
        type: 'text',
        accessorKey: 'display_name',
        width: '30%',
        title: t('table.columns.display_name'),
        render: (idp) => <div className="text-muted-foreground">{idp.display_name}</div>,
      },
      {
        type: 'text',
        accessorKey: 'strategy',
        title: t('table.columns.identity_provider'),
        width: '25%',
        render: (idp) => (
          <div className="text-muted-foreground">{STRATEGY_DISPLAY_NAMES[idp.strategy]}</div>
        ),
      },
      {
        type: 'actions',
        title: '',
        width: '20%',
        render: (idp) => (
          <SsoProviderTableActionsColumn
            provider={idp}
            readOnly={readOnly}
            isUpdating={isUpdating}
            customMessages={customMessages}
            edit={edit}
            onToggleEnabled={handleToggleEnabled}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRemoveFromOrg={handleDeleteFromOrg}
          />
        ),
      },
    ],
    [
      t,
      readOnly,
      edit,
      isUpdating,
      handleEdit,
      handleDelete,
      handleDeleteFromOrg,
      handleToggleEnabled,
    ],
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Spinner />
      </div>
    );
  }

  return (
    <div style={currentStyles.variables}>
      <div className={currentStyles.classes?.['SsoProviderTable-header']}>
        <Header
          title={t('header.title')}
          description={t('header.description')}
          actions={[
            {
              type: 'button',
              label: t('header.create_button_text'),
              onClick: () => handleCreate(),
              icon: Plus,
              disabled: !create || create.disabled || readOnly,
            },
          ]}
        />
      </div>

      <DataTable
        columns={columns}
        data={providers}
        emptyState={{ title: t('table.empty_message') }}
        className={currentStyles.classes?.['SsoProviderTable-table']}
      />

      {selectedIdp && (
        <SsoProviderDeleteModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          provider={selectedIdp}
          onDelete={handleDeleteConfirm}
          isLoading={isDeleting}
          customMessages={customMessages.delete_modal}
        />
      )}

      {selectedIdp && (
        <SsoProviderRemoveFromOrgModal
          isOpen={showRemoveModal}
          onClose={() => setShowRemoveModal(false)}
          provider={selectedIdp}
          organizationName={organization?.name}
          onRemove={handleRemoveConfirm}
          isLoading={isRemoving}
          customMessages={customMessages.remove_modal}
        />
      )}
    </div>
  );
}

export const SsoProviderTable = withMyOrgService(
  SsoProviderTableComponent,
  MY_ORG_SSO_PROVIDER_TABLE_SCOPES,
);
