import { describe, expect, it } from 'vitest';

import { getOrganizationDetailsPermissions } from '../organization-details-permissions';

describe('getOrganizationDetailsPermissions', () => {
  describe('canDeleteOrganization', () => {
    it('grants delete with the delete:my_org:organizations scope', () => {
      expect(
        getOrganizationDetailsPermissions(['delete:my_org:organizations']).canDeleteOrganization,
      ).toBe(true);
    });

    it('denies delete when only update:my_org:details is granted', () => {
      const permissions = getOrganizationDetailsPermissions(['update:my_org:details']);

      expect(permissions.canDeleteOrganization).toBe(false);
      expect(permissions.canUpdateDetails).toBe(true);
    });

    it('denies delete in readOnly mode even with the scope granted', () => {
      expect(
        getOrganizationDetailsPermissions(['delete:my_org:organizations'], { readOnly: true })
          .canDeleteOrganization,
      ).toBe(false);
    });

    it('grants delete when permission enforcement is disabled', () => {
      expect(
        getOrganizationDetailsPermissions([], { disablePermissionEnforcement: true })
          .canDeleteOrganization,
      ).toBe(true);
    });
  });
});
