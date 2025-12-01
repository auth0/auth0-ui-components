import { useAuth0 } from '@auth0/auth0-react';
import { User } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function ProfilePage() {
  const { user, isLoading } = useAuth0();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Profile Header */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex items-start space-x-4">
              {user.picture ? (
                <img
                  className="h-16 w-16 rounded-full"
                  src={user.picture}
                  alt={user.name || 'Profile'}
                />
              ) : (
                <div className="h-16 w-16 rounded-full bg-gray-300 flex items-center justify-center">
                  <User className="h-8 w-8 text-gray-600" />
                </div>
              )}
              <div className="flex flex-col items-start">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {t('profile.title')}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">{user.name || user.email}</p>
                <p className="text-sm text-gray-500 dark:text-gray-500">{user.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
