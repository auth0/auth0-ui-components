import * as React from 'react';
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
 * Configuration options that users can pass to Auth0ComponentProvider
 * These are the input props for the provider component.
 */
export interface Auth0ComponentConfig {
  authProxyUrl?: string;
  i18n?: I18nOptions;
  themeSettings?: ThemeSettings;
  customOverrides?: CustomOverrides;
  loader?: React.ReactNode;
}

/**
 * The complete shape of the context value available to consumers via `useComponentConfig`.
 * This combines input configuration with runtime-derived properties.
 */
export interface Auth0ComponentContextType {
  authProxyUrl?: string;
  i18nConfig?: I18nOptions;
  themeSettings?: ThemeSettings;
  customOverrides?: CustomOverrides;
  loader?: React.ReactNode;
  isProxyMode: boolean;
  apiBaseUrl: string | undefined;
  authDetails: AuthDetails | undefined;
}

export interface I18nOptions {
  currentLanguage: string;
  fallbackLanguage?: string;
}

/**
 * Auth0 authentication details fetched from SDK
 */
export interface AuthDetails {
  accessToken: string | undefined;
  domain: string | undefined;
  clientId: string | undefined;
  scopes: string | undefined;
  loading: boolean;
  error?: Error;
}

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
