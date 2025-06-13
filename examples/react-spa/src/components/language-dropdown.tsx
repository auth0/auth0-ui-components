import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export const LangaugeDropDown: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { i18n, t } = useTranslation();
  const menuRef = useRef<HTMLDivElement>(null);
  const languages = {
    'en-US': 'English',
    ja: '日本語',
  } as const;

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

  const handleLanguageSelect = useCallback(
    async (lang: string) => {
      if (i18n.language !== lang) {
        await i18n.changeLanguage(lang);
      }
      setIsMenuOpen(false);
    },
    [i18n, setIsMenuOpen],
  );

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center justify-center gap-x-1.5 px-5 py-2 text-sm font-medium leading-5 text-white capitalize bg-slate-900 rounded-lg hover:bg-slate-700 lg:mx-0 lg:w-auto focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-white"
        aria-label={t('language-drop-down.change-language-button')}
      >
        <Globe className="w-5 h-5" />
        {i18n.language}
      </button>

      <div className="relative" ref={menuRef}>
        {isMenuOpen && (
          <div
            className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-hidden"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="user-menu-button"
            tabIndex={-1}
          >
            <div className="py-1">
              {Object.entries(languages).map(([code, label]) => (
                <button
                  key={code}
                  onClick={() => handleLanguageSelect(code)}
                  className={`w-full text-left block px-4 py-2 text-sm ${
                    i18n.language === code
                      ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700'
                  }`}
                  role="menuitem"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
