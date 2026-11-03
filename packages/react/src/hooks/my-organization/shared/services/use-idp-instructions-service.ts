/**
 * Fetches identity provider setup instructions (creation or provisioning) for a strategy.
 * @module use-idp-instructions-service
 * @internal
 */

import {
  hasApiErrorBody,
  idpConfigQueryKeys,
  type IdpInstructionsLocale,
  type IdpInstructionsResponse,
  type IdpProvisioningInstructionsResponse,
  type IdpStrategy,
  type InstructionsKind,
} from '@auth0/universal-components-core';
import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useCoreClient } from '@/hooks/shared/use-core-client';
import { getCacheTimeOption } from '@/lib/utils/tanstack-compat';

export const INSTRUCTIONS_STALE_TIME_MS = 60 * 60 * 1000;
export const INSTRUCTIONS_GC_TIME_MS = 24 * 60 * 60 * 1000;

type InstructionsResponseFor<TKind extends InstructionsKind> = TKind extends 'creation'
  ? IdpInstructionsResponse
  : IdpProvisioningInstructionsResponse;

export interface UseIdpInstructionsServiceOptions<TKind extends InstructionsKind> {
  kind: TKind;
  strategy: IdpStrategy | undefined;
  locale: IdpInstructionsLocale;
  enabled?: boolean;
}

export interface UseIdpInstructionsServiceResult<TKind extends InstructionsKind> {
  instructions: InstructionsResponseFor<TKind> | null;
  isLoading: boolean;
  error: unknown;
}

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
  const isPreview = Boolean(coreClient?.auth?.previewMode);

  const query = useQuery<InstructionsResponseFor<TKind> | null>({
    queryKey:
      kind === 'creation'
        ? idpConfigQueryKeys.instructions(strategy!, locale)
        : idpConfigQueryKeys.provisioningInstructions(strategy!, locale),
    queryFn: async () => {
      const configuration = coreClient!.getMyOrganizationApiClient().organization.configuration;
      try {
        const response =
          kind === 'creation'
            ? await configuration.identityProviderInstructions.get(strategy!, { locale })
            : await configuration.identityProviderProvisioningInstructions.get(strategy!, {
                locale,
              });
        return response as InstructionsResponseFor<TKind>;
      } catch (error) {
        if (hasApiErrorBody(error) && error.body?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: Boolean(coreClient) && !isPreview && Boolean(strategy) && enabled,
    staleTime: INSTRUCTIONS_STALE_TIME_MS,
    ...getCacheTimeOption(INSTRUCTIONS_GC_TIME_MS),
    retry: (failureCount, error) => {
      if (hasApiErrorBody(error) && error.body?.status === 404) return false;
      const defaultRetry = queryClient.getDefaultOptions().queries?.retry;
      return typeof defaultRetry === 'function' ? defaultRetry(failureCount, error) : false;
    },
  });

  return {
    instructions: query.data ?? null,
    isLoading: query.isLoading && query.fetchStatus !== 'idle',
    error: query.error,
  };
}
