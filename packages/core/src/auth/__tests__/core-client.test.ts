import type { MyAccountClient } from '@auth0/myaccount-js';
import type { MyOrganizationClient } from '@auth0/myorganization-js';
import { initializeMyAccountClient } from '@core/services/my-account/my-account-api-service';
import { initializeMyOrgClient } from '@core/services/my-org/my-org-api-service';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createI18nService } from '../../i18n';
import { createMockI18nService } from '../../i18n/__mocks__/i18n-service.mocks';
import { createMockMyAccountClient } from '../../services/my-account/__tests__/__mocks__/my-account-api-service.mocks';
import { createMockMyOrgClient } from '../../services/my-org/__tests__/__mocks__/my-org-api-service.mocks';
import { createMockTokenManager } from '../__mocks__/token-manager.mocks';
import type { AuthDetails } from '../auth-types';
import { createCoreClient } from '../core-client';
import { createTokenManager } from '../token-manager';

// Mock the modules
vi.mock('../../i18n');
vi.mock('../token-manager');
vi.mock('@core/services/my-org/my-org-api-service');
vi.mock('@core/services/my-account/my-account-api-service');

describe('createCoreClient', () => {
  // Create mock instances using mock utilities
  const mockI18nService = createMockI18nService();
  const mockTokenManager = createMockTokenManager();
  const mockMyOrgClient = createMockMyOrgClient();
  const mockMyAccountClient = createMockMyAccountClient();

  // Get the mocked functions
  const createI18nServiceMock = vi.mocked(createI18nService);
  const createTokenManagerMock = vi.mocked(createTokenManager);
  const initializeMyOrgClientMock = vi.mocked(initializeMyOrgClient);
  const initializeMyAccountClientMock = vi.mocked(initializeMyAccountClient);

  const createAuthDetails = (overrides: Partial<AuthDetails> = {}): AuthDetails => {
    return {
      domain: 'example.auth0.com',
      authProxyUrl: undefined,
      contextInterface: {} as AuthDetails['contextInterface'],
      ...overrides,
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementations
    createI18nServiceMock.mockResolvedValue(mockI18nService);
    createTokenManagerMock.mockReturnValue(mockTokenManager);
    initializeMyOrgClientMock.mockReturnValue(mockMyOrgClient);
    initializeMyAccountClientMock.mockReturnValue(mockMyAccountClient);

    // Reset token manager mock to return successful token
    vi.mocked(mockTokenManager.getToken).mockResolvedValue('mock-token');
  });

  describe('i18n initialization', () => {
    it('initializes i18n with default options when none are provided', async () => {
      const authDetails = createAuthDetails();
      await createCoreClient(authDetails);

      expect(createI18nServiceMock).toHaveBeenCalledWith({
        currentLanguage: 'en-US',
        fallbackLanguage: 'en-US',
      });
    });

    it('initializes i18n with provided language options', async () => {
      const i18nOptions = { currentLanguage: 'es', fallbackLanguage: 'en' };
      const authDetails = createAuthDetails();
      await createCoreClient(authDetails, i18nOptions);

      expect(createI18nServiceMock).toHaveBeenCalledWith(i18nOptions);
    });

    it('exposes i18nService on the client', async () => {
      const authDetails = createAuthDetails();
      const client = await createCoreClient(authDetails);

      expect(client.i18nService).toBe(mockI18nService);
    });
  });

  describe('isProxyMode', () => {
    it('returns false when authProxyUrl is undefined', async () => {
      const authDetails = createAuthDetails();
      const client = await createCoreClient(authDetails);

      expect(client.isProxyMode()).toBe(false);
    });

    it('returns true when authProxyUrl is set', async () => {
      const authDetails = createAuthDetails({ authProxyUrl: 'https://proxy.auth0.com' });
      const client = await createCoreClient(authDetails);

      expect(client.isProxyMode()).toBe(true);
    });

    it('returns false when authProxyUrl is empty string', async () => {
      const authDetails = createAuthDetails({ authProxyUrl: '' });
      const client = await createCoreClient(authDetails);

      expect(client.isProxyMode()).toBe(false);
    });
  });

  describe('getToken', () => {
    it('delegates to token manager with all parameters', async () => {
      const authDetails = createAuthDetails();
      const client = await createCoreClient(authDetails);

      await client.getToken('read:org', 'my-org', true);

      expect(mockTokenManager.getToken).toHaveBeenCalledWith('read:org', 'my-org', true);
    });

    it('delegates to token manager with default ignoreCache', async () => {
      const authDetails = createAuthDetails();
      const client = await createCoreClient(authDetails);

      await client.getToken('read:me', 'me');

      expect(mockTokenManager.getToken).toHaveBeenCalledWith('read:me', 'me', false);
    });

    it('returns the token from token manager', async () => {
      const authDetails = createAuthDetails();
      vi.mocked(mockTokenManager.getToken).mockResolvedValueOnce('specific-token-value');
      const client = await createCoreClient(authDetails);

      const token = await client.getToken('read:me', 'me');

      expect(token).toBe('specific-token-value');
    });
  });

  describe('ensureScopes - proxy mode', () => {
    it('sets org scopes without token fetch in proxy mode', async () => {
      const authDetails = createAuthDetails({ authProxyUrl: 'https://proxy.auth0.com' });
      const client = await createCoreClient(authDetails);

      await client.ensureScopes('read:org', 'my-org');

      expect(mockMyOrgClient.setLatestScopes).toHaveBeenCalledWith('read:org');
      expect(mockTokenManager.getToken).not.toHaveBeenCalled();
    });

    it('sets account scopes without token fetch in proxy mode', async () => {
      const authDetails = createAuthDetails({ authProxyUrl: 'https://proxy.auth0.com' });
      const client = await createCoreClient(authDetails);

      await client.ensureScopes('read:me', 'me');

      expect(mockMyAccountClient.setLatestScopes).toHaveBeenCalledWith('read:me');
      expect(mockTokenManager.getToken).not.toHaveBeenCalled();
    });

    it('does not set scopes for unknown audience in proxy mode', async () => {
      const authDetails = createAuthDetails({ authProxyUrl: 'https://proxy.auth0.com' });
      const client = await createCoreClient(authDetails);

      await client.ensureScopes('read:something', 'unknown-audience');

      expect(mockMyOrgClient.setLatestScopes).not.toHaveBeenCalled();
      expect(mockMyAccountClient.setLatestScopes).not.toHaveBeenCalled();
      expect(mockTokenManager.getToken).not.toHaveBeenCalled();
    });
  });

  describe('ensureScopes - non-proxy mode', () => {
    it('throws when domain is missing in non-proxy mode', async () => {
      const authDetails = createAuthDetails({ domain: undefined });
      const client = await createCoreClient(authDetails);

      await expect(client.ensureScopes('read:org', 'my-org')).rejects.toThrow(
        'Authentication domain is missing, cannot initialize SPA service.',
      );
      expect(mockMyOrgClient.setLatestScopes).not.toHaveBeenCalled();
      expect(mockTokenManager.getToken).not.toHaveBeenCalled();
    });

    it('sets org scopes and fetches token in non-proxy mode', async () => {
      const authDetails = createAuthDetails();
      const client = await createCoreClient(authDetails);

      await client.ensureScopes('read:org', 'my-org');

      expect(mockMyOrgClient.setLatestScopes).toHaveBeenCalledWith('read:org');
      expect(mockTokenManager.getToken).toHaveBeenCalledWith('read:org', 'my-org', true);
    });

    it('sets account scopes and fetches token in non-proxy mode', async () => {
      const authDetails = createAuthDetails();
      const client = await createCoreClient(authDetails);

      await client.ensureScopes('read:me', 'me');

      expect(mockMyAccountClient.setLatestScopes).toHaveBeenCalledWith('read:me');
      expect(mockTokenManager.getToken).toHaveBeenCalledWith('read:me', 'me', true);
    });

    it('throws when token retrieval returns undefined in non-proxy mode', async () => {
      vi.mocked(mockTokenManager.getToken).mockResolvedValueOnce(undefined);
      const authDetails = createAuthDetails();
      const client = await createCoreClient(authDetails);

      await expect(client.ensureScopes('read:me', 'me')).rejects.toThrow(
        'Failed to retrieve token for audience: me',
      );
    });

    it('does not set scopes for unknown audience in non-proxy mode', async () => {
      const authDetails = createAuthDetails();
      const client = await createCoreClient(authDetails);

      await client.ensureScopes('read:something', 'unknown-audience');

      expect(mockMyOrgClient.setLatestScopes).not.toHaveBeenCalled();
      expect(mockMyAccountClient.setLatestScopes).not.toHaveBeenCalled();
      // Token fetch still happens for unknown audiences in non-proxy mode
      expect(mockTokenManager.getToken).toHaveBeenCalledWith(
        'read:something',
        'unknown-audience',
        true,
      );
    });
  });

  describe('API client initialization', () => {
    it('initializes token manager with auth details', async () => {
      const authDetails = createAuthDetails();
      await createCoreClient(authDetails);

      expect(createTokenManagerMock).toHaveBeenCalledWith(authDetails);
    });

    it('initializes MyOrg client with auth and token manager', async () => {
      const authDetails = createAuthDetails();
      await createCoreClient(authDetails);

      expect(initializeMyOrgClientMock).toHaveBeenCalledWith(authDetails, mockTokenManager);
    });

    it('initializes MyAccount client with auth and token manager', async () => {
      const authDetails = createAuthDetails();
      await createCoreClient(authDetails);

      expect(initializeMyAccountClientMock).toHaveBeenCalledWith(authDetails, mockTokenManager);
    });
  });

  describe('API client access', () => {
    it('exposes myAccountApiClient directly on the client', async () => {
      const authDetails = createAuthDetails();
      const client = await createCoreClient(authDetails);

      expect(client.myAccountApiClient).toBe(mockMyAccountClient.client);
    });

    it('exposes myOrgApiClient directly on the client', async () => {
      const authDetails = createAuthDetails();
      const client = await createCoreClient(authDetails);

      expect(client.myOrgApiClient).toBe(mockMyOrgClient.client);
    });

    it('returns myAccountApiClient when available via getter', async () => {
      const authDetails = createAuthDetails();
      const client = await createCoreClient(authDetails);

      expect(client.getMyAccountApiClient()).toBe(mockMyAccountClient.client);
    });

    it('returns myOrgApiClient when available via getter', async () => {
      const authDetails = createAuthDetails();
      const client = await createCoreClient(authDetails);

      expect(client.getMyOrgApiClient()).toBe(mockMyOrgClient.client);
    });

    it('throws when myAccountApiClient is not available', async () => {
      initializeMyAccountClientMock.mockReturnValueOnce({
        client: undefined as unknown as MyAccountClient,
        setLatestScopes: vi.fn(),
      });

      const authDetails = createAuthDetails();
      const client = await createCoreClient(authDetails);

      expect(() => client.getMyAccountApiClient()).toThrow(
        'myAccountApiClient is not enabled. Please use it within Auth0ComponentProvider.',
      );
    });

    it('throws when myOrgApiClient is not available', async () => {
      initializeMyOrgClientMock.mockReturnValueOnce({
        client: undefined as unknown as MyOrganizationClient,
        setLatestScopes: vi.fn(),
      });
      const authDetails = createAuthDetails();
      const client = await createCoreClient(authDetails);

      expect(() => client.getMyOrgApiClient()).toThrow(
        'myOrgApiClient is not enabled. Please ensure you are in an Auth0 Organization context.',
      );
    });
  });

  describe('client properties', () => {
    it('exposes auth details on the client', async () => {
      const authDetails = createAuthDetails();
      const client = await createCoreClient(authDetails);

      expect(client.auth).toEqual(authDetails);
    });

    it('preserves authProxyUrl in auth details', async () => {
      const authDetails = createAuthDetails({ authProxyUrl: 'https://custom-proxy.com' });
      const client = await createCoreClient(authDetails);

      expect(client.auth.authProxyUrl).toBe('https://custom-proxy.com');
    });

    it('preserves domain in auth details', async () => {
      const authDetails = createAuthDetails();
      const client = await createCoreClient(authDetails);

      expect(client.auth.domain).toBe('example.auth0.com');
    });

    it('preserves contextInterface in auth details', async () => {
      const customContext: AuthDetails['contextInterface'] = {
        user: { name: 'Test User' },
        isAuthenticated: true,
        getAccessTokenSilently: vi.fn(),
        getAccessTokenWithPopup: vi.fn(),
        loginWithRedirect: vi.fn(),
      };
      const authDetails = createAuthDetails({ contextInterface: customContext });
      const client = await createCoreClient(authDetails);

      expect(client.auth.contextInterface).toBe(customContext);
    });
  });
});
