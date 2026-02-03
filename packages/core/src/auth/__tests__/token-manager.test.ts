import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';

import { TEST_DOMAIN, TEST_CLIENT_ID } from '../../internals/__mocks__/shared/api-service.mocks';
import type {
  AuthDetails,
  BasicAuth0ContextInterface,
  GetTokenSilentlyVerboseResponse,
} from '../auth-types';
import { createTokenManager } from '../token-manager';

describe('token-manager', () => {
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
      it('should throw error when auth is not initialized', async () => {
        const tokenManager = createTokenManager(null as unknown as AuthDetails);
        await expect(tokenManager.getToken('read:users', 'management')).rejects.toThrow(
          'TokenUtils: auth in CoreClient is not initialized.',
        );
      });

      it('should throw error when contextInterface is not initialized', async () => {
        const authWithoutContext = createAuthConfig({ contextInterface: undefined });
        const tokenManager = createTokenManager(authWithoutContext);
        await expect(tokenManager.getToken('read:users', 'management')).rejects.toThrow(
          'TokenUtils: contextInterface in CoreClient is not initialized.',
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
          'TokenUtils: Auth0 domain is not configured',
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

      it('should deduplicate concurrent requests for same token', async () => {
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
        // Should only call the API once despite 3 requests
        expect(mockContextInterface.getAccessTokenSilently).toHaveBeenCalledTimes(1);
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
          'getAccessToken: failed',
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

      it('should use popup with consent prompt for mfa_required error', async () => {
        const mockToken = 'popup-token';
        vi.mocked(mockContextInterface.getAccessTokenSilently).mockRejectedValue({
          error: 'mfa_required',
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

      it('should throw error when popup returns undefined token', async () => {
        vi.mocked(mockContextInterface.getAccessTokenSilently).mockRejectedValue({
          error: 'consent_required',
        });
        vi.mocked(mockContextInterface.getAccessTokenWithPopup).mockResolvedValue(undefined);

        const auth = createAuthConfig();
        const tokenManager = createTokenManager(auth);
        await expect(tokenManager.getToken('read:users', 'management')).rejects.toThrow(
          'getAccessTokenWithPopup: Access token is not defined',
        );
      });

      it('should throw error for non-fallback errors', async () => {
        const originalError = new Error('Network timeout');
        vi.mocked(mockContextInterface.getAccessTokenSilently).mockRejectedValue(originalError);

        const auth = createAuthConfig();
        const tokenManager = createTokenManager(auth);
        await expect(tokenManager.getToken('read:users', 'management')).rejects.toThrow(
          'getAccessToken: failed',
        );
      });

      it('should include original error as cause for non-fallback errors', async () => {
        const originalError = new Error('Network timeout');
        vi.mocked(mockContextInterface.getAccessTokenSilently).mockRejectedValue(originalError);

        const auth = createAuthConfig();
        const tokenManager = createTokenManager(auth);
        try {
          await tokenManager.getToken('read:users', 'management');
          expect.fail('Should have thrown an error');
        } catch (error) {
          expect(error).toBeInstanceOf(Error);
          expect((error as Error).message).toBe('getAccessToken: failed');
          expect((error as Error).cause).toBe(originalError);
        }
      });

      it('should handle error objects with error property correctly', async () => {
        vi.mocked(mockContextInterface.getAccessTokenSilently).mockRejectedValue({
          error: 'invalid_grant',
          error_description: 'Some error description',
        });

        const auth = createAuthConfig();
        const tokenManager = createTokenManager(auth);
        await expect(tokenManager.getToken('read:users', 'management')).rejects.toThrow(
          'getAccessToken: failed',
        );
        expect(mockContextInterface.getAccessTokenWithPopup).not.toHaveBeenCalled();
      });

      it('should handle null error objects', async () => {
        vi.mocked(mockContextInterface.getAccessTokenSilently).mockRejectedValue(null);

        const auth = createAuthConfig();
        const tokenManager = createTokenManager(auth);
        await expect(tokenManager.getToken('read:users', 'management')).rejects.toThrow(
          'getAccessToken: failed',
        );
      });

      it('should handle string errors', async () => {
        vi.mocked(mockContextInterface.getAccessTokenSilently).mockRejectedValue(
          'String error message',
        );

        const auth = createAuthConfig();
        const tokenManager = createTokenManager(auth);
        await expect(tokenManager.getToken('read:users', 'management')).rejects.toThrow(
          'getAccessToken: failed',
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
