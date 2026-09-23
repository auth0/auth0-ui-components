import { describe, expect, it } from 'vitest';

import { hasAllPermissions, hasAnyPermission } from '../permission-utils';

describe('permission-utils', () => {
  describe('hasAnyPermission', () => {
    it('returns true when at least one permission is present', () => {
      expect(
        hasAnyPermission(
          ['read:my_org:members'],
          ['delete:my_org:memberships', 'read:my_org:members'],
        ),
      ).toBe(true);
    });

    it('returns false when none of the permissions are present', () => {
      expect(
        hasAnyPermission(
          ['read:my_org:members'],
          ['delete:my_org:memberships', 'create:my_org:member_roles'],
        ),
      ).toBe(false);
    });

    it('returns true when the required list is empty (vacuously satisfied)', () => {
      expect(hasAnyPermission([], [])).toBe(true);
    });
  });

  describe('hasAllPermissions', () => {
    it('returns true only when every required permission is present', () => {
      expect(
        hasAllPermissions(
          ['read:my_org:members', 'delete:my_org:memberships'],
          ['read:my_org:members', 'delete:my_org:memberships'],
        ),
      ).toBe(true);
    });

    it('returns false when any required permission is missing', () => {
      expect(
        hasAllPermissions(
          ['read:my_org:members'],
          ['read:my_org:members', 'delete:my_org:memberships'],
        ),
      ).toBe(false);
    });

    it('returns true when the required list is empty (vacuously satisfied)', () => {
      expect(hasAllPermissions([], [])).toBe(true);
    });
  });
});
