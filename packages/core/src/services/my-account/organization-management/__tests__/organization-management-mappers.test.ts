import { describe, expect, it } from 'vitest';

import type { OrganizationPrivate } from '../../../my-organization/organization-management/organization-details-types';
import { ORGANIZATION_CREATE_NAME_REGEX } from '../organization-management-constants';
import { UserOrganizationMappers } from '../organization-management-mappers';

const formValues = (overrides: Partial<OrganizationPrivate> = {}): OrganizationPrivate => ({
  name: 'bulba_leaf',
  display_name: 'Bulba Leaf',
  branding: {
    logo_url: 'https://cdn.example.com/logo.png',
    colors: { primary: '#237d68', page_background: '#d2decf' },
  },
  ...overrides,
});

describe('UserOrganizationMappers.createToAPI', () => {
  it('maps every filled field', () => {
    expect(UserOrganizationMappers.createToAPI(formValues())).toEqual({
      name: 'bulba_leaf',
      display_name: 'Bulba Leaf',
      branding: {
        logo_url: 'https://cdn.example.com/logo.png',
        colors: { primary: '#237d68', page_background: '#d2decf' },
      },
    });
  });

  it('trims the name, display name, and logo URL', () => {
    const payload = UserOrganizationMappers.createToAPI(
      formValues({
        name: ' bulba_leaf ',
        display_name: ' Bulba Leaf ',
        branding: {
          logo_url: ' https://cdn.example.com/logo.png ',
          colors: { primary: '#237d68', page_background: '#d2decf' },
        },
      }),
    );

    expect(payload.name).toBe('bulba_leaf');
    expect(payload.display_name).toBe('Bulba Leaf');
    expect(payload.branding?.logo_url).toBe('https://cdn.example.com/logo.png');
  });

  it('omits an empty display name and logo', () => {
    const payload = UserOrganizationMappers.createToAPI(
      formValues({
        display_name: '  ',
        branding: { logo_url: '', colors: { primary: '#237d68', page_background: '#d2decf' } },
      }),
    );

    expect(payload).not.toHaveProperty('display_name');
    expect(payload.branding).not.toHaveProperty('logo_url');
    expect(payload.branding?.colors).toEqual({ primary: '#237d68', page_background: '#d2decf' });
  });

  it('omits colors unless both are set', () => {
    const payload = UserOrganizationMappers.createToAPI(
      formValues({
        branding: {
          logo_url: 'https://cdn.example.com/logo.png',
          colors: { primary: '#237d68', page_background: '' },
        },
      }),
    );

    expect(payload.branding).toEqual({ logo_url: 'https://cdn.example.com/logo.png' });
  });

  it('omits branding when nothing is set', () => {
    const payload = UserOrganizationMappers.createToAPI(
      formValues({ branding: { logo_url: '', colors: { primary: '', page_background: '' } } }),
    );

    expect(payload).not.toHaveProperty('branding');
  });
});

describe('ORGANIZATION_CREATE_NAME_REGEX', () => {
  it.each(['acme', 'bulba_leaf', 'acme-corp-01', 'a', '1org'])('accepts %s', (name) => {
    expect(ORGANIZATION_CREATE_NAME_REGEX.test(name)).toBe(true);
  });

  it.each(['Acme', 'acme corp', '-acme', 'acme_', 'org_acme', 'acme.corp', ''])(
    'rejects "%s"',
    (name) => {
      expect(ORGANIZATION_CREATE_NAME_REGEX.test(name)).toBe(false);
    },
  );
});
