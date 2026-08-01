import { describe, it, expect, vi, beforeEach } from 'vitest';

import type { PasskeyPublicKeyCredentialCreationOptions } from '../user-passkey-management-types';
import {
  base64UrlToUint8Array,
  arrayBufferToBase64Url,
  parsePublicKeyCreationOptions,
  createPasskeyCredential,
  parseUserAgent,
} from '../user-passkey-management-utils';

import { toBuffer, mockCredential } from './__mocks__/user-passkey-management-utils.mocks';

describe('passkey-utils', () => {
  describe('base64UrlToUint8Array', () => {
    it('should decode a standard base64url string', () => {
      expect(Array.from(base64UrlToUint8Array('aGVsbG8'))).toEqual([104, 101, 108, 108, 111]); // "hello"
    });

    it('should handle base64url - and _ characters (url-safe alphabet)', () => {
      // "test-test" encodes to "dGVzdC10ZXN0" using - instead of + and _ instead of /
      expect(Array.from(base64UrlToUint8Array('dGVzdC10ZXN0'))).toEqual(
        [116, 101, 115, 116, 45, 116, 101, 115, 116], // "test-test"
      );
    });

    it('should handle strings requiring padding', () => {
      expect(Array.from(base64UrlToUint8Array('YQ'))).toEqual([97]); // "a"
    });

    it('should handle empty string', () => {
      expect(Array.from(base64UrlToUint8Array(''))).toEqual([]);
    });

    it('should roundtrip with arrayBufferToBase64Url', () => {
      const original = new Uint8Array([1, 2, 3, 4, 5, 255, 254]);
      const encoded = arrayBufferToBase64Url(original.buffer as ArrayBuffer);
      expect(Array.from(base64UrlToUint8Array(encoded))).toEqual(Array.from(original));
    });
  });

  describe('arrayBufferToBase64Url', () => {
    it('should encode an ArrayBuffer to base64url', () => {
      expect(arrayBufferToBase64Url(toBuffer('hello'))).toBe('aGVsbG8');
    });

    it('should not contain +, / or = characters', () => {
      const result = arrayBufferToBase64Url(
        new Uint8Array([0xfb, 0xff, 0xfe]).buffer as ArrayBuffer,
      );
      expect(result).not.toMatch(/[+/=]/);
    });

    it('should handle empty buffer', () => {
      expect(arrayBufferToBase64Url(new ArrayBuffer(0))).toBe('');
    });
  });

  describe('parsePublicKeyCreationOptions', () => {
    const baseOptions = Object.freeze({
      challenge: 'aGVsbG8', // "hello"
      user: { id: 'dXNlcg', name: 'test@example.com', displayName: 'Test User' }, // id = "user"
      rp: { name: 'Acme', id: 'acme.com' },
      pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
      timeout: 60000,
    }) as PasskeyPublicKeyCredentialCreationOptions;

    it('should decode challenge and user.id from base64url', () => {
      const result = parsePublicKeyCreationOptions(baseOptions);

      expect(Array.from(result.challenge as Uint8Array)).toEqual([104, 101, 108, 108, 111]); // "hello"
      expect(Array.from(result.user.id as unknown as Uint8Array)).toEqual([117, 115, 101, 114]); // "user"
    });

    it('should preserve other fields unchanged', () => {
      const result = parsePublicKeyCreationOptions(baseOptions);

      expect(result.rp).toEqual({ name: 'Acme', id: 'acme.com' });
      expect(result.timeout).toBe(60000);
      expect(result.pubKeyCredParams).toEqual([{ type: 'public-key', alg: -7 }]);
    });

    it('should produce empty Uint8Array for empty challenge or user.id', () => {
      const emptyOptions = {
        ...baseOptions,
        challenge: '',
        user: { ...baseOptions.user, id: '' },
      } as PasskeyPublicKeyCredentialCreationOptions;

      const result = parsePublicKeyCreationOptions(emptyOptions);

      expect(Array.from(result.challenge as Uint8Array)).toEqual([]);
      expect(Array.from(result.user.id as unknown as Uint8Array)).toEqual([]);
    });
  });

  describe('createPasskeyCredential', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
      Object.defineProperty(globalThis, 'window', {
        value: { PublicKeyCredential: true },
        writable: true,
        configurable: true,
      });
      Object.defineProperty(globalThis, 'navigator', {
        value: { credentials: { create: vi.fn() } },
        writable: true,
        configurable: true,
      });
    });

    it('should return null when navigator.credentials.create returns null', async () => {
      vi.spyOn(navigator.credentials, 'create').mockResolvedValue(null);
      expect(await createPasskeyCredential({} as PublicKeyCredentialCreationOptions)).toBeNull();
    });

    it('should return attestation response when credential is created', async () => {
      const mockRawId = toBuffer('rawId');
      const mockClientDataJSON = toBuffer('clientData');
      const mockAttestationObject = toBuffer('attestation');

      vi.spyOn(navigator.credentials, 'create').mockResolvedValue(
        mockCredential({
          rawId: mockRawId,
          response: {
            clientDataJSON: mockClientDataJSON,
            attestationObject: mockAttestationObject,
          },
        }),
      );

      const result = await createPasskeyCredential({} as PublicKeyCredentialCreationOptions);

      expect(result?.id).toBe('credential-id');
      expect(result?.type).toBe('public-key');
      expect(result?.authenticatorAttachment).toBe('platform');
      expect(result?.rawId).toBe(arrayBufferToBase64Url(mockRawId));
      expect(result?.response.clientDataJSON).toBe(arrayBufferToBase64Url(mockClientDataJSON));
      expect(result?.response.attestationObject).toBe(
        arrayBufferToBase64Url(mockAttestationObject),
      );
    });

    it('should set authenticatorAttachment to undefined when null', async () => {
      vi.spyOn(navigator.credentials, 'create').mockResolvedValue(
        mockCredential({ authenticatorAttachment: null }),
      );

      const result = await createPasskeyCredential({} as PublicKeyCredentialCreationOptions);
      expect(result?.authenticatorAttachment).toBeUndefined();
    });

    it('should handle cross-platform authenticatorAttachment', async () => {
      vi.spyOn(navigator.credentials, 'create').mockResolvedValue(
        mockCredential({ authenticatorAttachment: 'cross-platform' }),
      );

      const result = await createPasskeyCredential({} as PublicKeyCredentialCreationOptions);
      expect(result?.authenticatorAttachment).toBe('cross-platform');
    });

    it('should pass options to navigator.credentials.create', async () => {
      const createSpy = vi.spyOn(navigator.credentials, 'create').mockResolvedValue(null);
      const options = { timeout: 60000 } as PublicKeyCredentialCreationOptions;

      await createPasskeyCredential(options);

      expect(createSpy).toHaveBeenCalledWith({ publicKey: options });
    });

    it('should propagate errors from navigator.credentials.create', async () => {
      const notAllowedError = new DOMException('User cancelled', 'NotAllowedError');
      vi.spyOn(navigator.credentials, 'create').mockRejectedValue(notAllowedError);

      await expect(
        createPasskeyCredential({} as PublicKeyCredentialCreationOptions),
      ).rejects.toThrow('User cancelled');
    });
  });

  describe('parseUserAgent', () => {
    it('should return empty string for undefined', () => {
      expect(parseUserAgent(undefined)).toBe('');
    });

    it('should return empty string for empty string', () => {
      expect(parseUserAgent('')).toBe('');
    });

    it('should return empty string for unrecognizable UA', () => {
      expect(parseUserAgent('UnknownBot/1.0')).toBe('');
    });

    it('should detect Chrome on macOS', () => {
      expect(
        parseUserAgent(
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        ),
      ).toBe('Chrome on macOS');
    });

    it('should detect Safari on macOS', () => {
      expect(
        parseUserAgent(
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
        ),
      ).toBe('Safari on macOS');
    });

    it('should detect Firefox on Windows', () => {
      expect(
        parseUserAgent(
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0',
        ),
      ).toBe('Firefox on Windows');
    });

    // Edge UA contains "Chrome" — order dependency: Edge pattern must come before Chrome
    it('should detect desktop Edge (Edg/) not Chrome', () => {
      expect(
        parseUserAgent(
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 Edg/124.0.0.0',
        ),
      ).toBe('Edge on Windows');
    });

    // Android Edge uses EdgA/ token
    it('should detect Android Edge (EdgA/)', () => {
      expect(
        parseUserAgent(
          'Mozilla/5.0 (Linux; Android 10; HD1913) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36 EdgA/124.0.0.0',
        ),
      ).toBe('Edge on Android');
    });

    // Opera UA contains "Chrome" — order dependency: Opera pattern must come before Chrome
    it('should detect Opera (OPR/) not Chrome', () => {
      expect(
        parseUserAgent(
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36 OPR/110.0.0.0',
        ),
      ).toBe('Opera on Windows');
    });

    it('should detect Chrome on Android', () => {
      expect(
        parseUserAgent(
          'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
        ),
      ).toBe('Chrome on Android');
    });

    it('should detect Safari on iOS', () => {
      expect(
        parseUserAgent(
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        ),
      ).toBe('Safari on iOS');
    });

    it('should return browser alone when OS is unrecognized', () => {
      expect(parseUserAgent('Mozilla/5.0 Firefox/124.0')).toBe('Firefox');
    });

    it('should return OS alone when browser is unrecognized', () => {
      expect(parseUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)')).toBe('Windows');
    });
  });
});
