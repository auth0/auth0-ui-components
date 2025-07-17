import * as React from 'react';
import { AuthDetailsCore } from '@auth0-web-ui-components/core';

/**
 * Theme configuration
 * @property {('light'|'dark')} [mode] - Theme mode
 * @property {string} [primaryColor] - Primary color for theming
 */
export interface ThemeSettings {
  mode?: 'light' | 'dark';
  primaryColor?: string;
  [key: string]: unknown;
}

/**
 * Internationalization configuration for Auth0 components.
 */
export interface I18nOptions {
  currentLanguage: string;
  fallbackLanguage?: string;
}

/**
 * Auth0 authentication details with optional React-specific properties.
 */
export type AuthDetails = Omit<AuthDetailsCore, 'accessToken'>;

/**
 * Props for the Auth0ComponentProvider component.
 */
export interface Auth0ComponentProviderProps {
  i18n?: I18nOptions;
  themeSettings?: ThemeSettings;
  authDetails?: AuthDetails;
  customOverrides?: CustomOverrides;
  loader?: React.ReactNode;
}

/**
 * Configuration for Auth0ComponentProvider excluding authentication details.
 */
export type Auth0ComponentConfig = Omit<Auth0ComponentProviderProps, 'authDetails' | 'i18n'>;

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
