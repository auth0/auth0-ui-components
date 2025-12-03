'use client';

import i18n from 'i18next';
import React from 'react';
import { initReactI18next } from 'react-i18next';

// Initialize i18n
i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        'nav-bar.sign-in-button': 'Sign In',
        'nav-bar.sign-out-button': 'Sign Out',
        'nav-bar.profile-button': 'Profile',
        'hero-section.title': 'Universal Components',
        'hero-section.description':
          'A Next.js quickstart demonstrating delegated Organization Management leveraging Auth0 Universal Components.',
        'hero-section.get-started-button': 'Get Started',
        'hero-section.learn-more-button': 'Learn More',
        'profile.title': 'User',
        'profile.mfa-title': 'Multi-Factor Authentication',
        'profile.mfa-description': 'Manage your authentication factors for enhanced security.',
        'sidebar.my-account': 'My Account',
        'sidebar.mfa': 'Multi-Factor Authentication',
        'sidebar.my-organization': 'My Organization',
        'sidebar.organization-settings': 'Organization Settings',
        'sidebar.domains': 'Domains',
        'sidebar.identity-providers': 'Identity Providers',
      },
    },
  },
  lng: 'en',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  return <>{children}</>;
}
