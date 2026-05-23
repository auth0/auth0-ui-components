/**
 * Passkey API operations hook.
 * @module use-user-passkey-service
 */

import {
  createPasskeyCredential,
  passkeyQueryKeys,
  parsePublicKeyCreationOptions,
  type CreatePasskeyResponse,
  type UpdatePasskeyResponse,
} from '@auth0/universal-components-core';
import { useMutation, useQuery } from '@tanstack/react-query';

import { useCoreClient } from '@/hooks/shared/use-core-client';
import type {
  Passkey,
  UseUserPasskeyServiceResult,
} from '@/types/my-account/passkey/passkey-types';

/**
 * Internal service hook for passkey operations backed by TanStack Query.
 * Provides queries and mutations; use `useUserPasskey` for the public API.
 * @returns Passkey query and mutation handlers for listing, enrolling, revoking, and renaming passkeys.
 * @internal
 */
export function useUserPasskeyService(): UseUserPasskeyServiceResult {
  const { coreClient } = useCoreClient();

  const passkeysQuery = useQuery<Passkey[]>({
    queryKey: passkeyQueryKeys.list(),
    queryFn: async () => {
      const client = coreClient!.getMyAccountApiClient();
      const response = await client.authenticationMethods.list();
      return response.authentication_methods
        .filter((m) => (m as { type?: string }).type === 'passkey')
        .map((m) => ({
          id: m.id,
          name: (m as { name?: string }).name,
          createdAt: m.created_at,
        }));
    },
    enabled: !!coreClient,
  });

  const enrollMutation = useMutation<void, Error, void>({
    mutationFn: async () => {
      const client = coreClient!.getMyAccountApiClient();

      const startResponse = await client.authenticationMethods.create({ type: 'passkey' });
      const { auth_session, authn_params_public_key } = startResponse as CreatePasskeyResponse;

      const authnResponse = await createPasskeyCredential(
        parsePublicKeyCreationOptions(authn_params_public_key),
      );
      if (!authnResponse) return;

      await client.authenticationMethods.verify(authnResponse.id, {
        auth_session,
        authn_response: authnResponse,
      });
    },
  });

  const revokeMutation = useMutation<void, Error, string>({
    mutationFn: (id: string) =>
      coreClient!.getMyAccountApiClient().authenticationMethods.delete(id),
  });

  const renameMutation = useMutation<UpdatePasskeyResponse, Error, { id: string; name: string }>({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      coreClient!.getMyAccountApiClient().authenticationMethods.update(id, { name }),
  });

  return { passkeysQuery, enrollMutation, revokeMutation, renameMutation };
}
