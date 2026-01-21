import { vi } from 'vitest';

import { createMockI18nService } from '../../i18n/__mocks__/i18n-service.mocks';
import type {
  AuthDetails,
  BasicAuth0ContextInterface,
  CoreClientInterface,
  User,
  Auth0ContextInterface,
  GetTokenSilentlyVerboseResponse,
  GetTokenSilentlyOptions,
} from '../auth-types';

/**
 * Creates a mock user object
 */
export const createMockUser = (overrides?: Partial<User>): User => ({
  sub: 'auth0|test-user-123',
  name: 'Test User',
  given_name: 'Test',
  family_name: 'User',
  email: 'user@example.com',
  email_verified: true,
  picture: 'https://example.com/avatar.jpg',
  updated_at: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

/**
 * Creates a mock GetTokenSilentlyVerboseResponse
 */
export const createMockVerboseTokenResponse = (
  overrides?: Partial<GetTokenSilentlyVerboseResponse>,
): GetTokenSilentlyVerboseResponse => ({
  id_token: 'mock-id-token',
  access_token: 'mock-access-token',
  expires_in: 3600,
  ...overrides,
});

/**
 * Creates a mock BasicAuth0ContextInterface
 */
export const createMockBasicAuth0Context = (
  overrides?: Partial<BasicAuth0ContextInterface>,
): BasicAuth0ContextInterface => ({
  isAuthenticated: true,
  user: createMockUser(),
  getAccessTokenSilently: vi.fn().mockImplementation(async (options?: GetTokenSilentlyOptions) => {
    if (options?.detailedResponse) {
      return createMockVerboseTokenResponse();
    }
    return 'mock-access-token';
  }),
  getAccessTokenWithPopup: vi.fn().mockResolvedValue('mock-access-token'),
  loginWithRedirect: vi.fn().mockResolvedValue(undefined),
  ...overrides,
});

/**
 * Creates a mock Auth0ContextInterface with full properties
 */
export const createMockAuth0Context = (
  overrides?: Partial<Auth0ContextInterface>,
): Auth0ContextInterface => ({
  isAuthenticated: true,
  isLoading: false,
  user: createMockUser(),
  getAccessTokenSilently: vi.fn().mockImplementation(async (options?: GetTokenSilentlyOptions) => {
    if (options?.detailedResponse) {
      return createMockVerboseTokenResponse();
    }
    return 'mock-access-token';
  }),
  getAccessTokenWithPopup: vi.fn().mockResolvedValue('mock-access-token'),
  loginWithRedirect: vi.fn().mockResolvedValue(undefined),
  loginWithPopup: vi.fn().mockResolvedValue(undefined),
  logout: vi.fn().mockResolvedValue(undefined),
  getIdTokenClaims: vi.fn().mockResolvedValue({
    sub: 'auth0|test-user-123',
    aud: 'test-client-id',
    iss: 'https://test-domain.auth0.com/',
  }),
  handleRedirectCallback: vi.fn().mockResolvedValue({
    appState: {},
  }),
  ...overrides,
});

/**
 * Creates a mock AuthDetails object
 */
export const createMockAuthDetails = (overrides?: Partial<AuthDetails>): AuthDetails => ({
  authProxyUrl: 'https://mock-auth-proxy.com',
  domain: 'mock-domain.auth0.com',
  contextInterface: createMockBasicAuth0Context(),
  ...overrides,
});

/**
 * Creates a mock MyAccountClient service
 */
export const createMockMyAccountApiClient = (): CoreClientInterface['myAccountApiClient'] => {
  return {
    factors: {
      list: vi.fn().mockResolvedValue({ factors: [] }),
    },
    authenticationMethods: {
      list: vi.fn().mockResolvedValue({ authentication_methods: [] }),
      create: vi.fn().mockResolvedValue({ id: 'new_method_123', type: 'totp' }),
      delete: vi.fn().mockResolvedValue(undefined),
      verify: vi.fn().mockResolvedValue({ confirmed: true }),
    },
  } as unknown as CoreClientInterface['myAccountApiClient'];
};

/**
 * Creates a mock MyOrganizationClient service
 */
export const createMockMyOrganizationApiClient =
  (): CoreClientInterface['myOrganizationApiClient'] => {
    return {
      organizationDetails: {
        get: vi.fn().mockResolvedValue({
          id: 'organization_123',
          name: 'Test Organization',
          display_name: 'Test Organization',
        }),
        update: vi.fn().mockResolvedValue({
          id: 'organization_123',
          name: 'Test Organization',
          display_name: 'Test Organization',
        }),
      },
      organization: {
        identityProviders: {
          list: vi.fn().mockResolvedValue([]),
          get: vi.fn().mockResolvedValue({
            id: 'idp_123',
            name: 'Test Provider',
            strategy: 'oidc',
          }),
          create: vi.fn().mockResolvedValue({ id: 'idp_123' }),
          update: vi.fn().mockResolvedValue({ id: 'idp_123' }),
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
          create: vi.fn().mockResolvedValue({
            id: 'domain_123',
            domain: 'example.com',
            status: 'pending',
          }),
          update: vi.fn().mockResolvedValue({ id: 'domain_123' }),
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
    } as unknown as CoreClientInterface['myOrganizationApiClient'];
  };

/**
 * Creates a mock CoreClientInterface
 */
export const createMockCoreClient = (authDetails?: Partial<AuthDetails>): CoreClientInterface => {
  const mockAuth = createMockAuthDetails(authDetails);
  const mockI18nService = createMockI18nService();
  const mockMyAccountApiClient = createMockMyAccountApiClient();
  const mockMyOrganizationApiClient = createMockMyOrganizationApiClient();

  return {
    auth: mockAuth,
    i18nService: mockI18nService,
    myAccountApiClient: mockMyAccountApiClient,
    myOrganizationApiClient: mockMyOrganizationApiClient,
    getMyAccountApiClient: vi.fn(
      () => mockMyAccountApiClient,
    ) as CoreClientInterface['getMyAccountApiClient'],
    getMyOrganizationApiClient: vi.fn(
      () => mockMyOrganizationApiClient,
    ) as CoreClientInterface['getMyOrganizationApiClient'],
    getToken: vi.fn().mockResolvedValue('mock-access-token'),
    isProxyMode: vi.fn().mockReturnValue(false),
    ensureScopes: vi.fn().mockResolvedValue(undefined),
  };
};

/**
 * Creates a mock CoreClientInterface in proxy mode
 */
export const createMockProxyCoreClient = (
  authDetails?: Partial<AuthDetails>,
): CoreClientInterface => {
  const mockCoreClient = createMockCoreClient(authDetails);
  mockCoreClient.auth.authProxyUrl = 'https://mock-auth-proxy.com';
  mockCoreClient.isProxyMode = vi.fn().mockReturnValue(true);
  return mockCoreClient;
};

/**
 * Creates a mock unauthenticated CoreClientInterface
 */
export const createMockUnauthenticatedCoreClient = (): CoreClientInterface => {
  return createMockCoreClient({
    contextInterface: createMockBasicAuth0Context({
      isAuthenticated: false,
      user: undefined,
    }),
  });
};
