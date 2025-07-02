import * as React from 'react';
import { AuthDetailsCore } from '@auth0-web-ui-components/core';

/**
 * Theme configuration for the Auth0 components
 * @property {('light'|'dark')} [mode] - Theme mode
 * @property {string} [primaryColor] - Primary color for theming
 */
export interface ThemeSettings {
  mode?: 'light' | 'dark';
  primaryColor?: string;
  [key: string]: unknown;
}

/**
 * Configuration options for Auth0ComponentProvider TODO: Regenerate docs
 *
 * Defines configuration for authentication, internationalization, and theming.
 * Also optionally includes runtime authentication state in SPA mode.
 *
 * @property {string} [authProxyUrl] - Optional URL for authentication proxy in RWA (proxy) mode.
 *                                      If provided, authentication is handled externally and no tokens are fetched.
 *
 * @property {I18nOptions} [i18n] - Internationalization settings including current and fallback languages.
 *
 *
 * @property {ThemeSettings} [themeSettings] - UI theme configuration, such as light/dark mode and primary color.
 *
 * @property {AuthDetails} [authDetails] - Runtime authentication state, populated in SPA (non-proxy) mode.
 *                                         Includes access token, domain, client ID, scopes, loading, and error info.
 */
export type Auth0ComponentConfig = Omit<
  Auth0ComponentProviderProps,
  'authDetails' | 'apiBaseUrl'
> & {
  isProxyMode?: boolean;
};

export interface Auth0ComponentProviderProps {
  authProxyUrl?: string;
  i18n?: I18nOptions;
  themeSettings?: ThemeSettings;
  authDetails: AuthDetails;
  customOverrides?: CustomOverrides;
  apiBaseUrl?: string;
  loader?: React.ReactNode;
}

export interface I18nOptions {
  currentLanguage: string;
  fallbackLanguage?: string;
}

/**
 * Auth0 authentication details fetched from SDK
 */
export type AuthDetails = AuthDetailsCore;

/**
 * BrandingTheme
 *
 * Controlled UL branding configuration.
 */
export type BrandingTheme = {
  mode?: 'light' | 'dark' | 'system';
  primaryColor?: string;
  borderRadius?: number;
  fontFamily?: string;
  [key: string]: unknown;
};

/**
 * CustomerOverrides
 *
 * Custom CSS variable overrides (e.g. "--button-radius": "6px").
 */
export type CustomOverrides = Record<string, string>;

/**
 * ThemeInput
 *
 * Optional props passed into the ThemeProvider.
 */
export type ThemeInput = {
  branding?: BrandingTheme;
  customOverrides?: CustomOverrides;
};

/**
 * ThemeContextValue
 *
 * The values made available through the ThemeContext.
 */
export type ThemeContextValue = {
  branding: BrandingTheme;
  customOverrides: CustomOverrides;
  mergedTheme: Record<string, unknown>;
};

/**
 * A function that performs string translation within a namespace.
 *
 * @param key - Translation key relative to namespace
 * @param vars - Optional variables for interpolation
 * @param overrides - Optional translation overrides
 */
type TranslationFunction = (
  key: string,
  vars?: Record<string, unknown>,
  overrides?: Record<string, unknown>,
) => string;

/**
 * Factory function that creates namespace-scoped translation functions.
 *
 * @param namespace - Translation namespace (e.g., "mfa", "login")
 */
export type TFactory = (namespace: string) => TranslationFunction;

/** Defines the value provided by the i18n context. */
export interface I18nContextValue {
  /** The factory to create `t` functions. Undefined until initialized. */
  translator: TFactory | undefined;
  initialized: boolean;
}
