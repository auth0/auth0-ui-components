import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { SsoProviderTable } from '@/auth0-ui-components/blocks/my-org/idp-management/sso-provider-table';
import type { IdentityProvider } from '@/auth0-ui-components/types/my-org/idp-management/sso-provider/sso-provider-table-types';

const IdentityProviderManagement = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleCreate = () => {
    // Navigate to create page or open create modal
    navigate('/idp-management/create');
  };

  const handleEdit = (provider: IdentityProvider) => {
    // Navigate to edit page with provider ID
    navigate(`/idp-management/edit/${provider.id}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-semibold text-gray-900 dark:text-white mb-6">
        {t('identity-provider-management.title')}
      </h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <SsoProviderTable
          createAction={{
            onAfter: handleCreate,
          }}
          editAction={{
            onAfter: handleEdit,
          }}
        />
      </div>
    </div>
  );
};

export default IdentityProviderManagement;
