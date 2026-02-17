import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { TEST_DOMAIN, TEST_CLIENT_ID } from '../../internals/__mocks__/shared/api-service.mocks';
import type {
  AuthDetails,
  BasicAuth0ContextInterface,
  GetTokenSilentlyVerboseResponse,
} from '../auth-types';
import { createTokenManager } from '../token-manager';

describe('token-manager', () => {
  const mockMfaClient = {
    getAuthenticators: vi.fn().mockResolvedValue([]),
    enroll: vi.fn().mockResolvedValue({
      authenticatorType: 'otp',
      secret: 'mock-secret',
      barcodeUri: 'otpauth://totp/mock',
      id: 'authenticator_123',
    }),
    challenge: vi.fn().mockResolvedValue({
      challengeType: 'oob',
      oobCode: 'mock-oob-code',
    }),
    getEnrollmentFactors: vi.fn().mockResolvedValue([]),
    verify: vi.fn().mockResolvedValue({
      id_token: 'mock-id-token',
      access_token: 'mock-access-token',
      expires_in: 3600,
    }),
  };

  let mockContextInterface: BasicAuth0ContextInterface = {
    user: undefined,
    isAuthenticated: true,
    getAccessTokenSilently: vi.fn(),
    getAccessTokenWithPopup: vi.fn(),
    loginWithRedirect: vi.fn(),
    getConfiguration: vi.fn().mockReturnValue({
      domain: TEST_DOMAIN,
      clientId: TEST_CLIENT_ID,
    }),
    mfa: mockMfaClient,
  };

  const createAuthConfig = (overrides: Partial<AuthDetails> = {}): AuthDetails => ({
    domain: TEST_DOMAIN,
    contextInterface: mockContextInterface,
    ...overrides,
  });

  const mockToken = 'mock-access-token';

  beforeEach(() => {
    vi.mocked(mockContextInterface.getAccessTokenSilently).mockResolvedValue({
      access_token: mockToken,
      id_token: 'mock-id-token',
      expires_in: 3600,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('createTokenManager', () => {
    it('should create a token manager with getToken method', () => {
      const auth = createAuthConfig();
      const tokenManager = createTokenManager(auth);
      expect(tokenManager).toBeDefined();
      expect(tokenManager.getToken).toBeDefined();
      expect(typeof tokenManager.getToken).toBe('function');
    });
  });

  describe('getToken', () => {
    describe('validation errors', () => {
      it('should throw error when auth is not initialized', () => {
        expect(() => createTokenManager(null as unknown as AuthDetails)).toThrow(
          'TokenManager: auth is not initialized.',
        );
      });

      it('should throw error when contextInterface is not initialized', async () => {
        const authWithoutContext = createAuthConfig({ contextInterface: undefined });
        const tokenManager = createTokenManager(authWithoutContext);
        await expect(tokenManager.getToken('read:users', 'management')).rejects.toThrow(
          'TokenManager: contextInterface is not initialized.',
        );
      });

      it('should throw error when domain is not configured', async () => {
        const contextWithoutDomain = {
          ...mockContextInterface,
          getConfiguration: vi.fn().mockReturnValue({ domain: '', clientId: TEST_CLIENT_ID }),
        };
        const authWithoutDomain = createAuthConfig({
          domain: undefined,
          contextInterface: contextWithoutDomain,
        });
        const tokenManager = createTokenManager(authWithoutDomain);
        await expect(tokenManager.getToken('read:users', 'management')).rejects.toThrow(
          'TokenManager: Auth0 domain is not configured',
        );
      });
    });

    describe('proxy mode', () => {
      it('should return undefined when in proxy mode', async () => {
        const proxyAuth = createAuthConfig({ authProxyUrl: 'https://proxy.example.com' });
        const tokenManager = createTokenManager(proxyAuth);
        const token = await tokenManager.getToken('read:users', 'management');
        expect(token).toBeUndefined();
        expect(mockContextInterface.getAccessTokenSilently).not.toHaveBeenCalled();
      });

      it('should not validate contextInterface when in proxy mode', async () => {
        const proxyAuth = createAuthConfig({
          authProxyUrl: 'https://proxy.example.com',
          contextInterface: undefined,
        });
        const tokenManager = createTokenManager(proxyAuth);
        const token = await tokenManager.getToken('read:users', 'management');
        expect(token).toBeUndefined();
      });
    });

    describe('successful token retrieval', () => {
      it('should fetch token with correct audience and scope', async () => {
        const auth = createAuthConfig();
        const tokenManager = createTokenManager(auth);
        const token = await tokenManager.getToken('read:users', 'management');

        expect(token).toBe(mockToken);
        expect(mockContextInterface.getAccessTokenSilently).toHaveBeenCalledWith({
          authorizationParams: {
            audience: `https://${TEST_DOMAIN}/management/`,
            scope: 'read:users',
          },
          detailedResponse: true,
        });
      });

      it('should build audience URL correctly for MFA', async () => {
        const auth = createAuthConfig();
        const tokenManager = createTokenManager(auth);
        await tokenManager.getToken('read:me:authentication_methods', 'mfa');

        expect(mockContextInterface.getAccessTokenSilently).toHaveBeenCalledWith({
          authorizationParams: {
            audience: `https://${TEST_DOMAIN}/mfa/`,
            scope: 'read:me:authentication_methods',
          },
          detailedResponse: true,
        });
      });

      it('should handle domain with https protocol', async () => {
        const authWithHttps = createAuthConfig({ domain: `https://${TEST_DOMAIN}` });
        const tokenManager = createTokenManager(authWithHttps);
        await tokenManager.getToken('read:users', 'management');

        expect(mockContextInterface.getAccessTokenSilently).toHaveBeenCalledWith({
          authorizationParams: {
            audience: `https://${TEST_DOMAIN}/management/`,
            scope: 'read:users',
          },
          detailedResponse: true,
        });
      });
    });

    describe('cache management', () => {
      it('should not use cacheMode option when ignoreCache is false', async () => {
        const auth = createAuthConfig();
        const tokenManager = createTokenManager(auth);
        await tokenManager.getToken('read:users', 'management', false);

        expect(mockContextInterface.getAccessTokenSilently).toHaveBeenCalledWith({
          authorizationParams: {
            audience: `https://${TEST_DOMAIN}/management/`,
            scope: 'read:users',
          },
          detailedResponse: true,
        });
      });

      it('should use cacheMode off when ignoreCache is true', async () => {
        const auth = createAuthConfig();
        const tokenManager = createTokenManager(auth);
        await tokenManager.getToken('read:users', 'management', true);

        expect(mockContextInterface.getAccessTokenSilently).toHaveBeenCalledWith({
          authorizationParams: {
            audience: `https://${TEST_DOMAIN}/management/`,
            scope: 'read:users',
          },
          detailedResponse: true,
          cacheMode: 'off',
        });
      });

      it('should make concurrent requests for same token without deduplication', async () => {
        const mockToken = 'mock-token';
        let resolvePromise: (value: unknown) => void;
        const delayedPromise = new Promise((resolve) => {
          resolvePromise = resolve;
        });

        vi.mocked(mockContextInterface.getAccessTokenSilently).mockReturnValue(
          delayedPromise as Promise<GetTokenSilentlyVerboseResponse>,
        );

        const auth = createAuthConfig();
        const tokenManager = createTokenManager(auth);

        // Start multiple concurrent requests for the same token
        const promise1 = tokenManager.getToken('read:users', 'management');
        const promise2 = tokenManager.getToken('read:users', 'management');
        const promise3 = tokenManager.getToken('read:users', 'management');

        // Resolve the underlying promise
        resolvePromise!({
          access_token: mockToken,
          id_token: 'mock-id-token',
          expires_in: 3600,
        });

        const [token1, token2, token3] = await Promise.all([promise1, promise2, promise3]);

        expect(token1).toBe(mockToken);
        expect(token2).toBe(mockToken);
        expect(token3).toBe(mockToken);
        // Current implementation does not deduplicate, so each request calls the API
        expect(mockContextInterface.getAccessTokenSilently).toHaveBeenCalledTimes(3);
      });

      it('should not deduplicate requests with different scopes', async () => {
        const mockToken1 = 'mock-token-1';
        const mockToken2 = 'mock-token-2';

        vi.mocked(mockContextInterface.getAccessTokenSilently)
          .mockResolvedValueOnce({
            access_token: mockToken1,
            id_token: 'mock-id-token',
            expires_in: 3600,
          })
          .mockResolvedValueOnce({
            access_token: mockToken2,
            id_token: 'mock-id-token',
            expires_in: 3600,
          });

        const auth = createAuthConfig();
        const tokenManager = createTokenManager(auth);

        const [token1, token2] = await Promise.all([
          tokenManager.getToken('read:users', 'management'),
          tokenManager.getToken('write:users', 'management'),
        ]);

        expect(token1).toBe(mockToken1);
        expect(token2).toBe(mockToken2);
        expect(mockContextInterface.getAccessTokenSilently).toHaveBeenCalledTimes(2);
      });

      it('should not deduplicate requests with different audiences', async () => {
        const mockToken1 = 'mock-token-1';
        const mockToken2 = 'mock-token-2';

        vi.mocked(mockContextInterface.getAccessTokenSilently)
          .mockResolvedValueOnce({
            access_token: mockToken1,
            id_token: 'mock-id-token',
            expires_in: 3600,
          })
          .mockResolvedValueOnce({
            access_token: mockToken2,
            id_token: 'mock-id-token',
            expires_in: 3600,
          });

        const auth = createAuthConfig();
        const tokenManager = createTokenManager(auth);

        const [token1, token2] = await Promise.all([
          tokenManager.getToken('read:users', 'management'),
          tokenManager.getToken('read:users', 'mfa'),
        ]);

        expect(token1).toBe(mockToken1);
        expect(token2).toBe(mockToken2);
        expect(mockContextInterface.getAccessTokenSilently).toHaveBeenCalledTimes(2);
      });

      it('should clear pending request when ignoreCache is true', async () => {
        const mockToken1 = 'mock-token-1';
        const mockToken2 = 'mock-token-2';

        let resolveFirstPromise: (value: unknown) => void;
        const firstPromise = new Promise((resolve) => {
          resolveFirstPromise = resolve;
        });

        vi.mocked(mockContextInterface.getAccessTokenSilently)
          .mockReturnValueOnce(firstPromise as Promise<GetTokenSilentlyVerboseResponse>)
          .mockResolvedValueOnce({
            access_token: mockToken2,
            id_token: 'mock-id-token',
            expires_in: 3600,
          });

        const auth = createAuthConfig();
        const tokenManager = createTokenManager(auth);

        // Start first request
        const promise1 = tokenManager.getToken('read:users', 'management');

        // Start second request with ignoreCache, should not reuse first request
        const promise2 = tokenManager.getToken('read:users', 'management', true);

        // Resolve first promise
        resolveFirstPromise!({
          access_token: mockToken1,
          id_token: 'mock-id-token',
          expires_in: 3600,
        });

        const [token1, token2] = await Promise.all([promise1, promise2]);

        expect(token1).toBe(mockToken1);
        expect(token2).toBe(mockToken2);
        expect(mockContextInterface.getAccessTokenSilently).toHaveBeenCalledTimes(2);
      });

      it('should clean up pending request after completion', async () => {
        const auth = createAuthConfig();
        const tokenManager = createTokenManager(auth);

        // First request
        await tokenManager.getToken('read:users', 'management');

        // Second request should make a new API call since first is completed
        await tokenManager.getToken('read:users', 'management');

        expect(mockContextInterface.getAccessTokenSilently).toHaveBeenCalledTimes(2);
      });

      it('should clean up pending request after error', async () => {
        vi.mocked(mockContextInterface.getAccessTokenSilently).mockRejectedValueOnce(
          new Error('Network error'),
        );

        const auth = createAuthConfig();
        const tokenManager = createTokenManager(auth);

        // First request fails
        await expect(tokenManager.getToken('read:users', 'management')).rejects.toThrow(
          'Network error',
        );

        // Reset mock for second call
        vi.mocked(mockContextInterface.getAccessTokenSilently).mockResolvedValueOnce({
          access_token: 'mock-token',
          id_token: 'mock-id-token',
          expires_in: 3600,
        });

        // Second request should succeed with new API call
        const token = await tokenManager.getToken('read:users', 'management');
        expect(token).toBe('mock-token');
        expect(mockContextInterface.getAccessTokenSilently).toHaveBeenCalledTimes(2);
      });
    });

    describe('error handling with fallback', () => {
      it('should use popup with consent prompt for consent_required error', async () => {
        const mockToken = 'popup-token';
        vi.mocked(mockContextInterface.getAccessTokenSilently).mockRejectedValue({
          error: 'consent_required',
        });
        vi.mocked(mockContextInterface.getAccessTokenWithPopup).mockResolvedValue(mockToken);

        const auth = createAuthConfig();
        const tokenManager = createTokenManager(auth);
        const token = await tokenManager.getToken('read:users', 'management');

        expect(token).toBe(mockToken);
        expect(mockContextInterface.getAccessTokenWithPopup).toHaveBeenCalledWith({
          authorizationParams: {
            audience: `https://${TEST_DOMAIN}/management/`,
            scope: 'read:users',
            prompt: 'consent',
          },
        });
      });

      it('should use popup with login prompt for login_required error', async () => {
        const mockToken = 'popup-token';
        vi.mocked(mockContextInterface.getAccessTokenSilently).mockRejectedValue({
          error: 'login_required',
        });
        vi.mocked(mockContextInterface.getAccessTokenWithPopup).mockResolvedValue(mockToken);

        const auth = createAuthConfig();
        const tokenManager = createTokenManager(auth);
        const token = await tokenManager.getToken('read:users', 'management');

        expect(token).toBe(mockToken);
        expect(mockContextInterface.getAccessTokenWithPopup).toHaveBeenCalledWith({
          authorizationParams: {
            audience: `https://${TEST_DOMAIN}/management/`,
            scope: 'read:users',
            prompt: 'login',
          },
        });
      });

      it('should throw error for mfa_required error (not in fallback list)', async () => {
        const mfaError = { error: 'mfa_required' };
        vi.mocked(mockContextInterface.getAccessTokenSilently).mockRejectedValue(mfaError);

        const auth = createAuthConfig();
        const tokenManager = createTokenManager(auth);

        await expect(tokenManager.getToken('read:users', 'management')).rejects.toEqual(mfaError);
        expect(mockContextInterface.getAccessTokenWithPopup).not.toHaveBeenCalled();
      });

      it('should throw error when popup returns undefined token', async () => {
        const popupError = { error: 'consent_required' };
        vi.mocked(mockContextInterface.getAccessTokenSilently).mockRejectedValue(popupError);
        vi.mocked(mockContextInterface.getAccessTokenWithPopup).mockResolvedValue(undefined);

        const auth = createAuthConfig();
        const tokenManager = createTokenManager(auth);
        await expect(tokenManager.getToken('read:users', 'management')).rejects.toEqual(popupError);
      });

      it('should throw error for non-fallback errors', async () => {
        const originalError = new Error('Network timeout');
        vi.mocked(mockContextInterface.getAccessTokenSilently).mockRejectedValue(originalError);

        const auth = createAuthConfig();
        const tokenManager = createTokenManager(auth);
        await expect(tokenManager.getToken('read:users', 'management')).rejects.toThrow(
          'Network timeout',
        );
      });

      it('should throw error directly without wrapping for non-fallback errors', async () => {
        const originalError = new Error('Network timeout');
        vi.mocked(mockContextInterface.getAccessTokenSilently).mockRejectedValue(originalError);

        const auth = createAuthConfig();
        const tokenManager = createTokenManager(auth);
        try {
          await tokenManager.getToken('read:users', 'management');
          expect.fail('Should have thrown an error');
        } catch (error) {
          expect(error).toBe(originalError);
          expect((error as Error).message).toBe('Network timeout');
        }
      });

      it('should handle error objects with error property correctly', async () => {
        const errorObj = {
          error: 'invalid_grant',
          error_description: 'Some error description',
        };
        vi.mocked(mockContextInterface.getAccessTokenSilently).mockRejectedValue(errorObj);

        const auth = createAuthConfig();
        const tokenManager = createTokenManager(auth);
        await expect(tokenManager.getToken('read:users', 'management')).rejects.toEqual(errorObj);
        expect(mockContextInterface.getAccessTokenWithPopup).not.toHaveBeenCalled();
      });

      it('should handle null error objects', async () => {
        vi.mocked(mockContextInterface.getAccessTokenSilently).mockRejectedValue(null);

        const auth = createAuthConfig();
        const tokenManager = createTokenManager(auth);
        await expect(tokenManager.getToken('read:users', 'management')).rejects.toBe(null);
      });

      it('should handle string errors', async () => {
        vi.mocked(mockContextInterface.getAccessTokenSilently).mockRejectedValue(
          'String error message',
        );

        const auth = createAuthConfig();
        const tokenManager = createTokenManager(auth);
        await expect(tokenManager.getToken('read:users', 'management')).rejects.toBe(
          'String error message',
        );
      });
    });

    describe('edge cases', () => {
      it('should handle empty scope', async () => {
        const auth = createAuthConfig();
        const tokenManager = createTokenManager(auth);
        await tokenManager.getToken('', 'management');

        expect(mockContextInterface.getAccessTokenSilently).toHaveBeenCalledWith({
          authorizationParams: {
            audience: `https://${TEST_DOMAIN}/management/`,
            scope: '',
          },
          detailedResponse: true,
        });
      });

      it('should handle empty audiencePath', async () => {
        const auth = createAuthConfig();
        const tokenManager = createTokenManager(auth);
        await tokenManager.getToken('read:users', '');

        expect(mockContextInterface.getAccessTokenSilently).toHaveBeenCalledWith({
          authorizationParams: {
            audience: `https://${TEST_DOMAIN}//`,
            scope: 'read:users',
          },
          detailedResponse: true,
        });
      });

      it('should handle special characters in scope', async () => {
        const auth = createAuthConfig();
        const tokenManager = createTokenManager(auth);
        const scope = 'read:users write:users update:users:self';
        await tokenManager.getToken(scope, 'management');

        expect(mockContextInterface.getAccessTokenSilently).toHaveBeenCalledWith({
          authorizationParams: {
            audience: `https://${TEST_DOMAIN}/management/`,
            scope,
          },
          detailedResponse: true,
        });
      });
    });
  });
});
