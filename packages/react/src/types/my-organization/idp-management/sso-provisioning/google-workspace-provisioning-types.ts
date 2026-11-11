/**
 * Google Workspace provisioning type definitions.
 * @module google-workspace-provisioning-types
 * @internal
 */

import type {
  DirectoryProvisioningConfig,
  GoogleWorkspaceProvisioningDisableModalMessages,
  GoogleWorkspaceProvisioningEnableAutoSyncModalMessages,
  SharedComponentProps,
  SsoProvisioningTabMessages,
  DirectoryProvisioningConsentStatus,
  IdpKnownResponse,
  IdpManagementPermissions,
  SsoProviderNotificationMessages,
} from '@auth0/universal-components-core';

import type { SsoProvisioningTabEditProps } from '@/types/my-organization/idp-management/sso-provisioning/sso-provisioning-tab-types';

/** Phase of the Google consent flow started in this session. */
export type GoogleWorkspaceConsentPhase = 'idle' | 'waiting' | 'failed';

/** State of Google Workspace provisioning, from the directory provisioning configuration. */
export type GoogleWorkspaceProvisioningState = 'not_connected' | 'connected';

export interface UseGoogleWorkspaceProvisioningServiceOptions {
  customMessages?: Partial<SsoProviderNotificationMessages>;
}

export interface UseGoogleWorkspaceProvisioningServiceReturn {
  config: DirectoryProvisioningConfig | null;
  isConfigLoading: boolean;
  isStartingConsent: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  startConsent: () => Promise<string>;
  verifyConsent: (signal?: AbortSignal) => Promise<{ status: DirectoryProvisioningConsentStatus }>;
  refetchConfig: () => Promise<DirectoryProvisioningConfig | null>;
  setAutoSync: (enabled: boolean) => Promise<DirectoryProvisioningConfig>;
  deleteConfig: () => Promise<void>;
}

export interface UseGoogleWorkspaceProvisioningOptions
  extends Pick<UseGoogleWorkspaceProvisioningServiceOptions, 'customMessages'> {
  provider: IdpKnownResponse;
  permissions: IdpManagementPermissions;
  createAction?: SsoProvisioningTabEditProps['createAction'];
  deleteAction?: SsoProvisioningTabEditProps['deleteAction'];
}

/** Google Workspace provisioning UI state. */
export interface GoogleWorkspaceProvisioningModel {
  state: GoogleWorkspaceProvisioningState;
  config: DirectoryProvisioningConfig | null;
  consentPhase: GoogleWorkspaceConsentPhase;
  isConsentPending: boolean;
  isGranted: boolean;
  wasDisabled: boolean;
  isLoading: boolean;
  isStartingConsent: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isEnableAutoSyncModalOpen: boolean;
  isDisableModalOpen: boolean;
}

/** Google Workspace provisioning actions. */
export interface GoogleWorkspaceProvisioningActions {
  setProvisioningEnabled: (enabled: boolean) => Promise<void>;
  startConsent: () => Promise<void>;
  continueConsent: () => void;
  retryConsent: () => Promise<void>;
  setAutoSync: (enabled: boolean) => Promise<void>;
  confirmEnableAutoSyncModal: () => Promise<void>;
  dismissEnableAutoSyncModal: () => void;
  setDisableModalOpen: (open: boolean) => void;
  confirmDisable: () => Promise<void>;
}

export interface UseGoogleWorkspaceProvisioningReturn {
  model: GoogleWorkspaceProvisioningModel;
  actions: GoogleWorkspaceProvisioningActions;
}

export interface SsoProvisioningGoogleSyncPanelClasses {
  'SsoProvisioningGoogleSyncPanel-root'?: string;
  'SsoProvisioningGoogleSyncPanel-header'?: string;
  'SsoProvisioningGoogleSyncPanel-statusBadge'?: string;
  'SsoProvisioningGoogleSyncPanel-statusAlert'?: string;
  'SsoProvisioningGoogleSyncPanel-connectionInfo'?: string;
  'SsoProvisioningGoogleSyncPanel-actions'?: string;
  'SsoProvisioningGoogleSyncPanel-autoSync'?: string;
  'SsoProvisioningGoogleSyncPanel-errorOverlay'?: string;
  'SsoProvisioningGoogleSyncPanel-enableAutoSyncModal'?: string;
  'SsoProvisioningGoogleSyncPanel-disableModal'?: string;
}

export interface SsoProvisioningGoogleSyncPanelProps
  extends SharedComponentProps<SsoProvisioningTabMessages, SsoProvisioningGoogleSyncPanelClasses> {
  provider: IdpKnownResponse;
  permissions: IdpManagementPermissions;
  readOnly?: boolean;
  createAction?: SsoProvisioningTabEditProps['createAction'];
  deleteAction?: SsoProvisioningTabEditProps['deleteAction'];
}

export interface SsoProvisioningGoogleSyncEnableAutoSyncModalProps {
  open: boolean;
  isLoading: boolean;
  onDismiss: () => void;
  onConfirm: () => void;
  customMessages?: Partial<GoogleWorkspaceProvisioningEnableAutoSyncModalMessages>;
  className?: string;
}

export interface SsoProvisioningGoogleSyncDisableModalProps {
  open: boolean;
  isLoading: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  customMessages?: Partial<GoogleWorkspaceProvisioningDisableModalMessages>;
  className?: string;
}
