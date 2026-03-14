// Re-export shared API service mocks
export {
  createMockContextInterface,
  mockProxyConfig,
  createMockSpaConfig,
} from '../../../../internals/__mocks__/shared/api-service.mocks';

// =============================================================================
// MyAccount-specific Test Data
// =============================================================================

// Expected Proxy URL helper (service-specific path)
export const getExpectedProxyBaseUrl = (proxyUrl: string): string => {
  const cleanUrl = proxyUrl.replace(/\/$/, '');
  return `${cleanUrl}/me`;
};

// Request Init Test Data (MyAccount-specific)
export const mockRequestInits = {
  get: {
    method: 'GET',
  },
  post: {
    method: 'POST',
    body: JSON.stringify({ test: 'data' }),
  },
  postWithHeaders: {
    method: 'POST',
    body: JSON.stringify({ test: 'data' }),
    headers: {
      'X-Custom-Header': 'custom-value',
    },
  },
  withContentType: {
    method: 'POST',
    body: JSON.stringify({ test: 'data' }),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  },
};

// Error Messages (MyAccount-specific — thrown by createCoreClient, not the service directly)
export const expectedErrors = {
  missingContextInterface: 'Missing context interface',
  missingDomain: 'Missing domain',
};

// MyAccountClient Mock Methods
export const mockMyAccountClientMethods = {
  listFactors: 'listFactors',
  listAuthenticationMethods: 'listAuthenticationMethods',
  createAuthenticationMethod: 'createAuthenticationMethod',
  deleteAuthenticationMethod: 'deleteAuthenticationMethod',
  verifyAuthenticationMethod: 'verifyAuthenticationMethod',
} as const;
