/**
 * Custom message type definitions for Google Workspace provisioning.
 * @module google-workspace-provisioning-types
 * @internal
 */

import type { SharedMessages } from '../../../shared/shared-types';

export interface GoogleWorkspaceProvisioningHeaderMessages {
  title?: string;
  description_disabled?: string;
  description_enabled?: string;
  continue_button_label?: string;
  retry_button_label?: string;
  status?: {
    granted?: string;
    failed?: string;
  };
  provider_disabled_tooltip?: string;
  access_level_required_tooltip?: string;
  enable_tooltip?: string;
  disable_tooltip?: string;
}

export interface GoogleWorkspaceProvisioningConnectionInfoMessages {
  last_synced_label?: string;
}

export interface GoogleWorkspaceProvisioningStatusAlertMessages {
  previously_disabled?: string;
  unconfirmed_authorization?: string;
  sync_failed?: string;
}

export interface GoogleWorkspaceProvisioningAutoSyncMessages {
  title?: string;
  description?: string;
  enable_tooltip?: string;
  disable_tooltip?: string;
}

export interface GoogleWorkspaceProvisioningErrorMessages {
  title?: string;
  retry_button_label?: string;
}

export interface GoogleWorkspaceProvisioningEnableAutoSyncModalMessages {
  title?: string;
  content?: {
    description_enabled?: string;
    description_skip?: string;
  };
  actions?: {
    dismiss_button_label?: string;
    confirm_button_label?: string;
  };
}

export interface GoogleWorkspaceProvisioningDisableModalMessages {
  title?: string;
  content?: {
    description?: string;
  };
  actions?: {
    cancel_button_label?: string;
    confirm_button_label?: string;
  };
}

export interface GoogleWorkspaceProvisioningModalsMessages {
  enable_auto_sync?: GoogleWorkspaceProvisioningEnableAutoSyncModalMessages;
  disable?: GoogleWorkspaceProvisioningDisableModalMessages;
}

export interface GoogleWorkspaceProvisioningMessages extends SharedMessages {
  header?: GoogleWorkspaceProvisioningHeaderMessages;
  connection_info?: GoogleWorkspaceProvisioningConnectionInfoMessages;
  status_alert?: GoogleWorkspaceProvisioningStatusAlertMessages;
  auto_sync?: GoogleWorkspaceProvisioningAutoSyncMessages;
  error?: GoogleWorkspaceProvisioningErrorMessages;
  modals?: GoogleWorkspaceProvisioningModalsMessages;
}

export interface GoogleWorkspaceProvisioningNotificationMessages {
  connected_success?: string;
  connected_with_auto_sync_success?: string;
  connect_error?: string;
  auto_sync_enabled_success?: string;
  auto_sync_disabled_success?: string;
}
