import { describe, expect, it } from 'vitest';

import { buildTelemetryHeader, PACKAGE_VERSION, TELEMETRY_NAME } from '../telemetry';

describe('telemetry', () => {
  describe('constants', () => {
    it('should have correct telemetry name', () => {
      expect(TELEMETRY_NAME).toBe('universal-components');
    });

    it('should have a valid version format', () => {
      expect(PACKAGE_VERSION).toMatch(/^\d+\.\d+\.\d+/);
    });
  });

  describe('buildTelemetryHeader', () => {
    it('should return base64-encoded JSON for proxy mode with full telemetry config', () => {
      const header = buildTelemetryHeader({
        isProxyMode: true,
        component: 'user-mfa-management',
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
      const header = buildTelemetryHeader({
        isProxyMode: false,
        component: 'organization-sso-configuration',
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

    it('should use provided component value', () => {
      const header = buildTelemetryHeader({
        isProxyMode: false,
        component: 'unknown',
        css: 'unknown',
        distribution: 'npm',
        framework: 'react',
      });

      const decoded = JSON.parse(atob(header));
      expect(decoded.component).toBe('unknown');
      expect(decoded.css).toBe('unknown');
    });

    it('should include all required telemetry fields', () => {
      const header = buildTelemetryHeader({
        isProxyMode: true,
        component: 'organization-domain-management',
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
      const header = buildTelemetryHeader({
        isProxyMode: false,
        component: 'user-mfa-management',
        css: 'tailwind',
        distribution: 'npm',
        framework: 'vue',
      });

      const decoded = JSON.parse(atob(header));
      expect(decoded.framework).toBe('vue');
    });
  });
});
