'use client';

import { useEffect, useState } from 'react';

const COOKIE_NAME = 'theme-mode';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

function setThemeCookie(isDark: boolean) {
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${COOKIE_NAME}=${isDark ? 'dark' : 'light'}; path=/; max-age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`;
}

export function useDarkMode(initialDarkMode = false): boolean {
  const [isDarkMode, setIsDarkMode] = useState(initialDarkMode);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    setIsDarkMode(mediaQuery.matches);
    setThemeCookie(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
      setThemeCookie(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return isDarkMode;
}
