import {
  getComponentStyles,
  type IdentityProvider,
  STRATEGY_DISPLAY_NAMES,
} from '@auth0-web-ui-components/core';
import { Plus } from 'lucide-react';
import * as React from 'react';

import { SsoProviderTableActionsColumn } from '../../../components/my-org/idp-management/sso-provider-create/sso-provider-table/sso-provider-table-action';
import { SsoProviderDeleteModalContent } from '../../../components/my-org/idp-management/sso-provider-delete/provider-delete-modal-content';
import { DataTable, type Column } from '../../../components/ui/data-table';
import { Header } from '../../../components/ui/header';
import { Modal } from '../../../components/ui/modal';
import { Spinner } from '../../../components/ui/spinner';
import { withMyOrgService } from '../../../hoc/with-services';
import { useSsoProviderTable } from '../../../hooks/my-org/idp-management/use-sso-provider-table';
import { useTheme } from '../../../hooks/use-theme';
import { useTranslator } from '../../../hooks/use-translator';
import { cn } from '../../../lib/theme-utils';
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
  const [confirmationText, setConfirmationText] = React.useState('');

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
    async (idp: IdentityProvider) => {
      await onDeleteConfirm(idp);
      setShowDeleteModal(false);
      setSelectedIdp(null);
      setConfirmationText('');
    },
    [onDeleteConfirm],
  );

  const handleRemoveConfirm = React.useCallback(
    async (idp: IdentityProvider) => {
      await onRemoveConfirm(idp);
      setShowRemoveModal(false);
      setSelectedIdp(null);
      setConfirmationText('');
    },
    [onRemoveConfirm],
  );

  const handleModalContentChange = React.useCallback((field: string, value: string) => {
    setConfirmationText(value);
  }, []);

  const isConfirmationValid = confirmationText.trim() === (selectedIdp?.name || '');

  React.useEffect(() => {
    if (!showDeleteModal && !showRemoveModal) {
      setConfirmationText('');
    }
  }, [showDeleteModal, showRemoveModal]);

  const columns: Column<IdentityProvider>[] = React.useMemo(
    () => [
      {
        type: 'text',
        accessorKey: 'name',
        title: t('table.columns.name'),
        width: '25%',
        render: (idp) => <div className="font-medium">{idp.name}</div>,
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

      <Modal
        open={showDeleteModal}
        onOpenChange={(open) => !open && setShowDeleteModal(false)}
        className={cn('p-10', currentStyles.classes?.['SsoProviderTable-deleteProviderModal'])}
        title={t('delete_modal.title', { providerName: selectedIdp?.name })}
        content={
          <>
            <p
              className={cn(
                'font-normal block text-sm text-left text-(length:--font-size-paragraph) text-muted-foreground',
              )}
            >
              {t('delete_modal.description')}
            </p>
            <SsoProviderDeleteModalContent
              customMessages={customMessages.delete_modal}
              className={currentStyles?.classes?.SsoProviderTable_deleteProviderModal}
              onChange={handleModalContentChange}
            />
          </>
        }
        modalActions={{
          nextAction: {
            type: 'button',
            label: t('delete_modal.actions.delete_button_text'),
            onClick: () => selectedIdp && handleDeleteConfirm(selectedIdp),
            variant: 'destructive',
            disabled: isDeleting || !isConfirmationValid,
          },
          previousAction: {
            label: t('delete_modal.actions.cancel_button_text'),
            onClick: () => setShowDeleteModal(false),
          },
        }}
      />

      <Modal
        open={showRemoveModal}
        onOpenChange={(open) => !open && setShowRemoveModal(false)}
        title={t('remove_modal.title', {
          providerName: selectedIdp?.name,
          organizationName: organization?.name,
        })}
        className={cn('p-10', currentStyles.classes?.SsoProviderTable_deleteProviderFromOrgModal)}
        content={
          <>
            <p
              className={cn(
                'font-normal block text-sm text-left text-(length:--font-size-paragraph) text-muted-foreground',
              )}
            >
              {t('remove_modal.description', { providerName: selectedIdp?.name })}
            </p>
            <SsoProviderDeleteModalContent
              customMessages={customMessages.remove_modal}
              className={currentStyles?.classes?.['SsoProviderTable-removeProviderFromOrgModal']}
              onChange={handleModalContentChange}
            />
          </>
        }
        modalActions={{
          nextAction: {
            type: 'button',
            label: t('remove_modal.actions.remove_button_text'),
            onClick: () => selectedIdp && handleRemoveConfirm(selectedIdp),
            variant: 'destructive',
            disabled: isRemoving || !isConfirmationValid,
          },
          previousAction: {
            label: t('remove_modal.actions.cancel_button_text'),
            onClick: () => setShowRemoveModal(false),
          },
        }}
      />
    </div>
  );
}

export const SsoProviderTable = withMyOrgService(SsoProviderTableComponent);
