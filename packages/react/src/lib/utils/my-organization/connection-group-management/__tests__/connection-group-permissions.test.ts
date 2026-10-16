import { describe, expect, it } from 'vitest';

import { getConnectionGroupDetailPermissions } from '../connection-group-permissions';

describe('getConnectionGroupDetailPermissions', () => {
  it('maps each scope to its capability', () => {
    expect(getConnectionGroupDetailPermissions(['read:my_org:group_roles'])).toEqual({
      canViewRoles: true,
      canAssignRoles: false,
      canRemoveRoles: false,
    });
    expect(getConnectionGroupDetailPermissions(['create:my_org:group_roles'])).toEqual({
      canViewRoles: false,
      canAssignRoles: true,
      canRemoveRoles: false,
    });
    expect(getConnectionGroupDetailPermissions(['delete:my_org:group_roles'])).toEqual({
      canViewRoles: false,
      canAssignRoles: false,
      canRemoveRoles: true,
    });
  });

  it('denies only write capabilities when readOnly', () => {
    const all = [
      'read:my_org:group_roles',
      'create:my_org:group_roles',
      'delete:my_org:group_roles',
    ];
    expect(getConnectionGroupDetailPermissions(all, { readOnly: true })).toEqual({
      canViewRoles: true,
      canAssignRoles: false,
      canRemoveRoles: false,
    });
  });

  it('grants everything when enforcement is disabled', () => {
    expect(getConnectionGroupDetailPermissions([], { disablePermissionEnforcement: true })).toEqual(
      { canViewRoles: true, canAssignRoles: true, canRemoveRoles: true },
    );
  });
});
