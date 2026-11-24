import { describe, expect, it } from 'vitest';

import { AVAILABLE_STRATEGY_LIST, STRATEGY_TO_CONFIG_KEY } from '../sso-provider-constants';

describe('STRATEGY_TO_CONFIG_KEY', () => {
  it('maps every strategy to its identity provider configuration key', () => {
    expect(Object.keys(STRATEGY_TO_CONFIG_KEY).sort()).toEqual([...AVAILABLE_STRATEGY_LIST].sort());
  });

  it('uses googleapps for google-apps and the strategy name otherwise', () => {
    expect(STRATEGY_TO_CONFIG_KEY['google-apps']).toBe('googleapps');
    expect(STRATEGY_TO_CONFIG_KEY.samlp).toBe('samlp');
    expect(STRATEGY_TO_CONFIG_KEY.okta).toBe('okta');
  });
});
