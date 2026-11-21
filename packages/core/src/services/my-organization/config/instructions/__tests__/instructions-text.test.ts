import { describe, expect, it } from 'vitest';

import {
  dedentText,
  isExternalUrl,
  resolveAssetUrl,
  substitutePlaceholders,
} from '../instructions-text';

describe('dedentText', () => {
  it('removes indentation shared by all lines', () => {
    expect(dedentText('    Step one\n      nested\n    Step two')).toBe(
      'Step one\n  nested\nStep two',
    );
  });

  it('ignores blank lines when measuring indentation', () => {
    expect(dedentText('  a\n\n  b')).toBe('a\n\nb');
  });

  it('trims leading and trailing blank lines', () => {
    expect(dedentText('\n\n  a\n  b\n  \n')).toBe('a\nb');
  });

  it('normalises CRLF line endings', () => {
    expect(dedentText('  a\r\n  b')).toBe('a\nb');
  });

  it('leaves text without shared indentation unchanged', () => {
    expect(dedentText('a\n  b')).toBe('a\n  b');
  });

  it('handles empty input', () => {
    expect(dedentText('')).toBe('');
    expect(dedentText('   \n  ')).toBe('');
  });
});

describe('substitutePlaceholders', () => {
  it('replaces {{name}} placeholders', () => {
    expect(
      substitutePlaceholders('Provision users to {{companyName}}.', { companyName: 'Acme' }),
    ).toBe('Provision users to Acme.');
  });

  it('replaces ${name} placeholders', () => {
    expect(substitutePlaceholders('Name it ${companyName}', { companyName: 'Acme' })).toBe(
      'Name it Acme',
    );
  });

  it('tolerates whitespace inside braces and repeated placeholders', () => {
    expect(
      substitutePlaceholders('{{ companyName }} and {{companyName}}', { companyName: 'Acme' }),
    ).toBe('Acme and Acme');
  });

  it('leaves placeholders without a value unchanged', () => {
    expect(substitutePlaceholders('Hi {{companyName}} {{other}}', {})).toBe(
      'Hi {{companyName}} {{other}}',
    );
  });

  it('allows an empty-string value', () => {
    expect(substitutePlaceholders('[{{companyName}}]', { companyName: '' })).toBe('[]');
  });
});

describe('resolveAssetUrl', () => {
  const base = 'https://acme.auth0.com/my-org/public/instructions';

  it('appends a root-relative path to the base, keeping the base path', () => {
    expect(resolveAssetUrl(base, '/img/okta/1.png')).toBe(
      'https://acme.auth0.com/my-org/public/instructions/img/okta/1.png',
    );
  });

  it('appends relative paths and handles a trailing slash on the base', () => {
    expect(resolveAssetUrl(`${base}/`, 'img/1.png')).toBe(`${base}/img/1.png`);
    expect(resolveAssetUrl(base, './img/1.png')).toBe(`${base}/img/1.png`);
  });

  it('keeps absolute https URLs', () => {
    expect(resolveAssetUrl(base, 'https://cdn.example.com/a.png')).toBe(
      'https://cdn.example.com/a.png',
    );
  });

  it.each([
    'javascript:alert(1)',
    'data:image/png;base64,AAAA',
    'http://cdn.example.com/a.png',
    '//cdn.example.com/a.png',
    'vbscript:x',
    '',
  ])('rejects %s', (path) => {
    expect(resolveAssetUrl(base, path)).toBeUndefined();
  });

  it('rejects relative paths without a usable https base', () => {
    expect(resolveAssetUrl(undefined, '/img/1.png')).toBeUndefined();
    expect(resolveAssetUrl('', '/img/1.png')).toBeUndefined();
    expect(resolveAssetUrl('http://acme.test', '/img/1.png')).toBeUndefined();
    expect(resolveAssetUrl('not a url', '/img/1.png')).toBeUndefined();
  });
});

describe('isExternalUrl', () => {
  it.each([
    ['https://example.com', true],
    ['http://example.com', true],
    ['/relative', false],
    ['#anchor', false],
    ['mailto:a@b.c', false],
    [undefined, false],
  ])('%s -> %s', (href, expected) => {
    expect(isExternalUrl(href)).toBe(expected);
  });
});
