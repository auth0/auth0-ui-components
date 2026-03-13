import { initializeMfaStepUpClient } from '@core/services/mfa-step-up/mfa-step-up-api-service';
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
import type { MyAccountApiClient } from '../../services/my-account/my-account-api-service';
import { createMockMyOrganizationClient } from '../../services/my-organization/__tests__/__mocks__/my-organization-api-service.mocks';
import type { MyOrganizationApiClient } from '../../services/my-organization/my-organization-api-service';
import type { AuthDetails } from '../auth-types';
import { createCoreClient } from '../core-client';

// Mock the modules
vi.mock('@core/i18n');
vi.mock('@core/services/my-organization/my-organization-api-service');
vi.mock('@core/services/my-account/my-account-api-service');
vi.mock('@core/services/mfa-step-up/mfa-step-up-api-service');

describe('createCoreClient', () => {
  // Create mock instances using mock utilities
  const mockI18nService = createMockI18nService();
  const mockMyOrganizationClient = createMockMyOrganizationClient();
  const mockMyAccountClient = createMockMyAccountClient();
  const mockMfaApiClient = {
    getAuthenticators: vi.fn().mockResolvedValue([]),
    enroll: vi.fn().mockResolvedValue({}),
    challenge: vi.fn().mockResolvedValue({}),
    verify: vi.fn().mockResolvedValue({}),
  };

  // Get the mocked functions
  const createI18nServiceMock = vi.mocked(createI18nService);
  const initializeMyOrganizationClientMock = vi.mocked(initializeMyOrganizationClient);
  const initializeMyAccountClientMock = vi.mocked(initializeMyAccountClient);
  const initializeMfaStepUpClientMock = vi.mocked(initializeMfaStepUpClient);

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
    initializeMyOrganizationClientMock.mockReturnValue(mockMyOrganizationClient);
    initializeMyAccountClientMock.mockReturnValue(mockMyAccountClient);
    initializeMfaStepUpClientMock.mockReturnValue(mockMfaApiClient);
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

  describe('API client initialization', () => {
    it('initializes MyOrg client with auth details', async () => {
      const authDetails = createAuthDetails();
      await createCoreClient(authDetails);

      expect(initializeMyOrganizationClientMock).toHaveBeenCalledWith(
        expect.objectContaining({ mode: 'spa', domain: TEST_DOMAIN }),
      );
    });

    it('initializes MyAccount client with auth details', async () => {
      const authDetails = createAuthDetails();
      await createCoreClient(authDetails);

      expect(initializeMyAccountClientMock).toHaveBeenCalledWith(
        expect.objectContaining({ mode: 'spa', domain: TEST_DOMAIN }),
      );
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
      initializeMyAccountClientMock.mockReturnValueOnce(null as unknown as MyAccountApiClient);

      const authDetails = createAuthDetails();
      const client = await createCoreClient(authDetails);

      expect(() => client.getMyAccountApiClient()).toThrow(
        'myAccountApiClient is not enabled. Please use it within Auth0ComponentProvider.',
      );
    });

    it('throws when myOrganizationApiClient is not available', async () => {
      initializeMyOrganizationClientMock.mockReturnValueOnce(
        null as unknown as MyOrganizationApiClient,
      );
      const authDetails = createAuthDetails();
      const client = await createCoreClient(authDetails);

      expect(() => client.getMyOrganizationApiClient()).toThrow(
        'myOrganizationApiClient is not enabled. Please ensure you are in an Auth0 Organization context.',
      );
    });

    it('returns mfaApiClient via getter', async () => {
      const authDetails = createAuthDetails();
      const client = await createCoreClient(authDetails);

      expect(client.getMFAStepUpApiClient()).toBe(mockMfaApiClient);
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
    it('returns domain in SPA mode', async () => {
      const authDetails = createAuthDetails({ domain: TEST_DOMAIN });
      const client = await createCoreClient(authDetails);

      expect(client.getDomain()).toBe(TEST_DOMAIN);
    });

    it('returns domain in proxy mode when domain is provided', async () => {
      const authDetails = createAuthDetails({
        authProxyUrl: 'https://proxy.auth0.com',
        domain: TEST_DOMAIN,
      });
      const client = await createCoreClient(authDetails);

      expect(client.getDomain()).toBe(TEST_DOMAIN);
    });

    it('returns undefined in proxy mode when no domain is provided', async () => {
      const authDetails = createAuthDetails({
        authProxyUrl: 'https://proxy.auth0.com',
        domain: undefined,
      });
      const client = await createCoreClient(authDetails);

      expect(client.getDomain()).toBeUndefined();
    });
  });

  describe('previewMode', () => {
    it('returns a core client with previewMode and disables API clients', async () => {
      const authDetails = { ...createAuthDetails(), previewMode: true };
      const client = await createCoreClient(authDetails);

      expect(client.auth).toEqual({});
      expect(client.myAccountApiClient).toBeUndefined();
      expect(client.myOrganizationApiClient).toBeUndefined();
      expect(typeof client.isProxyMode).toBe('function');
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

    it('getMFAStepUpApiClient throws in previewMode', async () => {
      const authDetails = { ...createAuthDetails(), previewMode: true };
      const client = await createCoreClient(authDetails);

      expect(() => client.getMFAStepUpApiClient()).toThrow('Function not implemented.');
    });

    it('getDomain returns undefined in previewMode', async () => {
      const authDetails = { ...createAuthDetails(), previewMode: true };
      const client = await createCoreClient(authDetails);

      expect(client.getDomain()).toBeUndefined();
    });
  });
});
