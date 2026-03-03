'use client';

import { useUser } from '@auth0/nextjs-auth0';
import Link from 'next/link';
import type React from 'react';
import { useTranslation } from 'react-i18next';

import { useIsDarkMode } from '@/hooks/use-is-dark-mode';

import { ProfileDropdown } from './profile-dropdown';

const LOGO_ON_LIGHT =
  'https://cdn.auth0.com/quantum-assets/dist/2.0.2/logos/auth0/auth0-lockup-en-onlight.svg';
const LOGO_ON_DARK =
  'https://cdn.auth0.com/quantum-assets/dist/2.0.2/logos/auth0/auth0-lockup-en-ondark.svg';

export function Navbar() {
  const { user, isLoading } = useUser();
  const { t } = useTranslation();
  const isDarkMode = useIsDarkMode();

  return (
    <header className="w-full h-16 z-50">
      <nav className="px-4 py-3 shadow-sm h-full">
        <div className="mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex lg:flex-1">
            <Link href="/" className="-m-1.5 p-1.5">
              <img
                className="h-8 w-auto"
                src={isDarkMode ? LOGO_ON_DARK : LOGO_ON_LIGHT}
                alt="auth0 logo"
              />
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {!isLoading &&
              (user ? (
                <ProfileDropdown />
              ) : (
                <a
                  className="px-4 py-2 text-sm font-medium leading-5 text-center text-white capitalize bg-slate-900 rounded-lg hover:bg-slate-700 lg:mx-0 lg:w-auto focus:outline-none"
                  href="/auth/login"
                >
                  {t('nav-bar.sign-in-button')}
                </a>
              ))}
          </div>
        </div>
      </nav>
    </header>
  );
}
