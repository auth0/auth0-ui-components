'use client';

import type { ToasterProps } from 'sonner';
import { Toaster as Sonner } from 'sonner';

import { useTheme } from '../../hooks/use-theme';

const Toaster = ({ ...props }: ToasterProps) => {
  const { isDarkMode } = useTheme();
  const theme = isDarkMode ? 'dark' : 'light';

  return <Sonner theme={theme as ToasterProps['theme']} className="toaster group" {...props} />;
};

export { Toaster };
