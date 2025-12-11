import type { CoreClientInterface, AuthDetails } from '@auth0/universal-components-core';
import { vi } from 'vitest';

import {
  createMockAvailableFactors,
  createMockEmptyAuthenticationMethods,
} from '../my-account/mfa/mfa.mocks';
import { createMockIdentityProvider } from '../my-org/domain-management/domain.mocks';
import { createMockOrganization } from '../my-org/org-management/org-details.mocks';

import { createMockAuth } from './auth.mocks';
import { createMockI18nService } from './i18n-service.mocks';

const createMockMyAccountApiService = (): CoreClientInterface['myAccountApiClient'] => {
  return {
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
  } as unknown as CoreClientInterface['myAccountApiClient'];
};

const createMockMyOrgApiService = (): CoreClientInterface['myOrgApiClient'] => {
  const mockOrganization = createMockOrganization();
  const mockProvider = createMockIdentityProvider();

  return {
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
  } as unknown as CoreClientInterface['myOrgApiClient'];
};

export const createMockCoreClient = (authDetails?: Partial<AuthDetails>): CoreClientInterface => {
  const mockMyAccountApiService = createMockMyAccountApiService();
  const mockMyOrgApiService = createMockMyOrgApiService();

  return {
    auth: createMockAuth(authDetails),
    i18nService: createMockI18nService(),
    myAccountApiClient: mockMyAccountApiService as CoreClientInterface['myAccountApiClient'],
    myOrgApiClient: mockMyOrgApiService as CoreClientInterface['myOrgApiClient'],
    getMyAccountApiClient: vi.fn(
      () => mockMyAccountApiService,
    ) as CoreClientInterface['getMyAccountApiClient'],
    getMyOrgApiClient: vi.fn(() => mockMyOrgApiService) as CoreClientInterface['getMyOrgApiClient'],
    getToken: async () => {
      return 'mock-access-token';
    },
    isProxyMode: () => false,
    ensureScopes() {
      return Promise.resolve();
    },
  };
};
