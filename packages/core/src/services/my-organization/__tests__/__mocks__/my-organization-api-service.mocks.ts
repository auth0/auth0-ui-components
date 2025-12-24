import type { MyOrganizationClient } from '@auth0/myorganization-js';
import { vi } from 'vitest';

import type { initializeMyOrganizationClient } from '../../my-organization-api-service';

// Re-export shared API service mocks
export {
  // Auth Details Mocks
  mockAuthWithDomain,
  mockAuthWithProxyUrl,
  mockAuthWithProxyUrlTrailingSlash,
  mockAuthWithBothDomainAndProxy,
  mockAuthWithNeither,
  mockAuthWithEmptyDomain,
  mockAuthWithEmptyProxyUrl,
  mockAuthWithDomainWhitespace,
  mockAuthWithProxyUrlWhitespace,
  // Token Manager Mocks
  createMockTokenManager,
  createMockTokenManagerWithScopes,
  createMockTokenManagerWithError,
  // Token Test Data
  mockTokens,
  // Headers Helpers
  extractHeaders,
  expectedProxyHeaders,
  expectedDomainHeaders,
  // Helper Functions
  createMockAuthDetails,
  checkHeaders,
  getExpectedDomainUrl,
  getExpectedProxyBaseUrl as getExpectedProxyBaseUrlWithPath,
} from '../../../../internals/__mocks__/shared/api-service.mocks';

// =============================================================================
// MyOrganization-specific Test Data
// =============================================================================

// Expected URLs
export const getExpectedProxyBaseUrl = (proxyUrl: string): string => {
  const cleanUrl = proxyUrl.replace(/\/$/, '');
  return `${cleanUrl}/my-org`;
};

// Scope Test Data (MyOrganization-specific)
export const mockScopes = {
  empty: '',
  organizationRead: 'read:organization',
  organizationWrite: 'write:organization',
  members: 'read:organization_members',
  complex: 'read:organization write:organization read:organization_members',
  withSpaces: '  read:organization  write:organization  ',
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

// Error Messages (MyOrganization-specific)
export const expectedErrors = {
  missingDomainOrProxy: 'Missing domain or proxy URL for MyOrganizationClient',
  tokenManagerError: 'Token retrieval failed',
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
export const createMockMyOrganizationClient = (): ReturnType<
  typeof initializeMyOrganizationClient
> => {
  return {
    client: {} as MyOrganizationClient,
    setLatestScopes: vi.fn(),
  };
};
