import { describe, expect, it } from 'vitest';

import {
  buildTelemetryHeader,
  getComponentFromUrl,
  PACKAGE_VERSION,
  TELEMETRY_NAME,
} from '../telemetry';

describe('telemetry', () => {
  describe('constants', () => {
    it('should have correct telemetry name', () => {
      expect(TELEMETRY_NAME).toBe('universal-components');
    });

    it('should have a valid version format', () => {
      expect(PACKAGE_VERSION).toMatch(/^\d+\.\d+\.\d+/);
    });
  });

  describe('getComponentFromUrl', () => {
    it('should return user-mfa-management for authentication-methods URLs', () => {
      expect(getComponentFromUrl('https://example.com/me/authentication-methods')).toBe(
        'user-mfa-management',
      );
      expect(getComponentFromUrl('https://example.com/me/authentication-methods/123')).toBe(
        'user-mfa-management',
      );
    });

    it('should return organization-sso-configuration for identity-providers URLs', () => {
      expect(getComponentFromUrl('https://example.com/my-org/identity-providers')).toBe(
        'organization-sso-configuration',
      );
      expect(getComponentFromUrl('https://example.com/my-org/identity-providers/456/domains')).toBe(
        'organization-sso-configuration',
      );
    });

    it('should return organization-domain-management for domains URLs', () => {
      expect(getComponentFromUrl('https://example.com/my-org/domains')).toBe(
        'organization-domain-management',
      );
      expect(getComponentFromUrl('https://example.com/my-org/domains/789/verify')).toBe(
        'organization-domain-management',
      );
    });

    it('should return organization-details for configuration URLs', () => {
      expect(getComponentFromUrl('https://example.com/my-org/configuration')).toBe(
        'organization-details',
      );
    });

    it('should return unknown for unrecognized URLs', () => {
      expect(getComponentFromUrl('https://example.com/unknown/endpoint')).toBe('unknown');
      expect(getComponentFromUrl('https://example.com/api/users')).toBe('unknown');
    });
  });

  describe('buildTelemetryHeader', () => {
    it('should return base64-encoded JSON for proxy mode with full telemetry config', () => {
      const header = buildTelemetryHeader('https://example.com/me/authentication-methods', {
        isProxyMode: true,
        css: 'tailwind',
        distribution: 'npm',
        framework: 'react',
      });

      const decoded = JSON.parse(atob(header));
      expect(decoded).toEqual({
        name: 'universal-components',
        version: PACKAGE_VERSION,
        is_proxy_mode: true,
        framework: 'react',
        component: 'user-mfa-management',
        distribution: 'npm',
        css: 'tailwind',
      });
    });

    it('should return base64-encoded JSON for SPA mode with shadcn distribution', () => {
      const header = buildTelemetryHeader('https://example.com/my-org/identity-providers', {
        isProxyMode: false,
        css: 'scoped',
        distribution: 'shadcn',
        framework: 'react',
      });

      const decoded = JSON.parse(atob(header));
      expect(decoded).toEqual({
        name: 'universal-components',
        version: PACKAGE_VERSION,
        is_proxy_mode: false,
        framework: 'react',
        component: 'organization-sso-configuration',
        distribution: 'shadcn',
        css: 'scoped',
      });
    });

    it('should set component to unknown for unrecognized URLs', () => {
      const header = buildTelemetryHeader('https://example.com/unknown', {
        isProxyMode: false,
        css: 'unknown',
        distribution: 'npm',
        framework: 'react',
      });

      const decoded = JSON.parse(atob(header));
      expect(decoded.component).toBe('unknown');
      expect(decoded.css).toBe('unknown');
    });

    it('should include all required telemetry fields', () => {
      const header = buildTelemetryHeader('https://example.com/my-org/domains', {
        isProxyMode: true,
        css: 'tailwind',
        distribution: 'npm',
        framework: 'react',
      });

      const decoded = JSON.parse(atob(header));
      expect(decoded).toHaveProperty('name');
      expect(decoded).toHaveProperty('version');
      expect(decoded).toHaveProperty('is_proxy_mode');
      expect(decoded).toHaveProperty('framework');
      expect(decoded).toHaveProperty('component');
      expect(decoded).toHaveProperty('distribution');
      expect(decoded).toHaveProperty('css');
    });

    it('should use provided framework value', () => {
      const header = buildTelemetryHeader('https://example.com/me/authentication-methods', {
        isProxyMode: false,
        css: 'tailwind',
        distribution: 'npm',
        framework: 'vue',
      });

      const decoded = JSON.parse(atob(header));
      expect(decoded.framework).toBe('vue');
    });
  });
});
