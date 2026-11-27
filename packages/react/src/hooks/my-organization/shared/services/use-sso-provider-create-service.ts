/**
 * Internal SSO provider creation service hook.
 * Handles API interaction and mutation logic for creating SSO providers.
 * @module use-sso-provider-create-service
 * @internal
 */

import {
  DOMAIN_VERIFICATION_MODES,
  domainQueryKeys,
  hasApiErrorBody,
  SsoProviderMappers,
  ssoDomainQueryKeys,
  ssoProviderQueryKeys,
  type CreateIdentityProviderRequestContent,
  type CreateIdentityProviderRequestContentPrivate,
  type Domain,
  type IdpKnownResponse,
} from '@auth0/universal-components-core';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

import { showToast } from '@/components/auth0/shared/toast';
import { useIdpConfig } from '@/hooks/my-organization/shared/services/use-idp-config-service';
import { useOrganizationDetailsEditService } from '@/hooks/my-organization/shared/services/use-organization-details-edit-service';
import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useErrorHandler } from '@/hooks/shared/use-error-handler';
import { useQueryErrorToast } from '@/hooks/shared/use-query-error-toast';
import { useTranslator } from '@/hooks/shared/use-translator';
import { MAX_ORG_DOMAINS } from '@/lib/constants/my-organization/domain-management/domain-management-constants';
import { getProviderDomainsMode } from '@/lib/utils/my-organization/domain-management/domain-management-utils';
import { isMutationLoading } from '@/lib/utils/tanstack-compat';
import type {
  ProviderDetailsDomainsProps,
  UseSsoProviderCreateServiceOptions,
  UseSsoProviderCreateServiceReturn,
} from '@/types/my-organization/idp-management/sso-provider/sso-provider-create-types';

const NO_DOMAINS: Domain[] = [];

const selectAvailableDomains = (domains: Domain[]): Domain[] =>
  domains.filter(
    (domain) =>
      domain.status === 'verified' && domain.identity_provider_association === 'unassociated',
  );

/**
 * Extracts domain from discovery error detail.
 * @param detail - Error detail string.
 * @returns Domain string or null.
 * @internal
 */
function extractDomainFromDiscoveryError(detail?: string): string | null {
  if (!detail) return null;
  const match = detail.match(/discovery failure:\s*(.+)/i);
  return match?.[1]?.trim() ?? null;
}

/**
 * Internal service hook for SSO provider creation API operations.
 * @param options - Hook options.
 * @param options.createAction - Callback after successful creation.
 * @param options.customMessages - Custom translation messages.
 * @param options.shouldDeferSuccessToast - Returns true to leave the success toast to the caller.
 * @param options.canListDomains - Whether the user may list the organization's domains.
 * @returns Service state and methods.
 * @internal
 */
export function useSsoProviderCreateService({
  createAction,
  customMessages = {},
  shouldDeferSuccessToast,
  canListDomains = false,
}: UseSsoProviderCreateServiceOptions = {}): UseSsoProviderCreateServiceReturn {
  const { coreClient } = useCoreClient();
  const { t } = useTranslator('idp_management.create_sso_provider', customMessages);
  const queryClient = useQueryClient();
  const handleError = useErrorHandler();
  const { organization } = useOrganizationDetailsEditService({});
  const { idpConfig } = useIdpConfig();

  const domainsMode = getProviderDomainsMode(idpConfig);
  const showDomainsField =
    domainsMode === DOMAIN_VERIFICATION_MODES.REQUIRED ||
    (domainsMode === DOMAIN_VERIFICATION_MODES.OPTIONAL && canListDomains);

  const domainsQuery = useQuery({
    queryKey: domainQueryKeys.available(),
    queryFn: async (): Promise<Domain[]> => {
      const { response } = await coreClient!
        .getMyOrganizationApiClient()
        .organization.domains.list({ take: MAX_ORG_DOMAINS });
      return response?.organization_domains ?? NO_DOMAINS;
    },
    select: selectAvailableDomains,
    enabled: !!coreClient && showDomainsField && canListDomains,
    staleTime: 0,
  });

  useQueryErrorToast(domainsQuery, t('notifications.general_error'));

  const providerDomains = useMemo<ProviderDetailsDomainsProps | null>(
    () =>
      domainsMode && showDomainsField
        ? {
            mode: domainsMode,
            options: domainsQuery.data ?? NO_DOMAINS,
            isLoading: domainsQuery.isLoading,
            canList: canListDomains,
          }
        : null,
    [domainsMode, showDomainsField, domainsQuery.data, domainsQuery.isLoading, canListDomains],
  );

  const notifyCreated = useCallback(
    (providerName?: string | null) => {
      showToast({
        type: 'success',
        message: t('notifications.provider_create_success', { providerName }),
      });
    },
    [t],
  );

  const createProviderMutation = useMutation({
    mutationFn: async (
      data: CreateIdentityProviderRequestContentPrivate,
    ): Promise<IdpKnownResponse> => {
      if (!coreClient) {
        throw new Error('Core client not available');
      }

      const {
        strategy,
        name,
        display_name,
        domains,
        show_as_button,
        assign_membership_on_login,
        use_for_third_party_client_access,
        cross_app_access_resource_app,
        ...configOptions
      } = data;

      const formData = {
        strategy,
        name,
        display_name,
        domains,
        show_as_button,
        assign_membership_on_login,
        use_for_third_party_client_access,
        cross_app_access_resource_app,
        options: configOptions,
      };

      const apiRequestData: CreateIdentityProviderRequestContent = SsoProviderMappers.createToAPI(
        formData,
        {
          canSetShowAsButton: idpConfig?.organization?.can_set_show_as_button,
          canSetAssignMembershipOnLogin:
            idpConfig?.organization?.can_set_assign_membership_on_login,
          canSetDomains: getProviderDomainsMode(idpConfig) !== null,
        },
      );

      const result: IdpKnownResponse = await coreClient
        .getMyOrganizationApiClient()
        .organization.identityProviders.create(apiRequestData);

      return result;
    },
    onSuccess: (result, data) => {
      if (!shouldDeferSuccessToast?.()) {
        notifyCreated(result.name);
      }

      createAction?.onAfter?.(data, result);

      queryClient.invalidateQueries({ queryKey: ssoProviderQueryKeys.list() });

      if (result.domains?.length) {
        queryClient.invalidateQueries({ queryKey: domainQueryKeys.lists() });
        queryClient.invalidateQueries({ queryKey: domainQueryKeys.available() });
        queryClient.invalidateQueries({ queryKey: domainQueryKeys.allProviders() });
        queryClient.invalidateQueries({ queryKey: ssoDomainQueryKeys.lists() });
      }
    },
    onError: (error, data) => {
      if (
        hasApiErrorBody(error) &&
        error.body?.status === 409 &&
        error.body?.type === 'https://auth0.com/api-errors#A0E-409-0001'
      ) {
        showToast({
          type: 'error',
          message: t('notifications.provider_create_duplicated_provider_error', {
            providerName: data.name,
          }),
        });
        return;
      }
      if (hasApiErrorBody(error)) {
        const domainFromError = extractDomainFromDiscoveryError(error.body?.detail);
        if (domainFromError) {
          showToast({
            type: 'error',
            message: t('notifications.provider_create_discovery_failure', {
              domain: domainFromError,
            }),
          });
          return;
        }
      }

      handleError(error, { fallbackMessage: t('notifications.general_error') });
    },
  });

  const createProvider = useCallback(
    async (
      data: CreateIdentityProviderRequestContentPrivate,
    ): Promise<IdpKnownResponse | undefined> => {
      if (!coreClient) {
        showToast({
          type: 'error',
          message: t('notifications.general_error'),
        });
        return undefined;
      }

      if (createAction?.onBefore) {
        const canProceed = createAction.onBefore(data);
        if (!canProceed) {
          return undefined;
        }
      }

      return createProviderMutation.mutateAsync(data);
    },
    [coreClient, createAction, createProviderMutation],
  );

  return {
    createProvider,
    isCreating: isMutationLoading(createProviderMutation),
    isOrganizationBlocked: organization?.third_party_client_access === 'block',
    organizationDisplayName: organization?.display_name || undefined,
    providerDomains,
    notifyCreated,
  };
}
