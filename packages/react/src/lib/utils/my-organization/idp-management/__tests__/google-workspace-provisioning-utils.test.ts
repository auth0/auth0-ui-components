import type { DirectoryProvisioningConfig } from '@auth0/universal-components-core';
import { describe, expect, it } from 'vitest';

import {
  getConnectBlockReason,
  getConsentBadge,
  getLastSyncedAt,
  getSyncAlert,
  getToggleBlockReason,
} from '../google-workspace-provisioning-utils';

const config: DirectoryProvisioningConfig = {
  connection_id: 'con_123',
  connection_name: 'google-workspace',
  strategy: 'google-apps',
  synchronize_automatically: true,
  status: 'complete',
  created_at: '2026-08-01T10:00:00.000Z',
  updated_at: '2026-08-01T10:00:00.000Z',
  last_synchronization_at: '2026-09-07T02:00:00.000Z',
  last_synchronization_status: 'completed',
};

describe('google-workspace-provisioning-utils', () => {
  describe('getLastSyncedAt', () => {
    it('parses the last synchronization time', () => {
      expect(getLastSyncedAt(config)).toBe(Date.parse('2026-09-07T02:00:00.000Z'));
    });

    it.each([
      ['there is no configuration', null],
      ['it has never synchronized', { ...config, last_synchronization_at: undefined }],
    ])('is NaN when %s', (_, value) => {
      expect(getLastSyncedAt(value)).toBeNaN();
    });
  });

  describe('getSyncAlert', () => {
    it('has nothing to show without a configuration', () => {
      expect(getSyncAlert(null)).toBeUndefined();
    });

    it('shows the error when the last sync failed', () => {
      expect(getSyncAlert({ ...config, last_synchronization_status: 'failed' })).toBe(
        'sync_failed',
      );
    });

    it('prefers the error over the unconfirmed warning', () => {
      expect(
        getSyncAlert({
          ...config,
          last_synchronization_at: undefined,
          last_synchronization_status: 'failed',
        }),
      ).toBe('sync_failed');
    });

    it.each([
      ['never synchronized', { ...config, last_synchronization_at: undefined }],
      [
        'last synchronized before the configuration was created',
        { ...config, last_synchronization_at: '2026-07-01T00:00:00.000Z' },
      ],
    ])('warns when the directory %s', (_, value) => {
      expect(getSyncAlert(value)).toBe('unconfirmed_authorization');
    });

    it('is hidden after a completed sync since the configuration was created', () => {
      expect(getSyncAlert(config)).toBeUndefined();
    });

    it('is hidden for a sync time equal to the creation time', () => {
      expect(getSyncAlert({ ...config, last_synchronization_at: config.created_at })).toBe(
        undefined,
      );
    });
  });

  describe('getConsentBadge', () => {
    it.each([
      [{ isFailed: true, isGranted: true, isConnected: true }, 'failed'],
      [{ isFailed: false, isGranted: true, isConnected: true }, 'granted'],
      [{ isFailed: false, isGranted: true, isConnected: false }, undefined],
      [{ isFailed: false, isGranted: false, isConnected: true }, undefined],
    ])('maps %j to %s', (state, expected) => {
      expect(getConsentBadge(state)).toBe(expected);
    });
  });

  describe('getConnectBlockReason', () => {
    const allowed = {
      isProviderEnabled: true,
      canCreateProvisioning: true,
      hasFullAccessLevel: true,
      isActionDisabled: false,
    };

    it('has no reason when everything is allowed', () => {
      expect(getConnectBlockReason(allowed)).toBeUndefined();
    });

    it.each([
      [{ ...allowed, isProviderEnabled: false, canCreateProvisioning: false }, 'provider_disabled'],
      [{ ...allowed, canCreateProvisioning: false, hasFullAccessLevel: false }, 'forbidden'],
      [{ ...allowed, hasFullAccessLevel: false, isActionDisabled: true }, 'access_level_required'],
      [{ ...allowed, isActionDisabled: true }, 'action_disabled'],
    ])('explains %j as %s, in that order', (state, expected) => {
      expect(getConnectBlockReason(state)).toBe(expected);
    });
  });

  describe('getToggleBlockReason', () => {
    const usable = {
      isProviderEnabled: true,
      canToggle: true,
      isConnected: false,
      hasFullAccessLevel: true,
      hasTogglePermission: true,
      readOnly: false,
    };

    it('has no reason when the switch is usable', () => {
      expect(getToggleBlockReason(usable)).toBeUndefined();
    });

    it('reports a disabled provider first', () => {
      expect(getToggleBlockReason({ ...usable, isProviderEnabled: false, canToggle: false })).toBe(
        'provider_disabled',
      );
    });

    it('asks for full access before connecting', () => {
      expect(getToggleBlockReason({ ...usable, canToggle: false, hasFullAccessLevel: false })).toBe(
        'access_level_required',
      );
    });

    it('does not ask for access level once connected', () => {
      expect(
        getToggleBlockReason({
          ...usable,
          canToggle: false,
          isConnected: true,
          hasFullAccessLevel: false,
          hasTogglePermission: false,
        }),
      ).toBe('forbidden');
    });

    it.each([
      ['read-only', { readOnly: true }],
      ['missing the permission', { hasTogglePermission: false }],
    ])('is forbidden when %s', (_, patch) => {
      expect(getToggleBlockReason({ ...usable, canToggle: false, ...patch })).toBe('forbidden');
    });

    it('reports the action as disabled when nothing else blocks the switch', () => {
      expect(getToggleBlockReason({ ...usable, canToggle: false })).toBe('action_disabled');
    });
  });
});
