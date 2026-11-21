import { describe, expect, it } from 'vitest';

import { idpConfigQueryKeys } from '../../config-query-keys';
import { idpInstructionsQueryKeys } from '../instructions-query-keys';

describe('idpInstructionsQueryKeys', () => {
  it('scopes creation instructions under their own namespace', () => {
    expect(idpInstructionsQueryKeys.creation('okta', 'en')).toEqual([
      'idp-instructions',
      'creation',
      'okta',
      'en',
    ]);
  });

  it('scopes provisioning instructions under their own namespace', () => {
    expect(idpInstructionsQueryKeys.provisioning('waad', 'en')).toEqual([
      'idp-instructions',
      'provisioning',
      'waad',
      'en',
    ]);
  });

  it('keeps creation and provisioning instructions in separate cache entries', () => {
    expect(idpInstructionsQueryKeys.creation('okta', 'en')).not.toEqual(
      idpInstructionsQueryKeys.provisioning('okta', 'en'),
    );
  });

  it('includes the strategy so each strategy is cached on its own', () => {
    expect(idpInstructionsQueryKeys.creation('okta', 'en')).not.toEqual(
      idpInstructionsQueryKeys.creation('samlp', 'en'),
    );
  });

  it('stays outside the idp config namespace', () => {
    expect(idpInstructionsQueryKeys.all).not.toEqual(idpConfigQueryKeys.all);
  });
});
