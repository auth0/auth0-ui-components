/**
 * SSO provider table types.
 * @module sso-provider-table-types
 */

import type {
  SharedComponentProps,
  ComponentAction,
  SsoProviderDeleteSchema,
  SsoProviderTableMessages,
  IdentityProvider as CoreIdentityProvider,
} from '@auth0/universal-components-core';

export type IdentityProvider = CoreIdentityProvider;

/** SSO provider table schema. */
interface SsoProviderTableSchema {
  delete?: SsoProviderDeleteSchema;
  remove?: SsoProviderDeleteSchema;
}

/** CSS classes for SsoProviderTable. */
interface SsoProviderTableClasses {
  'SsoProviderTable-header'?: string;
  'SsoProviderTable-table'?: string;
  'SsoProviderTable-deleteProviderModal'?: string;
  'SsoProviderTable-deleteProviderFromOrganizationModal'?: string;
}

/** Props for SsoProviderTable component. */
export interface SsoProviderTableProps
  extends SharedComponentProps<
    SsoProviderTableMessages,
    SsoProviderTableClasses,
    SsoProviderTableSchema
  > {
  createAction: ComponentAction<void>;
  editAction: ComponentAction<IdentityProvider>;
  deleteAction?: ComponentAction<IdentityProvider>;
  deleteFromOrganizationAction?: ComponentAction<IdentityProvider>;
  enableProviderAction?: ComponentAction<IdentityProvider>;
}

/** useSsoProviderTable options. */
export interface UseSsoProviderTableOptions {
  readOnly?: boolean;
  createAction: ComponentAction<void>;
  editAction: ComponentAction<IdentityProvider>;
  deleteAction?: ComponentAction<IdentityProvider>;
  deleteFromOrganizationAction?: ComponentAction<IdentityProvider>;
  enableProviderAction?: ComponentAction<IdentityProvider>;
  customMessages?: SsoProviderTableProps['customMessages'];
}

export interface UseSsoProviderTableReturn {
  providers: IdentityProvider[];
  isLoading: boolean;
  isViewLoading: boolean;
  isDeleting: boolean;
  isRemoving: boolean;
  isUpdating: boolean;
  isUpdatingId: string | null;
  shouldAllowDeletion: boolean;
  shouldHideCreate: boolean;
  showDeleteModal: boolean;
  showRemoveModal: boolean;
  selectedIdp: IdentityProvider | null;
  error: unknown;
  retry: () => Promise<void>;
  fetchProviders: () => Promise<void>;
  getOrganizationName: () => Promise<string | undefined>;
  onDeleteConfirm: (selectedIdp: IdentityProvider) => Promise<void>;
  onRemoveConfirm: (selectedIdp: IdentityProvider) => Promise<void>;
  onEnableProvider: (selectedIdp: IdentityProvider, enabled: boolean) => Promise<boolean>;
  setShowDeleteModal: (open: boolean) => void;
  setShowRemoveModal: (open: boolean) => void;
  setSelectedIdp: (idp: IdentityProvider | null) => void;
  handleCreate: () => void;
  handleEdit: (idp: IdentityProvider) => void;
  handleDelete: (idp: IdentityProvider) => void;
  handleDeleteFromOrganization: (idp: IdentityProvider) => void;
  handleToggleEnabled: (idp: IdentityProvider, enabled: boolean) => Promise<void>;
  handleDeleteConfirm: (provider: IdentityProvider) => Promise<void>;
  handleRemoveConfirm: (provider: IdentityProvider) => Promise<void>;
}

/** Props for SsoProviderTable actions column. */
export interface SsoProviderTableActionsColumnProps
  extends SharedComponentProps<
    SsoProviderTableMessages,
    SsoProviderTableClasses,
    SsoProviderTableSchema
  > {
  provider: IdentityProvider;
  shouldAllowDeletion: boolean;
  isUpdating?: boolean;
  isUpdatingId?: string | null;
  edit?: {
    disabled?: boolean;
  };
  onToggleEnabled: (provider: IdentityProvider, enabled: boolean) => void;
  onEdit: (provider: IdentityProvider) => void;
  onDelete: (provider: IdentityProvider) => void;
  onRemoveFromOrganization: (provider: IdentityProvider) => void;
}

/** Props for the SsoProviderTableView component. */
export interface SsoProviderTableViewProps {
  providers: IdentityProvider[];
  isLoading: boolean;
  isViewLoading: boolean;
  isDeleting: boolean;
  isRemoving: boolean;
  isUpdating: boolean;
  isUpdatingId: string | null;
  shouldAllowDeletion: boolean;
  shouldHideCreate: boolean;
  showDeleteModal: boolean;
  showRemoveModal: boolean;
  selectedIdp: IdentityProvider | null;
  error: unknown;
  retry: () => Promise<void>;
  fetchProviders: () => Promise<void>;
  getOrganizationName: () => Promise<string | undefined>;
  onDeleteConfirm: (selectedIdp: IdentityProvider) => Promise<void>;
  onRemoveConfirm: (selectedIdp: IdentityProvider) => Promise<void>;
  onEnableProvider: (selectedIdp: IdentityProvider, enabled: boolean) => Promise<boolean>;
  setShowDeleteModal: (open: boolean) => void;
  setShowRemoveModal: (open: boolean) => void;
  setSelectedIdp: (idp: IdentityProvider | null) => void;
  handleCreate: () => void;
  handleEdit: (idp: IdentityProvider) => void;
  handleDelete: (idp: IdentityProvider) => void;
  handleDeleteFromOrganization: (idp: IdentityProvider) => void;
  handleToggleEnabled: (idp: IdentityProvider, enabled: boolean) => Promise<void>;
  handleDeleteConfirm: (provider: IdentityProvider) => Promise<void>;
  handleRemoveConfirm: (provider: IdentityProvider) => Promise<void>;
  styling: SsoProviderTableProps['styling'];
  customMessages: SsoProviderTableProps['customMessages'];
  readOnly: SsoProviderTableProps['readOnly'];
  createAction: SsoProviderTableProps['createAction'];
  editAction: SsoProviderTableProps['editAction'];
  hideHeader?: boolean;
}
