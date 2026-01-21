import { useTranslation } from 'react-i18next';

const OrganizationManagement = () => {
  const { t } = useTranslation();

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-6">
        {t('organization-management.title')}
      </h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        {/* <OrganizationDetailsEdit /> */}
      </div>
    </div>
  );
};

export default OrganizationManagement;
