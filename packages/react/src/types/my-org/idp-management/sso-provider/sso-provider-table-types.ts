import type {
  SharedComponentProps,
  ComponentAction,
  SsoProviderDeleteSchema,
  SsoProviderTableMessages,
  IdentityProvider as CoreIdentityProvider,
  OrganizationPrivate,
} from '@auth0/web-ui-components-core';

export type IdentityProvider = CoreIdentityProvider;

interface SsoProviderTableSchema {
  delete?: SsoProviderDeleteSchema;
  remove?: SsoProviderDeleteSchema;
}

interface SsoProviderTableClasses {
  'SsoProviderTable-header'?: string;
  'SsoProviderTable-table'?: string;
  'SsoProviderTable-deleteProviderModal'?: string;
  'SsoProviderTable-deleteProviderFromOrgModal'?: string;
}

export interface SsoProviderTableProps
  extends SharedComponentProps<
    SsoProviderTableMessages,
    SsoProviderTableClasses,
    SsoProviderTableSchema
  > {
  createAction: ComponentAction<void>;
  editAction: ComponentAction<IdentityProvider>;
  deleteAction?: ComponentAction<IdentityProvider>;
  deleteFromOrgAction?: ComponentAction<IdentityProvider>;
  enableProviderAction?: ComponentAction<IdentityProvider>;
}

export interface UseSsoProviderTableReturn extends SharedComponentProps {
  providers: IdentityProvider[];
  organization: OrganizationPrivate | null;
  isLoading: boolean;
  isDeleting: boolean;
  isRemoving: boolean;
  isUpdating: boolean;
  fetchProviders: () => Promise<void>;
  fetchOrganizationDetails: () => Promise<OrganizationPrivate | null>;
  onDeleteConfirm: (selectedIdp: IdentityProvider) => Promise<void>;
  onRemoveConfirm: (selectedIdp: IdentityProvider) => Promise<void>;
  onEnableProvider: (selectedIdp: IdentityProvider, enabled: boolean) => Promise<boolean>;
}

export interface SsoProviderTableActionsColumnProps
  extends SharedComponentProps<
    SsoProviderTableMessages,
    SsoProviderTableClasses,
    SsoProviderTableSchema
  > {
  provider: IdentityProvider;
  shouldAllowDeletion: boolean;
  isUpdating?: boolean;
  edit?: {
    disabled?: boolean;
  };
  onToggleEnabled: (provider: IdentityProvider, enabled: boolean) => void;
  onEdit: (provider: IdentityProvider) => void;
  onDelete: (provider: IdentityProvider) => void;
  onRemoveFromOrg: (provider: IdentityProvider) => void;
}
