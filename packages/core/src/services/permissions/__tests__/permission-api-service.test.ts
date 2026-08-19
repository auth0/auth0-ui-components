import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { ClientAuthConfig, SpaAuthConfig } from '../../../auth/auth-types';
import { initializePermissionClient } from '../permission-api-service';
import { PERMISSION_CLAIM } from '../permission-api-types';

describe('permission-api-service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('initializePermissionClient', () => {
    it('returns proxy client when mode is proxy', () => {
      const auth: ClientAuthConfig = {
        mode: 'proxy',
        proxyUrl: 'https://example.com',
      };

      const client = initializePermissionClient(auth);

      expect(client).toHaveProperty('getPermissions');
      expect(typeof client.getPermissions).toBe('function');
    });

    it('returns SPA client when mode is spa', () => {
      const auth: ClientAuthConfig = {
        mode: 'spa',
        domain: 'example.auth0.com',
        contextInterface: {
          getConfiguration: () => ({ domain: 'example.auth0.com', clientId: 'test' }),
          mfa: {} as SpaAuthConfig['contextInterface']['mfa'],
          createFetcher: vi.fn(),
          getIdTokenClaims: vi.fn(),
        },
      };

      const client = initializePermissionClient(auth);

      expect(client).toHaveProperty('getPermissions');
      expect(typeof client.getPermissions).toBe('function');
    });
  });

  describe('proxy permission client', () => {
    const proxyUrl = 'https://example.com';

    it('fetches permissions from /auth/profile endpoint', async () => {
      const mockPermissions = ['read:my_org:members', 'create:my_org:member_invitations'];
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ [PERMISSION_CLAIM]: mockPermissions }),
      });
      global.fetch = mockFetch;

      const auth: ClientAuthConfig = { mode: 'proxy', proxyUrl };
      const client = initializePermissionClient(auth);
      const permissions = await client.getPermissions();

      expect(mockFetch).toHaveBeenCalledWith(`${proxyUrl}/auth/profile`, {
        credentials: 'include',
      });
      expect(permissions).toEqual(mockPermissions);
    });

    it('returns empty array when response is not ok', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const mockFetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 401,
      });
      global.fetch = mockFetch;

      const auth: ClientAuthConfig = { mode: 'proxy', proxyUrl };
      const client = initializePermissionClient(auth);
      const permissions = await client.getPermissions();

      expect(permissions).toEqual([]);
      expect(consoleWarnSpy).toHaveBeenCalledWith('Failed to fetch user profile for permissions');
    });

    it('returns empty array when permissions claim is not an array', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ [PERMISSION_CLAIM]: 'not-an-array' }),
      });
      global.fetch = mockFetch;

      const auth: ClientAuthConfig = { mode: 'proxy', proxyUrl };
      const client = initializePermissionClient(auth);
      const permissions = await client.getPermissions();

      expect(permissions).toEqual([]);
    });

    it('returns empty array when permissions claim is missing', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({}),
      });
      global.fetch = mockFetch;

      const auth: ClientAuthConfig = { mode: 'proxy', proxyUrl };
      const client = initializePermissionClient(auth);
      const permissions = await client.getPermissions();

      expect(permissions).toEqual([]);
    });

    it('returns empty array and logs warning on fetch error', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const mockError = new Error('Network error');
      const mockFetch = vi.fn().mockRejectedValue(mockError);
      global.fetch = mockFetch;

      const auth: ClientAuthConfig = { mode: 'proxy', proxyUrl };
      const client = initializePermissionClient(auth);
      const permissions = await client.getPermissions();

      expect(permissions).toEqual([]);
      expect(consoleWarnSpy).toHaveBeenCalledWith('Error fetching user permissions:', mockError);
    });
  });

  describe('SPA permission client', () => {
    const createSpaAuth = (
      getIdTokenClaims?: () => Promise<Record<string, unknown> | undefined>,
    ): ClientAuthConfig => ({
      mode: 'spa',
      domain: 'example.auth0.com',
      contextInterface: {
        getConfiguration: () => ({ domain: 'example.auth0.com', clientId: 'test' }),
        mfa: {} as SpaAuthConfig['contextInterface']['mfa'],
        createFetcher: vi.fn(),
        getIdTokenClaims,
      },
    });

    it('fetches permissions from ID token claims', async () => {
      const mockPermissions = ['read:my_org:members', 'delete:my_org:memberships'];
      const getIdTokenClaims = vi.fn().mockResolvedValue({
        [PERMISSION_CLAIM]: mockPermissions,
      });

      const auth = createSpaAuth(getIdTokenClaims);
      const client = initializePermissionClient(auth);
      const permissions = await client.getPermissions();

      expect(getIdTokenClaims).toHaveBeenCalled();
      expect(permissions).toEqual(mockPermissions);
    });

    it('returns empty array when getIdTokenClaims is not available', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const auth = createSpaAuth(undefined);
      const client = initializePermissionClient(auth);
      const permissions = await client.getPermissions();

      expect(permissions).toEqual([]);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'getIdTokenClaims not available. Ensure Auth0Provider from @auth0/auth0-react wraps your app.',
      );
    });

    it('returns empty array when claims are undefined', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const getIdTokenClaims = vi.fn().mockResolvedValue(undefined);

      const auth = createSpaAuth(getIdTokenClaims);
      const client = initializePermissionClient(auth);
      const permissions = await client.getPermissions();

      expect(permissions).toEqual([]);
      expect(consoleWarnSpy).toHaveBeenCalledWith('No ID token claims available');
    });

    it('returns empty array when permissions claim is not an array', async () => {
      const getIdTokenClaims = vi.fn().mockResolvedValue({
        [PERMISSION_CLAIM]: 'not-an-array',
      });

      const auth = createSpaAuth(getIdTokenClaims);
      const client = initializePermissionClient(auth);
      const permissions = await client.getPermissions();

      expect(permissions).toEqual([]);
    });

    it('returns empty array when permissions claim is missing', async () => {
      const getIdTokenClaims = vi.fn().mockResolvedValue({
        sub: 'user123',
      });

      const auth = createSpaAuth(getIdTokenClaims);
      const client = initializePermissionClient(auth);
      const permissions = await client.getPermissions();

      expect(permissions).toEqual([]);
    });

    it('returns empty array and logs warning on error', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const mockError = new Error('Token error');
      const getIdTokenClaims = vi.fn().mockRejectedValue(mockError);

      const auth = createSpaAuth(getIdTokenClaims);
      const client = initializePermissionClient(auth);
      const permissions = await client.getPermissions();

      expect(permissions).toEqual([]);
      expect(consoleWarnSpy).toHaveBeenCalledWith('Error fetching permissions:', mockError);
    });
  });
});
