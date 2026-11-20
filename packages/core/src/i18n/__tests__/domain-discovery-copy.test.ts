import { describe, expect, it } from 'vitest';

import enUS from '../translations/en-US.json';

const { domain_discovery: discoveryPrompt, domain_create: domainCreate } = enUS.domain_management;

describe('domain discovery copy', () => {
  it('says discovery takes users to the organization, not to the identity provider login', () => {
    const { description } = discoveryPrompt.modal;

    expect(description).toContain('${domainName}');
    expect(description).toMatch(/taken straight to this organization/);
    expect(description).not.toMatch(/identity provider/i);
  });

  it('explains on the Add Domain checkbox that discovery only starts once the domain is verified', () => {
    const { tooltip } = domainCreate.modal.use_for_discovery;

    expect(tooltip).toMatch(/once the domain is verified/);
    expect(tooltip).toMatch(/taken straight to this organization/);
  });
});
