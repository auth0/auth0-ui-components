/**
 * SSO provider table types.
 * @module sso-provider-table-types
 */

import type {
  SharedComponentProps,
  ComponentAction,
  ComponentStyling,
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

/** Options for useSsoProviderTable hook. */
export interface UseSsoProviderTableOptions {
  createAction?: SsoProviderTableProps['createAction'];
  editAction?: SsoProviderTableProps['editAction'];
  deleteAction?: SsoProviderTableProps['deleteAction'];
  deleteFromOrganizationAction?: SsoProviderTableProps['deleteFromOrganizationAction'];
  enableProviderAction?: SsoProviderTableProps['enableProviderAction'];
  readOnly?: boolean;
  customMessages?: SsoProviderTableProps['customMessages'];
}

/** useSsoProviderTable hook result. */
export interface UseSsoProviderTableReturn {
  providers: IdentityProvider[];
  organization: OrganizationPrivate | null;
  isLoading: boolean;
  isDeleting: boolean;
  isRemoving: boolean;
  isUpdating: boolean;
  isUpdatingId: string | null;
  isViewLoading: boolean;
  shouldAllowDeletion: boolean;
  shouldHideCreate: boolean;
  showDeleteModal: boolean;
  showRemoveModal: boolean;
  selectedIdp: IdentityProvider | null;
  fetchProviders: () => Promise<void>;
  fetchOrganizationDetails: () => Promise<OrganizationPrivate | null>;
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

export interface SsoProviderTableViewProps extends UseSsoProviderTableReturn {
  styling: ComponentStyling<SsoProviderTableClasses>;
  customMessages: SsoProviderTableProps['customMessages'];
  readOnly: boolean;
  createAction: SsoProviderTableProps['createAction'];
  editAction: SsoProviderTableProps['editAction'];
}
