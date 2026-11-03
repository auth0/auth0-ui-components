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

export interface UseServiceProviderValuesOptions {
  /** Connection name; required for the SAML SSO URL query and entity IDs. */
  connectionName?: string;
  /** Supplies the entity ID when it can't be derived from the domain (custom domains). */
  resolveSamlMetadata?: (params: { connectionName: string }) => { entityId: string };
  /** Domain shown in URLs when the core client has none. Entity IDs are left empty instead. */
  fallbackDomain?: string;
}

/**
 * Builds the service provider values (callback URL, SAML SSO URL, entity IDs, ...) an
 * administrator copies into their identity provider, for the current tenant domain.
 * @param options - Hook options.
 * @param options.connectionName - Connection name.
 * @param options.resolveSamlMetadata - Entity ID resolver for custom domains.
 * @param options.fallbackDomain - Placeholder domain for URLs when none is configured.
 * @returns The values, keyed by name.
 */
export function useServiceProviderValues({
  connectionName,
  resolveSamlMetadata,
  fallbackDomain = 'YOUR_DOMAIN',
}: UseServiceProviderValuesOptions = {}): ServiceProviderValues {
  const { coreClient } = useCoreClient();
  const domain = coreClient?.getDomain();

  return useMemo(() => {
    const entityId =
      connectionName && resolveSamlMetadata
        ? resolveSamlMetadata({ connectionName }).entityId
        : buildServiceProviderEntityId(domain ?? '', connectionName);

    return {
      ...buildServiceProviderValues(domain || fallbackDomain, { connectionName, entityId }),
      adfsRelyingPartyIdentifier: buildAdfsRelyingPartyIdentifier(domain ?? ''),
    };
  }, [domain, fallbackDomain, connectionName, resolveSamlMetadata]);
}
