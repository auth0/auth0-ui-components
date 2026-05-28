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
 * Callback to get current component name from React context.
 * Called by fetchers on each request to get the component that initiated the call.
 */
export type TelemetryComponentGetter = () => string;

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
  component: string;
}

/**
 * Builds the base64-encoded telemetry header value.
 * @param options - Telemetry configuration options including component name
 * @returns Base64-encoded JSON telemetry payload
 * @internal
 */
export function buildTelemetryHeader(options: TelemetryOptions): string {
  const payload: TelemetryPayload = {
    name: TELEMETRY_NAME,
    version: PACKAGE_VERSION,
    is_proxy_mode: options.isProxyMode,
    framework: options.framework,
    component: options.component,
    distribution: options.distribution,
    css: options.css,
  };

  return btoa(JSON.stringify(payload));
}
