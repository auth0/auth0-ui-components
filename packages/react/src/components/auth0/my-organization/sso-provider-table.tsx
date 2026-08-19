/** @module sso-provider-table */

import {
  getComponentStyles,
  type IdpKnownResponse,
  STRATEGY_DISPLAY_NAMES,
} from '@auth0/universal-components-core';
import { Plus } from 'lucide-react';
import * as React from 'react';

import { SsoProviderDeleteModal } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-delete/provider-delete-modal';
import { SsoProviderRemoveFromOrganizationModal } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-remove/provider-remove-modal';
import { SsoProviderTableActionsColumn } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-table/sso-provider-table-action';
import { DataTable, type Column } from '@/components/auth0/shared/data-table';
import { GateKeeper } from '@/components/auth0/shared/gate-keeper/gate-keeper';
import { Header } from '@/components/auth0/shared/header';
import { RefreshIndicator } from '@/components/auth0/shared/refresh-indicator';
import { StyledScope } from '@/components/auth0/shared/styled-scope';
import { useSsoProviderTable } from '@/hooks/my-organization/use-sso-provider-table';
import { useTelemetry } from '@/hooks/shared/use-telemetry';
import { useTheme } from '@/hooks/shared/use-theme';
import { useTranslator } from '@/hooks/shared/use-translator';
import { cn } from '@/lib/utils';
import type {
  SsoProviderTableProps,
  SsoProviderTableViewProps,
} from '@/types/my-organization/idp-management/sso-provider/sso-provider-table-types';

/**
 * SSO provider table container component.
 * @param props - Component props
 * @param props.customMessages - Custom translation messages to override defaults
 * @param props.styling - Custom styling configuration with variables and classes
 * @param props.readOnly - Whether the component is in read-only mode
 * @param props.hideDeleteProvider - Whether to hide the delete provider action
 * @param props.hideRemoveFromOrganization - Whether to hide the remove from organization action
 * @param props.createAction - Configuration for the create action
 * @param props.editAction - Configuration for the edit action
 * @param props.deleteAction - Configuration for the delete action
 * @param props.deleteFromOrganizationAction - Configuration for removing from organization
 * @param props.enableProviderAction - Configuration for enabling a provider
 * @returns JSX element
 * @internal
 */
function SsoProviderTable(props: SsoProviderTableProps) {
  useTelemetry('sso-table-configuration');

  const {
    customMessages = {},
    styling = { variables: { common: {}, light: {}, dark: {} }, classes: {} },
    readOnly = false,
    hideHeader = false,
    hideDeleteProvider = false,
    hideRemoveFromOrganization = false,
    createAction,
    editAction,
    deleteAction,
    deleteFromOrganizationAction,
    enableProviderAction,
  } = props;

  const providerTable = useSsoProviderTable({
    readOnly,
    customMessages,
    createAction,
    editAction,
    deleteAction,
    deleteFromOrganizationAction,
    enableProviderAction,
  });

  return (
    <GateKeeper isLoading={providerTable.isLoading} styling={styling}>
      <SsoProviderTableView
        {...providerTable}
        styling={styling}
        customMessages={customMessages}
        hideHeader={hideHeader}
        hideDeleteProvider={hideDeleteProvider}
        hideRemoveFromOrganization={hideRemoveFromOrganization}
        createAction={createAction}
        editAction={editAction}
      />
    </GateKeeper>
  );
}

/**
 * Internal SSO provider table view component
 * @param props - Component props
 * @internal
 * @returns JSX element
 */
function SsoProviderTableView({
  styling,
  customMessages,
  permissions,
  hideHeader,
  hideDeleteProvider,
  hideRemoveFromOrganization,
  providers,
  shouldHideCreate,
  isViewLoading,
  isRefetchingProviders,
  isProvidersStale,
  providersUpdatedAt,
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
  refetchProviders,
  handleCreate,
  handleEdit,
  handleDelete,
  handleDeleteFromOrganization,
  handleToggleEnabled,
  handleDeleteConfirm,
  handleRemoveConfirm,
  setShowDeleteModal,
  setShowRemoveModal,
}: SsoProviderTableViewProps) {
  const { isDarkMode } = useTheme();
  const { t } = useTranslator('idp_management.sso_provider_table', customMessages);
  const { t: tCommon } = useTranslator('common');
  const currentStyles = React.useMemo(
    () => getComponentStyles(styling, isDarkMode),
    [styling, isDarkMode],
  );

  const columns: Column<IdpKnownResponse>[] = React.useMemo(
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
            hideDeleteProvider={hideDeleteProvider}
            hideRemoveFromOrganization={hideRemoveFromOrganization}
            permissions={permissions}
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
      permissions,
      editAction,
      isUpdating,
      hideDeleteProvider,
      hideRemoveFromOrganization,
      handleEdit,
      handleDelete,
      handleDeleteFromOrganization,
      handleToggleEnabled,
    ],
  );

  return (
    <StyledScope style={currentStyles.variables}>
      {!hideHeader && (
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
                disabled: createAction?.disabled || !permissions.canCreateProvider,
                ...(permissions.canCreateProvider
                  ? {}
                  : { tooltip: { content: tCommon('error.forbidden') } }),
              },
            ]}
          />
        </div>
      )}

      <div
        className={cn(
          'flex justify-end mb-8',
          currentStyles.classes?.['SsoProviderTable-tableActions'],
        )}
      >
        <RefreshIndicator
          isStale={isProvidersStale}
          isFetching={isRefetchingProviders}
          lastUpdatedAt={providersUpdatedAt || undefined}
          onRefresh={refetchProviders}
        />
      </div>

      <DataTable
        loading={isViewLoading}
        columns={columns}
        data={providers}
        emptyState={{ title: t('table.empty_message') }}
        className={currentStyles.classes?.['SsoProviderTable-table']}
        onRowClick={handleEdit}
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
export { SsoProviderTable, SsoProviderTableView };
