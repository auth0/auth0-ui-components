import { describe, expect, it, vi } from 'vitest';

import { createMockContextInterface } from '../../internals/__mocks__/shared/api-service.mocks';
import { AuthUtils, ensureTrailingSlash, normalizeProxyUrl } from '../auth-utils';

describe('AuthUtils', () => {
  describe('resolveAuthConfig', () => {
    describe('proxy mode', () => {
      it('returns proxy config when authProxyUrl is set', () => {
        const config = AuthUtils.resolveAuthConfig({ authProxyUrl: 'https://proxy.example.com' });
        expect(config).toEqual({ mode: 'proxy', proxyUrl: 'https://proxy.example.com/' });
      });

      it('adds trailing slash to authProxyUrl', () => {
        const config = AuthUtils.resolveAuthConfig({ authProxyUrl: 'https://proxy.example.com/' });
        expect(config).toEqual({ mode: 'proxy', proxyUrl: 'https://proxy.example.com/' });
      });

      it('normalizes authProxyUrl with multiple path segments', () => {
        const config = AuthUtils.resolveAuthConfig({
          authProxyUrl: 'https://proxy.example.com/api/proxy',
        });
        expect(config).toEqual({ mode: 'proxy', proxyUrl: 'https://proxy.example.com/api/proxy/' });
      });

      it('prefers proxy mode when both authProxyUrl and domain are set', () => {
        const config = AuthUtils.resolveAuthConfig({
          authProxyUrl: 'https://proxy.example.com',
          domain: 'test.auth0.com',
          contextInterface: createMockContextInterface(),
        });
        expect(config.mode).toBe('proxy');
      });

      it('includes domain in proxy config when domain is also provided', () => {
        const config = AuthUtils.resolveAuthConfig({
          authProxyUrl: 'https://proxy.example.com',
          domain: 'test.auth0.com',
        });
        expect(config).toEqual({
          mode: 'proxy',
          proxyUrl: 'https://proxy.example.com/',
          domain: 'test.auth0.com',
        });
      });

      it('trims whitespace from domain in proxy config', () => {
        const config = AuthUtils.resolveAuthConfig({
          authProxyUrl: 'https://proxy.example.com',
          domain: '  test.auth0.com  ',
        });
        expect(config).toMatchObject({ mode: 'proxy', domain: 'test.auth0.com' });
      });

      it('omits domain from proxy config when domain is not provided', () => {
        const config = AuthUtils.resolveAuthConfig({ authProxyUrl: 'https://proxy.example.com' });
        expect(config).not.toHaveProperty('domain');
      });
    });

    describe('SPA mode', () => {
      it('returns SPA config with domain and contextInterface', () => {
        const context = createMockContextInterface();
        const config = AuthUtils.resolveAuthConfig({
          domain: 'test.auth0.com',
          contextInterface: context,
        });
        expect(config).toEqual({
          mode: 'spa',
          domain: 'test.auth0.com',
          contextInterface: context,
        });
      });

      it('trims whitespace from domain', () => {
        const context = createMockContextInterface();
        const config = AuthUtils.resolveAuthConfig({
          domain: '  test.auth0.com  ',
          contextInterface: context,
        });
        expect(config).toMatchObject({ mode: 'spa', domain: 'test.auth0.com' });
      });

      it('falls back to domain from contextInterface.getConfiguration()', () => {
        const context = {
          ...createMockContextInterface(),
          getConfiguration: vi.fn().mockReturnValue({ domain: 'from-context.auth0.com' }),
        };
        const config = AuthUtils.resolveAuthConfig({ contextInterface: context });
        expect(config).toMatchObject({ mode: 'spa', domain: 'from-context.auth0.com' });
      });

      it('prefers auth.domain over contextInterface.getConfiguration().domain', () => {
        const context = {
          ...createMockContextInterface(),
          getConfiguration: vi.fn().mockReturnValue({ domain: 'from-context.auth0.com' }),
        };
        const config = AuthUtils.resolveAuthConfig({
          domain: 'explicit.auth0.com',
          contextInterface: context,
        });
        expect(config).toMatchObject({ mode: 'spa', domain: 'explicit.auth0.com' });
      });
    });

    describe('errors', () => {
      it('throws when no authProxyUrl and no contextInterface', () => {
        expect(() => AuthUtils.resolveAuthConfig({})).toThrow(
          'Initialization failed: Auth0 context not found. Ensure the component is rendered within Auth0ComponentProvider.',
        );
      });

      it('throws when domain is provided but contextInterface is missing', () => {
        expect(() => AuthUtils.resolveAuthConfig({ domain: 'test.auth0.com' })).toThrow(
          'Initialization failed: Auth0 context not found. Ensure the component is rendered within Auth0ComponentProvider.',
        );
      });

      it('throws when contextInterface exists but domain cannot be resolved', () => {
        const context = {
          ...createMockContextInterface(),
          getConfiguration: vi.fn().mockReturnValue(undefined),
        };
        expect(() => AuthUtils.resolveAuthConfig({ contextInterface: context })).toThrow(
          'Initialization failed: Auth0 domain is not configured. Provide a domain to Auth0ComponentProvider.',
        );
      });
    });
  });

  describe('ensureTrailingSlash', () => {
    it('adds trailing slash when missing', () => {
      expect(ensureTrailingSlash('https://example.com')).toBe('https://example.com/');
    });

    it('preserves single trailing slash', () => {
      expect(ensureTrailingSlash('https://example.com/')).toBe('https://example.com/');
    });

    it('normalizes multiple trailing slashes to one', () => {
      expect(ensureTrailingSlash('https://example.com///')).toBe('https://example.com/');
    });

    it('works with paths', () => {
      expect(ensureTrailingSlash('https://example.com/api/proxy')).toBe(
        'https://example.com/api/proxy/',
      );
    });

    it('works with relative paths', () => {
      expect(ensureTrailingSlash('/api/proxy')).toBe('/api/proxy/');
    });
  });

  describe('normalizeProxyUrl', () => {
    it('adds trailing slash to absolute URL without one', () => {
      expect(normalizeProxyUrl('https://example.com/api/proxy')).toBe(
        'https://example.com/api/proxy/',
      );
    });

    it('preserves trailing slash in absolute URL', () => {
      expect(normalizeProxyUrl('https://example.com/api/proxy/')).toBe(
        'https://example.com/api/proxy/',
      );
    });

    it('handles multiple trailing slashes', () => {
      expect(normalizeProxyUrl('https://example.com/api/proxy///')).toBe(
        'https://example.com/api/proxy/',
      );
    });

    it('handles absolute URL without path', () => {
      expect(normalizeProxyUrl('https://example.com')).toBe('https://example.com/');
    });

    it('ensures new URL path appending works correctly', () => {
      const normalized = normalizeProxyUrl('https://example.com/api/proxy');
      const fullUrl = new URL('my-org', normalized).href;
      expect(fullUrl).toBe('https://example.com/api/proxy/my-org');
    });
  });
});
