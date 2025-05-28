'use client';

import * as React from 'react';
import { I18nService, type I18nOptions } from '@auth0-ui-components/core';

/**
 * Context for providing I18nService throughout the application
 * Initialized as null and will be populated by the provider
 */
const I18nContext = React.createContext<I18nService | null>(null);
I18nContext.displayName = 'I18nContext';

/**
 * Custom hook to access the I18nService from context
 * @throws {Error} If used outside of I18nProvider
 * @returns {I18nService} The I18n service instance
 */
export function useI18n() {
  const context = React.useContext(I18nContext);
  
  if (!context) {
    throw new Error('useI18n must be used within I18nProvider');
  }
  
  return context;
}

/**
 * Props for the I18nProvider component
 * @property {React.ReactNode} children - Child components that will have access to I18n context
 * @property {I18nOptions} [options] - Configuration options for the I18n service
 */
interface I18nProviderProps {
  children: React.ReactNode;
  options?: I18nOptions;
}

/**
 * Provider component for internationalization services
 * Wraps the application with I18n context and manages translations
 * 
 * @example
 * ```tsx
 * <I18nProvider options={{ defaultLanguage: 'en' }}>
 *   <App />
 * </I18nProvider>
 * ```
 */
export const I18nProvider = React.memo(function I18nProvider({ 
  children, 
  options
}: I18nProviderProps) {
  // Create memoized instance of I18nService to prevent unnecessary recreations
  const i18nService = React.useMemo(() => new I18nService(options), [options]);

  return (
    <I18nContext.Provider value={i18nService}>
      {children}
    </I18nContext.Provider>
  );
});

// Add display name for better debugging
I18nProvider.displayName = 'I18nProvider';