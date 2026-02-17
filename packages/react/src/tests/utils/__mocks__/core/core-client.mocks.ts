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
    withScopes: vi.fn().mockReturnThis(),
  } as unknown as CoreClientInterface['myAccountApiClient'];
};

const createMockStepUpApiService = (): CoreClientInterface['stepUpApiService'] => {
  return {
    getAuthenticators: vi.fn().mockResolvedValue([]),
    enroll: vi.fn().mockResolvedValue({
      authenticatorType: 'otp',
      secret: 'mock-secret',
      barcodeUri: 'otpauth://totp/mock',
      id: 'authenticator_123',
    }),
    challenge: vi.fn().mockResolvedValue({
      challengeType: 'oob',
      oobCode: 'mock-oob-code',
    }),
    getEnrollmentFactors: vi.fn().mockResolvedValue([]),
    verify: vi.fn().mockResolvedValue({
      id_token: 'mock-id-token',
      access_token: 'mock-access-token',
      expires_in: 3600,
    }),
  } as unknown as CoreClientInterface['stepUpApiService'];
};

const createMockMyOrgApiService = (): CoreClientInterface['myOrganizationApiClient'] => {
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
        updateAttributes: vi.fn().mockResolvedValue(undefined),
        domains: {
          create: vi.fn().mockResolvedValue(undefined),
          delete: vi.fn().mockResolvedValue(undefined),
        },
        provisioning: {
          get: vi.fn().mockRejectedValue({ status: 404 }),
          create: vi.fn().mockResolvedValue({}),
          delete: vi.fn().mockResolvedValue(undefined),
          updateAttributes: vi.fn().mockResolvedValue(undefined),
          scimTokens: {
            list: vi.fn().mockResolvedValue([]),
            create: vi.fn().mockResolvedValue({ id: 'token_123', token: 'secret_token' }),
            delete: vi.fn().mockResolvedValue(undefined),
          },
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
    withScopes: vi.fn().mockReturnThis(),
  } as unknown as CoreClientInterface['myOrganizationApiClient'];
};

export const createMockCoreClient = (authDetails?: Partial<AuthDetails>): CoreClientInterface => {
  const mockMyAccountApiService = createMockMyAccountApiService();
  const mockMyOrgApiService = createMockMyOrgApiService();
  const mockStepUpApiService = createMockStepUpApiService();
  const mockAuth = createMockAuth(authDetails);

  return {
    auth: mockAuth,
    i18nService: createMockI18nService(),
    myAccountApiClient: mockMyAccountApiService as CoreClientInterface['myAccountApiClient'],
    myOrganizationApiClient: mockMyOrgApiService as CoreClientInterface['myOrganizationApiClient'],
    stepUpApiService: mockStepUpApiService as CoreClientInterface['stepUpApiService'],
    getMyAccountApiClient: vi.fn(
      () => mockMyAccountApiService,
    ) as CoreClientInterface['getMyAccountApiClient'],
    getMyOrganizationApiClient: vi.fn(
      () => mockMyOrgApiService,
    ) as CoreClientInterface['getMyOrganizationApiClient'],
    getStepUpApiService: vi.fn(
      () => mockStepUpApiService,
    ) as CoreClientInterface['getStepUpApiService'],
    getToken: async () => {
      return 'mock-access-token';
    },
    isProxyMode: () => false,
    getDomain: () => mockAuth.domain ?? mockAuth.contextInterface?.getConfiguration()?.domain,
  };
};
