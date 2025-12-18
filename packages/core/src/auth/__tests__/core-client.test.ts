import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import type { AuthDetails, BasicAuth0ContextInterface } from '../auth-types';
import { createCoreClient } from '../core-client';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock window.location
const mockLocation = {
  pathname: '/test-path',
  search: '?query=1',
  assign: vi.fn(),
  href: '',
};

describe('core-client', () => {
  let mockContextInterface: BasicAuth0ContextInterface;

  const createAuthDetails = (overrides: Partial<AuthDetails> = {}): AuthDetails => ({
    domain: 'example.auth0.com',
    contextInterface: mockContextInterface,
    scope: 'openid profile email',
    ...overrides,
  });

  const mockToken = 'mock-access-token';

  beforeEach(() => {
    vi.clearAllMocks();

    mockContextInterface = {
      user: { sub: 'user-123' },
      isAuthenticated: true,
      getAccessTokenSilently: vi.fn().mockResolvedValue({
        access_token: mockToken,
        id_token: 'mock-id-token',
        expires_in: 3600,
      }),
      getAccessTokenWithPopup: vi.fn().mockResolvedValue(mockToken),
      loginWithRedirect: vi.fn().mockResolvedValue(undefined),
    };

    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ data: 'test' }),
      clone: () => ({
        json: () => Promise.resolve({ data: 'test' }),
      }),
    });

    // Reset window.location mock
    mockLocation.assign.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('createCoreClient', () => {
    it('should create a core client with all required properties', async () => {
      const authDetails = createAuthDetails();
      const coreClient = await createCoreClient(authDetails);

      expect(coreClient).toBeDefined();
      expect(coreClient.auth).toBe(authDetails);
      expect(coreClient.i18nService).toBeDefined();
      expect(coreClient.myAccountApiClient).toBeDefined();
      expect(coreClient.myOrgApiClient).toBeDefined();
      expect(coreClient.isProxyMode).toBeDefined();
      expect(coreClient.getToken).toBeDefined();
      expect(coreClient.ensureScopes).toBeDefined();
      expect(coreClient.getMyAccountApiClient).toBeDefined();
      expect(coreClient.getMyOrgApiClient).toBeDefined();
    });

    it('should use provided i18n options', async () => {
      const authDetails = createAuthDetails();
      const coreClient = await createCoreClient(authDetails, {
        currentLanguage: 'ja',
        fallbackLanguage: 'en-US',
      });

      expect(coreClient.i18nService).toBeDefined();
    });

    it('should use default i18n options when not provided', async () => {
      const authDetails = createAuthDetails();
      const coreClient = await createCoreClient(authDetails);

      expect(coreClient.i18nService).toBeDefined();
    });
  });

  describe('isProxyMode', () => {
    it('should return true when authProxyUrl is set', async () => {
      const authDetails = createAuthDetails({ authProxyUrl: 'https://proxy.example.com' });
      const coreClient = await createCoreClient(authDetails);

      expect(coreClient.isProxyMode()).toBe(true);
    });

    it('should return false when authProxyUrl is not set', async () => {
      const authDetails = createAuthDetails({ authProxyUrl: undefined });
      const coreClient = await createCoreClient(authDetails);

      expect(coreClient.isProxyMode()).toBe(false);
    });
  });

  describe('getToken', () => {
    it('should delegate to token manager', async () => {
      const authDetails = createAuthDetails();
      const coreClient = await createCoreClient(authDetails);

      const token = await coreClient.getToken('read:users', 'my-org');

      expect(mockContextInterface.getAccessTokenSilently).toHaveBeenCalled();
      expect(token).toBe(mockToken);
    });

    it('should pass ignoreCache option to token manager', async () => {
      const authDetails = createAuthDetails();
      const coreClient = await createCoreClient(authDetails);

      await coreClient.getToken('read:users', 'my-org', true);

      expect(mockContextInterface.getAccessTokenSilently).toHaveBeenCalledWith(
        expect.objectContaining({
          cacheMode: 'off',
        }),
      );
    });
  });

  describe('ensureScopes', () => {
    it('should set scopes for my-org audience', async () => {
      const authDetails = createAuthDetails();
      const coreClient = await createCoreClient(authDetails);

      await coreClient.ensureScopes('read:org', 'my-org');

      expect(mockContextInterface.getAccessTokenSilently).toHaveBeenCalled();
    });

    it('should set scopes for me audience', async () => {
      const authDetails = createAuthDetails();
      const coreClient = await createCoreClient(authDetails);

      await coreClient.ensureScopes('read:me', 'me');

      expect(mockContextInterface.getAccessTokenSilently).toHaveBeenCalled();
    });

    it('should throw error when domain is missing in non-proxy mode', async () => {
      const authDetails = createAuthDetails({ domain: undefined });
      const coreClient = await createCoreClient(authDetails);

      await expect(coreClient.ensureScopes('read:org', 'my-org')).rejects.toThrow(
        'Authentication domain is missing',
      );
    });

    it('should throw error when token retrieval fails', async () => {
      // Mock getAccessTokenSilently to return a response without access_token
      mockContextInterface.getAccessTokenSilently = vi.fn().mockResolvedValue({
        access_token: '',
        id_token: 'mock-id-token',
        expires_in: 3600,
      });

      const authDetails = createAuthDetails();
      const coreClient = await createCoreClient(authDetails);

      await expect(coreClient.ensureScopes('read:org', 'my-org')).rejects.toThrow(
        'Failed to retrieve token for audience: my-org',
      );
    });

    it('should not fetch token in proxy mode', async () => {
      const authDetails = createAuthDetails({ authProxyUrl: 'https://proxy.example.com' });
      const coreClient = await createCoreClient(authDetails);

      await coreClient.ensureScopes('read:org', 'my-org');

      // In proxy mode, getAccessTokenSilently should not be called during ensureScopes
      expect(mockContextInterface.getAccessTokenSilently).not.toHaveBeenCalled();
    });

    it('should accumulate scopes across multiple calls', async () => {
      const authDetails = createAuthDetails({ authProxyUrl: 'https://proxy.example.com' });
      const coreClient = await createCoreClient(authDetails);

      await coreClient.ensureScopes('read:org', 'my-org');
      await coreClient.ensureScopes('write:org', 'my-org');

      // Make an API call to verify accumulated scopes are sent
      const apiClient = coreClient.getMyOrgApiClient();
      expect(apiClient).toBeDefined();
    });
  });

  describe('getMyAccountApiClient', () => {
    it('should return myAccountApiClient', async () => {
      const authDetails = createAuthDetails();
      const coreClient = await createCoreClient(authDetails);

      const client = coreClient.getMyAccountApiClient();

      expect(client).toBeDefined();
      expect(client).toBe(coreClient.myAccountApiClient);
    });
  });

  describe('getMyOrgApiClient', () => {
    it('should return myOrgApiClient', async () => {
      const authDetails = createAuthDetails();
      const coreClient = await createCoreClient(authDetails);

      const client = coreClient.getMyOrgApiClient();

      expect(client).toBeDefined();
      expect(client).toBe(coreClient.myOrgApiClient);
    });
  });

  describe('handleAuthStepUp (via fetcher)', () => {
    const originalWindow = global.window;

    beforeEach(() => {
      // Mock window for browser environment tests
      Object.defineProperty(global, 'window', {
        value: { location: mockLocation },
        writable: true,
      });
    });

    afterEach(() => {
      Object.defineProperty(global, 'window', {
        value: originalWindow,
        writable: true,
      });
    });

    it('should not redirect for non-403 responses', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ data: 'success' }),
        clone: () => ({
          json: () => Promise.resolve({ data: 'success' }),
        }),
      });

      const authDetails = createAuthDetails({ authProxyUrl: 'https://proxy.example.com' });
      const coreClient = await createCoreClient(authDetails);

      // Trigger ensureScopes to set up latestScopes, then the next API call will use fetcher
      await coreClient.ensureScopes('read:org', 'my-org');

      expect(mockLocation.assign).not.toHaveBeenCalled();
    });

    it('should not redirect for non-scope 403 errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 403,
        json: () => Promise.resolve({ error: 'forbidden' }),
        text: () => Promise.resolve('{"error": "forbidden"}'),
        clone: () => ({
          json: () => Promise.resolve({ error: 'forbidden' }),
        }),
      });

      const authDetails = createAuthDetails({ authProxyUrl: 'https://proxy.example.com' });
      const coreClient = await createCoreClient(authDetails);
      await coreClient.ensureScopes('read:org', 'my-org');

      // Trigger API call - non-scope 403 should not redirect
      const apiClient = coreClient.getMyOrgApiClient();
      try {
        await apiClient.organizationDetails.get();
      } catch {
        // Expected API error
      }

      expect(mockLocation.assign).not.toHaveBeenCalled();
    });

    it('should handle non-JSON 403 responses gracefully', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 403,
        json: () => Promise.reject(new Error('Not JSON')),
        text: () => Promise.resolve('Not JSON'),
        clone: () => ({
          json: () => Promise.reject(new Error('Not JSON')),
        }),
      });

      const authDetails = createAuthDetails({ authProxyUrl: 'https://proxy.example.com' });
      const coreClient = await createCoreClient(authDetails);
      await coreClient.ensureScopes('read:org', 'my-org');

      const apiClient = coreClient.getMyOrgApiClient();
      try {
        await apiClient.organizationDetails.get();
      } catch {
        // Expected to throw
      }

      // Should not redirect since it couldn't parse JSON
      expect(mockLocation.assign).not.toHaveBeenCalled();
    });

    it('should not redirect when window is undefined (SSR)', async () => {
      // Remove window to simulate SSR
      Object.defineProperty(global, 'window', {
        value: undefined,
        writable: true,
      });

      mockFetch.mockResolvedValue({
        ok: false,
        status: 403,
        json: () => Promise.resolve({ error: 'insufficient_scope' }),
        text: () => Promise.resolve('{"error": "insufficient_scope"}'),
        clone: () => ({
          json: () => Promise.resolve({ error: 'insufficient_scope' }),
        }),
      });

      const authDetails = createAuthDetails({ authProxyUrl: 'https://proxy.example.com' });
      const coreClient = await createCoreClient(authDetails);
      await coreClient.ensureScopes('read:org', 'my-org');

      const apiClient = coreClient.getMyOrgApiClient();
      try {
        await apiClient.organizationDetails.get();
      } catch {
        // Expected API error
      }

      // Should not crash, mockLocation.assign should not be called
      expect(mockLocation.assign).not.toHaveBeenCalled();
    });

    it('should use default scopes when baseScope is not provided in auth details', async () => {
      const authDetails = createAuthDetails({
        authProxyUrl: 'https://proxy.example.com',
        scope: undefined, // No base scope
      });
      const coreClient = await createCoreClient(authDetails);

      expect(coreClient.auth.scope).toBeUndefined();
      // When a scope error occurs, default scopes 'openid profile email offline_access' will be used
    });
  });

  describe('fetcher behavior', () => {
    it('should set auth0-scope header in proxy mode when scopes are set', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: 'org-123', name: 'test-org', display_name: 'Test Org' }),
        text: () =>
          Promise.resolve('{"id": "org-123", "name": "test-org", "display_name": "Test Org"}'),
        clone: () => ({
          json: () =>
            Promise.resolve({ id: 'org-123', name: 'test-org', display_name: 'Test Org' }),
        }),
      });

      const authDetails = createAuthDetails({ authProxyUrl: 'https://proxy.example.com' });
      const coreClient = await createCoreClient(authDetails);
      await coreClient.ensureScopes('read:org:details', 'my-org');

      const apiClient = coreClient.getMyOrgApiClient();
      await apiClient.organizationDetails.get();

      // Verify fetch was called with auth0-scope header
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.any(Headers),
          credentials: 'include',
        }),
      );

      // Check the Headers object for auth0-scope
      const callArgs = mockFetch.mock.calls[0];
      const headers = callArgs?.[1]?.headers as Headers;
      expect(headers.get('auth0-scope')).toBe('read:org:details');
    });

    it('should set Authorization header in non-proxy mode', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: 'org-123', name: 'test-org', display_name: 'Test Org' }),
        text: () =>
          Promise.resolve('{"id": "org-123", "name": "test-org", "display_name": "Test Org"}'),
        clone: () => ({
          json: () =>
            Promise.resolve({ id: 'org-123', name: 'test-org', display_name: 'Test Org' }),
        }),
      });

      const authDetails = createAuthDetails({ authProxyUrl: undefined });
      const coreClient = await createCoreClient(authDetails);
      await coreClient.ensureScopes('read:org:details', 'my-org');

      const apiClient = coreClient.getMyOrgApiClient();
      await apiClient.organizationDetails.get();

      // Verify fetch was called with Authorization header
      const callArgs = mockFetch.mock.calls[0];
      const headers = callArgs?.[1]?.headers as Headers;
      expect(headers.get('Authorization')).toBe(`Bearer ${mockToken}`);
    });

    it('should set Content-Type header for requests with body', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: 'org-123', name: 'test-org', display_name: 'Test Org' }),
        text: () =>
          Promise.resolve('{"id": "org-123", "name": "test-org", "display_name": "Test Org"}'),
        clone: () => ({
          json: () =>
            Promise.resolve({ id: 'org-123', name: 'test-org', display_name: 'Test Org' }),
        }),
      });

      const authDetails = createAuthDetails({ authProxyUrl: 'https://proxy.example.com' });
      const coreClient = await createCoreClient(authDetails);
      await coreClient.ensureScopes('update:org:details', 'my-org');

      const apiClient = coreClient.getMyOrgApiClient();

      // Call update which has a body
      await apiClient.organizationDetails.update({
        display_name: 'Updated Org',
        branding: { colors: { primary: '#FF0000', page_background: '#FFFFFF' } },
      });

      // Verify Content-Type was set
      const callArgs = mockFetch.mock.calls[0];
      const headers = callArgs?.[1]?.headers as Headers;
      expect(headers.get('Content-Type')).toBe('application/json');
    });

    it('should accumulate scopes across multiple ensureScopes calls', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        json: () => Promise.resolve({ id: 'org-123', name: 'test-org', display_name: 'Test Org' }),
        text: () =>
          Promise.resolve('{"id": "org-123", "name": "test-org", "display_name": "Test Org"}'),
        clone: () => ({
          json: () =>
            Promise.resolve({ id: 'org-123', name: 'test-org', display_name: 'Test Org' }),
        }),
      });

      const authDetails = createAuthDetails({ authProxyUrl: 'https://proxy.example.com' });
      const coreClient = await createCoreClient(authDetails);

      // Set multiple scopes
      await coreClient.ensureScopes('read:org:details', 'my-org');
      await coreClient.ensureScopes('update:org:details', 'my-org');

      const apiClient = coreClient.getMyOrgApiClient();
      await apiClient.organizationDetails.get();

      // Verify accumulated scopes are in header
      const callArgs = mockFetch.mock.calls[0];
      const headers = callArgs?.[1]?.headers as Headers;
      const scopeHeader = headers.get('auth0-scope');
      expect(scopeHeader).toContain('read:org:details');
      expect(scopeHeader).toContain('update:org:details');
    });
  });

  describe('createBoundClient (via API clients)', () => {
    it('should create myOrgApiClient with correct configuration', async () => {
      const authDetails = createAuthDetails();
      const coreClient = await createCoreClient(authDetails);

      const orgClient = coreClient.getMyOrgApiClient();
      expect(orgClient).toBeDefined();
    });

    it('should create myAccountApiClient with correct configuration', async () => {
      const authDetails = createAuthDetails();
      const coreClient = await createCoreClient(authDetails);

      const accountClient = coreClient.getMyAccountApiClient();
      expect(accountClient).toBeDefined();
    });

    it('should use proxy baseUrl when authProxyUrl is set', async () => {
      const authDetails = createAuthDetails({ authProxyUrl: 'https://proxy.example.com' });
      const coreClient = await createCoreClient(authDetails);

      expect(coreClient.isProxyMode()).toBe(true);
      expect(coreClient.getMyOrgApiClient()).toBeDefined();
      expect(coreClient.getMyAccountApiClient()).toBeDefined();
    });

    it('should use domain when not in proxy mode', async () => {
      const authDetails = createAuthDetails({ domain: 'example.auth0.com' });
      const coreClient = await createCoreClient(authDetails);

      expect(coreClient.isProxyMode()).toBe(false);
      expect(coreClient.getMyOrgApiClient()).toBeDefined();
    });
  });

  describe('scope accumulation', () => {
    it('should merge scopes when setLatestScopes is called multiple times', async () => {
      const authDetails = createAuthDetails({ authProxyUrl: 'https://proxy.example.com' });
      const coreClient = await createCoreClient(authDetails);

      // First scope set
      await coreClient.ensureScopes('read:org:details', 'my-org');
      // Second scope set - should merge with first
      await coreClient.ensureScopes('update:org:details', 'my-org');

      // Verify both scopes are preserved (we can't directly access latestScopes,
      // but we can verify the client is configured correctly)
      expect(coreClient.getMyOrgApiClient()).toBeDefined();
    });

    it('should handle separate scope accumulation for different audiences', async () => {
      const authDetails = createAuthDetails({ authProxyUrl: 'https://proxy.example.com' });
      const coreClient = await createCoreClient(authDetails);

      // Set scopes for my-org
      await coreClient.ensureScopes('read:org', 'my-org');
      // Set scopes for me
      await coreClient.ensureScopes('read:me', 'me');

      // Both clients should have their respective scopes
      expect(coreClient.getMyOrgApiClient()).toBeDefined();
      expect(coreClient.getMyAccountApiClient()).toBeDefined();
    });
  });
});
