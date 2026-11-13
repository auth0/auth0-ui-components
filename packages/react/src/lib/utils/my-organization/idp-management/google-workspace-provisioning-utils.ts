/**
 * Pure helpers for the Google Workspace provisioning panel.
 * @module google-workspace-provisioning-utils
 * @internal
 */

import type { DirectoryProvisioningConfig } from '@auth0/universal-components-core';

export type GoogleSyncAlert = 'sync_failed' | 'unconfirmed_authorization';

export type GoogleConsentBadge = 'failed' | 'granted';

/**
 * Why a control is unavailable. `action_disabled` means the integrator turned the action off, which
 * has no explanation to show the user.
 */
export type GoogleBlockReason =
  | 'provider_disabled'
  | 'access_level_required'
  | 'forbidden'
  | 'action_disabled';

/**
 * Time of the last synchronization.
 * @param config - Directory provisioning configuration.
 * @returns Epoch milliseconds, or `NaN` when the directory has never been synchronized.
 */
export function getLastSyncedAt(config: DirectoryProvisioningConfig | null): number {
  return config?.last_synchronization_at ? Date.parse(config.last_synchronization_at) : NaN;
}

/**
 * Decides which authorization warning to show. A failed sync is an error; a sync that has not run
 * since the configuration was created leaves the authorization unconfirmed.
 * @param config - Directory provisioning configuration.
 * @returns The alert to show, or `undefined` when there is nothing to warn about.
 */
export function getSyncAlert(
  config: DirectoryProvisioningConfig | null,
): GoogleSyncAlert | undefined {
  if (!config) return undefined;
  if (config.last_synchronization_status === 'failed') return 'sync_failed';

  const lastSyncedAt = getLastSyncedAt(config);
  if (Number.isNaN(lastSyncedAt) || lastSyncedAt < Date.parse(config.created_at)) {
    return 'unconfirmed_authorization';
  }
  return undefined;
}

/**
 * Badge shown next to the title.
 * @param state - Current consent and connection state.
 * @param state.isFailed - The consent flow failed.
 * @param state.isGranted - Access was granted in this session.
 * @param state.isConnected - A configuration exists.
 * @returns The badge to show, if any.
 */
export function getConsentBadge({
  isFailed,
  isGranted,
  isConnected,
}: {
  isFailed: boolean;
  isGranted: boolean;
  isConnected: boolean;
}): GoogleConsentBadge | undefined {
  if (isFailed) return 'failed';
  if (isGranted && isConnected) return 'granted';
  return undefined;
}

/**
 * Why the Continue with Google button cannot be used.
 * @param state - What the user and the provider allow.
 * @param state.isProviderEnabled - The provider is enabled.
 * @param state.canCreateProvisioning - The user may create provisioning.
 * @param state.hasFullAccessLevel - The provider has full access level.
 * @param state.isActionDisabled - The integrator disabled the create action.
 * @returns The reason, or `undefined` when the button is usable.
 */
export function getConnectBlockReason({
  isProviderEnabled,
  canCreateProvisioning,
  hasFullAccessLevel,
  isActionDisabled,
}: {
  isProviderEnabled: boolean;
  canCreateProvisioning: boolean;
  hasFullAccessLevel: boolean;
  isActionDisabled: boolean;
}): GoogleBlockReason | undefined {
  if (!isProviderEnabled) return 'provider_disabled';
  if (!canCreateProvisioning) return 'forbidden';
  if (!hasFullAccessLevel) return 'access_level_required';
  if (isActionDisabled) return 'action_disabled';
  return undefined;
}

/**
 * Why the provisioning switch cannot be used.
 * @param state - What the user and the provider allow.
 * @param state.isProviderEnabled - The provider is enabled.
 * @param state.canToggle - The switch can be used.
 * @param state.isConnected - A configuration exists.
 * @param state.hasFullAccessLevel - The provider has full access level.
 * @param state.hasTogglePermission - The user may create or delete provisioning, as applicable.
 * @param state.readOnly - The component is read-only.
 * @returns The reason, or `undefined` when the switch is usable.
 */
export function getToggleBlockReason({
  isProviderEnabled,
  canToggle,
  isConnected,
  hasFullAccessLevel,
  hasTogglePermission,
  readOnly,
}: {
  isProviderEnabled: boolean;
  canToggle: boolean;
  isConnected: boolean;
  hasFullAccessLevel: boolean;
  hasTogglePermission: boolean;
  readOnly: boolean;
}): GoogleBlockReason | undefined {
  if (!isProviderEnabled) return 'provider_disabled';
  if (canToggle) return undefined;
  if (!isConnected && !hasFullAccessLevel) return 'access_level_required';
  if (readOnly || !hasTogglePermission) return 'forbidden';
  return 'action_disabled';
}
