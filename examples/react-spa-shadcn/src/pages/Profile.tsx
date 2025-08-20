import Header from '@/components/Header';
import { useTranslation } from 'react-i18next';

const Profile = () => {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-semibold text-gray-900 mb-6">{t('user-profile.title')}</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-medium text-gray-900 mb-4">{t('user-profile.mfa.title')}</h2>
          <p className="text-gray-600 mb-4">{t('user-profile.mfa.description')}</p>
          {/* Replace the below section with UserMfaMgmt Component */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <p className="text-gray-500">{t('user-profile.mfa.placeholder.title')}</p>
            <p className="text-sm text-gray-400 mt-2">
              {t('user-profile.mfa.placeholder.description')}
            </p>
          </div>
          {/* End of Section */}
        </div>
      </div>
    </div>
  );
};

export default Profile;
