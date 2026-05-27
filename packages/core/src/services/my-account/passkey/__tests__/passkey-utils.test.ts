import { describe, it, expect, vi, beforeEach } from 'vitest';

import type { PasskeyPublicKeyCredentialCreationOptions } from '../passkey-types';
import {
  base64UrlToUint8Array,
  arrayBufferToBase64Url,
  parsePublicKeyCreationOptions,
  createPasskeyCredential,
} from '../passkey-utils';

const toBuffer = (str: string) => new TextEncoder().encode(str).buffer as ArrayBuffer;

interface MockCredentialOverrides {
  id?: string;
  rawId?: ArrayBuffer;
  authenticatorAttachment?: string | null;
  response?: {
    clientDataJSON?: ArrayBuffer;
    attestationObject?: ArrayBuffer;
  };
}

const mockCredential = (overrides: MockCredentialOverrides = {}) =>
  ({
    id: overrides.id ?? 'credential-id',
    rawId: overrides.rawId ?? toBuffer('rawId'),
    type: 'public-key',
    authenticatorAttachment:
      'authenticatorAttachment' in overrides ? overrides.authenticatorAttachment : 'platform',
    response: {
      clientDataJSON: overrides.response?.clientDataJSON ?? toBuffer('clientData'),
      attestationObject: overrides.response?.attestationObject ?? toBuffer('attestation'),
    },
  }) as unknown as PublicKeyCredential;

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
});
