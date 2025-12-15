import { MyAccountClient } from '@auth0/myaccount-js';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';

import type { AuthDetails } from '../../../auth/auth-types';
import type { createTokenManager } from '../../../auth/token-manager';
import { initializeMyAccountClient } from '../my-account-api-service';

vi.mock('@auth0/myaccount-js');

describe('initializeMyAccountClient', () => {
  const mockGetToken = vi.fn();
  const mockTokenManagerService = {
    getToken: mockGetToken,
  } as unknown as ReturnType<typeof createTokenManager>;

  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = mockFetch;
    mockFetch.mockResolvedValue(new Response());
  });

  describe('when authProxyUrl is provided', () => {
    const authWithProxy: AuthDetails = {
      authProxyUrl: 'https://proxy.example.com/',
    } as AuthDetails;

    it('should create MyAccountClient with correct baseUrl (trailing slash removed)', () => {
      initializeMyAccountClient(authWithProxy, mockTokenManagerService);

      expect(MyAccountClient).toHaveBeenCalledWith({
        domain: '',
        baseUrl: 'https://proxy.example.com/me',
        telemetry: false,
        fetcher: expect.any(Function),
      });
    });

    it('should create MyAccountClient with correct baseUrl (no trailing slash)', () => {
      const authNoTrailingSlash: AuthDetails = {
        authProxyUrl: 'https://proxy.example.com',
      } as AuthDetails;

      initializeMyAccountClient(authNoTrailingSlash, mockTokenManagerService);

      expect(MyAccountClient).toHaveBeenCalledWith({
        domain: '',
        baseUrl: 'https://proxy.example.com/me',
        telemetry: false,
        fetcher: expect.any(Function),
      });
    });

    it('should return setLatestScopes function', () => {
      const result = initializeMyAccountClient(authWithProxy, mockTokenManagerService);

      expect(result.setLatestScopes).toBeInstanceOf(Function);
    });

    describe('fetcher behavior', () => {
      it('should call fetch with correct URL and init options', async () => {
        let capturedFetcher: (url: string, init?: RequestInit) => Promise<Response>;
        (MyAccountClient as Mock).mockImplementation(({ fetcher }) => {
          capturedFetcher = fetcher;
          return {};
        });

        initializeMyAccountClient(authWithProxy, mockTokenManagerService);

        await capturedFetcher!('https://proxy.example.com/me/test', { method: 'GET' });

        expect(mockFetch).toHaveBeenCalledWith('https://proxy.example.com/me/test', {
          method: 'GET',
          headers: {},
        });
      });

      it('should add Content-Type header when body is present', async () => {
        let capturedFetcher: (url: string, init?: RequestInit) => Promise<Response>;
        (MyAccountClient as Mock).mockImplementation(({ fetcher }) => {
          capturedFetcher = fetcher;
          return {};
        });

        initializeMyAccountClient(authWithProxy, mockTokenManagerService);

        await capturedFetcher!('https://proxy.example.com/me/test', {
          method: 'POST',
          body: JSON.stringify({ data: 'test' }),
        });

        expect(mockFetch).toHaveBeenCalledWith('https://proxy.example.com/me/test', {
          method: 'POST',
          body: JSON.stringify({ data: 'test' }),
          headers: {
            'Content-Type': 'application/json',
          },
        });
      });

      it('should not add Content-Type header when body is not present', async () => {
        let capturedFetcher: (url: string, init?: RequestInit) => Promise<Response>;
        (MyAccountClient as Mock).mockImplementation(({ fetcher }) => {
          capturedFetcher = fetcher;
          return {};
        });

        initializeMyAccountClient(authWithProxy, mockTokenManagerService);

        await capturedFetcher!('https://proxy.example.com/me/test', { method: 'GET' });

        expect(mockFetch).toHaveBeenCalledWith('https://proxy.example.com/me/test', {
          method: 'GET',
          headers: {},
        });
      });

      it('should add auth0-scope header when latestScopes is set', async () => {
        let capturedFetcher: (url: string, init?: RequestInit) => Promise<Response>;
        (MyAccountClient as Mock).mockImplementation(({ fetcher }) => {
          capturedFetcher = fetcher;
          return {};
        });

        const result = initializeMyAccountClient(authWithProxy, mockTokenManagerService);
        result.setLatestScopes('openid profile');

        await capturedFetcher!('https://proxy.example.com/me/test', { method: 'GET' });

        expect(mockFetch).toHaveBeenCalledWith('https://proxy.example.com/me/test', {
          method: 'GET',
          headers: {
            'auth0-scope': 'openid profile',
          },
        });
      });

      it('should not add auth0-scope header when latestScopes is empty', async () => {
        let capturedFetcher: (url: string, init?: RequestInit) => Promise<Response>;
        (MyAccountClient as Mock).mockImplementation(({ fetcher }) => {
          capturedFetcher = fetcher;
          return {};
        });

        initializeMyAccountClient(authWithProxy, mockTokenManagerService);

        await capturedFetcher!('https://proxy.example.com/me/test', { method: 'GET' });

        expect(mockFetch).toHaveBeenCalledWith('https://proxy.example.com/me/test', {
          method: 'GET',
          headers: {},
        });
      });

      it('should preserve existing headers from init', async () => {
        let capturedFetcher: (url: string, init?: RequestInit) => Promise<Response>;
        (MyAccountClient as Mock).mockImplementation(({ fetcher }) => {
          capturedFetcher = fetcher;
          return {};
        });

        initializeMyAccountClient(authWithProxy, mockTokenManagerService);

        await capturedFetcher!('https://proxy.example.com/me/test', {
          method: 'GET',
          headers: { 'X-Custom-Header': 'custom-value' },
        });

        expect(mockFetch).toHaveBeenCalledWith('https://proxy.example.com/me/test', {
          method: 'GET',
          headers: {
            'X-Custom-Header': 'custom-value',
          },
        });
      });
    });
  });

  describe('when neither authProxyUrl nor domain is provided', () => {
    it('should throw an error', () => {
      const authWithoutBoth: AuthDetails = {} as AuthDetails;

      expect(() => initializeMyAccountClient(authWithoutBoth, mockTokenManagerService)).toThrow(
        'Missing domain or proxy URL for MyAccountClient',
      );
    });
  });

  describe('when authProxyUrl takes precedence over domain', () => {
    it('should use authProxyUrl when both are provided', () => {
      const authWithBoth: AuthDetails = {
        authProxyUrl: 'https://proxy.example.com/',
        domain: 'example.auth0.com',
      } as AuthDetails;

      initializeMyAccountClient(authWithBoth, mockTokenManagerService);

      expect(MyAccountClient).toHaveBeenCalledWith({
        domain: '',
        baseUrl: 'https://proxy.example.com/me',
        telemetry: false,
        fetcher: expect.any(Function),
      });
    });
  });
});
