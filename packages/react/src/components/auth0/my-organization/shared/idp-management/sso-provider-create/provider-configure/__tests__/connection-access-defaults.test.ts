import { STRATEGIES } from '@auth0/universal-components-core';
import { describe, it, expect } from 'vitest';

import {
  CROSS_APP_ACCESS_STRATEGIES,
  getConnectionAccessDefaults,
} from '@/components/auth0/my-organization/shared/idp-management/sso-provider-create/provider-configure/connection-access-defaults';

describe('getConnectionAccessDefaults', () => {
  it('should default use_for_third_party_client_access to false when there is no initialData', () => {
    expect(getConnectionAccessDefaults(STRATEGIES.WAAD).use_for_third_party_client_access).toBe(
      false,
    );
  });

  it('should read use_for_third_party_client_access from initialData', () => {
    const result = getConnectionAccessDefaults(STRATEGIES.ADFS, {
      use_for_third_party_client_access: true,
    });
    expect(result.use_for_third_party_client_access).toBe(true);
  });

  it.each(CROSS_APP_ACCESS_STRATEGIES)(
    'should seed cross_app_access_resource_app from the config default for %s',
    (strategy) => {
      expect(getConnectionAccessDefaults(strategy, undefined, 'enabled')).toHaveProperty(
        'cross_app_access_resource_app',
        { status: 'enabled' },
      );
    },
  );

  it('should prefer initialData cross_app_access_resource_app over the config default', () => {
    const result = getConnectionAccessDefaults(
      STRATEGIES.OIDC,
      { cross_app_access_resource_app: { status: 'disabled' } },
      'enabled',
    );
    expect(result.cross_app_access_resource_app).toEqual({ status: 'disabled' });
  });

  it('should leave cross_app_access_resource_app undefined when there is no initial or default value', () => {
    expect(
      getConnectionAccessDefaults(STRATEGIES.OKTA).cross_app_access_resource_app,
    ).toBeUndefined();
  });

  it.each([STRATEGIES.WAAD, STRATEGIES.ADFS, STRATEGIES.GOOGLE_APPS, STRATEGIES.PINGFEDERATE])(
    'should omit cross_app_access_resource_app for non-XAA strategy %s',
    (strategy) => {
      const result = getConnectionAccessDefaults(
        strategy,
        { cross_app_access_resource_app: { status: 'enabled' } },
        'enabled',
      );
      expect(result).not.toHaveProperty('cross_app_access_resource_app');
    },
  );
});
