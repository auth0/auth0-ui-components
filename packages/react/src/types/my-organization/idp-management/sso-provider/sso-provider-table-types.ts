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
  createAction: ComponentAction<void>;
  editAction: ComponentAction<IdentityProvider>;
  deleteAction?: ComponentAction<IdentityProvider>;
  deleteFromOrganizationAction?: ComponentAction<IdentityProvider>;
  enableProviderAction?: ComponentAction<IdentityProvider>;
}

/** useSsoProviderTable hook result. */
export interface UseSsoProviderTableReturn extends SharedComponentProps {
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
export interface UseSsoProviderTableLogicOptions {
  readOnly: boolean;
  isLoading: boolean;
  createAction: ComponentAction<void>;
  editAction: ComponentAction<IdentityProvider>;
  deleteAction?: ComponentAction<IdentityProvider>;
  deleteFromOrganizationAction?: ComponentAction<IdentityProvider>;
  onEnableProvider: (selectedIdp: IdentityProvider, enabled: boolean) => Promise<boolean>;
  onDeleteConfirm: (selectedIdp: IdentityProvider) => Promise<void>;
  onRemoveConfirm: (selectedIdp: IdentityProvider) => Promise<void>;
}
/**
 * Combined logic and handler result for SSO provider table.
 * Used for hooks and view props.
 */
export interface UseSsoProviderTableLogicResult {
  // Logic props
  isViewLoading: boolean;
  showDeleteModal: boolean;
  shouldAllowDeletion: boolean;
  shouldHideCreate: boolean;
  showRemoveModal: boolean;
  selectedIdp: IdentityProvider | null;

  // Handler props
  setShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowRemoveModal: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedIdp: React.Dispatch<React.SetStateAction<IdentityProvider | null>>;
  handleCreate: () => void;
  handleEdit: (idp: IdentityProvider) => void;
  handleDelete: (idp: IdentityProvider) => void;
  handleDeleteFromOrganization: (idp: IdentityProvider) => void;
  handleToggleEnabled: (idp: IdentityProvider, enabled: boolean) => Promise<void>;
  handleDeleteConfirm: (provider: IdentityProvider) => Promise<void>;
  handleRemoveConfirm: (provider: IdentityProvider) => Promise<void>;
}

export interface SsoProviderTableLogicProps {
  data: IdentityProvider[];
  isLoading: boolean;
  styling: SsoProviderTableProps['styling'];
  customMessages: SsoProviderTableProps['customMessages'];
  hideHeader: boolean;
  readOnly: boolean;
  shouldHideCreate: boolean;
  isViewLoading: boolean;
  createAction: SsoProviderTableProps['createAction'];
  editAction: SsoProviderTableProps['editAction'];
  selectedIdp: IdentityProvider | null;
  showDeleteModal: boolean;
  showRemoveModal: boolean;
  organization: OrganizationPrivate | null;
  isUpdating: boolean;
  isUpdatingId: string | null;
  isDeleting: boolean;
  isRemoving: boolean;
  shouldAllowDeletion: boolean;
}

export interface SsoProviderTableHandlerProps {
  handleCreate: () => void;
  handleEdit: (idp: IdentityProvider) => void;
  handleDelete: (idp: IdentityProvider) => void;
  handleDeleteFromOrganization: (idp: IdentityProvider) => void;
  handleToggleEnabled: (idp: IdentityProvider, enabled: boolean) => void;
  handleDeleteConfirm: (provider: IdentityProvider) => Promise<void>;
  handleRemoveConfirm: (provider: IdentityProvider) => Promise<void>;
  setShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowRemoveModal: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedIdp: React.Dispatch<React.SetStateAction<IdentityProvider | null>>;
}

export type SsoProviderTableViewProps = {
  logic: SsoProviderTableLogicProps;
  handlers: SsoProviderTableHandlerProps;
};
