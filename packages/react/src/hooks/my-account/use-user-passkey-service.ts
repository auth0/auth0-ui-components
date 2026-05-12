/**
 * Passkey API operations hook.
 * @module use-user-passkey-service
 */

import type {
  CreatePasskeyResponse,
  PasskeyAttestationResponse,
} from '@auth0/universal-components-core';
import { useCallback } from 'react';

import { useCoreClient } from '@/hooks/shared/use-core-client';
import type {
  Passkey,
  UseUserPasskeyServiceResult,
} from '@/types/my-account/passkey/passkey-types';

/**
 * Hook for raw passkey API operations: fetch, enroll, rename, revoke.
 * Uses myaccount-js SDK directly for all API calls.
 * @returns Passkey API operation functions.
 */
export function useUserPasskeyService(): UseUserPasskeyServiceResult {
  const { coreClient } = useCoreClient();

  if (!coreClient) {
    throw new Error(
      'useUserPasskeyService must be used within Auth0ComponentProvider with initialized CoreClient',
    );
  }

  const fetchPasskeys = useCallback(async (): Promise<Passkey[]> => {
    const client = coreClient.getMyAccountApiClient();
    const response = await client.authenticationMethods.list();
    return response.authentication_methods
      .filter((m) => (m as { type?: string }).type === 'passkey')
      .map((m) => ({
        id: m.id,
        createdAt: m.created_at,
      }));
  }, [coreClient]);

  const enrollPasskey = useCallback(async (): Promise<void> => {
    const client = coreClient.getMyAccountApiClient();

    // Step 1: Start enrollment — SDK calls POST /authentication-methods { type: 'passkey' }
    const startResponse = await client.authenticationMethods.create({ type: 'passkey' });
    const { auth_session, authn_params_public_key } = startResponse as CreatePasskeyResponse;

    // Step 2: Browser WebAuthn — decode base64url fields for the browser API
    const publicKeyOptions: PublicKeyCredentialCreationOptions = {
      ...authn_params_public_key,
      challenge: base64UrlToUint8Array(authn_params_public_key.challenge),
      user: {
        ...authn_params_public_key.user,
        id: base64UrlToUint8Array(authn_params_public_key.user.id),
      },
    } as unknown as PublicKeyCredentialCreationOptions;

    const credential = (await navigator.credentials.create({
      publicKey: publicKeyOptions,
    })) as PublicKeyCredential | null;

    if (!credential) {
      throw new Error('Credential creation was cancelled or failed');
    }

    const attestation = credential.response as globalThis.AuthenticatorAttestationResponse;

    // Step 3: Complete enrollment — SDK calls POST /authentication-methods/:id/verify
    const authnResponse: PasskeyAttestationResponse = {
      id: credential.id,
      rawId: arrayBufferToBase64Url(credential.rawId),
      type: 'public-key',
      authenticatorAttachment: 'platform',
      response: {
        clientDataJSON: arrayBufferToBase64Url(attestation.clientDataJSON),
        attestationObject: arrayBufferToBase64Url(attestation.attestationObject),
      },
    };

    await client.authenticationMethods.verify(credential.id, {
      auth_session,
      authn_response: authnResponse,
    });
  }, [coreClient]);

  const revokePasskey = useCallback(
    async (id: string): Promise<void> => {
      const client = coreClient.getMyAccountApiClient();
      await client.authenticationMethods.delete(id);
    },
    [coreClient],
  );

  const renamePasskey = useCallback(
    async (id: string, name: string): Promise<void> => {
      const client = coreClient.getMyAccountApiClient();
      await client.authenticationMethods.update(id, { name });
    },
    [coreClient],
  );

  return { fetchPasskeys, enrollPasskey, revokePasskey, renamePasskey };
}

/**
 * @param base64Url - Base64url-encoded string to decode.
 * @returns Uint8Array of decoded bytes.
 */
function base64UrlToUint8Array(base64Url: string): Uint8Array {
  const padding = '='.repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/') + padding;
  const binary = atob(base64);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

/**
 * @param buffer - ArrayBuffer to encode.
 * @returns Base64url-encoded string.
 */
function arrayBufferToBase64Url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const binary = String.fromCharCode(...bytes);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
