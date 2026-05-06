/**
 * SSO provider table types.
 * @module sso-provider-table-types
 */

import type {
  SharedComponentProps,
  ComponentAction,
  SsoProviderDeleteSchema,
  SsoProviderTableMessages,
  IdpKnownResponse,
  OrganizationPrivate,
} from '@auth0/universal-components-core';

export type { IdpKnownResponse };

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
  editAction: ComponentAction<IdpKnownResponse>;
  deleteAction?: ComponentAction<IdpKnownResponse>;
  deleteFromOrganizationAction?: ComponentAction<IdpKnownResponse>;
  enableProviderAction?: ComponentAction<IdpKnownResponse>;
}

/** useSsoProviderTable hook result. */
export interface UseSsoProviderTableReturn extends SharedComponentProps {
  providers: IdpKnownResponse[];
  organization: OrganizationPrivate | null;
  isLoading: boolean;
  isDeleting: boolean;
  isRemoving: boolean;
  isUpdating: boolean;
  isUpdatingId: string | null;
  fetchProviders: () => Promise<void>;
  fetchOrganizationDetails: () => Promise<OrganizationPrivate | null>;
  onDeleteConfirm: (selectedIdp: IdpKnownResponse) => Promise<void>;
  onRemoveConfirm: (selectedIdp: IdpKnownResponse) => Promise<void>;
  onEnableProvider: (selectedIdp: IdpKnownResponse, enabled: boolean) => Promise<boolean>;
}

/** Props for SsoProviderTable actions column. */
export interface SsoProviderTableActionsColumnProps
  extends SharedComponentProps<
    SsoProviderTableMessages,
    SsoProviderTableClasses,
    SsoProviderTableSchema
  > {
  provider: IdpKnownResponse;
  shouldAllowDeletion: boolean;
  isUpdating?: boolean;
  isUpdatingId?: string | null;
  edit?: {
    disabled?: boolean;
  };
  onToggleEnabled: (provider: IdpKnownResponse, enabled: boolean) => void;
  onEdit: (provider: IdpKnownResponse) => void;
  onDelete: (provider: IdpKnownResponse) => void;
  onRemoveFromOrganization: (provider: IdpKnownResponse) => void;
}
export interface UseSsoProviderTableLogicOptions {
  readOnly: boolean;
  isLoading: boolean;
  createAction: ComponentAction<void>;
  editAction: ComponentAction<IdpKnownResponse>;
  deleteAction?: ComponentAction<IdpKnownResponse>;
  deleteFromOrganizationAction?: ComponentAction<IdpKnownResponse>;
  onEnableProvider: (selectedIdp: IdpKnownResponse, enabled: boolean) => Promise<boolean>;
  onDeleteConfirm: (selectedIdp: IdpKnownResponse) => Promise<void>;
  onRemoveConfirm: (selectedIdp: IdpKnownResponse) => Promise<void>;
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
  selectedIdp: IdpKnownResponse | null;

  // Handler props
  setShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowRemoveModal: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedIdp: React.Dispatch<React.SetStateAction<IdpKnownResponse | null>>;
  handleCreate: () => void;
  handleEdit: (idp: IdpKnownResponse) => void;
  handleDelete: (idp: IdpKnownResponse) => void;
  handleDeleteFromOrganization: (idp: IdpKnownResponse) => void;
  handleToggleEnabled: (idp: IdpKnownResponse, enabled: boolean) => Promise<void>;
  handleDeleteConfirm: (provider: IdpKnownResponse) => Promise<void>;
  handleRemoveConfirm: (provider: IdpKnownResponse) => Promise<void>;
}

export interface SsoProviderTableLogicProps {
  data: IdpKnownResponse[];
  isLoading: boolean;
  styling: SsoProviderTableProps['styling'];
  customMessages: SsoProviderTableProps['customMessages'];
  hideHeader: boolean;
  readOnly: boolean;
  shouldHideCreate: boolean;
  isViewLoading: boolean;
  createAction: SsoProviderTableProps['createAction'];
  editAction: SsoProviderTableProps['editAction'];
  selectedIdp: IdpKnownResponse | null;
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
  handleEdit: (idp: IdpKnownResponse) => void;
  handleDelete: (idp: IdpKnownResponse) => void;
  handleDeleteFromOrganization: (idp: IdpKnownResponse) => void;
  handleToggleEnabled: (idp: IdpKnownResponse, enabled: boolean) => void;
  handleDeleteConfirm: (provider: IdpKnownResponse) => Promise<void>;
  handleRemoveConfirm: (provider: IdpKnownResponse) => Promise<void>;
  setShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowRemoveModal: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedIdp: React.Dispatch<React.SetStateAction<IdpKnownResponse | null>>;
}

export type SsoProviderTableViewProps = {
  logic: SsoProviderTableLogicProps;
  handlers: SsoProviderTableHandlerProps;
};
