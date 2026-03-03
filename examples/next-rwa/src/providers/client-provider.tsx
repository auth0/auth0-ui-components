'use client';

import { Auth0ComponentProvider } from '@auth0/universal-components-react/rwa';
import React from 'react';

import { clientConfig } from '../config/features';
import { useIsDarkMode } from '../hooks/use-is-dark-mode';

import { I18nProvider } from './i18n-provider';

interface ClientProviderProps {
  children: React.ReactNode;
}

export function ClientProvider({ children }: ClientProviderProps) {
  const isDarkMode = useIsDarkMode();

  return (
    <I18nProvider>
      <Auth0ComponentProvider
        authDetails={{
          authProxyUrl: '/', // Use the auth proxy base (For example, MFA service will add /mfa/authenticators)
          domain: clientConfig.auth0Domain,
        }}
        themeSettings={{
          mode: isDarkMode ? 'dark' : 'light',
          theme: 'default',
        }}
      >
        {children}
      </Auth0ComponentProvider>
    </I18nProvider>
  );
}
