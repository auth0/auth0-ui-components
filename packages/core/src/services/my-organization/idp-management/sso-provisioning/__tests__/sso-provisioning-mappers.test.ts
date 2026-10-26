import { describe, it, expect } from 'vitest';

import { ALL_SCIM_TOKEN_SCOPES } from '../sso-provisioning-constants';
import { SsoProvisioningMappers } from '../sso-provisioning-mappers';

const bounded = SsoProvisioningMappers.getCreateTokenFormRules({
  scopes: ['get:users', 'post:users'],
  default_expiry: 3600,
  max_allowed_expiry: 86400,
});
const open = SsoProvisioningMappers.getCreateTokenFormRules(undefined);

describe('SsoProvisioningMappers', () => {
  describe('getCreateTokenFormRules', () => {
    it('should use all scopes and no limits when no config exist', () => {
      expect(open).toEqual({
        defaultExpiry: null,
        maxAllowedExpiry: null,
        allowedScopes: ALL_SCIM_TOKEN_SCOPES,
      });
    });

    it('should use all scopes when the profile scope list is empty', () => {
      expect(SsoProvisioningMappers.getCreateTokenFormRules({ scopes: [] }).allowedScopes).toEqual(
        ALL_SCIM_TOKEN_SCOPES,
      );
    });

    it('should use the profile limits and scopes', () => {
      expect(bounded).toEqual({
        defaultExpiry: 3600,
        maxAllowedExpiry: 86400,
        allowedScopes: ['get:users', 'post:users'],
      });
    });
  });

  describe('getCreateTokenFormDefaults', () => {
    it('should pre-fill the profile default lifetime and check all scopes', () => {
      expect(SsoProvisioningMappers.getCreateTokenFormDefaults(bounded)).toEqual({
        noExpiration: false,
        tokenLifetime: '3600',
        scopes: ['get:users', 'post:users'],
      });
    });

    it('should leave the lifetime blank when the profile has no default', () => {
      expect(SsoProvisioningMappers.getCreateTokenFormDefaults(open).tokenLifetime).toBe('');
    });
  });

  describe('createScimTokenToAPI', () => {
    it('should omit token_lifetime for no expiration', () => {
      expect(
        SsoProvisioningMappers.createScimTokenToAPI({
          noExpiration: true,
          tokenLifetime: '5000',
          scopes: ['get:users'],
        }),
      ).toEqual({});
    });

    it('should send token_lifetime as a number', () => {
      expect(
        SsoProvisioningMappers.createScimTokenToAPI({
          noExpiration: false,
          tokenLifetime: ' 7200 ',
          scopes: ['get:users'],
        }),
      ).toEqual({ token_lifetime: 7200 });
    });

    it('should not send scopes because the SDK request has no scopes field', () => {
      expect(
        SsoProvisioningMappers.createScimTokenToAPI({
          noExpiration: false,
          tokenLifetime: '7200',
          scopes: ['get:users'],
        }),
      ).not.toHaveProperty('scopes');
    });
  });
});
