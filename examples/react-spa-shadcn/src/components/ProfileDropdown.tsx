import { useAuth0 } from '@auth0/auth0-react';
import { User, LogOut } from 'lucide-react';
import { useState, useRef, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { LanguageDropDown } from './language-dropdown';

export function ProfileDropdown() {
  const { user, logout } = useAuth0();
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSignOut = useCallback(() => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  }, [logout]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!user) return null;

  return (
    <div className="flex items-center gap-2">
      <LanguageDropDown />
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          {user.picture ? (
            <img className="h-8 w-8 rounded-full" src={user.picture} alt={user.name || 'Profile'} />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
              <User className="h-4 w-4 text-gray-600" />
            </div>
          )}
          <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-gray-300">
            {user.name || user.email}
          </span>
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 z-50 border border-gray-200 dark:border-gray-700">
            <Link
              to="/profile"
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsOpen(false)}
            >
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>{t('nav-bar.profile-button')}</span>
              </div>
            </Link>
            <a
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={handleSignOut}
            >
              <div className="flex items-center space-x-2">
                <LogOut className="h-4 w-4" />
                <span>{t('nav-bar.sign-out-button')}</span>
              </div>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
