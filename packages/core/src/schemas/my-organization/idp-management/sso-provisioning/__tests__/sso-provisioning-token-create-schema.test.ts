import { SsoProvisioningMappers } from '@core/services/my-organization/idp-management/sso-provisioning/sso-provisioning-mappers';
import { describe, it, expect } from 'vitest';

import {
  createProvisioningCreateTokenSchema,
  type ProvisioningCreateTokenFormValues,
} from '../sso-provisioning-token-create-schema';
import type { ProvisioningCreateTokenFormRules } from '../sso-provisioning-token-create-schema-types';

const messages = {
  required: 'required',
  integer: 'integer',
  min: 'min',
  max: 'max',
  scopesRequired: 'scopesRequired',
};

const bounded = SsoProvisioningMappers.getCreateTokenFormRules({
  scopes: ['get:users', 'post:users'],
  default_expiry: 3600,
  max_allowed_expiry: 86400,
});
const open = SsoProvisioningMappers.getCreateTokenFormRules(undefined);

const firstError = (
  rules: ProvisioningCreateTokenFormRules,
  values: Partial<ProvisioningCreateTokenFormValues>,
) => {
  const result = createProvisioningCreateTokenSchema(rules, messages).safeParse({
    noExpiration: false,
    tokenLifetime: '',
    scopes: ['get:users'],
    ...values,
  });
  return result.success ? undefined : result.error.issues[0]?.message;
};

describe('createProvisioningCreateTokenSchema', () => {
  it('should accept no expiration with a blank lifetime', () => {
    expect(firstError(open, { noExpiration: true })).toBeUndefined();
  });

  it('should ignore an invalid lifetime when no expiration is checked', () => {
    expect(firstError(bounded, { noExpiration: true, tokenLifetime: '5' })).toBeUndefined();
  });

  it('should require a lifetime when no expiration is clear', () => {
    expect(firstError(open, { tokenLifetime: '' })).toBe('required');
    expect(firstError(open, { tokenLifetime: '   ' })).toBe('required');
  });

  it('should reject a lifetime that is not a whole number', () => {
    expect(firstError(open, { tokenLifetime: '12.5' })).toBe('integer');
    expect(firstError(open, { tokenLifetime: 'abc' })).toBe('integer');
  });

  it('should reject a lifetime below 900 seconds', () => {
    expect(firstError(open, { tokenLifetime: '899' })).toBe('min');
  });

  it('should accept 900 seconds', () => {
    expect(firstError(open, { tokenLifetime: '900' })).toBeUndefined();
  });

  it('should reject a lifetime above max_allowed_expiry', () => {
    expect(firstError(bounded, { tokenLifetime: '86401' })).toBe('max');
  });

  it('should accept max_allowed_expiry', () => {
    expect(firstError(bounded, { tokenLifetime: '86400' })).toBeUndefined();
  });

  it('should accept any lifetime of 900 or more when max is not set', () => {
    expect(firstError(open, { tokenLifetime: '99999999' })).toBeUndefined();
  });

  it('should require at least one scope', () => {
    expect(firstError(open, { noExpiration: true, scopes: [] })).toBe('scopesRequired');
  });
});
