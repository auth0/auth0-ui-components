import { describe, expect, it } from 'vitest';

import { createPermissionResolver } from '../permission-map';

const resolve = createPermissionResolver({
  canCreate: ['create:my_org:member_invitations'],
  canResend: ['delete:my_org:member_invitations', 'create:my_org:member_invitations'],
  canShowMenu: { any: ['create:my_org:member_roles', 'delete:my_org:memberships'] },
} as const);

describe('createPermissionResolver', () => {
  describe('array rules', () => {
    it('grants when the required scope is present', () => {
      expect(resolve(['create:my_org:member_invitations']).canCreate).toBe(true);
    });

    it('denies when the required scope is absent', () => {
      expect(resolve(['read:my_org:members']).canCreate).toBe(false);
    });

    it('requires every scope listed', () => {
      expect(resolve(['delete:my_org:member_invitations']).canResend).toBe(false);
      expect(
        resolve(['delete:my_org:member_invitations', 'create:my_org:member_invitations']).canResend,
      ).toBe(true);
    });
  });

  describe('any rules', () => {
    it('grants when at least one scope is present', () => {
      expect(resolve(['delete:my_org:memberships']).canShowMenu).toBe(true);
    });

    it('denies when none of the scopes are present', () => {
      expect(resolve(['read:my_org:members']).canShowMenu).toBe(false);
    });
  });

  describe('when readOnly is true', () => {
    it('denies everything regardless of granted scopes', () => {
      expect(
        resolve(
          [
            'create:my_org:member_invitations',
            'delete:my_org:member_invitations',
            'delete:my_org:memberships',
          ],
          { readOnly: true },
        ),
      ).toEqual({ canCreate: false, canResend: false, canShowMenu: false });
    });
  });

  describe('with no scopes and no options', () => {
    it('denies everything', () => {
      expect(resolve([])).toEqual({
        canCreate: false,
        canResend: false,
        canShowMenu: false,
      });
    });
  });
});
