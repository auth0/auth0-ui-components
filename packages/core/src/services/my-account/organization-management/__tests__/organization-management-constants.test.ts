import { describe, expect, it } from 'vitest';

import {
  ORGANIZATION_CREATE_LOGO_URL_REGEX,
  ORGANIZATION_CREATE_NAME_REGEX,
} from '../organization-management-constants';

describe('ORGANIZATION_CREATE_NAME_REGEX', () => {
  it.each(['acme', 'acme-corp', 'acme_corp', 'a', 'a1', '1a'])('accepts %s', (name) => {
    expect(ORGANIZATION_CREATE_NAME_REGEX.test(name)).toBe(true);
  });

  it.each(['', 'Acme', 'org_acme', '-acme', 'acme-', '_acme', 'acme_', 'ac me'])(
    'rejects %s',
    (name) => {
      expect(ORGANIZATION_CREATE_NAME_REGEX.test(name)).toBe(false);
    },
  );
});

describe('ORGANIZATION_CREATE_LOGO_URL_REGEX', () => {
  it('accepts an https URL', () => {
    expect(ORGANIZATION_CREATE_LOGO_URL_REGEX.test('https://example.com/logo.png')).toBe(true);
  });

  it.each(['http://example.com/logo.png', 'ftp://example.com/logo.png', 'example.com/logo.png'])(
    'rejects %s',
    (url) => {
      expect(ORGANIZATION_CREATE_LOGO_URL_REGEX.test(url)).toBe(false);
    },
  );

  it('rejects a URL with whitespace', () => {
    expect(ORGANIZATION_CREATE_LOGO_URL_REGEX.test('https://example.com/my logo.png')).toBe(false);
  });

  it('accepts a URL of exactly 1024 characters and rejects one of 1025', () => {
    const prefix = 'https://example.com/';
    expect(ORGANIZATION_CREATE_LOGO_URL_REGEX.test(prefix + 'a'.repeat(1024 - prefix.length))).toBe(
      true,
    );
    expect(ORGANIZATION_CREATE_LOGO_URL_REGEX.test(prefix + 'a'.repeat(1025 - prefix.length))).toBe(
      false,
    );
  });
});
