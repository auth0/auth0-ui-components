/**
 * Fetches identity provider setup instructions (creation or provisioning) for a strategy.
 * @module use-idp-instructions-service
 * @internal
 */

import { idpInstructionsQueryKeys, type InstructionsKind } from '@auth0/universal-components-core';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useCoreClient } from '@/hooks/shared/use-core-client';
import { createRetryUnlessNotFound, nullOnNotFound } from '@/lib/utils/shared/query-utils';
import type {
  InstructionsResponseFor,
  UseIdpInstructionsServiceOptions,
  UseIdpInstructionsServiceResult,
} from '@/types/my-organization/idp-management/sso-guided-setup/sso-guided-setup-types';

/**
 * Loads the creation or provisioning instructions for a strategy.
 * @param options - Hook options.
 * @param options.kind - `creation` or `provisioning`.
 * @param options.strategy - IdP strategy.
 * @param options.locale - Instructions locale.
 * @param options.enabled - Extra gate.
 * @returns Instructions and query state.
 */
export function useIdpInstructionsService<TKind extends InstructionsKind>({
  kind,
  strategy,
  locale,
  enabled = true,
}: UseIdpInstructionsServiceOptions<TKind>): UseIdpInstructionsServiceResult<TKind> {
  const { coreClient } = useCoreClient();
  const queryClient = useQueryClient();

  const query = useQuery<InstructionsResponseFor<TKind> | null>({
    queryKey:
      kind === 'creation'
        ? idpInstructionsQueryKeys.creation(strategy!, locale)
        : idpInstructionsQueryKeys.provisioning(strategy!, locale),
    queryFn: async () => {
      const configuration = coreClient!.getMyOrganizationApiClient().organization.configuration;
      const response =
        kind === 'creation'
          ? await nullOnNotFound(
              configuration.identityProviderInstructions.get(strategy!, { locale }),
            )
          : await nullOnNotFound(
              configuration.identityProviderProvisioningInstructions.get(strategy!, { locale }),
            );
      return response as InstructionsResponseFor<TKind> | null;
    },
    enabled: Boolean(coreClient?.myOrganizationApiClient) && Boolean(strategy) && enabled,
    retry: createRetryUnlessNotFound(queryClient),
  });

  return {
    instructions: query.data ?? null,
    isLoading: query.isLoading && query.fetchStatus !== 'idle',
    error: query.error,
  };
}
