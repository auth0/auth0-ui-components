import { describe, expect, it } from 'vitest';

import type { GetIdpConfigurationResponseContent } from '../../../config/config-types';
import {
  getStrategyUserAttributes,
  toProvisioningAttributeMappings,
  toSsoAttributeMappings,
} from '../sso-provider-user-attributes';

const IDP_CONFIG = {
  organization: { can_set_show_as_button: true, can_set_assign_membership_on_login: false },
  strategies: {
    oidc: {
      enabled_features: ['provisioning'],
      provisioning_methods: ['scim'],
      user_attributes: {
        given_name: {
          description: 'First name',
          label: 'Given Name',
          profile_required: false,
          sso_field_name: 'given_name',
          provisioning_field_name: 'name.givenName',
        },
        preferred_username: {
          description: 'Preferred username',
          label: 'Preferred username',
          profile_required: false,
          provisioning_field_name: 'userName',
        },
      },
    },
    adfs: {
      enabled_features: [],
      provisioning_methods: [],
      user_attributes: {
        given_name: {
          description: 'First name',
          label: 'Given Name',
          profile_required: false,
          sso_field_name: [
            'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
            'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
          ],
        },
        email: {
          description: 'Email',
          label: 'Email',
          profile_required: true,
          sso_field_name: 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
        },
      },
    },
    googleapps: {
      enabled_features: ['provisioning'],
      provisioning_methods: ['google_workspace'],
      user_attributes: {},
    },
    okta: { enabled_features: [], provisioning_methods: [] },
  },
} as unknown as GetIdpConfigurationResponseContent;

describe('sso-provider-user-attributes', () => {
  describe('getStrategyUserAttributes', () => {
    it('reads the strategy entry, mapping google-apps to its config key', () => {
      expect(Object.keys(getStrategyUserAttributes(IDP_CONFIG, 'adfs')!)).toEqual([
        'given_name',
        'email',
      ]);
      expect(getStrategyUserAttributes(IDP_CONFIG, 'google-apps')).toEqual({});
    });

    it('returns undefined when the response has no user attributes for the strategy', () => {
      expect(getStrategyUserAttributes(IDP_CONFIG, 'okta')).toBeUndefined();
      expect(getStrategyUserAttributes(IDP_CONFIG, 'waad')).toBeUndefined();
      expect(getStrategyUserAttributes(null, 'adfs')).toBeUndefined();
      expect(getStrategyUserAttributes(IDP_CONFIG, undefined)).toBeUndefined();
    });
  });

  describe('toSsoAttributeMappings', () => {
    it('lists required attributes first and turns the SSO field into a list', () => {
      expect(toSsoAttributeMappings(getStrategyUserAttributes(IDP_CONFIG, 'adfs')!)).toEqual([
        {
          user_attribute: 'email',
          label: 'Email',
          description: 'Email',
          is_required: true,
          is_extra: false,
          is_missing: false,
          sso_field: ['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
        },
        {
          user_attribute: 'given_name',
          label: 'Given Name',
          description: 'First name',
          is_required: false,
          is_extra: false,
          is_missing: false,
          sso_field: [
            'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
            'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
          ],
        },
      ]);
    });

    it('leaves out attributes that only have a provisioning field', () => {
      const mappings = toSsoAttributeMappings(getStrategyUserAttributes(IDP_CONFIG, 'oidc')!);
      expect(mappings.map((item) => item.user_attribute)).toEqual(['given_name']);
    });

    it('falls back to the id when there is no label', () => {
      expect(toSsoAttributeMappings({ nickname: { sso_field_name: 'nickname' } })[0]).toMatchObject(
        { user_attribute: 'nickname', label: 'nickname', is_required: false },
      );
    });

    it('returns an empty list for no attributes', () => {
      expect(toSsoAttributeMappings({})).toEqual([]);
    });
  });

  describe('toProvisioningAttributeMappings', () => {
    it('lists attributes with a provisioning field', () => {
      const mappings = toProvisioningAttributeMappings(
        getStrategyUserAttributes(IDP_CONFIG, 'oidc')!,
      );
      expect(mappings).toEqual([
        expect.objectContaining({
          user_attribute: 'given_name',
          provisioning_field: 'name.givenName',
        }),
        expect.objectContaining({
          user_attribute: 'preferred_username',
          provisioning_field: 'userName',
        }),
      ]);
    });
  });
});
