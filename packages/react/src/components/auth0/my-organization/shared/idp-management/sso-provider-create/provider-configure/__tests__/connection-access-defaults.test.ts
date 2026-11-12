import { describe, it, expect } from 'vitest';

import { getConnectionAccessDefaults } from '@/components/auth0/my-organization/shared/idp-management/sso-provider-create/provider-configure/connection-access-defaults';

describe('getConnectionAccessDefaults', () => {
  it('should default use_for_third_party_client_access to false when there is no initialData', () => {
    expect(getConnectionAccessDefaults().use_for_third_party_client_access).toBe(false);
  });

  it('should leave use_for_third_party_client_access undefined in edit mode when initialData omits it', () => {
    const result = getConnectionAccessDefaults({}, undefined, 'edit');
    expect(result.use_for_third_party_client_access).toBeUndefined();
  });

  it('should keep an explicit use_for_third_party_client_access value in edit mode', () => {
    const result = getConnectionAccessDefaults(
      { use_for_third_party_client_access: false },
      undefined,
      'edit',
    );
    expect(result.use_for_third_party_client_access).toBe(false);
  });

  it('should read use_for_third_party_client_access from initialData', () => {
    const result = getConnectionAccessDefaults({ use_for_third_party_client_access: true });
    expect(result.use_for_third_party_client_access).toBe(true);
  });

  it('should seed cross_app_access_resource_app from the config default when showCrossAppAccess is true', () => {
    expect(getConnectionAccessDefaults(undefined, 'enabled', 'create', true)).toHaveProperty(
      'cross_app_access_resource_app',
      { status: 'enabled' },
    );
  });

  it('should prefer initialData cross_app_access_resource_app over the config default', () => {
    const result = getConnectionAccessDefaults(
      { cross_app_access_resource_app: { status: 'disabled' } },
      'enabled',
      'create',
      true,
    );
    expect(result.cross_app_access_resource_app).toEqual({ status: 'disabled' });
  });

  it('should leave cross_app_access_resource_app undefined when there is no initial or default value', () => {
    expect(
      getConnectionAccessDefaults(undefined, undefined, 'create', true)
        .cross_app_access_resource_app,
    ).toBeUndefined();
  });

  it('should omit cross_app_access_resource_app when showCrossAppAccess is false', () => {
    const result = getConnectionAccessDefaults(
      { cross_app_access_resource_app: { status: 'enabled' } },
      'enabled',
    );
    expect(result).not.toHaveProperty('cross_app_access_resource_app');
  });
});
