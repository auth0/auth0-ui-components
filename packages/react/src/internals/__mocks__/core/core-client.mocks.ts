import type { CoreClientInterface, AuthDetails } from '@auth0-web-ui-components/core';
import { vi } from 'vitest';

import { createMockOrganization } from '../my-org/org-management/org-details.mocks';

import { createMockAuth } from './auth.mocks';
import { createMockI18nService } from './i18n-service.mocks';

const createMockMyOrgApiService = (): CoreClientInterface['myOrgApiClient'] => {
  const mockOrganization = createMockOrganization();

  return {
    organizationDetails: {
      get: vi.fn().mockResolvedValue(mockOrganization),
      update: vi.fn().mockResolvedValue(mockOrganization),
    },
    organization: {
      identityProviders: {
        list: vi.fn().mockResolvedValue([]),
        create: vi.fn().mockResolvedValue({}),
        update: vi.fn().mockResolvedValue({}),
        delete: vi.fn().mockResolvedValue(undefined),
        detach: vi.fn().mockResolvedValue(undefined),
      },
      domains: {
        list: vi.fn().mockResolvedValue([]),
        create: vi.fn().mockResolvedValue({}),
        update: vi.fn().mockResolvedValue({}),
        delete: vi.fn().mockResolvedValue(undefined),
      },
    },
  } as unknown as CoreClientInterface['myOrgApiClient'];
};

export const createMockCoreClient = (authDetails?: Partial<AuthDetails>): CoreClientInterface => {
  const mockMyOrgApiService = createMockMyOrgApiService();

  return {
    auth: createMockAuth(authDetails),
    i18nService: createMockI18nService(),
    myAccountApiClient: undefined,
    myOrgApiClient: mockMyOrgApiService as CoreClientInterface['myOrgApiClient'],
    getMyAccountApiClient: vi.fn(() => {
      throw new Error('myAccountApiService not available in mock yet');
    }) as CoreClientInterface['getMyAccountApiClient'],
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
