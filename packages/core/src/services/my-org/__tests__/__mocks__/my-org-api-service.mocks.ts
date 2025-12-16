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
// MyOrg-specific Test Data
// =============================================================================

// Expected Proxy URL helper (service-specific path)
export const getExpectedProxyBaseUrl = (proxyUrl: string): string => {
  const cleanUrl = proxyUrl.replace(/\/$/, '');
  return `${cleanUrl}/my-org`;
};

// Scope Test Data (MyOrg-specific)
export const mockScopes = {
  empty: '',
  orgRead: 'read:organization',
  orgWrite: 'write:organization',
  members: 'read:organization_members',
  complex: 'read:organization write:organization read:organization_members',
  withSpaces: '  read:organization  write:organization  ',
};

// Request Init Test Data (MyOrg-specific)
export const mockRequestInits = {
  get: {
    method: 'GET',
  },
  post: {
    method: 'POST',
    body: JSON.stringify({ name: 'Test Org' }),
  },
  postWithHeaders: {
    method: 'POST',
    body: JSON.stringify({ name: 'Test Org' }),
    headers: {
      'X-Custom-Header': 'custom-value',
    },
  },
  withContentType: {
    method: 'POST',
    body: JSON.stringify({ name: 'Test Org' }),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  },
  patch: {
    method: 'PATCH',
    body: JSON.stringify({ display_name: 'Updated Org' }),
  },
};

// Error Messages (MyOrg-specific)
export const expectedErrors = {
  missingDomainOrProxy: 'Missing domain or proxy URL for MyOrgClient',
  tokenManagerError: 'Token retrieval failed',
};

// MyOrganizationClient Mock Methods
export const mockMyOrgClientMethods = {
  listOrganizations: 'listOrganizations',
  getOrganization: 'getOrganization',
  updateOrganization: 'updateOrganization',
  listMembers: 'listMembers',
  listRoles: 'listRoles',
} as const;
