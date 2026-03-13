import type { CoreClientInterface, AuthDetails } from '@auth0/universal-components-core';
import { vi } from 'vitest';

import { createMockAuth } from '@/tests/utils/__mocks__/core/auth.mocks';
import { createMockI18nService } from '@/tests/utils/__mocks__/core/i18n-service.mocks';
import {
  createMockAvailableFactors,
  createMockEmptyAuthenticationMethods,
} from '@/tests/utils/__mocks__/my-account/mfa/mfa.mocks';
import { createMockIdentityProvider } from '@/tests/utils/__mocks__/my-organization/domain-management/domain.mocks';
import { createMockOrganization } from '@/tests/utils/__mocks__/my-organization/organization-management/organization-details.mocks';

const createMockMyAccountApiService = (): CoreClientInterface['myAccountApiClient'] => {
  const service = {
    withScopes: vi.fn(),
    factors: {
      list: vi.fn().mockResolvedValue(createMockAvailableFactors()),
    },
    authenticationMethods: {
      list: vi.fn().mockResolvedValue(createMockEmptyAuthenticationMethods()),
      create: vi.fn().mockResolvedValue({}),
      delete: vi.fn().mockResolvedValue(undefined),
      verify: vi.fn().mockResolvedValue({}),
    },
    mfa: {
      fetchFactors: vi.fn().mockResolvedValue([]),
    },
  } as unknown as NonNullable<CoreClientInterface['myAccountApiClient']>;
  service.withScopes = vi.fn(() => service) as typeof service.withScopes;
  return service;
};

const createMockMyOrgApiService = (): CoreClientInterface['myOrganizationApiClient'] => {
  const mockOrganization = createMockOrganization();
  const mockProvider = createMockIdentityProvider();

  const service = {
    withScopes: vi.fn(),
    organizationDetails: {
      get: vi.fn().mockResolvedValue(mockOrganization),
      update: vi.fn().mockResolvedValue(mockOrganization),
    },
    organization: {
      identityProviders: {
        list: vi.fn().mockResolvedValue([]),
        get: vi.fn().mockResolvedValue(mockProvider),
        create: vi.fn().mockResolvedValue({}),
        update: vi.fn().mockResolvedValue({}),
        delete: vi.fn().mockResolvedValue(undefined),
        detach: vi.fn().mockResolvedValue(undefined),
        domains: {
          create: vi.fn().mockResolvedValue(undefined),
          delete: vi.fn().mockResolvedValue(undefined),
        },
        provisioning: {
          get: vi.fn().mockRejectedValue({ status: 404 }),
          create: vi.fn().mockResolvedValue({}),
          delete: vi.fn().mockResolvedValue(undefined),
        },
      },
      domains: {
        list: vi.fn().mockResolvedValue([]),
        create: vi.fn().mockResolvedValue({}),
        update: vi.fn().mockResolvedValue({}),
        delete: vi.fn().mockResolvedValue(undefined),
        verify: {
          create: vi.fn().mockResolvedValue({ status: 'verified' }),
        },
        identityProviders: {
          get: vi.fn().mockResolvedValue({ identity_providers: [] }),
        },
      },
      configuration: {
        get: vi.fn().mockResolvedValue({
          allowed_strategies: [
            'samlp',
            'oidc',
            'adfs',
            'waad',
            'google-apps',
            'pingfederate',
            'okta',
          ],
          connection_deletion_behavior: 'allow',
        }),
        identityProviders: {
          get: vi.fn().mockResolvedValue({
            strategies: {
              samlp: {
                enabled_features: ['provisioning'],
                provisioning_methods: ['scim'],
              },
              oidc: {
                enabled_features: [],
                provisioning_methods: [],
              },
            },
          }),
        },
      },
    },
  } as unknown as NonNullable<CoreClientInterface['myOrganizationApiClient']>;
  service.withScopes = vi.fn(() => service) as typeof service.withScopes;
  return service;
};

export const createMockCoreClient = (authDetails?: Partial<AuthDetails>): CoreClientInterface => {
  const mockMyAccountApiService = createMockMyAccountApiService();
  const mockMyOrgApiService = createMockMyOrgApiService();
  const mockAuth = createMockAuth(authDetails);

  return {
    auth: mockAuth,
    i18nService: createMockI18nService(),
    myAccountApiClient: mockMyAccountApiService as CoreClientInterface['myAccountApiClient'],
    myOrganizationApiClient: mockMyOrgApiService as CoreClientInterface['myOrganizationApiClient'],
    getMyAccountApiClient: vi.fn(
      () => mockMyAccountApiService,
    ) as CoreClientInterface['getMyAccountApiClient'],
    getMyOrganizationApiClient: vi.fn(
      () => mockMyOrgApiService,
    ) as CoreClientInterface['getMyOrganizationApiClient'],
    getMFAStepUpApiClient: vi.fn().mockReturnValue({
      getAuthenticators: vi.fn().mockResolvedValue([]),
      enroll: vi.fn().mockResolvedValue({}),
      challenge: vi.fn().mockResolvedValue({}),
      verify: vi.fn().mockResolvedValue({}),
    }) as CoreClientInterface['getMFAStepUpApiClient'],
    isProxyMode: () => false,
    getDomain: () => mockAuth.domain ?? mockAuth.contextInterface?.getConfiguration()?.domain,
  };
};
