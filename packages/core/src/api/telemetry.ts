/**
 * Telemetry utilities for Auth0 UI Components.
 * @module telemetry
 * @internal
 */

import pkg from '../../package.json';

/**
 * The package name used in telemetry.
 */
export const TELEMETRY_NAME = 'universal-components';

/**
 * The current package version. Read from package.json at build time.
 */
export const PACKAGE_VERSION: string = pkg.version;

/**
 * CSS implementation type for telemetry.
 */
export type CssImplementation = 'scoped' | 'tailwind' | 'unknown';

/**
 * Distribution channel type.
 */
export type DistributionChannel = 'npm' | 'shadcn';

/**
 * Framework type for telemetry.
 */
export type Framework = 'react' | 'vue' | 'angular';

/**
 * Telemetry configuration passed from framework packages.
 * Groups all telemetry-related settings in one object.
 */
export interface TelemetryConfig {
  css: CssImplementation;
  distribution: DistributionChannel;
  framework: Framework;
}

/**
 * Map of Auth0 API URL paths to component telemetry names.
 * Only includes currently exposed block components.
 * @internal
 */
const URL_TO_COMPONENT_MAP: Record<string, string> = {
  // MyAccount API (me/) - UserMFAMgmt component
  '/authentication-methods': 'user-mfa-management',

  // MyOrganization API (my-org/) - SSO components
  '/identity-providers': 'organization-sso-configuration',

  // MyOrganization API (my-org/) - DomainTable component
  '/domains': 'organization-domain-management',

  // MyOrganization API (my-org/) - OrganizationDetailsEdit component
  '/details': 'organization-details',

  // MyOrganization API (my-org/) - Organization configuration
  '/configuration': 'organization-details',
};

/**
 * Extracts the component name from an API URL.
 * @param url - The API URL being called
 * @returns The component telemetry name or 'unknown'
 * @internal
 */
export function getComponentFromUrl(url: string): string {
  for (const [path, component] of Object.entries(URL_TO_COMPONENT_MAP)) {
    if (url.includes(path)) {
      return component;
    }
  }
  return 'unknown';
}

/**
 * Telemetry payload structure sent in the Auth0-Client header.
 */
export interface TelemetryPayload {
  name: string;
  version: string;
  is_proxy_mode: boolean;
  framework: string;
  component: string;
  distribution: DistributionChannel;
  css: CssImplementation;
}

/**
 * Configuration options for building telemetry header.
 * Extends TelemetryConfig with request-specific options.
 */
export interface TelemetryOptions extends TelemetryConfig {
  isProxyMode: boolean;
}

/**
 * Builds the base64-encoded telemetry header value.
 * @param url - The API URL being called (used to determine component)
 * @param options - Telemetry configuration options
 * @returns Base64-encoded JSON telemetry payload
 * @internal
 */
export function buildTelemetryHeader(url: string, options: TelemetryOptions): string {
  const payload: TelemetryPayload = {
    name: TELEMETRY_NAME,
    version: PACKAGE_VERSION,
    is_proxy_mode: options.isProxyMode,
    framework: options.framework,
    component: getComponentFromUrl(url),
    distribution: options.distribution,
    css: options.css,
  };

  return btoa(JSON.stringify(payload));
}
