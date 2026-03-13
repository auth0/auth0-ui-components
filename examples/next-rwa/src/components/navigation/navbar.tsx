'use client';

import { useUser } from '@auth0/nextjs-auth0';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type React from 'react';
import { useTranslation } from 'react-i18next';
import { useDarkMode } from '@/hooks/use-dark-mode';
import { ProfileDropdown } from './profile-dropdown';
import { Button } from '../ui/button';

const LOGO_ON_LIGHT =
  'https://cdn.auth0.com/quantum-assets/dist/2.0.2/logos/auth0/auth0-lockup-en-onlight.svg';
const LOGO_ON_DARK =
  'https://cdn.auth0.com/quantum-assets/dist/2.0.2/logos/auth0/auth0-lockup-en-ondark.svg';

export function Navbar() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const { t } = useTranslation();
  const isDarkMode = useDarkMode();

  return (
    <header className="w-full h-16 z-50">
      <nav className="px-4 py-3 shadow-sm h-full bg-white dark:bg-black">
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
                <Button className="cursor-pointer" onClick={() => router.push('/auth/login')}>
                  {t('nav-bar.sign-in-button')}
                </Button>
              ))}
          </div>
        </div>
      </nav>
    </header>
  );
}
