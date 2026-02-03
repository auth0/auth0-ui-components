import type { MyAccountClient } from '@auth0/myaccount-js';
import type { MyOrganizationClient } from '@auth0/myorganization-js';
import { initializeMyAccountClient } from '@core/services/my-account/my-account-api-service';
import { initializeMyOrganizationClient } from '@core/services/my-organization/my-organization-api-service';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createI18nService } from '../../i18n';
import { createMockI18nService } from '../../i18n/__mocks__/i18n-service.mocks';
import {
  createMockContextInterface,
  TEST_DOMAIN,
} from '../../internals/__mocks__/shared/api-service.mocks';
import { createMockMyAccountClient } from '../../services/my-account/__tests__/__mocks__/my-account-api-service.mocks';
import { createMockMyOrganizationClient } from '../../services/my-organization/__tests__/__mocks__/my-organization-api-service.mocks';
import { createMockTokenManager } from '../__mocks__/token-manager.mocks';
import type { AuthDetails } from '../auth-types';
import { createCoreClient } from '../core-client';
import { createTokenManager } from '../token-manager';

// Mock the modules
vi.mock('../../i18n');
vi.mock('../token-manager');
vi.mock('@core/services/my-organization/my-organization-api-service');
vi.mock('@core/services/my-account/my-account-api-service');

describe('createCoreClient', () => {
  // Create mock instances using mock utilities
  const mockI18nService = createMockI18nService();
  const mockTokenManager = createMockTokenManager();
  const mockMyOrganizationClient = createMockMyOrganizationClient();
  const mockMyAccountClient = createMockMyAccountClient();

  // Get the mocked functions
  const createI18nServiceMock = vi.mocked(createI18nService);
  const createTokenManagerMock = vi.mocked(createTokenManager);
  const initializeMyOrganizationClientMock = vi.mocked(initializeMyOrganizationClient);
  const initializeMyAccountClientMock = vi.mocked(initializeMyAccountClient);

  const createAuthDetails = (overrides: Partial<AuthDetails> = {}): AuthDetails => {
    return {
      domain: TEST_DOMAIN,
      authProxyUrl: undefined,
      contextInterface: createMockContextInterface(),
      ...overrides,
    };
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mock implementations
    createI18nServiceMock.mockResolvedValue(mockI18nService);
    createTokenManagerMock.mockReturnValue(mockTokenManager);
    initializeMyOrganizationClientMock.mockReturnValue(mockMyOrganizationClient);
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

      expect(mockTokenManager.getToken).toHaveBeenCalledWith('read:me', 'me', undefined);
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

      expect(mockMyOrganizationClient.setLatestScopes).toHaveBeenCalledWith('read:org');
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

      expect(mockMyOrganizationClient.setLatestScopes).not.toHaveBeenCalled();
      expect(mockMyAccountClient.setLatestScopes).not.toHaveBeenCalled();
      expect(mockTokenManager.getToken).not.toHaveBeenCalled();
    });
  });

  describe('ensureScopes - non-proxy mode', () => {
    it('throws when domain is missing in non-proxy mode', async () => {
      const authDetails = createAuthDetails({ domain: '', contextInterface: undefined });
      const client = await createCoreClient(authDetails);

      await expect(client.ensureScopes('read:org', 'my-org')).rejects.toThrow(
        'Authentication domain is missing, cannot initialize SPA service.',
      );
      expect(mockMyOrganizationClient.setLatestScopes).not.toHaveBeenCalled();
      expect(mockTokenManager.getToken).not.toHaveBeenCalled();
    });

    it('uses domain from contextInterface.getConfiguration() when auth.domain is undefined', async () => {
      const mockContext = {
        ...createMockContextInterface(),
        getConfiguration: vi
          .fn()
          .mockReturnValue({ domain: 'context.auth0.com', clientId: 'test-client-id' }),
      };
      const authDetails = createAuthDetails({ domain: undefined, contextInterface: mockContext });
      const client = await createCoreClient(authDetails);

      await client.ensureScopes('read:org', 'my-org');

      expect(mockMyOrganizationClient.setLatestScopes).toHaveBeenCalledWith('read:org');
      expect(mockTokenManager.getToken).toHaveBeenCalledWith('read:org', 'my-org', true);
    });

    it('prefers auth.domain over contextInterface.getConfiguration().domain', async () => {
      const mockContext = {
        ...createMockContextInterface(),
        getConfiguration: vi
          .fn()
          .mockReturnValue({ domain: 'context.auth0.com', clientId: 'test-client-id' }),
      };
      const authDetails = createAuthDetails({
        domain: 'explicit.auth0.com',
        contextInterface: mockContext,
      });
      const client = await createCoreClient(authDetails);

      await client.ensureScopes('read:org', 'my-org');

      // Should not throw, meaning domain was found
      expect(mockMyOrganizationClient.setLatestScopes).toHaveBeenCalledWith('read:org');
      expect(mockTokenManager.getToken).toHaveBeenCalledWith('read:org', 'my-org', true);
    });

    it('throws when contextInterface.getConfiguration() returns undefined domain', async () => {
      const mockContext = {
        ...createMockContextInterface(),
        getConfiguration: vi.fn().mockReturnValue({ clientId: 'test-client-id' }),
      };
      const authDetails = createAuthDetails({ domain: undefined, contextInterface: mockContext });
      const client = await createCoreClient(authDetails);

      await expect(client.ensureScopes('read:org', 'my-org')).rejects.toThrow(
        'Authentication domain is missing, cannot initialize SPA service.',
      );
    });

    it('throws when contextInterface.getConfiguration() returns undefined', async () => {
      const mockContext = {
        ...createMockContextInterface(),
        getConfiguration: vi.fn().mockReturnValue(undefined),
      };
      const authDetails = createAuthDetails({ domain: undefined, contextInterface: mockContext });
      const client = await createCoreClient(authDetails);

      await expect(client.ensureScopes('read:org', 'my-org')).rejects.toThrow(
        'Authentication domain is missing, cannot initialize SPA service.',
      );
    });

    it('throws when contextInterface is undefined and domain is not provided', async () => {
      const authDetails = createAuthDetails({ domain: undefined, contextInterface: undefined });
      const client = await createCoreClient(authDetails);

      await expect(client.ensureScopes('read:org', 'my-org')).rejects.toThrow(
        'Authentication domain is missing, cannot initialize SPA service.',
      );
    });

    it('sets org scopes and fetches token in non-proxy mode', async () => {
      const authDetails = createAuthDetails();
      const client = await createCoreClient(authDetails);

      await client.ensureScopes('read:org', 'my-org');

      expect(mockMyOrganizationClient.setLatestScopes).toHaveBeenCalledWith('read:org');
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

      expect(mockMyOrganizationClient.setLatestScopes).not.toHaveBeenCalled();
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

      expect(initializeMyOrganizationClientMock).toHaveBeenCalledWith(
        authDetails,
        mockTokenManager,
      );
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

    it('exposes myOrganizationApiClient directly on the client', async () => {
      const authDetails = createAuthDetails();
      const client = await createCoreClient(authDetails);

      expect(client.myOrganizationApiClient).toBe(mockMyOrganizationClient.client);
    });

    it('returns myAccountApiClient when available via getter', async () => {
      const authDetails = createAuthDetails();
      const client = await createCoreClient(authDetails);

      expect(client.getMyAccountApiClient()).toBe(mockMyAccountClient.client);
    });

    it('returns myOrganizationApiClient when available via getter', async () => {
      const authDetails = createAuthDetails();
      const client = await createCoreClient(authDetails);

      expect(client.getMyOrganizationApiClient()).toBe(mockMyOrganizationClient.client);
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

    it('throws when myOrganizationApiClient is not available', async () => {
      initializeMyOrganizationClientMock.mockReturnValueOnce({
        client: undefined as unknown as MyOrganizationClient,
        setLatestScopes: vi.fn(),
      });
      const authDetails = createAuthDetails();
      const client = await createCoreClient(authDetails);

      expect(() => client.getMyOrganizationApiClient()).toThrow(
        'myOrganizationApiClient is not enabled. Please ensure you are in an Auth0 Organization context.',
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

    it('preserves contextInterface in auth details', async () => {
      const customContext = createMockContextInterface();
      const authDetails = createAuthDetails({ contextInterface: customContext });
      const client = await createCoreClient(authDetails);

      expect(client.auth.contextInterface).toBe(customContext);
    });
  });
});
