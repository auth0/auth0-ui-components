import { initializeMyAccountClient } from '@core/services/my-account/my-account-api-service';
import type { MyAccountClientWithScopes } from '@core/services/my-account/my-account-api-service';
import { initializeMyOrganizationClient } from '@core/services/my-organization/my-organization-api-service';
import type { MyOrganizationClientWithScopes } from '@core/services/my-organization/my-organization-api-service';
import { initializeStepUpApiService } from '@core/services/step-up';
import type { StepUpApiService } from '@core/services/step-up';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createI18nService } from '../../i18n';
import { createMockI18nService } from '../../i18n/__mocks__/i18n-service.mocks';
import {
  createMockContextInterface,
  TEST_DOMAIN,
} from '../../internals/__mocks__/shared/api-service.mocks';
import { createMockMyAccountClient } from '../../services/my-account/__tests__/__mocks__/my-account-api-service.mocks';
import { createMockMyOrganizationClient } from '../../services/my-organization/__tests__/__mocks__/my-organization-api-service.mocks';
import { createMockSpaTokenRetriever } from '../__mocks__/spa-token-retriever.mocks';
import type { AuthDetails } from '../auth-types';
import { createCoreClient } from '../core-client';
import { createSpaTokenRetriever } from '../spa-token-retriever';

// Mock the modules
vi.mock('@core/i18n');
vi.mock('@core/auth/spa-token-retriever');
vi.mock('@core/services/my-organization/my-organization-api-service');
vi.mock('@core/services/my-account/my-account-api-service');
vi.mock('@core/services/step-up');

describe('createCoreClient', () => {
  // Create mock instances using mock utilities
  const mockI18nService = createMockI18nService();
  const mockTokenManager = createMockSpaTokenRetriever();
  const mockMyOrganizationClient = createMockMyOrganizationClient();
  const mockMyAccountClient = createMockMyAccountClient();
  const mockStepUpApiService = {
    getAuthenticators: vi.fn(),
    enroll: vi.fn(),
    challenge: vi.fn(),
    getEnrollmentFactors: vi.fn(),
    verify: vi.fn(),
  } as unknown as StepUpApiService;

  // Get the mocked functions
  const createI18nServiceMock = vi.mocked(createI18nService);
  const createSpaTokenRetrieverMock = vi.mocked(createSpaTokenRetriever);
  const initializeMyOrganizationClientMock = vi.mocked(initializeMyOrganizationClient);
  const initializeMyAccountClientMock = vi.mocked(initializeMyAccountClient);
  const initializeStepUpApiServiceMock = vi.mocked(initializeStepUpApiService);

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
    createSpaTokenRetrieverMock.mockReturnValue(mockTokenManager);
    initializeMyOrganizationClientMock.mockReturnValue(mockMyOrganizationClient);
    initializeMyAccountClientMock.mockReturnValue(mockMyAccountClient);
    initializeStepUpApiServiceMock.mockReturnValue(mockStepUpApiService);

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

  // ensureScopes tests removed - functionality replaced with withScopes() per-call pattern

  describe('API client initialization', () => {
    it('initializes token manager with auth details', async () => {
      const authDetails = createAuthDetails();
      await createCoreClient(authDetails);

      expect(createSpaTokenRetrieverMock).toHaveBeenCalledWith(authDetails);
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

      expect(client.myAccountApiClient).toBe(mockMyAccountClient);
    });

    it('exposes myOrganizationApiClient directly on the client', async () => {
      const authDetails = createAuthDetails();
      const client = await createCoreClient(authDetails);

      expect(client.myOrganizationApiClient).toBe(mockMyOrganizationClient);
    });

    it('returns myAccountApiClient when available via getter', async () => {
      const authDetails = createAuthDetails();
      const client = await createCoreClient(authDetails);

      expect(client.getMyAccountApiClient()).toBe(mockMyAccountClient);
    });

    it('returns myOrganizationApiClient when available via getter', async () => {
      const authDetails = createAuthDetails();
      const client = await createCoreClient(authDetails);

      expect(client.getMyOrganizationApiClient()).toBe(mockMyOrganizationClient);
    });

    it('throws when myAccountApiClient is not available', async () => {
      initializeMyAccountClientMock.mockReturnValueOnce(
        undefined as unknown as MyAccountClientWithScopes,
      );

      const authDetails = createAuthDetails();
      const client = await createCoreClient(authDetails);

      expect(() => client.getMyAccountApiClient()).toThrow(
        'myAccountApiClient is not enabled. Please use it within Auth0ComponentProvider.',
      );
    });

    it('throws when myOrganizationApiClient is not available', async () => {
      initializeMyOrganizationClientMock.mockReturnValueOnce(
        undefined as unknown as MyOrganizationClientWithScopes,
      );
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

  describe('getDomain', () => {
    it('returns domain from authDetails when provided', async () => {
      const authDetails = createAuthDetails({ domain: 'custom.auth0.com' });
      const client = await createCoreClient(authDetails);

      expect(client.getDomain()).toBe('custom.auth0.com');
    });

    it('falls back to contextInterface domain when authDetails domain is undefined', async () => {
      const authDetails = createAuthDetails({ domain: undefined });
      const client = await createCoreClient(authDetails);

      expect(client.getDomain()).toBe(TEST_DOMAIN);
    });
  });

  describe('stepUpApiService access', () => {
    it('returns stepUpApiService when available via getter', async () => {
      const authDetails = createAuthDetails();
      const client = await createCoreClient(authDetails);

      expect(client.getStepUpApiService()).toBe(mockStepUpApiService);
    });

    it('throws when stepUpApiService is not available', async () => {
      initializeStepUpApiServiceMock.mockReturnValueOnce(undefined as unknown as StepUpApiService);

      const authDetails = createAuthDetails();
      const client = await createCoreClient(authDetails);

      expect(() => client.getStepUpApiService()).toThrow(
        'stepUpApiService is not enabled. Please use it within Auth0ComponentProvider.',
      );
    });

    it('exposes stepUpApiService directly on the client', async () => {
      const authDetails = createAuthDetails();
      const client = await createCoreClient(authDetails);

      expect(client.stepUpApiService).toBe(mockStepUpApiService);
    });
  });

  // --- New tests for previewMode ---
  describe('previewMode', () => {
    it('returns a core client with previewMode and disables API clients', async () => {
      const authDetails = { ...createAuthDetails(), previewMode: true };
      const client = await createCoreClient(authDetails);

      expect(client.auth).toEqual({});
      expect(client.myAccountApiClient).toBeUndefined();
      expect(client.myOrganizationApiClient).toBeUndefined();
      expect(typeof client.getToken).toBe('function');
      expect(typeof client.isProxyMode).toBe('function');
    });

    it('getToken returns undefined in previewMode', async () => {
      const authDetails = { ...createAuthDetails(), previewMode: true };
      const client = await createCoreClient(authDetails);

      const token = await client.getToken('scope', 'aud');
      expect(token).toBeUndefined();
    });

    it('isProxyMode returns false in previewMode', async () => {
      const authDetails = { ...createAuthDetails(), previewMode: true };
      const client = await createCoreClient(authDetails);

      expect(client.isProxyMode()).toBe(false);
    });

    it('getMyAccountApiClient throws in previewMode', async () => {
      const authDetails = { ...createAuthDetails(), previewMode: true };
      const client = await createCoreClient(authDetails);

      expect(() => client.getMyAccountApiClient()).toThrow('Function not implemented.');
    });

    it('getMyOrganizationApiClient throws in previewMode', async () => {
      const authDetails = { ...createAuthDetails(), previewMode: true };
      const client = await createCoreClient(authDetails);

      expect(() => client.getMyOrganizationApiClient()).toThrow('Function not implemented.');
    });

    it('getDomain returns undefined in previewMode', async () => {
      const authDetails = { ...createAuthDetails(), previewMode: true };
      const client = await createCoreClient(authDetails);

      expect(client.getDomain()).toBeUndefined();
    });

    it('getStepUpApiService returns undefined in previewMode', async () => {
      const authDetails = { ...createAuthDetails(), previewMode: true };
      const client = await createCoreClient(authDetails);

      expect(client.getStepUpApiService()).toBeUndefined();
    });
  });
});
