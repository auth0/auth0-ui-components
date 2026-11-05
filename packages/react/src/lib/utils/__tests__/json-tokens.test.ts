import { describe, expect, it } from 'vitest';

import { tokenizeJsonLine } from '@/lib/utils/json-tokens';

describe('tokenizeJsonLine', () => {
  describe('when the line is a key with a string value', () => {
    it('should split key, punctuation and string', () => {
      expect(tokenizeJsonLine('  "email": "bob@acme.corp",')).toEqual([
        { type: 'punctuation', text: '  ' },
        { type: 'key', text: '"email"' },
        { type: 'punctuation', text: ': ' },
        { type: 'string', text: '"bob@acme.corp"' },
        { type: 'punctuation', text: ',' },
      ]);
    });
  });

  describe('when the value is a number, boolean or null', () => {
    it('should type each literal', () => {
      expect(tokenizeJsonLine('"a": -1.5e3,').map((token) => token.type)).toEqual([
        'key',
        'punctuation',
        'number',
        'punctuation',
      ]);
      expect(tokenizeJsonLine('"b": true').at(-1)).toEqual({ type: 'boolean', text: 'true' });
      expect(tokenizeJsonLine('"c": false').at(-1)).toEqual({ type: 'boolean', text: 'false' });
      expect(tokenizeJsonLine('"d": null').at(-1)).toEqual({ type: 'null', text: 'null' });
    });
  });

  describe('when a string contains escaped quotes', () => {
    it('should keep the whole string as one token', () => {
      expect(tokenizeJsonLine('"msg": "say \\"hi\\""')).toEqual([
        { type: 'key', text: '"msg"' },
        { type: 'punctuation', text: ': ' },
        { type: 'string', text: '"say \\"hi\\""' },
      ]);
    });
  });

  describe('when a string contains a colon', () => {
    it('should treat it as a value, not a key', () => {
      expect(tokenizeJsonLine('  "urn:oasis:names",')).toEqual([
        { type: 'punctuation', text: '  ' },
        { type: 'string', text: '"urn:oasis:names"' },
        { type: 'punctuation', text: ',' },
      ]);
    });
  });

  describe('when the line holds only brackets', () => {
    it('should return punctuation', () => {
      expect(tokenizeJsonLine('},')).toEqual([{ type: 'punctuation', text: '},' }]);
    });
  });

  describe('when the line is empty', () => {
    it('should return no tokens', () => {
      expect(tokenizeJsonLine('')).toEqual([]);
    });
  });

  describe('when tokens are joined back', () => {
    it('should reproduce the input exactly', () => {
      const line = '    "nameIdAttributes": { "value": "891bf161", "n": 2 },';
      expect(
        tokenizeJsonLine(line)
          .map((token) => token.text)
          .join(''),
      ).toBe(line);
    });
  });
});
