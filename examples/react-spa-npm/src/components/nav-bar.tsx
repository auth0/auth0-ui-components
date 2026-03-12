import { useAuth0 } from '@auth0/auth0-react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { ProfileDropdown } from './profile-dropdown';
import { useIsDarkMode } from '../hooks/use-is-dark-mode';
import { Button } from './ui/button';

const LOGO_ON_LIGHT =
  'https://cdn.auth0.com/quantum-assets/dist/2.0.2/logos/auth0/auth0-lockup-en-onlight.svg';
const LOGO_ON_DARK =
  'https://cdn.auth0.com/quantum-assets/dist/2.0.2/logos/auth0/auth0-lockup-en-ondark.svg';

export const Navbar: React.FC = () => {
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const { t } = useTranslation();
  const isDarkMode = useIsDarkMode();

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        <nav className="bg-white dark:bg-black px-4 py-3 shadow-sm">
          <div className="mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4">
              <Link to="/" className="-m-1.5 p-1.5">
                <img
                  className="h-8 w-auto"
                  src={isDarkMode ? LOGO_ON_DARK : LOGO_ON_LIGHT}
                  alt="auth0 logo"
                />
              </Link>
            </div>

            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <ProfileDropdown />
              ) : (
                <Button onClick={() => loginWithRedirect()}>{t('nav-bar.sign-in-button')}</Button>
              )}
            </div>
          </div>
        </nav>
      </header>
    </>
  );
};
