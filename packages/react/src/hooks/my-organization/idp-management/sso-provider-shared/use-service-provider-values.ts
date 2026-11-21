/**
 * Service provider values for the current tenant.
 * @module use-service-provider-values
 */

import {
  buildAdfsRelyingPartyIdentifier,
  buildServiceProviderEntityId,
  buildServiceProviderValues,
  type ServiceProviderValues,
} from '@auth0/universal-components-core';
import { useMemo } from 'react';

import { useCoreClient } from '@/hooks/shared/use-core-client';
import { useTranslator } from '@/hooks/shared/use-translator';
import type { UseServiceProviderValuesOptions } from '@/types/my-organization/idp-management/sso-provider/sso-provider-shared-types';

/**
 * Builds the service provider values (callback URL, SAML SSO URL, entity IDs, ...)
 * @param options - Hook options.
 * @param options.connectionName - Connection name.
 * @param options.resolveSamlMetadata - Entity ID resolver for custom domains.
 * @param options.fallbackDomain - Domain for URLs when none is configured; defaults to a translated placeholder.
 * @returns The values, keyed by name.
 */
export function useServiceProviderValues({
  connectionName,
  resolveSamlMetadata,
  fallbackDomain,
}: UseServiceProviderValuesOptions = {}): ServiceProviderValues {
  const { t } = useTranslator('common');
  const { coreClient } = useCoreClient();
  const placeholderDomain = fallbackDomain ?? t('your_domain_placeholder');
  const domain = coreClient?.getDomain();

  return useMemo(() => {
    const entityId =
      connectionName && resolveSamlMetadata
        ? resolveSamlMetadata({ connectionName }).entityId
        : buildServiceProviderEntityId(domain ?? '', connectionName);

    return {
      ...buildServiceProviderValues(domain || placeholderDomain, { connectionName, entityId }),
      adfsRelyingPartyIdentifier: buildAdfsRelyingPartyIdentifier(domain ?? ''),
    };
  }, [domain, placeholderDomain, connectionName, resolveSamlMetadata]);
}
