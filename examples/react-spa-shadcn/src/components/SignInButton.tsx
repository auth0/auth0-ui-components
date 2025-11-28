import { useAuth0 } from '@auth0/auth0-react';
import React from 'react';
import { useTranslation } from 'react-i18next';

export const SignInButton: React.FC = () => {
  const { loginWithRedirect, isAuthenticated, isLoading } = useAuth0();
  const { t } = useTranslation();

  const handleSignIn = () => {
    loginWithRedirect();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Don't show sign-in button if already authenticated
  }

  return (
    <button
      onClick={handleSignIn}
      className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-gray-800"
    >
      {t('auth.sign-in', 'Sign In')}
    </button>
  );
};
