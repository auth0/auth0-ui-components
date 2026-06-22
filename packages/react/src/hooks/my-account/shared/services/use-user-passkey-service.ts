import {
  createPasskeyCredential,
  passkeyQueryKeys,
  parsePublicKeyCreationOptions,
  parseUserAgent,
  type CreatePasskeyResponse,
  type PasskeyAuthMethodResponse,
} from '@auth0/universal-components-core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useTranslator } from '@/hooks/shared/use-translator';
import type {
  Passkey,
  UseUserPasskeyServiceResult,
} from '@/types/my-account/passkey/passkey-types';

/**
 * Internal service hook for passkey CRUD operations.
 * @returns Query and mutation handlers for listing, enrolling, revoking, and renaming passkeys.
 * @internal
 */
export function useUserPasskeyService(): UseUserPasskeyServiceResult {
  const { coreClient } = useCoreClient('user-passkey-management');
  const queryClient = useQueryClient();
  const { t } = useTranslator('passkey');

  const passkeysQuery = useQuery<Passkey[]>({
    queryKey: passkeyQueryKeys.list(),
    queryFn: async () => {
      const client = coreClient!.getMyAccountApiClient();
      const response = await client.authenticationMethods.list();
      return response.authentication_methods
        .filter((m) => (m as PasskeyAuthMethodResponse).type === 'passkey')
        .map((m, index) => {
          const passkey = m as PasskeyAuthMethodResponse;
          return {
            id: passkey.id,
            name: t('passkey_name', { index: index + 1 }),
            createdAt: passkey.created_at,
            lastUsedAt: passkey.last_auth_at,
            deviceInfo: parseUserAgent(passkey.user_agent),
          };
        });
    },
    enabled: !!coreClient,
  });

  const invalidateList = () => queryClient.invalidateQueries({ queryKey: passkeyQueryKeys.list() });

  const enrollMutation = useMutation<boolean, Error, void>({
    mutationFn: async () => {
      const client = coreClient!.getMyAccountApiClient();

      const startResponse = (await client.authenticationMethods.create({
        type: 'passkey',
      })) as CreatePasskeyResponse;
      const { auth_session, authn_params_public_key } = startResponse;
      const authenticationMethodId = 'passkey|new';

      const authnResponse = await createPasskeyCredential(
        parsePublicKeyCreationOptions(authn_params_public_key),
      );
      if (!authnResponse) return false;

      await client.authenticationMethods.verify(authenticationMethodId, {
        auth_session,
        authn_response: authnResponse,
      });
      return true;
    },
    onSuccess: (enrolled) => {
      if (enrolled) invalidateList();
    },
  });

  const revokeMutation = useMutation<void, Error, string>({
    mutationFn: (id) => coreClient!.getMyAccountApiClient().authenticationMethods.delete(id),
    onSuccess: invalidateList,
  });

  return { passkeysQuery, enrollMutation, revokeMutation };
}
