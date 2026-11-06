import { describe, expect, it } from 'vitest';

import { getIdpManagementPermissions } from '../idp-management-permissions';

describe('getIdpManagementPermissions', () => {
  describe('canReadConfiguration', () => {
    it('grants when read:my_org:configuration is present', () => {
      expect(getIdpManagementPermissions(['read:my_org:configuration']).canReadConfiguration).toBe(
        true,
      );
    });

    it('denies when read:my_org:configuration is absent', () => {
      expect(
        getIdpManagementPermissions(['read:my_org:identity_providers']).canReadConfiguration,
      ).toBe(false);
    });

    it('denies in readOnly mode', () => {
      expect(
        getIdpManagementPermissions(['read:my_org:configuration'], { readOnly: true })
          .canReadConfiguration,
      ).toBe(false);
    });
  });
});
