/**
 * Passkey utilities for WebAuthn credential handling and display.
 * @module passkey-utils
 */

import type {
  PasskeyAttestationResponse,
  PasskeyPublicKeyCredentialCreationOptions,
} from './passkey-types';

/**
 * @param base64Url - Base64url-encoded string to decode.
 * @returns Uint8Array of decoded bytes.
 */
export function base64UrlToUint8Array(base64Url: string): Uint8Array {
  const padding = '='.repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/') + padding;
  const binary = atob(base64);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

/**
 * @param buffer - ArrayBuffer to encode.
 * @returns Base64url-encoded string.
 */
export function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const binary = Array.from(bytes, (b) => String.fromCharCode(b)).join('');
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Converts server-side passkey creation options to browser-compatible
 * PublicKeyCredentialCreationOptions by decoding base64url-encoded fields.
 * @param serverOptions - Options received from the server.
 * @returns PublicKeyCredentialCreationOptions for navigator.credentials.create.
 */
export function parsePublicKeyCreationOptions(
  serverOptions: PasskeyPublicKeyCredentialCreationOptions,
): PublicKeyCredentialCreationOptions {
  return {
    ...serverOptions,
    challenge: base64UrlToUint8Array(serverOptions.challenge),
    user: {
      ...serverOptions.user,
      id: base64UrlToUint8Array(serverOptions.user.id),
    },
  } as unknown as PublicKeyCredentialCreationOptions;
}

// Edg/ matches desktop Edge; EdgA/ matches Edge on Android
const BROWSER_PATTERNS: [RegExp, string][] = [
  [/EdgA?\//i, 'Edge'],
  [/OPR\//i, 'Opera'],
  [/Chrome\//i, 'Chrome'],
  [/Firefox\//i, 'Firefox'],
  [/Safari\//i, 'Safari'],
];

const OS_PATTERNS: [RegExp, string][] = [
  [/iPhone|iPad|iPod/i, 'iOS'],
  [/Android/i, 'Android'],
  [/Windows NT/i, 'Windows'],
  [/Mac OS X/i, 'macOS'],
  [/CrOS/i, 'ChromeOS'],
  [/Linux/i, 'Linux'],
];

/**
 * Extracts a human-readable browser + OS label from a user agent string.
 * Returns an empty string if the UA is absent or unrecognizable.
 * @param ua - Raw user agent string.
 * @returns Label like "Chrome on macOS", or empty string.
 */
export function parseUserAgent(ua?: string): string {
  if (!ua) return '';
  const browser = BROWSER_PATTERNS.find(([re]) => re.test(ua))?.[1];
  const os = OS_PATTERNS.find(([re]) => re.test(ua))?.[1];
  if (browser && os) return `${browser} on ${os}`;
  return browser ?? os ?? '';
}

/**
 * @returns True if the browser supports WebAuthn passkey creation.
 */
export function isWebAuthnSupported(): boolean {
  return !!(window.PublicKeyCredential && navigator.credentials?.create);
}

/**
 * Runs the WebAuthn credential creation ceremony and returns the attestation response.
 * Returns null if the user cancels or no credential is produced.
 * @param options - PublicKeyCredentialCreationOptions from the server.
 * @returns Attestation response or null.
 */
export async function createPasskeyCredential(
  options: PublicKeyCredentialCreationOptions,
): Promise<PasskeyAttestationResponse | null> {
  if (!isWebAuthnSupported()) return null;

  const credential = (await navigator.credentials.create({
    publicKey: options,
  })) as PublicKeyCredential | null;

  if (!credential) return null;

  const attestation = credential.response as AuthenticatorAttestationResponse;

  return {
    id: credential.id,
    rawId: arrayBufferToBase64Url(credential.rawId),
    type: 'public-key',
    authenticatorAttachment: (credential.authenticatorAttachment ??
      undefined) as PasskeyAttestationResponse['authenticatorAttachment'],
    response: {
      clientDataJSON: arrayBufferToBase64Url(attestation.clientDataJSON),
      attestationObject: arrayBufferToBase64Url(attestation.attestationObject),
    },
  };
}
