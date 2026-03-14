import type { MyOrganizationClient } from '@auth0/myorganization-js';

// Re-export shared API service mocks
export {
  createMockContextInterface,
  mockProxyConfig,
  createMockSpaConfig,
} from '../../../../internals/__mocks__/shared/api-service.mocks';

// =============================================================================
// MyOrganization-specific Test Data
// =============================================================================

// Expected URLs
export const getExpectedProxyBaseUrl = (proxyUrl: string): string => {
  const cleanUrl = proxyUrl.replace(/\/$/, '');
  return `${cleanUrl}/my-org`;
};

// Request Init Test Data (MyOrganization-specific)
export const mockRequestInits = {
  get: {
    method: 'GET',
  },
  post: {
    method: 'POST',
    body: JSON.stringify({ name: 'Test Organization' }),
  },
  postWithHeaders: {
    method: 'POST',
    body: JSON.stringify({ name: 'Test Organization' }),
    headers: {
      'X-Custom-Header': 'custom-value',
    },
  },
  withContentType: {
    method: 'POST',
    body: JSON.stringify({ name: 'Test Organization' }),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  },
  patch: {
    method: 'PATCH',
    body: JSON.stringify({ display_name: 'Updated Organization' }),
  },
};

// Error Messages (MyOrganization-specific — thrown by createCoreClient, not the service directly)
export const expectedErrors = {
  missingContextInterface: 'Missing context interface',
  missingDomain: 'Missing domain',
};

// MyOrganizationClient Mock Methods
export const mockMyOrganizationClientMethods = {
  listOrganizations: 'listOrganizations',
  getOrganization: 'getOrganization',
  updateOrganization: 'updateOrganization',
  listMembers: 'listMembers',
  listRoles: 'listRoles',
};

/**
 * Creates a mock MyOrganization API client
 */
export const createMockMyOrganizationClient = () =>
  ({
    organization: {} as MyOrganizationClient['organization'],
    organizationDetails: {} as MyOrganizationClient['organizationDetails'],
  }) as unknown as MyOrganizationClient;
