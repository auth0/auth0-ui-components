import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router-dom';
import { ProfileDropdown } from './profile-dropdown';
import { useTranslation } from 'react-i18next';

export const Navbar: React.FC = () => {
  const { isAuthenticated, loginWithRedirect } = useAuth0();
  const { t } = useTranslation();

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <nav className="bg-white border-b border-gray-200 px-4 py-3 shadow-sm dark:bg-gray-900 dark:border-gray-700">
        <div className="mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8">
          <div className="flex lg:flex-1">
            <Link to="/" className="-m-1.5 p-1.5">
              <img
                className="h-8 w-auto"
                src="https://cdn.auth0.com/quantum-assets/dist/2.0.2/logos/auth0/auth0-lockup-en-onlight.svg"
                alt="auth0 logo"
              />
            </Link>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <ProfileDropdown />
            ) : (
              <button
                className="px-4 py-2 text-sm font-medium leading-5 text-center text-white capitalize bg-slate-900 rounded-lg hover:bg-slate-700 lg:mx-0 lg:w-auto focus:outline-none"
                onClick={() => loginWithRedirect()}
              >
                {t('nav-bar.sign-in-button')}
              </button>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
};
