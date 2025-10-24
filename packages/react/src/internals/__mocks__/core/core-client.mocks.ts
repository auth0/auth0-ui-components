import type { CoreClientInterface, AuthDetailsCore } from '@auth0-web-ui-components/core';
import { vi } from 'vitest';

import { createMockOrganization } from '../my-org/org-management/org-details.mocks';

import { createMockAuth } from './auth.mocks';
import { createMockI18nService } from './i18n-service.mocks';

const createMockMyOrgApiService = (): CoreClientInterface['myOrgApiService'] => {
  const mockOrganization = createMockOrganization();

  return {
    organizationDetails: {
      get: vi.fn().mockResolvedValue(mockOrganization),
      update: vi.fn().mockResolvedValue(mockOrganization),
    },
    organization: {
      identityProviders: {
        list: vi.fn().mockResolvedValue([]),
        delete: vi.fn().mockResolvedValue(undefined),
        detach: vi.fn().mockResolvedValue(undefined),
        update: vi.fn().mockResolvedValue(undefined),
      },
    },
  };
};

export const createMockCoreClient = (
  authDetails?: Partial<AuthDetailsCore>,
): CoreClientInterface => {
  const mockMyOrgApiService = createMockMyOrgApiService();

  return {
    auth: createMockAuth(authDetails),
    i18nService: createMockI18nService(),
    myAccountApiService: undefined,
    myOrgApiService: mockMyOrgApiService as CoreClientInterface['myOrgApiService'],
    getMyAccountApiService: vi.fn(() => {
      throw new Error('myAccountApiService not available in mock yet');
    }) as CoreClientInterface['getMyAccountApiService'],
    getMyOrgApiService: vi.fn(
      () => mockMyOrgApiService,
    ) as CoreClientInterface['getMyOrgApiService'],
    getToken: async () => {
      return 'mock-access-token';
    },
    getApiBaseUrl: () => 'https://test-api.auth0.com',
    isProxyMode: () => false,
  };
};
