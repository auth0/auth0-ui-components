import type { UpdateIdentityProviderRequestContentPrivate } from '@auth0/universal-components-core';
import { describe, expect, it } from 'vitest';

import {
  getProviderAccess,
  getProviderAccessLevel,
  pickLimitedUpdateFields,
} from '@/lib/utils/my-organization/idp-management/idp-management-utils';

describe('getProviderAccessLevel', () => {
  it('returns the reported access level', () => {
    expect(getProviderAccessLevel({ access_level: 'limited' })).toBe('limited');
  });

  it.each([null, undefined, {}])('defaults to full when none is reported (%o)', (provider) => {
    expect(getProviderAccessLevel(provider)).toBe('full');
  });
});

describe('getProviderAccess', () => {
  it('allows everything with full access', () => {
    expect(getProviderAccess({ access_level: 'full' })).toEqual({
      accessLevel: 'full',
      canEditDetails: true,
      canEditLoginSettings: true,
      canToggle: true,
      canDetach: true,
      canDelete: true,
      canManageDomains: true,
      canSyncAttributes: true,
    });
  });

  it('allows login settings, enabling, removing and syncing with limited access', () => {
    expect(getProviderAccess({ access_level: 'limited' })).toEqual({
      accessLevel: 'limited',
      canEditDetails: false,
      canEditLoginSettings: true,
      canToggle: true,
      canDetach: true,
      canDelete: false,
      canManageDomains: false,
      canSyncAttributes: true,
    });
  });

  it.each(['readonly', 'none'] as const)('allows nothing with %s access', (accessLevel) => {
    expect(getProviderAccess({ access_level: accessLevel })).toEqual({
      accessLevel,
      canEditDetails: false,
      canEditLoginSettings: false,
      canToggle: false,
      canDetach: false,
      canDelete: false,
      canManageDomains: false,
      canSyncAttributes: false,
    });
  });

  it('treats a provider without an access level as full', () => {
    expect(getProviderAccess(null).canEditDetails).toBe(true);
  });
});

describe('pickLimitedUpdateFields', () => {
  it('keeps only the fields limited access may update', () => {
    const update: UpdateIdentityProviderRequestContentPrivate = {
      strategy: 'okta',
      display_name: 'Renamed',
      show_as_button: true,
      assign_membership_on_login: false,
      is_enabled: true,
      use_for_third_party_client_access: true,
      client_id: 'new-client-id',
    };

    expect(pickLimitedUpdateFields(update)).toEqual({
      strategy: 'okta',
      show_as_button: true,
      assign_membership_on_login: false,
      is_enabled: true,
    });
  });

  it('leaves out fields the update does not set, instead of sending them as undefined', () => {
    const picked = pickLimitedUpdateFields({
      strategy: 'okta',
      show_as_button: true,
    } as UpdateIdentityProviderRequestContentPrivate);

    expect(Object.keys(picked).sort()).toEqual(['show_as_button', 'strategy']);
  });
});
