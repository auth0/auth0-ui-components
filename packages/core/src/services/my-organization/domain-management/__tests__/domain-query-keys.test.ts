import { describe, expect, it } from 'vitest';

import { domainQueryKeys } from '../domain-query-keys';

describe('domainQueryKeys', () => {
  it('keeps every domain provider list under the shared providers key', () => {
    expect(domainQueryKeys.providers('domain_a')).toEqual([
      ...domainQueryKeys.allProviders(),
      'domain_a',
    ]);
    expect(domainQueryKeys.providers('domain_b').slice(0, -1)).toEqual(
      domainQueryKeys.allProviders(),
    );
  });

  it('does not put the domain lists under the providers key', () => {
    expect(domainQueryKeys.list({ pageSize: 10 })).not.toEqual(
      expect.arrayContaining(['providers']),
    );
  });
});
