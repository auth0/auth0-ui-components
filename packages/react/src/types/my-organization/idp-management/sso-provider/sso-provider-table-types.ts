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
import type { UseQueryResult } from '@tanstack/react-query';

export type { IdpKnownResponse };

/** Refetch handler for the SSO providers query. */
export type RefetchProviders = UseQueryResult<IdpKnownResponse[]>['refetch'];

/** SSO provider table schema. */
interface SsoProviderTableSchema {
  delete?: SsoProviderDeleteSchema;
  remove?: SsoProviderDeleteSchema;
}

/** CSS classes for SsoProviderTable. */
interface SsoProviderTableClasses {
  'SsoProviderTable-header'?: string;
  'SsoProviderTable-table'?: string;
  'SsoProviderTable-tableHeader'?: string;
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
  editAction: ComponentAction<IdpKnownResponse>;
  deleteAction?: ComponentAction<IdpKnownResponse>;
  deleteFromOrganizationAction?: ComponentAction<IdpKnownResponse>;
  enableProviderAction?: ComponentAction<IdpKnownResponse>;
}

/** Internal service hook result for SSO provider table data and CRUD operations. */
export interface UseSsoProviderTableServiceReturn extends SharedComponentProps {
  providers: IdpKnownResponse[];
  organization: OrganizationPrivate | null;
  isLoading: boolean;
  isRefetchingProviders: boolean;
  isProvidersStale: boolean;
  providersUpdatedAt: number;
  providersError: unknown;
  organizationError: unknown;
  refetchProviders: RefetchProviders;
  isDeleting: boolean;
  isRemoving: boolean;
  isUpdating: boolean;
  isUpdatingId: string | null;
  fetchProviders: () => Promise<void>;
  fetchOrganizationDetails: () => Promise<OrganizationPrivate | null>;
  onDeleteConfirm: (selectedIdp: IdpKnownResponse) => Promise<void>;
  onRemoveConfirm: (selectedIdp: IdpKnownResponse) => Promise<void>;
  onEnableProvider: (selectedIdp: IdpKnownResponse, enabled: boolean) => Promise<void>;
}

/** Options for the combined useSsoProviderTable hook. */
export interface UseSsoProviderTableOptions {
  readOnly?: boolean;
  customMessages?: SsoProviderTableMessages;
  createAction: ComponentAction<void>;
  editAction: ComponentAction<IdpKnownResponse>;
  deleteAction?: ComponentAction<IdpKnownResponse>;
  deleteFromOrganizationAction?: ComponentAction<IdpKnownResponse>;
  enableProviderAction?: ComponentAction<IdpKnownResponse>;
}

/** useSsoProviderTable hook result. */
export interface UseSsoProviderTableReturn {
  providers: IdpKnownResponse[];
  organization: OrganizationPrivate | null;

  isLoading: boolean;
  isViewLoading: boolean;
  isRefetchingProviders: boolean;
  isProvidersStale: boolean;
  providersUpdatedAt: number;
  isDeleting: boolean;
  isRemoving: boolean;
  isUpdating: boolean;
  isUpdatingId: string | null;

  shouldAllowDeletion: boolean;
  shouldHideCreate: boolean;

  showDeleteModal: boolean;
  showRemoveModal: boolean;
  selectedIdp: IdpKnownResponse | null;

  refetchProviders: RefetchProviders;
  fetchProviders: () => Promise<void>;
  fetchOrganizationDetails: () => Promise<OrganizationPrivate | null>;

  handleCreate: () => void;
  handleEdit: (idp: IdpKnownResponse) => void;
  handleDelete: (idp: IdpKnownResponse) => void;
  handleDeleteFromOrganization: (idp: IdpKnownResponse) => void;
  handleToggleEnabled: (idp: IdpKnownResponse, enabled: boolean) => Promise<void>;
  handleDeleteConfirm: (provider: IdpKnownResponse) => Promise<void>;
  handleRemoveConfirm: (provider: IdpKnownResponse) => Promise<void>;

  setShowDeleteModal: React.Dispatch<React.SetStateAction<boolean>>;
  setShowRemoveModal: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedIdp: React.Dispatch<React.SetStateAction<IdpKnownResponse | null>>;
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
export interface SsoProviderTableViewProps extends UseSsoProviderTableReturn {
  styling: SsoProviderTableProps['styling'];
  customMessages: SsoProviderTableProps['customMessages'];
  readOnly: boolean;
  hideHeader: boolean;
  createAction: SsoProviderTableProps['createAction'];
  editAction: SsoProviderTableProps['editAction'];
}
