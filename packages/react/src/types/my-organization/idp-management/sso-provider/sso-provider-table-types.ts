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
  OrganizationPrivate,
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
  hideHeader?: boolean;
  createAction: ComponentAction<void>;
  editAction: ComponentAction<IdentityProvider>;
  deleteAction?: ComponentAction<IdentityProvider>;
  deleteFromOrganizationAction?: ComponentAction<IdentityProvider>;
  enableProviderAction?: ComponentAction<IdentityProvider>;
}

/** Internal service hook result for SSO provider table data and CRUD operations. */
export interface UseSsoProviderTableServiceReturn extends SharedComponentProps {
  providers: IdentityProvider[];
  organization: OrganizationPrivate | null;
  isLoading: boolean;
  isDeleting: boolean;
  isRemoving: boolean;
  isUpdating: boolean;
  isUpdatingId: string | null;
  fetchProviders: () => Promise<void>;
  fetchOrganizationDetails: () => Promise<OrganizationPrivate | null>;
  onDeleteConfirm: (selectedIdp: IdentityProvider) => Promise<void>;
  onRemoveConfirm: (selectedIdp: IdentityProvider) => Promise<void>;
  onEnableProvider: (selectedIdp: IdentityProvider, enabled: boolean) => Promise<boolean>;
}

/** Options for the combined useSsoProviderTable hook. */
export interface UseSsoProviderTableOptions {
  readOnly?: boolean;
  customMessages?: SsoProviderTableMessages;
  createAction: ComponentAction<void>;
  editAction: ComponentAction<IdentityProvider>;
  deleteAction?: ComponentAction<IdentityProvider>;
  deleteFromOrganizationAction?: ComponentAction<IdentityProvider>;
  enableProviderAction?: ComponentAction<IdentityProvider>;
}

/** useSsoProviderTable hook result. */
export interface UseSsoProviderTableReturn {
  // Data
  providers: IdentityProvider[];
  organization: OrganizationPrivate | null;

  // Loading states
  isLoading: boolean;
  isViewLoading: boolean;
  isDeleting: boolean;
  isRemoving: boolean;
  isUpdating: boolean;
  isUpdatingId: string | null;

  // Config
  shouldAllowDeletion: boolean;
  shouldHideCreate: boolean;

  // UI state
  showDeleteModal: boolean;
  showRemoveModal: boolean;
  selectedIdp: IdentityProvider | null;

  // Data actions
  fetchProviders: () => Promise<void>;
  fetchOrganizationDetails: () => Promise<OrganizationPrivate | null>;

  // UI handlers
  handleCreate: () => void;
  handleEdit: (idp: IdentityProvider) => void;
  handleDelete: (idp: IdentityProvider) => void;
  handleDeleteFromOrganization: (idp: IdentityProvider) => void;
  handleToggleEnabled: (idp: IdentityProvider, enabled: boolean) => Promise<void>;
  handleDeleteConfirm: (provider: IdentityProvider) => Promise<void>;
  handleRemoveConfirm: (provider: IdentityProvider) => Promise<void>;

  // UI state setters
  setShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowRemoveModal: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedIdp: React.Dispatch<React.SetStateAction<IdentityProvider | null>>;
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
export interface SsoProviderTableViewProps extends UseSsoProviderTableReturn {
  styling: SsoProviderTableProps['styling'];
  customMessages: SsoProviderTableProps['customMessages'];
  readOnly: boolean;
  hideHeader: boolean;
  createAction: SsoProviderTableProps['createAction'];
  editAction: SsoProviderTableProps['editAction'];
}
