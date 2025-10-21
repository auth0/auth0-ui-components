import type { BaseCoreClientInterface } from '@core/auth/auth-types';
import type { MyOrgClient } from 'auth0-myorg-sdk';

import type {
  CreateIdentityProviderRequestContentPrivate,
  ListIdentityProvidersResponseContent,
  DetachIdpProviderResponseContent,
  CreateIdentityProviderRequestContent,
  CreateIdentityProviderResponseContent,
  UpdateIdentityProviderRequestContent,
  UpdateIdentityProviderResponseContent,
} from '../idp-types';

import { SsoProviderMappers } from './sso-provider-mappers';
import {
  getIdentityProviders,
  deleteIdentityProvider,
  detachIdentityProvider,
  updateIdentityProvider,
  createIdentityProvider,
} from './sso-provider-service';

export interface IdentityProvidersController {
  list(): Promise<ListIdentityProvidersResponseContent>;
  delete(idpId: string): Promise<void>;
  detach(idpId: string): Promise<DetachIdpProviderResponseContent>;
  create(
    provider: CreateIdentityProviderRequestContentPrivate,
  ): Promise<CreateIdentityProviderResponseContent>;
  update(
    idpId: string,
    data: UpdateIdentityProviderRequestContent,
  ): Promise<UpdateIdentityProviderResponseContent>;
}

export function createIdentityProvidersController(
  coreClient: BaseCoreClientInterface,
  myOrgClient?: MyOrgClient,
): IdentityProvidersController {
  const isProxy = coreClient.isProxyMode();

  if (!isProxy && !myOrgClient) {
    throw new Error('MyOrgClient is required for non-proxy mode');
  }

  const delegateCall = <T>(proxyFn: () => Promise<T>, sdkFn: () => Promise<T>): Promise<T> =>
    isProxy ? proxyFn() : sdkFn();

  return {
    list: () =>
      delegateCall(
        () => getIdentityProviders(coreClient.getApiBaseUrl()),
        () => myOrgClient!.organization.identityProviders.list(),
      ),

    create: (provider: CreateIdentityProviderRequestContentPrivate) => {
      const { strategy, name, display_name, ...configOptions } = provider;

      const providerRequestData = {
        strategy,
        name,
        display_name,
        options: configOptions,
      };

      const apiRequestData: CreateIdentityProviderRequestContent =
        SsoProviderMappers.createToAPI(providerRequestData);

      return delegateCall(
        () => createIdentityProvider(coreClient.getApiBaseUrl(), apiRequestData),
        () => myOrgClient!.organization.identityProviders.create(apiRequestData),
      );
    },

    delete: (idpId: string) =>
      delegateCall(
        () => deleteIdentityProvider(coreClient.getApiBaseUrl(), idpId),
        () => myOrgClient!.organization.identityProviders.delete(idpId),
      ),

    detach: (idpId: string) =>
      delegateCall(
        () => detachIdentityProvider(coreClient.getApiBaseUrl(), idpId),
        () => myOrgClient!.organization.identityProviders.detach(idpId),
      ),

    update: (idpId: string, data: UpdateIdentityProviderRequestContent) =>
      delegateCall(
        () => updateIdentityProvider(coreClient.getApiBaseUrl(), idpId, data),
        () => myOrgClient!.organization.identityProviders.update(idpId, data),
      ),
  };
}
