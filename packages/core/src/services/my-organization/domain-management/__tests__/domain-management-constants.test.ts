import { MyOrganization } from '@auth0/myorganization-js';
import { describe, it, expect } from 'vitest';

import {
  DEFAULT_DOMAIN_VERIFICATION_MODE,
  DOMAIN_VERIFICATION_MODES,
} from '../domain-management-constants';

describe('domain-management-constants', () => {
  it('lists the three modes the API supports', () => {
    expect(Object.values(DOMAIN_VERIFICATION_MODES).sort()).toEqual([
      'none',
      'optional',
      'required',
    ]);
  });

  it('matches the values the SDK reports', () => {
    const sdkModes = Object.values(MyOrganization.IdentityProvidersConfigDomainVerificationEnum);

    expect(Object.values(DOMAIN_VERIFICATION_MODES).sort()).toEqual([...sdkModes].sort());
  });

  it('defaults to optional, which is what the API reports when unconfigured', () => {
    expect(DEFAULT_DOMAIN_VERIFICATION_MODE).toBe(DOMAIN_VERIFICATION_MODES.OPTIONAL);
  });
});
