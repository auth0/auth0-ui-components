import { useAuth0 } from '@auth0/auth0-react';
import React from 'react';

import { ProfileDropdown } from './ProfileDropdown';
import { SignInButton } from './SignInButton';

export const AuthButton: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
      </div>
    );
  }

  return isAuthenticated ? <ProfileDropdown /> : <SignInButton />;
};
