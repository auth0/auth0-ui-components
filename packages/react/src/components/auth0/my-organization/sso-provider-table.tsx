/** @module sso-provider-table */

import {
  getComponentStyles,
  type IdentityProvider,
  STRATEGY_DISPLAY_NAMES,
} from '@auth0/universal-components-core';
import { Plus } from 'lucide-react';
import * as React from 'react';

import { SsoProviderDeleteModal } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-delete/provider-delete-modal';
import { SsoProviderRemoveFromOrganizationModal } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-remove/provider-remove-modal';
import { SsoProviderTableActionsColumn } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-table/sso-provider-table-action';
import { DataTable, type Column } from '@/components/auth0/shared/data-table';
import { Header } from '@/components/auth0/shared/header';
import { StyledScope } from '@/components/auth0/shared/styled-scope';
import { useSsoProviderTable } from '@/hooks/my-organization/use-sso-provider-table';
import { useSsoProviderTableLogic } from '@/hooks/my-organization/use-sso-provider-table-logic';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import type {
  SsoProviderTableProps,
  SsoProviderTableLogicProps,
  SsoProviderTableHandlerProps,
  SsoProviderTableViewProps,
} from '@/types/my-organization/idp-management/sso-provider/sso-provider-table-types';

/**
 * Internal SSO provider table container(logic) component.
 * @param props - Component props
 * @param props.customMessages - Custom translation messages to override defaults
 * @param props.styling - Custom styling configuration with variables and classes
 * @param props.readOnly - Whether the component is in read-only mode
 * @param props.createAction - Configuration for the create action
 * @param props.editAction - Configuration for the edit action
 * @param props.deleteAction - Configuration for the delete action
 * @param props.deleteFromOrganizationAction - Configuration for removing from organization
 * @param props.enableProviderAction - Configuration for enabling a provider
 * @returns JSX element
 * @internal
 */
function SsoProviderTableContainer(props: SsoProviderTableProps) {
  const {
    customMessages = {},
    styling = { variables: { common: {}, light: {}, dark: {} }, classes: {} },
    readOnly = false,
    createAction,
    editAction,
    deleteAction,
    deleteFromOrganizationAction,
    enableProviderAction,
  } = props;

  const ssoProviderTable = useSsoProviderTable(
    deleteAction,
    deleteFromOrganizationAction,
    enableProviderAction,
    customMessages,
  );

  const {
    providers,
    organization,
    isLoading,
    isDeleting,
    isRemoving,
    isUpdating,
    isUpdatingId,
    onDeleteConfirm,
    onRemoveConfirm,
    onEnableProvider,
  } = ssoProviderTable;

  const tableLogic = useSsoProviderTableLogic({
    isLoading,
    readOnly,
    createAction,
    editAction,
    deleteAction,
    deleteFromOrganizationAction,
    onEnableProvider,
    onDeleteConfirm,
    onRemoveConfirm,
  });

  const ssoProviderCreateLogicProps: SsoProviderTableLogicProps = {
    data: providers,
    styling,
    customMessages,
    readOnly,
    createAction,
    editAction,
    organization,
    isUpdating,
    isUpdatingId,
    isDeleting,
    isRemoving,
    hideHeader: false,
    isLoading: tableLogic.isViewLoading,
    shouldHideCreate: tableLogic.shouldHideCreate,
    isViewLoading: tableLogic.isViewLoading,
    selectedIdp: tableLogic.selectedIdp,
    showDeleteModal: tableLogic.showDeleteModal,
    showRemoveModal: tableLogic.showRemoveModal,
    shouldAllowDeletion: tableLogic.shouldAllowDeletion,
  };

  const ssoProviderCreateHandlerProps: SsoProviderTableHandlerProps = {
    handleCreate: tableLogic.handleCreate,
    handleEdit: tableLogic.handleEdit,
    handleDelete: tableLogic.handleDelete,
    handleDeleteFromOrganization: tableLogic.handleDeleteFromOrganization,
    handleToggleEnabled: tableLogic.handleToggleEnabled,
    handleDeleteConfirm: tableLogic.handleDeleteConfirm,
    handleRemoveConfirm: tableLogic.handleRemoveConfirm,
    setShowDeleteModal: tableLogic.setShowDeleteModal,
    setShowRemoveModal: tableLogic.setShowRemoveModal,
    setSelectedIdp: tableLogic.setSelectedIdp,
  };

  return (
    <SsoProviderTableView
      logic={ssoProviderCreateLogicProps}
      handlers={ssoProviderCreateHandlerProps}
    />
  );
}

/**
 * Internal SSO provider table view component
 * @param props - Component props
 * @param props.logic - Component logic props
 * @param props.handlers - Component handler props
 * @internal
 * @returns JSX element
 */
function SsoProviderTableView({ logic, handlers }: SsoProviderTableViewProps) {
  const {
    styling,
    customMessages,
    readOnly,
    data,
    shouldHideCreate,
    isViewLoading,
    createAction,
    editAction,
    selectedIdp,
    showDeleteModal,
    showRemoveModal,
    shouldAllowDeletion,
    organization,
    isUpdating,
    isUpdatingId,
    isDeleting,
    isRemoving,
  } = logic;

  const {
    handleCreate,
    handleEdit,
    handleDelete,
    handleDeleteFromOrganization,
    handleToggleEnabled,
    handleDeleteConfirm,
    handleRemoveConfirm,
    setShowDeleteModal,
    setShowRemoveModal,
  } = handlers;

  const { isDarkMode } = useTheme();
  const { t } = useTranslator('idp_management.sso_provider_table', customMessages);
  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
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
            shouldAllowDeletion={shouldAllowDeletion}
            readOnly={readOnly}
            isUpdating={isUpdating}
            isUpdatingId={isUpdatingId}
            customMessages={customMessages}
            edit={editAction}
            onToggleEnabled={handleToggleEnabled}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRemoveFromOrganization={handleDeleteFromOrganization}
          />
        ),
      },
    ],
    [
      t,
      readOnly,
      editAction,
      isUpdating,
      handleEdit,
      handleDelete,
      handleDeleteFromOrganization,
      handleToggleEnabled,
    ],
  );

  return (
    <StyledScope style={currentStyles.variables}>
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
              hidden: shouldHideCreate || isViewLoading,
              disabled: createAction?.disabled || readOnly,
            },
          ]}
        />
      </div>

      <DataTable
        loading={isViewLoading}
        columns={columns}
        data={data}
        emptyState={{ title: t('table.empty_message') }}
        className={currentStyles.classes?.['SsoProviderTable-table']}
      />

      {selectedIdp && (
        <SsoProviderDeleteModal
          className={currentStyles.classes?.['SsoProviderTable-deleteProviderModal']}
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          provider={selectedIdp}
          onDelete={handleDeleteConfirm}
          isLoading={isDeleting}
          customMessages={customMessages?.delete_modal}
        />
      )}

      {selectedIdp && (
        <SsoProviderRemoveFromOrganizationModal
          className={
            currentStyles.classes?.['SsoProviderTable-deleteProviderFromOrganizationModal']
          }
          isOpen={showRemoveModal}
          onClose={() => setShowRemoveModal(false)}
          provider={selectedIdp}
          organizationName={organization?.name}
          onRemove={handleRemoveConfirm}
          isLoading={isRemoving}
          customMessages={customMessages?.remove_modal}
        />
      )}
    </StyledScope>
  );
}

/**
 * SSO identity providers table.
 *
 * Displays a table of SSO identity providers with actions for creating, editing,
 * enabling/disabling, deleting, and removing providers from the organization.
 *
 * @param props - {@link SsoProviderTableProps}
 * @param props.customMessages - Custom i18n message overrides
 * @param props.styling - CSS variables and class overrides
 * @param props.readOnly - Render in read-only mode
 * @param props.createAction - Lifecycle hooks for provider creation
 * @param props.editAction - Lifecycle hooks for provider editing
 * @param props.deleteAction - Lifecycle hooks for provider deletion
 * @param props.deleteFromOrganizationAction - Lifecycle hooks for removing provider from organization
 * @param props.enableProviderAction - Lifecycle hooks for enabling/disabling provider
 * @returns SSO provider table component
 *
 * @see {@link SsoProviderTableProps} for full props documentation
 *
 * @example
 * ```tsx
 * <SsoProviderTable
 *   createAction={{ onAfter: () => navigate('/providers/new') }}
 *   editAction={{ onAfter: (provider) => navigate(`/providers/${provider.id}`) }}
 *   deleteAction={{
 *     onBefore: (provider) => confirm(`Delete ${provider.name}?`),
 *     onAfter: (provider) => console.log('Deleted:', provider),
 *   }}
 * />
 * ```
 */
const SsoProviderTable = SsoProviderTableContainer;

export { SsoProviderTable, SsoProviderTableView };
