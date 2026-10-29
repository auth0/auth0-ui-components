import { describe, expect, it } from 'vitest';

import { idpConfigQueryKeys } from '../config-query-keys';

describe('idpConfigQueryKeys', () => {
  it('scopes instruction keys under the idp config namespace', () => {
    expect(idpConfigQueryKeys.instructions('okta', 'en')).toEqual([
      'idp-config',
      'instructions',
      'okta',
      'en',
    ]);
  });

  it('scopes provisioning instruction keys under the idp config namespace', () => {
    expect(idpConfigQueryKeys.provisioningInstructions('waad', 'en')).toEqual([
      'idp-config',
      'provisioning-instructions',
      'waad',
      'en',
    ]);
  });

  it('keeps creation and provisioning instructions in separate cache entries', () => {
    expect(idpConfigQueryKeys.instructions('okta', 'en')).not.toEqual(
      idpConfigQueryKeys.provisioningInstructions('okta', 'en'),
    );
  });

  it('includes the strategy so each strategy is cached on its own', () => {
    expect(idpConfigQueryKeys.instructions('okta', 'en')).not.toEqual(
      idpConfigQueryKeys.instructions('samlp', 'en'),
    );
  });
});
