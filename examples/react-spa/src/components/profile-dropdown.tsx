import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Link } from 'react-router-dom';
import { LangaugeDropDown } from './language-dropdown';
import { useTranslation } from 'react-i18next';

export const ProfileDropdown: React.FC = () => {
  const { user, logout } = useAuth0();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useTranslation();
  const menuRef = useRef<HTMLDivElement>(null);

  const handleSignOut = useCallback(() => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  }, [logout]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsMenuOpen(false);
    }
  }, []);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
      setIsMenuOpen(false);
    }
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    // Cleanup function to remove event listeners.
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen, handleClickOutside, handleKeyDown]);

  return (
    <div className="flex items-center gap-2">
      <LangaugeDropDown />

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-white"
          id="user-menu-button"
          aria-expanded={isMenuOpen}
          aria-haspopup="true"
        >
          {user?.picture && (
            <img src={user?.picture} alt="Profile" className="w-9 h-9 rounded-full" />
          )}
        </button>
        {isMenuOpen && (
          <div
            className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-hidden"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="user-menu-button"
            tabIndex={-1}
          >
            <div className="py-1 border-t border-gray-200 dark:border-gray-600">
              <Link
                to="/profile"
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                role="menuitem"
                onClick={() => setIsMenuOpen(false)}
              >
                {t('profile-drop-down.settings')}
              </Link>
            </div>
            <div className="py-1 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={handleSignOut}
                className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
                role="menuitem"
              >
                {t('profile-drop-down.sign-out')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
