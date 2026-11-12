import { describe, expect, it } from 'vitest';

import { getIdpManagementPermissions } from '../idp-management-permissions';

describe('getIdpManagementPermissions', () => {
  describe('canTestProvider', () => {
    describe('when both test scopes are granted', () => {
      it('should grant testing', () => {
        expect(
          getIdpManagementPermissions([
            'create:my_org:identity_providers_tests',
            'read:my_org:identity_providers_tests',
          ]).canTestProvider,
        ).toBe(true);
      });
    });

    describe('when only the create scope is granted', () => {
      it('should deny testing because results cannot be polled', () => {
        expect(
          getIdpManagementPermissions(['create:my_org:identity_providers_tests']).canTestProvider,
        ).toBe(false);
      });
    });

    describe('when only the read scope is granted', () => {
      it('should deny testing', () => {
        expect(
          getIdpManagementPermissions(['read:my_org:identity_providers_tests']).canTestProvider,
        ).toBe(false);
      });
    });

    describe('when readOnly is set', () => {
      it('should deny testing', () => {
        expect(
          getIdpManagementPermissions(
            ['create:my_org:identity_providers_tests', 'read:my_org:identity_providers_tests'],
            { readOnly: true },
          ).canTestProvider,
        ).toBe(false);
      });
    });
  });
});
